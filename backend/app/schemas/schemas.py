from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Research Requests & Inputs ---

class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=500, description="The subject or question to research")
    model: Optional[str] = Field("gpt-4o-mini", description="Model name (e.g. gpt-4o-mini, gpt-4o)")
    tone: Optional[str] = Field("analytical", description="Tone: analytical, formal, executive, casual")
    length: Optional[str] = Field("detailed", description="Length: brief, detailed, exhaustive")
    max_sources: Optional[int] = Field(5, ge=1, le=10)
    mock_mode: Optional[bool] = Field(False, description="Force mock simulation mode")
    openai_api_key: Optional[str] = None
    tavily_api_key: Optional[str] = None

class ImproveReportRequest(BaseModel):
    session_id: str
    custom_instructions: Optional[str] = None
    model: Optional[str] = "gpt-4o-mini"
    mock_mode: Optional[bool] = False

class ComparisonRequest(BaseModel):
    topic_a: str = Field(..., min_length=2)
    topic_b: str = Field(..., min_length=2)
    model: Optional[str] = "gpt-4o-mini"
    tone: Optional[str] = "analytical"
    length: Optional[str] = "detailed"
    mock_mode: Optional[bool] = False

# --- Sources & Citations ---

class SourceBase(BaseModel):
    title: str
    url: str
    domain: str
    favicon_url: Optional[str] = None
    snippet: Optional[str] = None
    relevance_score: Optional[float] = 1.0
    is_scraped: bool = False

class SourceResponse(SourceBase):
    id: str
    session_id: str
    scraped_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Reports ---

class ReportBase(BaseModel):
    title: str
    summary: Optional[str] = None
    content: str
    score: Optional[float] = None
    strengths: Optional[List[str]] = []
    improvements: Optional[List[str]] = []
    verdict: Optional[str] = None
    tags: Optional[List[str]] = []
    is_favorite: bool = False

class ReportUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None

class ReportResponse(ReportBase):
    id: str
    session_id: str
    public_id: str
    version: int
    created_at: datetime
    updated_at: datetime
    sources: Optional[List[SourceResponse]] = []

    class Config:
        from_attributes = True

# --- Agent Events ---

class AgentEventResponse(BaseModel):
    id: str
    session_id: str
    agent_name: str
    event_type: str
    step_number: int
    message: str
    data: Optional[Dict[str, Any]] = None
    tokens: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Research Session ---

class ResearchSessionResponse(BaseModel):
    id: str
    topic: str
    mode: str
    status: str
    model: str
    tone: str
    length: str
    total_tokens: int
    estimated_cost: float
    duration_seconds: float
    created_at: datetime
    updated_at: datetime
    report: Optional[ReportResponse] = None
    sources: List[SourceResponse] = []
    events: List[AgentEventResponse] = []

    class Config:
        from_attributes = True

class ResearchSessionSummary(BaseModel):
    id: str
    topic: str
    mode: str
    status: str
    model: str
    total_tokens: int
    estimated_cost: float
    duration_seconds: float
    created_at: datetime
    is_favorite: bool = False
    report_title: Optional[str] = None
    report_score: Optional[float] = None
    tags: List[str] = []

    class Config:
        from_attributes = True

# --- User Settings ---

class UserSettingsResponse(BaseModel):
    id: str
    default_model: str
    default_tone: str
    default_length: str
    max_search_results: int
    theme: str
    has_openai_key: bool = False
    has_tavily_key: bool = False

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    default_model: Optional[str] = None
    default_tone: Optional[str] = None
    default_length: Optional[str] = None
    max_search_results: Optional[int] = None
    theme: Optional[str] = None
    api_key_override: Optional[str] = None
    tavily_key_override: Optional[str] = None

# --- Analytics ---

class AnalyticsOverview(BaseModel):
    total_sessions: int
    total_reports: int
    total_tokens: int
    total_estimated_cost: float
    average_score: float
    average_duration_seconds: float
    sessions_by_model: Dict[str, int]
    top_tags: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]

# --- User & Authentication ---

class UserRegisterRequest(BaseModel):
    email: str
    name: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str = "analyst"
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
