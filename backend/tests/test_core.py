import json

import pytest

from app.models import Scenario
from app.prompts.evaluation_prompt import CRITERIA
from app.prompts.patient_system import build_patient_prompt
from app.services.evaluation import _build_result, _extract_json


def make_scenario() -> Scenario:
    return Scenario(
        title="Тест",
        patient_profile={"name": "Иван", "age": 50, "gender": "мужской", "occupation": "инженер"},
        hidden_diagnosis="Острый коронарный синдром",
        anamnesis_facts={"complaints": ["Давящая боль за грудиной"], "negatives": ["Кашля нет"]},
        red_flags=[],
        difficulty="easy",
    )


def test_patient_prompt_hides_diagnosis():
    prompt = build_patient_prompt(make_scenario())
    assert "Острый коронарный синдром" not in prompt
    assert "Давящая боль за грудиной" in prompt


def test_extract_json_strips_markdown():
    raw = '```json\n{"a": 1}\n```'
    assert json.loads(_extract_json(raw)) == {"a": 1}


def test_extract_json_without_json_raises():
    with pytest.raises(ValueError):
        _extract_json("просто текст")


def _payload(score):
    return {
        "criteria": {k: {"score": score, "comment": "ок"} for k, _, _ in CRITERIA},
        "diagnosis_correct": True,
        "missed_questions": ["Курите ли вы?"],
        "strengths": [],
        "feedback": "Хорошо",
    }


def test_scores_are_clamped_to_max():
    result = _build_result(_payload(999))
    assert all(c.score == c.max_score for c in result.criteria)
    assert result.total_score == 100


def test_negative_scores_become_zero():
    assert _build_result(_payload(-5)).total_score == 0


def test_missing_criterion_raises():
    data = _payload(5)
    del data["criteria"]["hpi"]
    with pytest.raises(KeyError):
        _build_result(data)