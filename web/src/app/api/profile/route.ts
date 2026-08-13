import { fail, identify, ok } from "@/server/http";
import { getProfile } from "@/server/repository";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to load your career profile.");

  try {
    return ok(getProfile(who.userId));
  } catch (e) {
    console.error("[api/profile]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}
