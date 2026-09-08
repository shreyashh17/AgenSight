from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.models.models import ResearchSession, Report
from app.schemas.schemas import AnalyticsOverview

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    db: AsyncSession = Depends(get_db)
):
    # Total sessions
    sessions_res = await db.execute(select(func.count(ResearchSession.id)))
    total_sessions = sessions_res.scalar() or 0

    # Total reports
    reports_res = await db.execute(select(func.count(Report.id)))
    total_reports = reports_res.scalar() or 0

    # Total tokens & cost
    stats_res = await db.execute(
        select(
            func.sum(ResearchSession.total_tokens),
            func.sum(ResearchSession.estimated_cost),
            func.avg(ResearchSession.duration_seconds)
        )
    )
    tokens_sum, cost_sum, avg_duration = stats_res.one()
    total_tokens = tokens_sum or 0
    total_estimated_cost = round(cost_sum or 0.0, 4)
    average_duration_seconds = round(avg_duration or 0.0, 1)

    # Average Score
    score_res = await db.execute(select(func.avg(Report.score)))
    avg_score = score_res.scalar()
    average_score = round(avg_score or 0.0, 2)

    # Sessions by model
    model_res = await db.execute(
        select(ResearchSession.model, func.count(ResearchSession.id))
        .group_by(ResearchSession.model)
    )
    sessions_by_model = {row[0] or "gpt-4o-mini": row[1] for row in model_res.all()}

    # Recent activity
    recent_res = await db.execute(
        select(ResearchSession)
        .order_by(desc(ResearchSession.created_at))
        .limit(10)
    )
    recent_sessions = recent_res.scalars().all()
    recent_activity = [
        {
            "id": s.id,
            "topic": s.topic,
            "status": s.status,
            "model": s.model,
            "tokens": s.total_tokens,
            "cost": s.estimated_cost,
            "created_at": s.created_at.isoformat()
        }
        for s in recent_sessions
    ]

    # Top tags
    reports = (await db.execute(select(Report))).scalars().all()
    tag_counts = {}
    for r in reports:
        if r.tags:
            for t in r.tags:
                tag_counts[t] = tag_counts.get(t, 0) + 1
    
    top_tags = [{"tag": k, "count": v} for k, v in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:8]]

    return AnalyticsOverview(
        total_sessions=total_sessions,
        total_reports=total_reports,
        total_tokens=total_tokens,
        total_estimated_cost=total_estimated_cost,
        average_score=average_score,
        average_duration_seconds=average_duration_seconds,
        sessions_by_model=sessions_by_model,
        top_tags=top_tags,
        recent_activity=recent_activity
    )
