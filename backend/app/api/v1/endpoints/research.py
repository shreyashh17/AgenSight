import json
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db, AsyncSessionLocal
from app.models.models import ResearchSession, Report, Source, AgentEvent
from app.schemas.schemas import (
    ResearchRequest, 
    ImproveReportRequest, 
    ResearchSessionResponse, 
    ResearchSessionSummary
)
from app.agents.pipeline import research_pipeline

router = APIRouter()

@router.post("/stream")
async def start_research_stream(
    request: ResearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Initiates a live multi-agent research workflow and streams events via SSE.
    """
    # Create session record
    session = ResearchSession(
        topic=request.topic,
        mode="standard",
        status="running",
        model=request.model or "gpt-4o-mini",
        tone=request.tone or "analytical",
        length=request.length or "detailed"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    session_id = session.id

    async def event_generator():
        # Yield initial session confirmation
        init_payload = {
            "agent": "orchestrator",
            "event_type": "session_created",
            "message": f"Research session initiated for: {request.topic}",
            "data": {"session_id": session_id, "topic": request.topic},
            "step_number": 0,
            "tokens": 0
        }
        yield f"data: {json.dumps(init_payload)}\n\n"

        async with AsyncSessionLocal() as session_db:
            try:
                async for event in research_pipeline.run(
                    session_id=session_id,
                    topic=request.topic,
                    tone=request.tone or "analytical",
                    length=request.length or "detailed",
                    model_name=request.model or "gpt-4o-mini",
                    max_sources=request.max_sources or 5,
                    mock_mode=request.mock_mode or False,
                    openai_key=request.openai_api_key,
                    tavily_key=request.tavily_api_key,
                    db=session_db
                ):
                    event_dict = event.to_dict()
                    event_dict["session_id"] = session_id
                    yield f"data: {json.dumps(event_dict)}\n\n"
            except Exception as e:
                err_dict = {
                    "agent": "orchestrator",
                    "event_type": "error",
                    "message": f"Pipeline execution error: {str(e)}",
                    "data": {"error": str(e), "session_id": session_id},
                    "step_number": 0,
                    "tokens": 0
                }
                yield f"data: {json.dumps(err_dict)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/improve")
async def improve_report_stream(
    request: ImproveReportRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    One-click Critic feedback iteration: re-runs writer with critic suggestions.
    """
    stmt = (
        select(ResearchSession)
        .options(selectinload(ResearchSession.report), selectinload(ResearchSession.sources))
        .where(ResearchSession.id == request.session_id)
    )
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()

    if not session or not session.report:
        raise HTTPException(status_code=404, detail="Session or Report not found")

    critic_feedback = ""
    if session.report.improvements:
        critic_feedback += "Areas to improve:\n" + "\n".join([f"- {item}" for item in session.report.improvements])
    if session.report.verdict:
        critic_feedback += f"\nVerdict: {session.report.verdict}"
    if request.custom_instructions:
        critic_feedback += f"\nUser Custom Instructions: {request.custom_instructions}"

    session_id = session.id
    topic = session.topic

    async def event_generator():
        init_payload = {
            "agent": "orchestrator",
            "event_type": "session_created",
            "message": f"Starting refinement pass based on critic feedback...",
            "data": {"session_id": session_id, "topic": topic, "is_improvement": True},
            "step_number": 0,
            "tokens": 0
        }
        yield f"data: {json.dumps(init_payload)}\n\n"

        async with AsyncSessionLocal() as session_db:
            try:
                async for event in research_pipeline.run(
                    session_id=session_id,
                    topic=topic,
                    tone=session.tone,
                    length=session.length,
                    model_name=request.model or session.model,
                    mock_mode=request.mock_mode or False,
                    revision_feedback=critic_feedback,
                    db=session_db
                ):
                    event_dict = event.to_dict()
                    event_dict["session_id"] = session_id
                    yield f"data: {json.dumps(event_dict)}\n\n"
            except Exception as e:
                err_dict = {
                    "agent": "orchestrator",
                    "event_type": "error",
                    "message": f"Refinement error: {str(e)}",
                    "data": {"error": str(e), "session_id": session_id},
                    "step_number": 0,
                    "tokens": 0
                }
                yield f"data: {json.dumps(err_dict)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/sessions", response_model=List[ResearchSessionSummary])
async def list_sessions(
    q: Optional[str] = Query(None, description="Search term for topic or title"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    favorite_only: bool = Query(False, description="Filter favorites only"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ResearchSession)
        .options(selectinload(ResearchSession.report))
        .order_by(desc(ResearchSession.created_at))
    )

    if q:
        stmt = stmt.where(ResearchSession.topic.ilike(f"%{q}%"))

    result = await db.execute(stmt)
    sessions = result.scalars().all()

    summaries = []
    for s in sessions:
        is_fav = s.report.is_favorite if s.report else False
        if favorite_only and not is_fav:
            continue

        report_tags = s.report.tags if s.report and s.report.tags else []
        if tag and tag not in report_tags:
            continue

        summaries.append(
            ResearchSessionSummary(
                id=s.id,
                topic=s.topic,
                mode=s.mode,
                status=s.status,
                model=s.model,
                total_tokens=s.total_tokens,
                estimated_cost=s.estimated_cost,
                duration_seconds=s.duration_seconds,
                created_at=s.created_at,
                is_favorite=is_fav,
                report_title=s.report.title if s.report else None,
                report_score=s.report.score if s.report else None,
                tags=report_tags
            )
        )

    return summaries[offset:offset + limit]

@router.get("/sessions/{session_id}", response_model=ResearchSessionResponse)
async def get_session_detail(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ResearchSession)
        .options(
            selectinload(ResearchSession.report),
            selectinload(ResearchSession.sources),
            selectinload(ResearchSession.events)
        )
        .where(ResearchSession.id == session_id)
    )
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    session = await db.get(ResearchSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.delete(session)
    await db.commit()
    return {"success": True, "message": "Session deleted successfully"}
