from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Scenario, SimSession, User
from app.schemas import FinishRequest, SessionCreate, SessionListItem, SessionOut
from app.services.evaluation import EvaluationError, evaluate_session

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def _to_out(sim: SimSession) -> SessionOut:
    out = SessionOut.model_validate(sim)
    if sim.status == "finished":
        out.correct_diagnosis = sim.scenario.hidden_diagnosis
    return out


def _get_owned_or_404(db: Session, session_id: int, current_user: User) -> SimSession:
    sim = db.get(SimSession, session_id)
    if not sim or sim.user_id != current_user.id:
        raise HTTPException(404, "Сессия не найдена")
    return sim


@router.get("", response_model=list[SessionListItem])
def list_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(SimSession).where(SimSession.user_id == current_user.id).order_by(SimSession.id.desc())
    ).all()
    return [
        SessionListItem(
            id=s.id,
            scenario_title=s.scenario.title,
            scenario_specialty=s.scenario.specialty,
            status=s.status,
            score=s.score,
            final_diagnosis=s.final_diagnosis,
            created_at=s.created_at,
        )
        for s in rows
    ]


@router.post("", response_model=SessionOut)
def create_session(
    payload: SessionCreate,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not db.get(Scenario, payload.scenario_id):
        raise HTTPException(404, "Сценарий не найден")

    # Если у пользователя уже есть незавершённая сессия по этому сценарию — продолжаем её.
    existing = db.scalar(
        select(SimSession)
        .where(
            SimSession.user_id == current_user.id,
            SimSession.scenario_id == payload.scenario_id,
            SimSession.status == "active",
        )
        .order_by(SimSession.id.desc())
    )
    if existing:
        response.status_code = 200
        return _to_out(existing)

    sim = SimSession(
        user_id=current_user.id, student_id=current_user.username, scenario_id=payload.scenario_id
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    response.status_code = 201
    return _to_out(sim)


@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return _to_out(_get_owned_or_404(db, session_id, current_user))


@router.post("/{session_id}/finish", response_model=SessionOut)
async def finish_session(
    session_id: int,
    payload: FinishRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sim = _get_owned_or_404(db, session_id, current_user)
    if sim.status == "finished":
        raise HTTPException(409, "Сессия уже завершена")
    if not any(m.role == "student" for m in sim.messages):
        raise HTTPException(400, "Сначала задайте пациенту хотя бы один вопрос")

    try:
        result = await evaluate_session(sim.scenario, sim.messages, payload.final_diagnosis)
    except EvaluationError as e:
        raise HTTPException(502, f"Не удалось выполнить оценку: {e}")

    sim.final_diagnosis = payload.final_diagnosis
    sim.score = float(result.total_score)
    sim.evaluation = result.model_dump()
    sim.status = "finished"
    db.commit()
    db.refresh(sim)
    return _to_out(sim)


@router.delete("/{session_id}", status_code=204)
def delete_session(
    session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    sim = _get_owned_or_404(db, session_id, current_user)
    if sim.status != "active":
        raise HTTPException(409, "Можно удалить только незавершённую сессию")
    db.delete(sim)
    db.commit()