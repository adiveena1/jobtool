import { fail, identify, ok, rateLimit } from "@/server/http";
import { getJob, getResume } from "@/server/repository";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to tailor your resume.");

  const limit = rateLimit(who.userId, "resume:tailor", 20, 3600);
  if (!limit.allowed) {
    return fail("rate_limited", "Twenty tailored versions this hour is the cap.", {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    const body = (await req.json().catch(() => null)) as { jobId?: unknown } | null;
    if (!body || typeof body.jobId !== "string") {
      return fail("validation_failed", "Pick a role to tailor against.", { fields: { jobId: "Required." } });
    }

    const job = getJob(who.userId, body.jobId);
    if (!job) return fail("not_found", "That role is no longer listed.");

    const base = getResume(who.userId);
    return ok({
      ...base,
      id: `rv-${Date.now()}`,
      label: `${job.role.split(" ")[0]} — ${job.companyName}`,
      tailoredForJobId: job.id,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[api/resume/tailor]", e);
    return fail("upstream_unavailable", "The resume model is not responding. Nothing was overwritten.");
  }
}
