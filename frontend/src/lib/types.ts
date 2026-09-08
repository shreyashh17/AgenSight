export type AgentName = "orchestrator" | "search" | "reader" | "writer" | "critic";

export type EventType = 
  | "session_created"
  | "start"
  | "thought"
  | "step"
  | "source_discovered"
  | "scrape_progress"
  | "token_chunk"
  | "report_chunk"
  | "critic_chunk"
  | "critic_evaluation"
  | "complete"
  | "error"
  | "comparison_started"
  | "branch_switch"
  | "comparison_complete";

export interface AgentStreamEvent {
  agent: AgentName;
  event_type: EventType;
  message: string;
  data?: Record<string, any>;
  step_number: number;
  tokens: number;
  timestamp: string;
  session_id?: string;
  branch?: "A" | "B";
}

export interface SourceItem {
  id?: string;
  title: string;
  url: string;
  domain: string;
  favicon_url?: string;
  snippet?: string;
  scraped_text?: string;
  is_scraped?: boolean;
  relevance_score?: number;
}

export interface ReportItem {
  id: string;
  session_id: string;
  public_id: string;
  title: string;
  summary?: string;
  content: string;
  score?: number;
  strengths?: string[];
  improvements?: string[];
  verdict?: string;
  tags?: string[];
  is_favorite: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  sources?: SourceItem[];
}

export interface SessionSummary {
  id: string;
  topic: string;
  mode: string;
  status: string;
  model: string;
  total_tokens: number;
  estimated_cost: number;
  duration_seconds: number;
  created_at: string;
  is_favorite: boolean;
  report_title?: string;
  report_score?: number;
  tags: string[];
}

export interface SessionDetail {
  id: string;
  topic: string;
  mode: string;
  status: string;
  model: string;
  tone: string;
  length: string;
  total_tokens: number;
  estimated_cost: number;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  report?: ReportItem;
  sources: SourceItem[];
  events: AgentStreamEvent[];
}

export interface AnalyticsOverview {
  total_sessions: number;
  total_reports: number;
  total_tokens: number;
  total_estimated_cost: number;
  average_score: number;
  average_duration_seconds: number;
  sessions_by_model: Record<string, number>;
  top_tags: { tag: string; count: number }[];
  recent_activity: {
    id: string;
    topic: string;
    status: string;
    model: string;
    tokens: number;
    cost: number;
    created_at: string;
  }[];
}

export interface UserSettings {
  id: string;
  default_model: string;
  default_tone: string;
  default_length: string;
  max_search_results: number;
  theme: string;
  has_openai_key: boolean;
  has_tavily_key: boolean;
  api_key_override?: string;
  tavily_key_override?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserRegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}


