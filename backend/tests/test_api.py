import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db

@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_get_settings():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/settings")
        assert response.status_code == 200
        data = response.json()
        assert "default_model" in data
        assert "default_tone" in data

@pytest.mark.asyncio
async def test_analytics_overview():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        assert "total_sessions" in data
        assert "total_reports" in data

@pytest.mark.asyncio
async def test_list_sessions():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/research/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

@pytest.mark.asyncio
async def test_research_stream_mock():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/research/stream",
            json={
                "topic": "Test Autonomous Agents Flow",
                "model": "gpt-4o-mini",
                "tone": "analytical",
                "length": "brief",
                "mock_mode": True
            }
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
