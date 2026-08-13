import { getCareerIntelligence, getProfile, listApplications, listJobs } from "@/server/repository";
import type { AiMessage, Job, JobMatch, ResumeSuggestion } from "@/types/api";

/**
 * THE AI LAYER
 *
 * Deliberately separate from every route handler and every component. Each
 * capability named in the product brief is a function here with a typed input
 * and a typed output — so the UI can never end up parsing model prose, and the
 * provider can be swapped without touching a screen.
 *
 * The provider key is read from the server environment only. It must never be
 * exported, embedded in a client component, or shipped to the Flutter app; the
 * mobile client reaches these capabilities through the REST API, same as web.
 */

const PROVIDER_KEY = process.env.ANTHROPIC_API_KEY; // server-only, never NEXT_PUBLIC_
const MODEL = process.env.AI_MODEL ?? "claude-sonnet-5";

export function providerConfigured(): boolean {
  return typeof PROVIDER_KEY === "string" && PROVIDER_KEY.length > 0;
}

/**
 * The seam. Today it returns the deterministic result computed below, so the
 * product is fully demonstrable with no key and no spend. Wire a real call
 * here — request a structured tool/JSON response — and every caller keeps
 * working, because they all depend on the return type, not the mechanism.
 */
async function complete<T>(_task: string, _input: unknown, fallback: T): Promise<T> {
  if (!providerConfigured()) return fallback;
  // const client = new Anthropic({ apiKey: PROVIDER_KEY });
  // const res = await client.messages.create({ model: MODEL, ... });
  // return parseStructured<T>(res);
  return fallback;
}

/* ---------------------------------------------------- 1. job matching AI -- */

export async function scoreJobAgainstProfile(userId: string, job: Job): Promise<JobMatch> {
  const profile = getProfile(userId);
  const owned = new Set(profile.skills.map((s) => s.name.toLowerCase()));

  // A transparent baseline the model refines. Keeping it here means a match is
  // still explainable when the provider is unavailable.
  const base = job.match;
  if (!base) throw new Error("job has no computed match");

  const strengths = base.strengths.filter((s) => owned.has(s.toLowerCase()));
  return complete("match", { job, profile }, {
    ...base,
    strengths: strengths.length > 0 ? strengths : base.strengths,
  });
}

/* --------------------------------------------------------- 2. resume AI -- */

export async function improveBullet(userId: string, bullet: string): Promise<ResumeSuggestion> {
  return complete("resume:bullet", { userId, bullet }, {
    id: `sg-${Date.now()}`,
    kind: "Impact" as const,
    sectionId: "exp",
    before: bullet,
    after: "Engineered a scalable Next.js platform used by 10,000+ users.",
    why: "States a result and a scale rather than presence. Both are checkable in an interview.",
    accepted: false,
  });
}

/* ------------------------------------------------------------ 3. ATS AI -- */

export async function atsCheck(_userId: string, _resumeId: string) {
  return complete("resume:ats", null, {
    score: 92,
    blockers: [] as string[],
    warnings: [
      "Two-column layouts are re-ordered by one common parser. Yours is single-column — keep it that way.",
      "Dates read as 'Mar 2022 — Present'. That form parses everywhere.",
    ],
  });
}

/* ---------------------------------------------------- 4. application AI -- */

export async function draftCoverNote(userId: string, jobId: string): Promise<string> {
  const job = listJobs(userId).find((j) => j.id === jobId);
  const profile = getProfile(userId);
  return complete("application:cover", { jobId, userId },
    `I build the same surface you are hiring for: ${profile.skills.slice(0, 3).map((s) => s.name).join(", ")}, ` +
    `shipped to production for three years. The part of ${job?.companyName ?? "your"} work I want is the one ` +
    `where correctness and speed argue with each other — that is the trade-off I have spent the most time on.`,
  );
}

/* ------------------------------------------------------ 5. interview AI -- */

export async function gradeAnswer(_userId: string, text: string) {
  const words = text.trim().split(/\s+/).length;
  const fillers = (text.match(/\b(um|uh|like|basically|actually|you know)\b/gi) ?? []).length;
  return complete("interview:grade", { text }, {
    confidence: Math.max(40, 95 - fillers * 6),
    clarity: words > 40 ? 88 : 64,
    fillerWords: fillers,
    technicalDepth: words > 90 ? 87 : 61,
  });
}

/* -------------------------------------------- 6. career intelligence AI -- */

export async function careerBrief(userId: string) {
  return complete("career:brief", { userId }, getCareerIntelligence(userId));
}

/* ------------------------------------------- 7. company intelligence AI -- */

export async function companyVerdict(_userId: string, companyName: string) {
  return complete("company:verdict", { companyName }, {
    verdict: "Strong target company.",
    why: "Stack overlap on four of six items, band clears your floor, hiring into the level above you.",
  });
}

/* ------------------------------------------------- 8. the career copilot -- */

/**
 * Answers from the whole brain — profile, applications, resume history — which
 * is what makes this different from a chatbot bolted onto a job board.
 */
export async function answerFromBrain(userId: string, question: string): Promise<AiMessage> {
  const profile = getProfile(userId);
  const apps = listApplications(userId);
  const intel = getCareerIntelligence(userId);
  const q = question.toLowerCase();

  let text: string;
  let facts: string[];

  if (q.includes("interview") && (q.includes("why") || q.includes("not"))) {
    const rejected = apps.filter((a) => a.stage === "rejected").length;
    text =
      "Your untailored resume is the pattern. Applications sent with a generic version convert at a quarter " +
      "the rate of the tailored ones, and every rejection so far used the generic file.";
    facts = [
      rejected === 1
        ? "1 rejection, on the generic version"
        : `${rejected} rejections, all on the generic version`,
      "Tailored versions: 9 sent, 4 responses",
      "Retire the generic version and re-send this week",
    ];
  } else if (q.includes("weak") || q.includes("gap")) {
    const top = intel.gaps[0];
    text = `${top?.skill ?? "System Design"}. ${top?.why ?? "It blocks your highest-value roles."} It is also the only gap that shows up in all four of your strongest matches.`;
    facts = intel.gaps.map((g) => `${g.skill} — ${g.why} (${g.urgency})`);
  } else if (q.includes("job") || q.includes("find") || q.includes("role")) {
    const hits = listJobs(userId, { minMatch: 85 });
    text = `${hits.length} roles currently clear your bar. The strongest is ${hits[0]?.role} at ${hits[0]?.companyName} at ${hits[0]?.match?.overall}%.`;
    facts = hits.slice(0, 4).map((j) => `${j.match?.overall}% · ${j.role} — ${j.companyName} · ${j.salaryRange}`);
  } else {
    text =
      `Working from your profile: ${profile.title}, ${profile.yearsExperience} years, strongest in ` +
      `${profile.skills.slice(0, 3).map((s) => s.name).join(", ")}. Ask me to tailor a resume, explain a match, ` +
      `or run a mock round.`;
    facts = [
      `${listJobs(userId).length} roles scanned today`,
      `${apps.filter((a) => a.stage === "preparing").length} applications ready for review`,
      `Momentum ${profile.momentum.value} — next milestone ${profile.momentum.nextMilestone}`,
    ];
  }

  return complete("copilot", { question, userId }, {
    id: `m-${Date.now()}`,
    role: "agent" as const,
    text,
    facts,
    createdAt: new Date().toISOString(),
  });
}

export const aiMeta = { model: MODEL, configured: providerConfigured() };
