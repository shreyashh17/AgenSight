from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Report, ResearchSession, Source
from app.schemas.schemas import ReportResponse, ReportUpdateRequest, SourceResponse

router = APIRouter()

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Report).where(Report.id == report_id)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Fetch sources for the associated session
    source_stmt = select(Source).where(Source.session_id == report.session_id)
    sources_res = await db.execute(source_stmt)
    sources = sources_res.scalars().all()

    resp = ReportResponse.model_validate(report)
    resp.sources = [SourceResponse.model_validate(s) for s in sources]
    return resp

@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    update_data: ReportUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    report = await db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if update_data.title is not None:
        report.title = update_data.title
    if update_data.content is not None:
        report.content = update_data.content
        report.version += 1
    if update_data.summary is not None:
        report.summary = update_data.summary
    if update_data.tags is not None:
        report.tags = update_data.tags
    if update_data.is_favorite is not None:
        report.is_favorite = update_data.is_favorite

    await db.commit()
    await db.refresh(report)

    source_stmt = select(Source).where(Source.session_id == report.session_id)
    sources_res = await db.execute(source_stmt)
    sources = sources_res.scalars().all()

    resp = ReportResponse.model_validate(report)
    resp.sources = [SourceResponse.model_validate(s) for s in sources]
    return resp

@router.get("/share/{public_id}", response_model=ReportResponse)
async def get_public_report(
    public_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Public share link resolver: accessible without authentication.
    """
    stmt = select(Report).where(Report.public_id == public_id)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Shared report not found or link expired")

    source_stmt = select(Source).where(Source.session_id == report.session_id)
    sources_res = await db.execute(source_stmt)
    sources = sources_res.scalars().all()

    resp = ReportResponse.model_validate(report)
    resp.sources = [SourceResponse.model_validate(s) for s in sources]
    return resp
