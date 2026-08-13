import { fail, identify, ok } from "@/server/http";
import { getJob } from "@/server/repository";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to view this role.");

  try {
    const { id } = await params;
    const job = getJob(who.userId, id);
    if (!job) return fail("not_found", "That role is no longer listed.");
    return ok(job);
  } catch (e) {
    console.error("[api/jobs/:id]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}
