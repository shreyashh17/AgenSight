import json
import asyncio
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, AsyncSessionLocal
from app.models.models import ResearchSession
from app.schemas.schemas import ComparisonRequest
from app.agents.pipeline import research_pipeline

router = APIRouter()

@router.post("/stream")
async def start_comparison_stream(
    request: ComparisonRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Runs dual-topic comparative research, streaming live progress for Topic A and Topic B.
    """
    # Create session records for Topic A & Topic B
    session_a = ResearchSession(
        topic=request.topic_a,
        mode="comparison_a",
        model=request.model or "gpt-4o-mini",
        tone=request.tone or "analytical",
        length=request.length or "detailed"
    )
    session_b = ResearchSession(
        topic=request.topic_b,
        mode="comparison_b",
        model=request.model or "gpt-4o-mini",
        tone=request.tone or "analytical",
        length=request.length or "detailed"
    )
    db.add(session_a)
    db.add(session_b)
    await db.commit()
    await db.refresh(session_a)
    await db.refresh(session_b)

    id_a = session_a.id
    id_b = session_b.id

    async def event_generator():
        # Announcement event
        init_event = {
            "agent": "orchestrator",
            "event_type": "comparison_started",
            "message": f"Comparing '{request.topic_a}' vs '{request.topic_b}'",
            "data": {
                "session_a_id": id_a,
                "session_b_id": id_b,
                "topic_a": request.topic_a,
                "topic_b": request.topic_b
            },
            "step_number": 0,
            "tokens": 0
        }
        yield f"data: {json.dumps(init_event)}\n\n"

        async with AsyncSessionLocal() as session_db:
            # Stream A
            yield f"data: {json.dumps({'agent': 'orchestrator', 'event_type': 'branch_switch', 'message': f'Executing analysis for Branch A: {request.topic_a}', 'data': {'branch': 'A'}})}\n\n"
            async for event in research_pipeline.run(
                session_id=id_a,
                topic=request.topic_a,
                tone=request.tone or "analytical",
                length=request.length or "detailed",
                model_name=request.model or "gpt-4o-mini",
                mock_mode=request.mock_mode or False,
                db=session_db
            ):
                event_dict = event.to_dict()
                event_dict["branch"] = "A"
                event_dict["session_id"] = id_a
                yield f"data: {json.dumps(event_dict)}\n\n"

            # Stream B
            yield f"data: {json.dumps({'agent': 'orchestrator', 'event_type': 'branch_switch', 'message': f'Executing analysis for Branch B: {request.topic_b}', 'data': {'branch': 'B'}})}\n\n"
            async for event in research_pipeline.run(
                session_id=id_b,
                topic=request.topic_b,
                tone=request.tone or "analytical",
                length=request.length or "detailed",
                model_name=request.model or "gpt-4o-mini",
                mock_mode=request.mock_mode or False,
                db=session_db
            ):
                event_dict = event.to_dict()
                event_dict["branch"] = "B"
                event_dict["session_id"] = id_b
                yield f"data: {json.dumps(event_dict)}\n\n"

            # Final comparative complete
            yield f"data: {json.dumps({'agent': 'orchestrator', 'event_type': 'comparison_complete', 'message': 'Comparative research completed for both topics.', 'data': {'session_a_id': id_a, 'session_b_id': id_b}})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
