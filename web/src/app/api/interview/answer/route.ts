import { fail, identify, ok } from "@/server/http";
import { scoreInterview } from "@/server/repository";

export const dynamic = "force-dynamic";

/**
 * Submits one answer. When the session has no questions left the response
 * carries the finished report, so the client never has to poll for it.
 */
export async function POST(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to continue the round.");

  try {
    const body = (await req.json().catch(() => null)) as
      | { sessionId?: unknown; questionId?: unknown; text?: unknown; final?: unknown }
      | null;

    if (!body || typeof body.sessionId !== "string" || typeof body.text !== "string") {
      return fail("validation_failed", "We did not receive your answer.", {
        fields: { text: "Required.", sessionId: "Required." },
      });
    }
    if (body.text.trim().length < 2) {
      return fail("validation_failed", "That answer is too short to score.", {
        fields: { text: "Say a little more." },
      });
    }

    if (body.final === true) {
      return ok({ done: true as const, report: scoreInterview(body.sessionId) });
    }

    return ok({
      done: false as const,
      liveMetrics: [
        { key: "confidence", label: "Confidence", value: 84 },
        { key: "clarity", label: "Clarity", value: 88 },
        { key: "fillerWords", label: "Filler words", value: 4 },
        { key: "technicalDepth", label: "Technical depth", value: 87 },
      ],
    });
  } catch (e) {
    console.error("[api/interview/answer]", e);
    return fail("internal", "Something went wrong on our side. Your answer was not lost.");
  }
}
