import { jobs as seed } from "@/lib/data";
import type { Job, MatchFacetKey } from "@/types/api";

/**
 * Client-safe view of the shortlist.
 *
 * Screens that run in the browser cannot import server/repository — that module
 * is the data boundary and must stay out of the client bundle. This mapper
 * produces the same contract shape from the seed for interactive screens; in a
 * real build the page fetches /api/jobs/matches instead and drops this file.
 */

const KEYS: Record<string, MatchFacetKey> = {
  Skills: "skills", Experience: "experience", Education: "education", Location: "location",
  Salary: "salary", Industry: "industry", Growth: "growth", "Company fit": "companyFit",
};

export function listMatches(): Job[] {
  return seed
    .filter((j) => j.match >= 80)
    .map((j) => ({
      id: j.id,
      role: j.role,
      companyId: j.company.toLowerCase().replace(/[^a-z]+/g, "-"),
      companyName: j.company,
      companyMonogram: j.logo,
      companyTint: j.tint,
      location: j.location,
      remote: j.remote,
      salaryRange: j.salary,
      experienceRange: j.experience,
      postedAt: new Date(Date.now() - j.postedHoursAgo * 3600_000).toISOString(),
      sourceCount: 41,
      match: {
        overall: j.match,
        facets: j.facets.map((f) => ({ key: KEYS[f.label] ?? "skills", label: f.label, score: f.score })),
        strengths: j.strengths,
        gaps: j.gaps,
        recommendation: j.recommendation,
        competition: j.competition,
        applicantCount: j.applicants,
        applyWithinHours: j.match >= 95 ? 24 : null,
      },
    }))
    .sort((a, b) => (b.match?.overall ?? 0) - (a.match?.overall ?? 0));
}
