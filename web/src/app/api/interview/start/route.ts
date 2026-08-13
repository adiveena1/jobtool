import { fail, identify, ok, rateLimit } from "@/server/http";
import { startInterview } from "@/server/repository";
import type { InterviewMode } from "@/types/api";

export const dynamic = "force-dynamic";

const MODES: InterviewMode[] = ["behavioral", "technical", "hr", "system_design", "case", "mock"];

export async function POST(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to start a practice round.");

  const limit = rateLimit(who.userId, "interview:start", 12, 3600);
  if (!limit.allowed) {
    return fail("rate_limited", "That is a lot of practice for one hour. Come back shortly.", {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    const body = (await req.json().catch(() => null)) as { mode?: unknown } | null;
    const mode = body?.mode;
    if (typeof mode !== "string" || !MODES.includes(mode as InterviewMode)) {
      return fail("validation_failed", "Pick an interview mode.", {
        fields: { mode: `Expected one of: ${MODES.join(", ")}` },
      });
    }
    return ok(startInterview(who.userId, mode as InterviewMode));
  } catch (e) {
    console.error("[api/interview/start]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}
