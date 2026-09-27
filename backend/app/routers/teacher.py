from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_teacher
from app.models import Scenario, SimSession, User
from app.routers.sessions import _to_out
from app.schemas import ScenarioAdminOut, SessionOut, StudentSummary, TeacherSessionListItem

router = APIRouter(prefix="/api/teacher", tags=["teacher"])


@router.get("/students", response_model=list[StudentSummary])
def list_students(current_user: User = Depends(get_current_teacher), db: Session = Depends(get_db)):
    students = db.scalars(select(User).where(User.role == "student").order_by(User.username)).all()
    result = []
    for u in students:
        finished = [s for s in u.sessions if s.status == "finished" and s.score is not None]
        result.append(
            StudentSummary(
                id=u.id,
                username=u.username,
                full_name=u.full_name,
                specialty=u.specialty,
                course=u.course,
                attempts=len(u.sessions),
                finished=len(finished),
                avg_score=round(sum(s.score for s in finished) / len(finished), 1) if finished else None,
            )
        )
    return result


@router.get("/students/{user_id}/sessions", response_model=list[TeacherSessionListItem])
def list_student_sessions(
    user_id: int, current_user: User = Depends(get_current_teacher), db: Session = Depends(get_db)
):
    student = db.get(User, user_id)
    if not student or student.role != "student":
        raise HTTPException(404, "Студент не найден")
    rows = db.scalars(
        select(SimSession).where(SimSession.user_id == user_id).order_by(SimSession.id.desc())
    ).all()
    return [
        TeacherSessionListItem(
            id=s.id,
            student_username=student.username,
            student_full_name=student.full_name,
            scenario_title=s.scenario.title,
            scenario_specialty=s.scenario.specialty,
            status=s.status,
            score=s.score,
            final_diagnosis=s.final_diagnosis,
            created_at=s.created_at,
        )
        for s in rows
    ]


@router.get("/sessions/{session_id}", response_model=SessionOut)
def get_any_session(
    session_id: int, current_user: User = Depends(get_current_teacher), db: Session = Depends(get_db)
):
    """В отличие от /api/sessions/{id}, здесь нет проверки владения — куратор видит сессии всех студентов."""
    sim = db.get(SimSession, session_id)
    if not sim:
        raise HTTPException(404, "Сессия не найдена")
    return _to_out(sim)


@router.get("/scenarios", response_model=list[ScenarioAdminOut])
def list_scenarios_admin(current_user: User = Depends(get_current_teacher), db: Session = Depends(get_db)):
    """Список сценариев с полными данными (диагноз, факты) — для страницы управления сценариями."""
    return db.scalars(select(Scenario).order_by(Scenario.id)).all()