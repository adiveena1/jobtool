import { fail, identify, ok } from "@/server/http";
import { getCompany } from "@/server/repository";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to see company intelligence.");

  try {
    const { id } = await params;
    return ok(getCompany(who.userId, id));
  } catch (e) {
    console.error("[api/companies/:id]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}
