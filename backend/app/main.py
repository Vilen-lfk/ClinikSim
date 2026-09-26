from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, scenarios, sessions, stats

from app import models  # noqa: F401  (регистрирует модели в metadata)
from app.config import settings
from app.database import Base, engine
from app.routers import chat, scenarios, sessions

from app.routers import auth, chat, scenarios, sessions, stats

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)  # создаём таблицы при старте
    yield


app = FastAPI(title="Симулятор пациента", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenarios.router)
app.include_router(sessions.router)
app.include_router(chat.router)

app.include_router(stats.router)
app.include_router(auth.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}