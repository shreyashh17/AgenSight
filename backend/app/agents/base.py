from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime

class AgentType(str, Enum):
    ORCHESTRATOR = "orchestrator"
    SEARCH = "search"
    READER = "reader"
    WRITER = "writer"
    CRITIC = "critic"

class EventType(str, Enum):
    START = "start"
    THOUGHT = "thought"
    STEP = "step"
    SOURCE_DISCOVERED = "source_discovered"
    SCRAPE_PROGRESS = "scrape_progress"
    TOKEN_CHUNK = "token_chunk"
    REPORT_CHUNK = "report_chunk"
    CRITIC_CHUNK = "critic_chunk"
    CRITIC_EVALUATION = "critic_evaluation"
    COMPLETE = "complete"
    ERROR = "error"

class AgentStreamEvent:
    def __init__(
        self,
        agent: AgentType,
        event_type: EventType,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        step_number: int = 1,
        tokens: int = 0
    ):
        self.agent = agent
        self.event_type = event_type
        self.message = message
        self.data = data or {}
        self.step_number = step_number
        self.tokens = tokens
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent": self.agent.value,
            "event_type": self.event_type.value,
            "message": self.message,
            "data": self.data,
            "step_number": self.step_number,
            "tokens": self.tokens,
            "timestamp": self.timestamp
        }
