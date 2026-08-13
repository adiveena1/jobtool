import { fail, identify, ok } from "@/server/http";
import { getCareerIntelligence } from "@/server/repository";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to see your career intelligence.");

  try {
    return ok(getCareerIntelligence(who.userId));
  } catch (e) {
    console.error("[api/career/intelligence]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}
