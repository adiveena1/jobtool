import { fail, identify, ok, rateLimit } from "@/server/http";
import { answerFromBrain } from "@/server/ai";

export const dynamic = "force-dynamic";

/**
 * The only entry point to the copilot.
 *
 * The provider key is read server-side inside the AI layer and never reaches
 * either client. The response is a structured AiMessage, so the UI renders
 * fields rather than parsing prose.
 */
export async function POST(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to talk to your career agent.");

  const limit = rateLimit(who.userId, "ai:chat", 40, 3600);
  if (!limit.allowed) {
    return fail("rate_limited", "Forty questions an hour is the cap. The agent keeps working meanwhile.", {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    const body = (await req.json().catch(() => null)) as { message?: unknown } | null;
    if (!body || typeof body.message !== "string" || body.message.trim().length === 0) {
      return fail("validation_failed", "Ask the agent something.", { fields: { message: "Required." } });
    }
    if (body.message.length > 2000) {
      return fail("validation_failed", "That message is too long.", {
        fields: { message: "Keep it under 2000 characters." },
      });
    }

    return ok(await answerFromBrain(who.userId, body.message));
  } catch (e) {
    console.error("[api/ai/chat]", e);
    return fail("upstream_unavailable", "The agent is not reachable right now. Nothing you asked was lost.");
  }
}
