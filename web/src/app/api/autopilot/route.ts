import { fail, identify, ok } from "@/server/http";
import { getAutopilot } from "@/server/repository";
import type { AutopilotMode } from "@/types/api";

export const dynamic = "force-dynamic";

const MODES: AutopilotMode[] = ["review_every", "auto_above_90", "auto_by_preferences"];

export async function GET(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to manage Autopilot.");

  try {
    return ok(getAutopilot(who.userId));
  } catch (e) {
    console.error("[api/autopilot GET]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}

export async function PATCH(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to change Autopilot settings.");

  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return fail("validation_failed", "No settings were sent.");

    const fields: Record<string, string> = {};
    if ("mode" in body && !MODES.includes(body.mode as AutopilotMode)) {
      fields.mode = `Expected one of: ${MODES.join(", ")}`;
    }
    if ("minMatch" in body) {
      const v = Number(body.minMatch);
      if (Number.isNaN(v) || v < 50 || v > 100) fields.minMatch = "Between 50 and 100.";
    }
    if ("dailyCap" in body) {
      const v = Number(body.dailyCap);
      // Capped server-side: a client cannot raise its own submission ceiling.
      if (Number.isNaN(v) || v < 1 || v > 50) fields.dailyCap = "Between 1 and 50.";
    }
    if (Object.keys(fields).length > 0) {
      return fail("validation_failed", "Those settings are out of range.", { fields });
    }

    const current = getAutopilot(who.userId);
    return ok({ ...current, config: { ...current.config, ...body } });
  } catch (e) {
    console.error("[api/autopilot PATCH]", e);
    return fail("internal", "Something went wrong on our side. Your settings are unchanged.");
  }
}
