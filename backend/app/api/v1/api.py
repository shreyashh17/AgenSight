from fastapi import APIRouter
from app.api.v1.endpoints import auth, research, reports, compare, export, analytics, settings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(research.router, prefix="/research", tags=["Research"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(compare.router, prefix="/compare", tags=["Comparison"])
api_router.include_router(export.router, prefix="/export", tags=["Export"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
