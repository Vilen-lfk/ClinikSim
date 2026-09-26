import json
import re
from typing import Iterable

from app.models import Message, Scenario
from app.prompts.evaluation_prompt import CRITERIA, build_evaluation_prompt
from app.schemas import CriterionResult, EvaluationOut
from app.services.llm import LLMError, complete_json


from app.config import settings
from app.services.mock_llm import mock_evaluation


class EvaluationError(Exception):
    """Не удалось получить корректную оценку."""


def _extract_json(raw: str) -> str:
    """Убирает возможные markdown-ограждения и берёт текст от первой { до последней }."""
    raw = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("В ответе нет JSON")
    return raw[start : end + 1]


def _str_list(value) -> list[str]:
    return [str(x).strip() for x in value if str(x).strip()] if isinstance(value, list) else []


def _build_result(data: dict) -> EvaluationOut:
    """Валидирует ответ модели; баллы обрезаются по максимуму, итог считаем сами."""
    criteria: list[CriterionResult] = []
    for key, title, max_score in CRITERIA:
        item = data["criteria"][key]
        score = max(0, min(max_score, int(round(float(item["score"])))))
        criteria.append(
            CriterionResult(
                key=key, title=title, score=score, max_score=max_score,
                comment=str(item.get("comment", "")).strip(),
            )
        )
    return EvaluationOut(
        total_score=sum(c.score for c in criteria),
        diagnosis_correct=bool(data.get("diagnosis_correct")),
        criteria=criteria,
        missed_questions=_str_list(data.get("missed_questions")),
        strengths=_str_list(data.get("strengths")),
        feedback=str(data.get("feedback", "")).strip(),
    )


async def evaluate_session(
    scenario: Scenario, messages: Iterable[Message], final_diagnosis: str
) -> EvaluationOut:
    """Второй вызов LLM (роль преподавателя). До 2 попыток при невалидном JSON."""
    if settings.mock_llm:
        return mock_evaluation(scenario, messages, final_diagnosis)
    prompt = build_evaluation_prompt(scenario, list(messages), final_diagnosis)
    last_error: Exception | None = None
    for _ in range(2):
        try:
            raw = await complete_json(prompt)
            return _build_result(json.loads(_extract_json(raw)))
        except LLMError as e:
            raise EvaluationError(str(e)) from e
        except (ValueError, KeyError, TypeError) as e:  # JSONDecodeError ⊂ ValueError
            last_error = e
    raise EvaluationError(f"Модель вернула некорректный JSON: {last_error}")