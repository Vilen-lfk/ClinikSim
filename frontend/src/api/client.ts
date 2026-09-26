import type { AuthResponse, AuthUser, Scenario, ScenarioListItem, ScenarioStats, Session, SessionListItem } from "../types";

const BASE = "/api";

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

function authHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function extractError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((d: { msg: string }) => d.msg).join("; ");
  } catch {
    /* тело не JSON */
  }
  return `Ошибка ${res.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    ...init,
  });
  if (res.status === 401) {
    // Токен истёк или недействителен — очищаем локальную сессию
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthToken(null);
  }
  if (!res.ok) throw new Error(await extractError(res));
  return res.json() as Promise<T>;
}

export const api = {
  register: (username: string, password: string, full_name?: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, full_name: full_name || null }),
    }),
  login: (username: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  getScenarios: () => request<ScenarioListItem[]>("/scenarios"),
  getScenario: (id: number) => request<Scenario>(`/scenarios/${id}`),
  createSession: (scenario_id: number) =>
    request<Session>("/sessions", { method: "POST", body: JSON.stringify({ scenario_id }) }),
  getSession: (id: number) => request<Session>(`/sessions/${id}`),
  finishSession: (id: number, final_diagnosis: string) =>
    request<Session>(`/sessions/${id}/finish`, { method: "POST", body: JSON.stringify({ final_diagnosis }) }),
  getHistory: () => request<SessionListItem[]>("/sessions"),
  getStats: () => request<ScenarioStats[]>("/stats/scenarios"),
    getMe: () => request<AuthUser>("/auth/me"),
  updateProfile: (data: Partial<{ full_name: string; specialty: string; course: string }>) =>
    request<AuthUser>("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
  changePassword: (current_password: string, new_password: string) =>
    request<{ status: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),
};

export async function streamPatientReply(
  sessionId: number,
  content: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE}/chat/${sessionId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ content }),
    signal,
  });
  if (!res.ok) throw new Error(await extractError(res));
  if (!res.body) throw new Error("Браузер не поддерживает потоковое чтение ответа");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) onChunk(text);
  }
  const tail = decoder.decode();
  if (tail) onChunk(tail);
}