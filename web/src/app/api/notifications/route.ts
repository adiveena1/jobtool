import { fail, identify, ok } from "@/server/http";
import { listNotifications } from "@/server/repository";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to see your notifications.");

  try {
    return ok(listNotifications(who.userId));
  } catch (e) {
    console.error("[api/notifications]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}
