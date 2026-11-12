from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Настройки приложения. Значения читаются из .env / переменных окружения."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openai_api_key: str = ""
    openai_base_url: str = ""  # пусто = официальный OpenAI; иначе адрес совместимого API (OpenRouter, ProxyAPI и т.п.)
    openai_model: str = "gpt-4o-mini"
    # Запасные модели через запятую (только OpenRouter): используются, если основная недоступна
    openai_fallback_models: str = ""
    patient_temperature: float = 0.7      # «живость» пациента
    evaluation_temperature: float = 0.2   # оценка должна быть стабильной
    patient_max_tokens: int = 200         # ответы пациента короткие
    mock_llm: bool = False  # демо-режим без OpenAI
    database_url: str = "sqlite:///./simulator.db"
    cors_origins: str = "http://localhost:5173"

    @property
    def fallback_models_list(self) -> list[str]:
        return [m.strip() for m in self.openai_fallback_models.split(",") if m.strip()]

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]
    jwt_secret_key: str = "change-me-to-a-random-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 дней
    teacher_invite_code: str = "change-me-teacher-code"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()