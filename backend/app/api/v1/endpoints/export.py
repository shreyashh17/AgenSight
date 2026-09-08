from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import PlainTextResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Report, Source
from app.services.export_service import export_service

router = APIRouter()

@router.get("/{report_id}/pdf")
async def export_pdf(
    report_id: str,
    db: AsyncSession = Depends(get_db)
):
    report = await db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    source_stmt = select(Source).where(Source.session_id == report.session_id)
    sources_res = await db.execute(source_stmt)
    sources = [{"title": s.title, "url": s.url, "domain": s.domain} for s in sources_res.scalars().all()]

    pdf_bytes = export_service.generate_pdf(
        report_title=report.title,
        content=report.content,
        score=report.score,
        verdict=report.verdict,
        sources=sources
    )

    clean_filename = "".join(c for c in report.title if c.isalnum() or c in (' ', '-', '_')).rstrip()[:40]
    filename = f"{clean_filename or 'InsightForge_Report'}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\""
        }
    )

@router.get("/{report_id}/markdown")
async def export_markdown(
    report_id: str,
    db: AsyncSession = Depends(get_db)
):
    report = await db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    source_stmt = select(Source).where(Source.session_id == report.session_id)
    sources_res = await db.execute(source_stmt)
    sources = [{"title": s.title, "url": s.url, "domain": s.domain} for s in sources_res.scalars().all()]

    md_text = export_service.generate_markdown(
        report_title=report.title,
        content=report.content,
        score=report.score,
        verdict=report.verdict,
        sources=sources
    )

    clean_filename = "".join(c for c in report.title if c.isalnum() or c in (' ', '-', '_')).rstrip()[:40]
    filename = f"{clean_filename or 'InsightForge_Report'}.md"

    return PlainTextResponse(
        content=md_text,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\""
        }
    )

@router.get("/{report_id}/json")
async def export_json(
    report_id: str,
    db: AsyncSession = Depends(get_db)
):
    report = await db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    source_stmt = select(Source).where(Source.session_id == report.session_id)
    sources_res = await db.execute(source_stmt)
    sources = [{"title": s.title, "url": s.url, "domain": s.domain} for s in sources_res.scalars().all()]

    data = {
        "id": report.id,
        "title": report.title,
        "content": report.content,
        "summary": report.summary,
        "score": report.score,
        "verdict": report.verdict,
        "strengths": report.strengths,
        "improvements": report.improvements,
        "tags": report.tags,
        "sources": sources,
        "created_at": report.created_at.isoformat()
    }

    return JSONResponse(content=data)
