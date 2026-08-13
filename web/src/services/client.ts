import type { ApiError, ApiResponse, PageMeta } from "@/types/api";

/**
 * The only place either web client talks to the API.
 *
 * Returns a discriminated result rather than throwing, so every caller is
 * forced by the type checker to handle failure — that is what keeps a raw
 * "500 Internal Server Error" from ever reaching a screen.
 */

export type Result<T> =
  | { ok: true; data: T; meta?: PageMeta }
  | { ok: false; error: ApiError };

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const OFFLINE: ApiError = {
  code: "upstream_unavailable",
  message: "You're offline. We'll reconnect automatically.",
};

export async function request<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number; retries?: number },
): Promise<Result<T>> {
  const { timeoutMs = 12_000, retries = 1, ...rest } = init ?? {};

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const res = await fetch(`${BASE}${path}`, {
        ...rest,
        signal: ctrl.signal,
        headers: {
          "content-type": "application/json",
          ...(rest.headers ?? {}),
        },
        credentials: "include",
      });
      clearTimeout(timer);

      const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;
      if (!body) {
        return { ok: false, error: { code: "internal", message: "Something went wrong. Try again." } };
      }
      if (!body.ok) return { ok: false, error: body.error };
      return { ok: true, data: body.data, meta: body.meta };
    } catch {
      clearTimeout(timer);
      // Retry once on transport failure; a 4xx never reaches here so it is
      // never retried.
      if (attempt === retries) return { ok: false, error: OFFLINE };
    }
  }

  return { ok: false, error: OFFLINE };
}

export const api = {
  jobs: (q?: { minMatch?: number; remote?: boolean; q?: string; page?: number }) => {
    const p = new URLSearchParams();
    if (q?.minMatch != null) p.set("minMatch", String(q.minMatch));
    if (q?.remote) p.set("remote", "true");
    if (q?.q) p.set("q", q.q);
    if (q?.page) p.set("page", String(q.page));
    const qs = p.toString();
    return request(`/api/jobs${qs ? `?${qs}` : ""}`);
  },
  job: (id: string) => request(`/api/jobs/${encodeURIComponent(id)}`),
  matches: () => request(`/api/jobs/matches`),
  applications: (stage?: string) =>
    request(`/api/applications${stage ? `?stage=${encodeURIComponent(stage)}` : ""}`),
  apply: (jobId: string) =>
    request(`/api/applications`, { method: "POST", body: JSON.stringify({ jobId }) }),
  analyzeResume: () => request(`/api/resume/analyze`, { method: "POST" }),
  tailorResume: (jobId: string) =>
    request(`/api/resume/tailor`, { method: "POST", body: JSON.stringify({ jobId }) }),
  startInterview: (mode: string) =>
    request(`/api/interview/start`, { method: "POST", body: JSON.stringify({ mode }) }),
  answerInterview: (payload: { sessionId: string; questionId?: string; text: string; final?: boolean }) =>
    request(`/api/interview/answer`, { method: "POST", body: JSON.stringify(payload) }),
  intelligence: () => request(`/api/career/intelligence`),
  company: (id: string) => request(`/api/companies/${encodeURIComponent(id)}`),
  notifications: () => request(`/api/notifications`),
  profile: () => request(`/api/profile`),
  autopilot: () => request(`/api/autopilot`),
  chat: (message: string) =>
    request(`/api/ai/chat`, { method: "POST", body: JSON.stringify({ message }) }),
};
