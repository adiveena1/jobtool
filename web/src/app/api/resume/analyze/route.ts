import { fail, identify, ok, rateLimit } from "@/server/http";
import { getResume } from "@/server/repository";

export const dynamic = "force-dynamic";

/**
 * Analysis is a model call in a real build, so it is rate limited and its
 * result is a structured ResumeVersion — never free prose the client must parse.
 */
export async function POST(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to analyse your resume.");

  const limit = rateLimit(who.userId, "resume:analyze", 10, 3600);
  if (!limit.allowed) {
    return fail("rate_limited", "Ten analyses this hour. The last result is still on screen.", {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    return ok(getResume(who.userId));
  } catch (e) {
    console.error("[api/resume/analyze]", e);
    return fail("upstream_unavailable", "The resume model is not responding. Your document is untouched.");
  }
}
