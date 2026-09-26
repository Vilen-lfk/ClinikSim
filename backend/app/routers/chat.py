from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.services.mock_llm import mock_stream_reply

from app.database import SessionLocal, get_db
from app.models import Message, SimSession
from app.prompts.patient_system import build_patient_prompt
from app.schemas import MessageCreate
from app.services.llm import LLMError, stream_patient_reply

from app.dependencies import get_current_user
from app.models import Message, SimSession, User

router = APIRouter(prefix="/api/chat", tags=["chat"])

MAX_HISTORY = 40  # сколько последних реплик отправляем в модель


def _save_patient_message(session_id: int, text: str) -> None:
    """Сохраняет ответ пациента в отдельной сессии БД (после окончания стрима)."""
    if not text.strip():
        return
    db = SessionLocal()
    try:
        db.add(Message(session_id=session_id, role="patient", content=text))
        db.commit()
    finally:
        db.close()


@router.post("/{session_id}/message")
async def send_message(
    session_id: int,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sim = db.get(SimSession, session_id)
    if not sim or sim.user_id != current_user.id:
        raise HTTPException(404, "Сессия не найдена")
    if sim.status != "active":
        raise HTTPException(409, "Сессия уже завершена")

    system_prompt = build_patient_prompt(sim.scenario)
    history = [
        {"role": "user" if m.role == "student" else "assistant", "content": m.content}
        for m in sim.messages
    ][-MAX_HISTORY:]
    history.append({"role": "user", "content": payload.content})

    # Получаем первый кусок ДО начала ответа: если LLM недоступна, вернём нормальный HTTP 502
    #agen = stream_patient_reply(system_prompt, history)
    #-------------
    if settings.mock_llm:
        agen = mock_stream_reply(sim.scenario, payload.content)
    else:
        agen = stream_patient_reply(system_prompt, history)
    #-------------
    try:
        first = await anext(agen)
    except StopAsyncIteration:
        first = ""
    except LLMError as e:
        raise HTTPException(502, str(e))

    # Реплику студента сохраняем только после успешного старта ответа
    db.add(Message(session_id=session_id, role="student", content=payload.content))
    db.commit()

    async def body():
        parts: list[str] = []
        try:
            if first:
                parts.append(first)
                yield first
            async for chunk in agen:
                parts.append(chunk)
                yield chunk
        except LLMError:
            yield "\n[Связь с пациентом прервана]"
        finally:
            # Сохраняем всё, что успели получить (в т.ч. при разрыве соединения клиентом)
            _save_patient_message(session_id, "".join(parts))

    return StreamingResponse(
        body(),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )