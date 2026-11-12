import asyncio
from typing import AsyncIterator

from openai import AsyncOpenAI, OpenAIError, RateLimitError

from app.config import settings


class LLMError(Exception):
    """Ошибка при обращении к LLM."""


_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if not settings.openai_api_key:
        raise LLMError("Не задан OPENAI_API_KEY в .env")
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url or None,
            timeout=60.0,
        )
    return _client


# Паузы (сек) между повторами при 429 — у бесплатных моделей частые кратковременные лимиты
RETRY_DELAYS = (3, 8, 15)

RATE_LIMIT_MESSAGE = "ИИ-сервис сейчас перегружен (лимит запросов). Подождите немного и повторите."


async def _create_with_retry(**kwargs):
    """Вызов chat.completions.create с повторами при превышении лимита (HTTP 429)."""
    for delay in (*RETRY_DELAYS, None):
        try:
            return await _get_client().chat.completions.create(**kwargs)
        except RateLimitError as e:
            if delay is None:
                raise LLMError(RATE_LIMIT_MESSAGE) from e
            await asyncio.sleep(delay)


def _extra_body() -> dict | None:
    """Для OpenRouter передаём список запасных моделей: при ошибке основной запрос уйдёт на следующую."""
    if settings.fallback_models_list:
        return {"models": [settings.openai_model, *settings.fallback_models_list]}
    return None


async def stream_patient_reply(system_prompt: str, history: list[dict]) -> AsyncIterator[str]:
    """Стримит ответ пациента по кускам текста."""
    try:
        stream = await _create_with_retry(
            model=settings.openai_model,
            messages=[{"role": "system", "content": system_prompt}, *history],
            temperature=settings.patient_temperature,
            max_tokens=settings.patient_max_tokens,
            stream=True,
            extra_body=_extra_body(),
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
        resp = await _create_with_retry(
            model=settings.openai_model,
            messages=messages,
            temperature=settings.evaluation_temperature,
            response_format={"type": "json_object"},
            extra_body=_extra_body(),
        )
        return resp.choices[0].message.content or ""
    except OpenAIError as e:
        raise LLMError(f"Ошибка LLM: {e}") from e