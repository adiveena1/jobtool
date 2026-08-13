import { NextResponse } from "next/server";
import type { ApiError, ApiErrorCode, ApiResponse, PageMeta } from "@/types/api";

/**
 * Every route handler answers through these two helpers, so both clients can
 * rely on one envelope and one error vocabulary. Nothing here ever leaks a
 * stack trace, a provider name, or an upstream status code to the caller.
 */

const STATUS: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  validation_failed: 422,
  rate_limited: 429,
  upstream_unavailable: 503,
  internal: 500,
};

export function ok<T>(data: T, meta?: PageMeta) {
  return NextResponse.json<ApiResponse<T>>({ ok: true, data, ...(meta ? { meta } : {}) });
}

export function fail(code: ApiErrorCode, message: string, extra?: Partial<ApiError>) {
  const error: ApiError = { code, message, ...extra };
  return NextResponse.json<ApiResponse<never>>(
    { ok: false, error },
    {
      status: STATUS[code],
      headers: extra?.retryAfterSeconds ? { "Retry-After": String(extra.retryAfterSeconds) } : undefined,
    },
  );
}

/** Wraps a handler so an unexpected throw becomes a clean 500, never a leak. */
export function guard<T>(fn: () => Promise<T> | T) {
  return async () => {
    try {
      return await fn();
    } catch (e) {
      console.error("[api]", e);
      return fail("internal", "Something went wrong on our side. Try again in a moment.");
    }
  };
}

/* ------------------------------------------------------------ rate limit -- */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Fixed-window limiter, per identity per route. In-process only — a real
 * deployment moves this to Redis so it holds across instances.
 */
export function rateLimit(identity: string, route: string, limit: number, windowSeconds: number) {
  const key = `${identity}:${route}`;
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true as const };
  }
  if (b.count >= limit) {
    return { allowed: false as const, retryAfterSeconds: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { allowed: true as const };
}

/* ----------------------------------------------------------------- auth -- */

export type Identity = { userId: string };

/**
 * Reads the caller's identity from the session cookie or bearer token.
 *
 * The demo build accepts a fixed identity so both clients work without a login
 * server. Swap the body for real verification — every handler already routes
 * its data access through the returned userId, so nothing above changes.
 */
export function identify(req: Request): Identity | null {
  const auth = req.headers.get("authorization");
  const cookie = req.headers.get("cookie") ?? "";
  const hasSession = cookie.includes("careeros_session=") || auth?.startsWith("Bearer ");
  if (!hasSession && process.env.REQUIRE_AUTH === "true") return null;
  return { userId: "demo-user" };
}

/** Validates a page/perPage pair without trusting the query string. */
export function paging(url: URL, maxPerPage = 50) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const raw = Number(url.searchParams.get("perPage") ?? 20) || 20;
  const perPage = Math.min(Math.max(1, raw), maxPerPage);
  return { page, perPage };
}

export function pageSlice<T>(rows: T[], page: number, perPage: number): { rows: T[]; meta: PageMeta } {
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);
  return {
    rows: slice,
    meta: { page, perPage, total: rows.length, hasMore: start + perPage < rows.length },
  };
}
