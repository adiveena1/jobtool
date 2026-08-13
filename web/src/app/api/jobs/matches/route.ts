import { fail, identify, ok, pageSlice, paging } from "@/server/http";
import { listMatches } from "@/server/repository";

export const dynamic = "force-dynamic";

/** High-fit roles only. The cutoff is a product rule, so it stays server-side. */
export async function GET(req: Request) {
  const who = identify(req);
  if (!who) return fail("unauthorized", "Sign in to see your matches.");

  try {
    const url = new URL(req.url);
    const { page, perPage } = paging(url);
    const { rows, meta } = pageSlice(listMatches(who.userId), page, perPage);
    return ok(rows, meta);
  } catch (e) {
    console.error("[api/jobs/matches]", e);
    return fail("internal", "Something went wrong on our side. Try again in a moment.");
  }
}
