from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_teacher
from app.models import Scenario, SimSession, User
from app.schemas import ScenarioAdminOut, ScenarioCreate, ScenarioListItem, ScenarioOut, ScenarioUpdate

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


@router.get("", response_model=list[ScenarioListItem])
def list_scenarios(db: Session = Depends(get_db)):
    return db.scalars(select(Scenario).order_by(Scenario.id)).all()


@router.get("/{scenario_id}", response_model=ScenarioOut)
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.get(Scenario, scenario_id)
    if not scenario:
        raise HTTPException(404, "Сценарий не найден")
    return scenario


@router.get("/{scenario_id}/admin", response_model=ScenarioAdminOut)
def get_scenario_admin(
    scenario_id: int, current_user: User = Depends(get_current_teacher), db: Session = Depends(get_db)
):
    """Полные данные сценария (включая диагноз и факты анамнеза) — только для редактирования куратором."""
    scenario = db.get(Scenario, scenario_id)
    if not scenario:
        raise HTTPException(404, "Сценарий не найден")
    return scenario


@router.post("", response_model=ScenarioAdminOut, status_code=201)
def create_scenario(
    payload: ScenarioCreate, current_user: User = Depends(get_current_teacher), db: Session = Depends(get_db)
):
    scenario = Scenario(**payload.model_dump())
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return scenario


@router.patch("/{scenario_id}", response_model=ScenarioAdminOut)
def update_scenario(
    scenario_id: int,
    payload: ScenarioUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    scenario = db.get(Scenario, scenario_id)
    if not scenario:
        raise HTTPException(404, "Сценарий не найден")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(scenario, key, value)
    db.commit()
    db.refresh(scenario)
    return scenario


@router.delete("/{scenario_id}", status_code=204)
def delete_scenario(
    scenario_id: int, current_user: User = Depends(get_current_teacher), db: Session = Depends(get_db)
):
    scenario = db.get(Scenario, scenario_id)
    if not scenario:
        raise HTTPException(404, "Сценарий не найден")
    # Запрещаем удалять сценарий, если по нему уже есть сессии студентов — иначе потеряется их история
    has_sessions = db.scalar(select(SimSession.id).where(SimSession.scenario_id == scenario_id))
    if has_sessions:
        raise HTTPException(409, "Нельзя удалить сценарий: по нему уже есть сессии студентов")
    db.delete(scenario)
    db.commit()