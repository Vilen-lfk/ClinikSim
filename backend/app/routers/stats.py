from fastapi import APIRouter, Depends
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Scenario, SimSession
from app.schemas import ScenarioStats

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/scenarios", response_model=list[ScenarioStats])
def scenario_stats(db: Session = Depends(get_db)):
    """Число завершённых попыток и средний балл по каждому сценарию."""
    stmt = (
        select(Scenario.id, Scenario.title, func.count(SimSession.id), func.avg(SimSession.score))
        .outerjoin(
            SimSession,
            and_(SimSession.scenario_id == Scenario.id, SimSession.status == "finished"),
        )
        .group_by(Scenario.id)
        .order_by(Scenario.id)
    )
    return [
        ScenarioStats(
            scenario_id=sid,
            title=title,
            attempts=cnt,
            avg_score=round(avg, 1) if avg is not None else None,
        )
        for sid, title, cnt, avg in db.execute(stmt).all()
    ]