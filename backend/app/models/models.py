import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ResearchSession(Base):
    __tablename__ = "research_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    topic: Mapped[str] = mapped_column(String(500), nullable=False)
    mode: Mapped[str] = mapped_column(String(50), default="standard")  # standard, comparison, deep_dive
    status: Mapped[str] = mapped_column(String(50), default="queued")   # queued, searching, reading, writing, critiquing, completed, failed
    model: Mapped[str] = mapped_column(String(100), default="gpt-4o-mini")
    tone: Mapped[str] = mapped_column(String(50), default="analytical") # formal, analytical, executive, casual
    length: Mapped[str] = mapped_column(String(50), default="detailed")  # brief, detailed, exhaustive
    
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    estimated_cost: Mapped[float] = mapped_column(Float, default=0.0)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    report: Mapped[Optional["Report"]] = relationship("Report", back_populates="session", uselist=False, cascade="all, delete-orphan")
    sources: Mapped[List["Source"]] = relationship("Source", back_populates="session", cascade="all, delete-orphan")
    events: Mapped[List["AgentEvent"]] = relationship("AgentEvent", back_populates="session", cascade="all, delete-orphan", order_by="AgentEvent.created_at")

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("research_sessions.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Critic agent review details
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    strengths: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    improvements: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    verdict: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # User curation
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    public_id: Mapped[str] = mapped_column(String(64), unique=True, default=generate_uuid, index=True)
    
    version: Mapped[int] = mapped_column(Integer, default=1)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    session: Mapped["ResearchSession"] = relationship("ResearchSession", back_populates="report")

class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("research_sessions.id", ondelete="CASCADE"), nullable=False)
    
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=False)
    favicon_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scraped_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_scraped: Mapped[bool] = mapped_column(Boolean, default=False)
    relevance_score: Mapped[Optional[float]] = mapped_column(Float, default=1.0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["ResearchSession"] = relationship("ResearchSession", back_populates="sources")

class AgentEvent(Base):
    __tablename__ = "agent_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("research_sessions.id", ondelete="CASCADE"), nullable=False)
    
    agent_name: Mapped[str] = mapped_column(String(50), nullable=False)  # search, reader, writer, critic, orchestrator
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # start, thought, step, token_chunk, source, complete, error
    step_number: Mapped[int] = mapped_column(Integer, default=1)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    data: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["ResearchSession"] = relationship("ResearchSession", back_populates="events")

class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default="default_user")
    default_model: Mapped[str] = mapped_column(String(100), default="gpt-4o-mini")
    default_tone: Mapped[str] = mapped_column(String(50), default="analytical")
    default_length: Mapped[str] = mapped_column(String(50), default="detailed")
    max_search_results: Mapped[int] = mapped_column(Integer, default=5)
    theme: Mapped[str] = mapped_column(String(20), default="dark")
    api_key_override: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    tavily_key_override: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
