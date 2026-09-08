import { 
  SessionSummary, 
  SessionDetail, 
  ReportItem, 
  AnalyticsOverview, 
  UserSettings,
  AgentStreamEvent,
  User,
  AuthResponse,
  UserRegisterPayload,
  UserLoginPayload
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiService {
  static async register(payload: UserRegisterPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  }

  static async login(payload: UserLoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Invalid credentials" }));
      throw new Error(err.detail || "Invalid credentials");
    }
    return res.json();
  }

  static async demoLogin(): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Demo login failed" }));
      throw new Error(err.detail || "Demo login failed");
    }
    return res.json();
  }

  static async getMe(token: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-cache"
      },
    });
    if (!res.ok) throw new Error("Failed to get current user session");
    return res.json();
  }

  static async updateProfile(token: string, data: { name?: string; avatar_url?: string }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to update profile" }));
      throw new Error(err.detail || "Failed to update profile");
    }
    return res.json();
  }

  static async changePassword(token: string, data: { current_password: string; new_password: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/me/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to change password" }));
      throw new Error(err.detail || "Failed to change password");
    }
    return res.json();
  }

  static async fetchSessions(params?: {
    q?: string;
    tag?: string;
    favorite_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<SessionSummary[]> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append("q", params.q);
    if (params?.tag) searchParams.append("tag", params.tag);
    if (params?.favorite_only) searchParams.append("favorite_only", "true");
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const url = `${API_BASE_URL}/research/sessions?${searchParams.toString()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.statusText}`);
    return res.json();
  }

  static async fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
    const res = await fetch(`${API_BASE_URL}/research/sessions/${sessionId}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch session: ${res.statusText}`);
    return res.json();
  }

  static async deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/research/sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete session");
    return res.json();
  }

  static async fetchReport(reportId: string): Promise<ReportItem> {
    const res = await fetch(`${API_BASE_URL}/reports/${reportId}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch report: ${res.statusText}`);
    return res.json();
  }

  static async updateReport(reportId: string, data: {
    title?: string;
    content?: string;
    summary?: string;
    tags?: string[];
    is_favorite?: boolean;
  }): Promise<ReportItem> {
    const res = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update report");
    return res.json();
  }

  static async fetchPublicReport(publicId: string): Promise<ReportItem> {
    const res = await fetch(`${API_BASE_URL}/reports/share/${publicId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Public report not found or link expired");
    return res.json();
  }

  static async fetchAnalytics(): Promise<AnalyticsOverview> {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
  }

  static async fetchSettings(): Promise<UserSettings> {
    const res = await fetch(`${API_BASE_URL}/settings`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
  }

  static async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    return res.json();
  }

  static getPdfExportUrl(reportId: string): string {
    return `${API_BASE_URL}/export/${reportId}/pdf`;
  }

  static getMarkdownExportUrl(reportId: string): string {
    return `${API_BASE_URL}/export/${reportId}/markdown`;
  }

  static getJsonExportUrl(reportId: string): string {
    return `${API_BASE_URL}/export/${reportId}/json`;
  }

  /**
   * Stream research events from SSE endpoint
   */
  static async streamResearch(
    payload: {
      topic: string;
      model?: string;
      tone?: string;
      length?: string;
      max_sources?: number;
      mock_mode?: boolean;
    },
    onEvent: (event: AgentStreamEvent) => void,
    onError: (err: any) => void,
    onFinish: () => void
  ): Promise<() => void> {
    const controller = new AbortController();

    fetch(`${API_BASE_URL}/research/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
              const jsonStr = trimmed.replace(/^data:\s*/, "");
              try {
                const event: AgentStreamEvent = JSON.parse(jsonStr);
                onEvent(event);
              } catch (e) {
                console.warn("Failed to parse SSE JSON chunk:", jsonStr);
              }
            }
          }
        }
        onFinish();
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          onError(err);
        }
      });

    return () => controller.abort();
  }

  /**
   * Stream Critic-driven improvement re-run
   */
  static async streamImprovement(
    payload: {
      session_id: string;
      custom_instructions?: string;
      model?: string;
      mock_mode?: boolean;
    },
    onEvent: (event: AgentStreamEvent) => void,
    onError: (err: any) => void,
    onFinish: () => void
  ): Promise<() => void> {
    const controller = new AbortController();

    fetch(`${API_BASE_URL}/research/improve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
              const jsonStr = trimmed.replace(/^data:\s*/, "");
              try {
                const event: AgentStreamEvent = JSON.parse(jsonStr);
                onEvent(event);
              } catch (e) {
                console.warn("Failed to parse SSE JSON chunk:", jsonStr);
              }
            }
          }
        }
        onFinish();
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          onError(err);
        }
      });

    return () => controller.abort();
  }

  /**
   * Stream dual-topic comparison
   */
  static async streamComparison(
    payload: {
      topic_a: string;
      topic_b: string;
      model?: string;
      tone?: string;
      length?: string;
      mock_mode?: boolean;
    },
    onEvent: (event: AgentStreamEvent) => void,
    onError: (err: any) => void,
    onFinish: () => void
  ): Promise<() => void> {
    const controller = new AbortController();

    fetch(`${API_BASE_URL}/compare/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
              const jsonStr = trimmed.replace(/^data:\s*/, "");
              try {
                const event: AgentStreamEvent = JSON.parse(jsonStr);
                onEvent(event);
              } catch (e) {
                console.warn("Failed to parse SSE JSON chunk:", jsonStr);
              }
            }
          }
        }
        onFinish();
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          onError(err);
        }
      });

    return () => controller.abort();
  }
}
