"""Демо-режим без OpenAI: пациент отвечает по фактам сценария, оценка считается эвристикой.
Только для отладки интерфейса. Качество намного ниже, чем у настоящей LLM."""
import asyncio
import re
from typing import AsyncIterator, Iterable

from app.models import Message, Scenario
from app.prompts.evaluation_prompt import CRITERIA
from app.schemas import CriterionResult, EvaluationOut

SECTIONS = ["complaints", "hpi", "life_history", "risk_factors"]
STOP = {"острый", "острая", "впервые", "выявленный", "типа", "который", "когда", "этого", "около"}

# Намерение в вопросе -> раздел фактов
INTENTS = [
    (r"когда|давно|как долго|началось|с чего", "hpi"),
    (r"курит|алкогол|пьёте|пьете|питани|спорт|вес\b|стресс|работа", "risk_factors"),
    (r"наследств|родител|отец|мать|операц|аллерг|хроническ|болезни|давлени", "life_history"),
    (r"жалоб|беспокоит|что случилось|на что жалуетесь", "complaints"),
]


def _stems(text: str) -> set[str]:
    """Грубые основы слов (первые 5 букв) для сопоставления вопроса с фактами."""
    words = re.findall(r"[а-яёa-z0-9]+", text.lower())
    return {w[:5] for w in words if len(w) >= 4 and w not in STOP}


def _best(items: list[str], question: str) -> str | None:
    """Факт с наибольшим пересечением по основам слов; None, если пересечений нет."""
    q = _stems(question)
    scored = [(len(q & _stems(i)), i) for i in items]
    score, item = max(scored, key=lambda x: x[0], default=(0, None))
    return item if score > 0 else None


def _reply_text(scenario: Scenario, question: str) -> str:
    q = question.lower()
    facts = scenario.anamnesis_facts
    profile = scenario.patient_profile

    if re.search(r"здравств|добрый|привет", q):
        return "Здравствуйте, доктор."
    if re.search(r"диагноз|что у меня|как думаете", q):
        return "Не знаю, доктор. Я пришёл, чтобы вы мне объяснили."

    # 1) намерение -> раздел (внутри раздела берём наиболее подходящий факт)
    for pattern, section in INTENTS:
        if re.search(pattern, q):
            items = facts.get(section) or []
            if section == "complaints":
                return profile.get("arrival_complaint") or (items[0] if items else "Мне нездоровится.")
            if items:
                return _best(items, question) or items[0]

    # 2) общий поиск по всем разделам, включая «чего нет»
    all_items = [i for s in [*SECTIONS, "negatives"] for i in (facts.get(s) or [])]
    return _best(all_items, question) or "Не совсем понял вопрос, доктор. Можете спросить иначе?"


async def mock_stream_reply(scenario: Scenario, question: str) -> AsyncIterator[str]:
    """Имитирует потоковый ответ: отдаёт текст по словам с небольшой задержкой."""
    for word in _reply_text(scenario, question).split(" "):
        await asyncio.sleep(0.04)
        yield word + " "


def mock_evaluation(scenario: Scenario, messages: Iterable[Message], final_diagnosis: str) -> EvaluationOut:
    """Оценка по доле выясненных фактов и совпадению слов диагноза с эталоном."""
    student_text = " ".join(m.content for m in messages if m.role == "student")
    q = _stems(student_text)
    facts = scenario.anamnesis_facts

    criteria: list[CriterionResult] = []
    missed: list[str] = []
    strengths: list[str] = []

    for key, title, max_score in CRITERIA:
        if key == "diagnosis":
            def norm(t: str) -> set[str]:
                return {w[:6] for w in re.findall(r"[а-яё]+", t.lower()) if len(w) >= 6 and w not in STOP}
            correct = bool(norm(final_diagnosis) & norm(scenario.hidden_diagnosis))
            score = max_score if correct else (5 if final_diagnosis.strip() else 0)
            comment = "Диагноз совпадает с эталоном." if correct else "Диагноз не совпал с эталоном."
        else:
            items = facts.get(key) or []
            covered = [i for i in items if q & _stems(i)]
            ratio = len(covered) / len(items) if items else 1
            score = round(max_score * min(1, ratio * 1.6))
            comment = f"Выяснено пунктов: {len(covered)} из {len(items)}."
            missed += [f"Не выяснено: {i}" for i in items if i not in covered]
            if ratio >= 0.6:
                strengths.append(f"Хорошо раскрыт раздел «{title}»")
        criteria.append(CriterionResult(key=key, title=title, score=score, max_score=max_score, comment=comment))

    total = sum(c.score for c in criteria)
    return EvaluationOut(
        total_score=total,
        diagnosis_correct=next(c for c in criteria if c.key == "diagnosis").score == 25,
        criteria=criteria,
        missed_questions=missed[:6],
        strengths=strengths,
        feedback=(
            f"[ДЕМО-РЕЖИМ] Оценка рассчитана простым сопоставлением слов, а не ИИ. Итог: {total} из 100. "
            "Для полноценной обратной связи подключите OPENAI_API_KEY и выключите MOCK_LLM."
        ),
    )