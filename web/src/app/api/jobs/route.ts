import { fail, identify, ok, pageSlice, paging, rateLimit } from "@/server/http";
import { listJobs } from "@/server/repository";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to see roles matched to your profile.");

  const limit = rateLimit(who.userId, "jobs", 120, 60);
  if (!limit.allowed) {
    return fail("rate_limited", "Too many requests. Give it a minute.", {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    const url = new URL(req.url);
    const minMatchRaw = url.searchParams.get("minMatch");
    const minMatch = minMatchRaw == null ? undefined : Number(minMatchRaw);
    if (minMatch != null && (Number.isNaN(minMatch) || minMatch < 0 || minMatch > 100)) {
      return fail("validation_failed", "minMatch must be between 0 and 100.", {
        fields: { minMatch: "Expected a number from 0 to 100." },
      });
    }

    const rows = listJobs(who.userId, {
      minMatch,
      remoteOnly: url.searchParams.get("remote") === "true",
      q: url.searchParams.get("q") ?? undefined,
    });

    const { page, perPage } = paging(url);
    const { rows: slice, meta } = pageSlice(rows, page, perPage);
    return ok(slice, meta);
  } catch (e) {
    console.error("[api/jobs]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}
