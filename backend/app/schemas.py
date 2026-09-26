from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ScenarioListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    specialty: str
    difficulty: str


class ScenarioOut(ScenarioListItem):
    patient_profile: dict[str, Any]


class SessionCreate(BaseModel):
    scenario_id: int

class MessageCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    content: str = Field(min_length=1, max_length=1000)


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: Literal["student", "patient"]
    content: str
    created_at: datetime


class FinishRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    final_diagnosis: str = Field(min_length=2, max_length=500)


class CriterionResult(BaseModel):
    key: str
    title: str
    score: int
    max_score: int
    comment: str


class EvaluationOut(BaseModel):
    total_score: int
    diagnosis_correct: bool
    criteria: list[CriterionResult]
    missed_questions: list[str]
    strengths: list[str]
    feedback: str


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: str
    status: str
    final_diagnosis: str | None = None
    score: float | None = None
    created_at: datetime
    scenario: ScenarioOut
    messages: list[MessageOut] = []
    evaluation: EvaluationOut | None = None
    correct_diagnosis: str | None = None  # заполняется только после завершения

class SessionListItem(BaseModel):
    id: int
    scenario_title: str
    scenario_specialty: str
    status: str
    score: float | None = None
    final_diagnosis: str | None = None
    created_at: datetime


class ScenarioStats(BaseModel):
    """Агрегированная статистика по сценарию (только завершённые сессии)."""
    scenario_id: int
    title: str
    attempts: int
    avg_score: float | None = None   

class RegisterRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")
    password: str = Field(min_length=6, max_length=100)
    full_name: str | None = Field(default=None, max_length=200)


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=100)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    full_name: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str | None = None
    specialty: str | None = None
    course: str | None = None
    created_at: datetime

class UpdateProfileRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str | None = Field(default=None, max_length=200)
    specialty: str | None = Field(default=None, max_length=100)
    course: str | None = Field(default=None, max_length=50)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=100)
    new_password: str = Field(min_length=6, max_length=100)