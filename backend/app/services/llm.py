from typing import AsyncIterator

from openai import AsyncOpenAI, OpenAIError

from app.config import settings


class LLMError(Exception):
    """Ошибка при обращении к LLM."""


_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if not settings.openai_api_key:
        raise LLMError("Не задан OPENAI_API_KEY в .env")
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.openai_api_key, timeout=60.0)
    return _client


async def stream_patient_reply(system_prompt: str, history: list[dict]) -> AsyncIterator[str]:
    """Стримит ответ пациента по кускам текста."""
    try:
        stream = await _get_client().chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "system", "content": system_prompt}, *history],
            temperature=settings.patient_temperature,
            max_tokens=settings.patient_max_tokens,
            stream=True,
        )
        async for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except OpenAIError as e:
        raise LLMError(f"Ошибка LLM: {e}") from e


async def complete_json(messages: list[dict]) -> str:
    """Обычный (не потоковый) вызов с режимом JSON. Возвращает сырую строку."""
    try:
        resp = await _get_client().chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=settings.evaluation_temperature,
            response_format={"type": "json_object"},
        )
        return resp.choices[0].message.content or ""
    except OpenAIError as e:
        raise LLMError(f"Ошибка LLM: {e}") from e