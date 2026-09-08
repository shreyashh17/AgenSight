import os
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings as app_settings
from app.models.models import UserSettings
from app.schemas.schemas import UserSettingsResponse, UserSettingsUpdate

router = APIRouter()

@router.get("", response_model=UserSettingsResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserSettings).where(UserSettings.id == "default_user")
    result = await db.execute(stmt)
    user_settings = result.scalar_one_or_none()

    if not user_settings:
        user_settings = UserSettings(id="default_user")
        db.add(user_settings)
        await db.commit()
        await db.refresh(user_settings)

    has_openai = bool(user_settings.api_key_override or app_settings.OPENAI_API_KEY)
    has_tavily = bool(user_settings.tavily_key_override or app_settings.TAVILY_API_KEY)

    return UserSettingsResponse(
        id=user_settings.id,
        default_model=user_settings.default_model,
        default_tone=user_settings.default_tone,
        default_length=user_settings.default_length,
        max_search_results=user_settings.max_search_results,
        theme=user_settings.theme,
        has_openai_key=has_openai,
        has_tavily_key=has_tavily
    )

@router.put("", response_model=UserSettingsResponse)
async def update_settings(
    update_data: UserSettingsUpdate,
    db: AsyncSession = Depends(get_db)
):
    user_settings = await db.get(UserSettings, "default_user")
    if not user_settings:
        user_settings = UserSettings(id="default_user")
        db.add(user_settings)

    if update_data.default_model is not None:
        user_settings.default_model = update_data.default_model
    if update_data.default_tone is not None:
        user_settings.default_tone = update_data.default_tone
    if update_data.default_length is not None:
        user_settings.default_length = update_data.default_length
    if update_data.max_search_results is not None:
        user_settings.max_search_results = update_data.max_search_results
    if update_data.theme is not None:
        user_settings.theme = update_data.theme
    if update_data.api_key_override is not None:
        user_settings.api_key_override = update_data.api_key_override
    if update_data.tavily_key_override is not None:
        user_settings.tavily_key_override = update_data.tavily_key_override

    await db.commit()
    await db.refresh(user_settings)

    has_openai = bool(user_settings.api_key_override or app_settings.OPENAI_API_KEY)
    has_tavily = bool(user_settings.tavily_key_override or app_settings.TAVILY_API_KEY)

    return UserSettingsResponse(
        id=user_settings.id,
        default_model=user_settings.default_model,
        default_tone=user_settings.default_tone,
        default_length=user_settings.default_length,
        max_search_results=user_settings.max_search_results,
        theme=user_settings.theme,
        has_openai_key=has_openai,
        has_tavily_key=has_tavily
    )
