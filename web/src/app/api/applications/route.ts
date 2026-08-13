import { fail, identify, ok, pageSlice, paging, rateLimit } from "@/server/http";
import { createApplication, listApplications } from "@/server/repository";
import type { ApplicationStage } from "@/types/api";

export const dynamic = "force-dynamic";

const STAGES: ApplicationStage[] = [
  "discovered", "saved", "preparing", "applied", "screening", "interview", "offer", "rejected",
];

export async function GET(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to see your pipeline.");

  try {
    const url = new URL(req.url);
    const stageRaw = url.searchParams.get("stage");
    if (stageRaw && !STAGES.includes(stageRaw as ApplicationStage)) {
      return fail("validation_failed", "Unknown pipeline stage.", {
        fields: { stage: `Expected one of: ${STAGES.join(", ")}` },
      });
    }

    const rows = listApplications(who.userId, (stageRaw as ApplicationStage) ?? undefined);
    const { page, perPage } = paging(url);
    const { rows: slice, meta } = pageSlice(rows, page, perPage);
    return ok(slice, meta);
  } catch (e) {
    console.error("[api/applications GET]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}

export async function POST(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to apply.");

  // Applying writes to the outside world, so it is limited far harder than reads.
  const limit = rateLimit(who.userId, "applications:create", 20, 3600);
  if (!limit.allowed) {
    return fail("rate_limited", "You have hit today's application cap. Autopilot resumes in an hour.", {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  try {
    const body = (await req.json().catch(() => null)) as { jobId?: unknown } | null;
    if (!body || typeof body.jobId !== "string" || body.jobId.length === 0) {
      return fail("validation_failed", "We could not tell which role to apply to.", {
        fields: { jobId: "Required." },
      });
    }

    const created = createApplication(who.userId, body.jobId);
    if (!created) return fail("not_found", "That role is no longer listed.");
    return ok(created);
  } catch (e) {
    console.error("[api/applications POST]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}
