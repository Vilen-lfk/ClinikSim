import re
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_.-]+$")

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
    user_id: int
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

    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=100)
    full_name: str | None = Field(default=None, max_length=200)
    role: str = Field(default="student")
    invite_code: str | None = Field(default=None, max_length=200)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not USERNAME_PATTERN.match(v):
            raise ValueError(
                "Логин может содержать только латинские буквы, цифры, точку, дефис и подчёркивание"
            )
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in {"student", "teacher"}:
            raise ValueError("Роль должна быть 'student' или 'teacher'")
        return v


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

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str | None = None
    specialty: str | None = None
    course: str | None = None
    role: str
    created_at: datetime    

ALLOWED_SPECIALTIES = {"therapy", "cardiology", "neurology", "surgery"}
ALLOWED_DIFFICULTIES = {"easy", "medium", "hard"}


class ScenarioCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=2, max_length=200)
    specialty: str
    difficulty: str
    hidden_diagnosis: str = Field(min_length=2, max_length=300)
    patient_profile: dict[str, Any]
    anamnesis_facts: dict[str, Any]
    red_flags: list[str] = []

    @field_validator("specialty")
    @classmethod
    def check_specialty(cls, v: str) -> str:
        if v not in ALLOWED_SPECIALTIES:
            raise ValueError(f"Специальность должна быть одной из: {', '.join(sorted(ALLOWED_SPECIALTIES))}")
        return v

    @field_validator("difficulty")
    @classmethod
    def check_difficulty(cls, v: str) -> str:
        if v not in ALLOWED_DIFFICULTIES:
            raise ValueError(f"Сложность должна быть одной из: {', '.join(sorted(ALLOWED_DIFFICULTIES))}")
        return v


class ScenarioUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=2, max_length=200)
    specialty: str | None = None
    difficulty: str | None = None
    hidden_diagnosis: str | None = Field(default=None, min_length=2, max_length=300)
    patient_profile: dict[str, Any] | None = None
    anamnesis_facts: dict[str, Any] | None = None
    red_flags: list[str] | None = None

    @field_validator("specialty")
    @classmethod
    def check_specialty(cls, v: str | None) -> str | None:
        if v is not None and v not in ALLOWED_SPECIALTIES:
            raise ValueError(f"Специальность должна быть одной из: {', '.join(sorted(ALLOWED_SPECIALTIES))}")
        return v

    @field_validator("difficulty")
    @classmethod
    def check_difficulty(cls, v: str | None) -> str | None:
        if v is not None and v not in ALLOWED_DIFFICULTIES:
            raise ValueError(f"Сложность должна быть одной из: {', '.join(sorted(ALLOWED_DIFFICULTIES))}")
        return v


class ScenarioAdminOut(BaseModel):
    """Полные данные сценария, включая скрытые от студента поля. Только для куратора."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    specialty: str
    difficulty: str
    hidden_diagnosis: str
    patient_profile: dict[str, Any]
    anamnesis_facts: dict[str, Any]
    red_flags: list[str]


class StudentSummary(BaseModel):
    id: int
    username: str
    full_name: str | None = None
    specialty: str | None = None
    course: str | None = None
    attempts: int
    finished: int
    avg_score: float | None = None


class TeacherSessionListItem(BaseModel):
    id: int
    student_username: str
    student_full_name: str | None = None
    scenario_title: str
    scenario_specialty: str
    status: str
    score: float | None = None
    final_diagnosis: str | None = None
    created_at: datetime