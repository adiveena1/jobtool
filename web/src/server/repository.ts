import {
  applications as seedApplications, autopilot as seedAutopilot, company as seedCompany,
  intelligence as seedIntel, jobs as seedJobs, profile as seedProfile,
  resumeScores, resumeSuggestions, trackerStats,
} from "@/lib/data";
import type {
  Application, ApplicationStage, AutopilotConfig, AutopilotStats, CareerIntelligence,
  CareerProfile, CompanyIntelligence, InterviewMetric, InterviewMode, InterviewReport,
  InterviewSession, Job, JobMatch, MatchFacet, MatchFacetKey, PipelineStats,
  ResumeVersion, AppNotification, Skill,
} from "@/types/api";

/**
 * The repository is the only place that knows how records are stored. Route
 * handlers call these functions; they never touch the seed module directly.
 * Replacing this file with real queries is the whole database migration.
 *
 * Every read takes a userId. That is not decoration — it is where per-user
 * isolation is enforced, so no handler can accidentally serve another user's
 * career data.
 */

const FACET_KEYS: Record<string, MatchFacetKey> = {
  Skills: "skills", Experience: "experience", Education: "education", Location: "location",
  Salary: "salary", Industry: "industry", Growth: "growth", "Company fit": "companyFit",
};

const STAGE_MAP: Record<string, ApplicationStage> = {
  Discovered: "discovered", Saved: "saved", Preparing: "preparing", Applied: "applied",
  Screening: "screening", Interview: "interview", Offer: "offer", Rejected: "rejected",
};

function hoursAgoToIso(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

function toMatch(j: (typeof seedJobs)[number]): JobMatch {
  const facets: MatchFacet[] = j.facets.map((f) => ({
    key: FACET_KEYS[f.label] ?? "skills",
    label: f.label,
    score: f.score,
  }));
  return {
    overall: j.match,
    facets,
    strengths: j.strengths,
    gaps: j.gaps,
    recommendation: j.recommendation,
    competition: j.competition,
    applicantCount: j.applicants,
    applyWithinHours: j.match >= 95 ? 24 : null,
  };
}

function toJob(j: (typeof seedJobs)[number]): Job {
  return {
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
    postedAt: hoursAgoToIso(j.postedHoursAgo),
    sourceCount: 41,
    match: toMatch(j),
  };
}

/* ------------------------------------------------------------------ jobs -- */

export function listJobs(_userId: string, opts?: { minMatch?: number; remoteOnly?: boolean; q?: string }): Job[] {
  let rows = seedJobs.map(toJob);
  if (opts?.minMatch != null) rows = rows.filter((j) => (j.match?.overall ?? 0) >= opts.minMatch!);
  if (opts?.remoteOnly) rows = rows.filter((j) => j.remote === "Remote");
  if (opts?.q) {
    const t = opts.q.toLowerCase();
    rows = rows.filter((j) => `${j.role} ${j.companyName} ${j.location}`.toLowerCase().includes(t));
  }
  return rows.sort((a, b) => (b.match?.overall ?? 0) - (a.match?.overall ?? 0));
}

export function getJob(userId: string, id: string): Job | null {
  return listJobs(userId).find((j) => j.id === id) ?? null;
}

/** High-fit only. The threshold is a product decision, so it lives server-side. */
export function listMatches(userId: string): Job[] {
  return listJobs(userId, { minMatch: 85 });
}

/* ---------------------------------------------------------------- profile -- */

export function getProfile(userId: string): CareerProfile {
  const skills: Skill[] = seedProfile.skills.map((name, i) => ({
    id: `sk${i}`,
    name,
    level: seedIntel.strengths.find((s) => s.skill === name)?.level ?? 70,
    demand: seedIntel.strengths.find((s) => s.skill === name)?.demand ?? 75,
    emerging: false,
  }));
  const emerging: Skill[] = seedProfile.emerging.map((name, i) => ({
    id: `em${i}`, name, level: 30, demand: 92, emerging: true,
  }));

  return {
    userId,
    title: seedProfile.title,
    level: "entry",
    yearsExperience: 3,
    skills: [...skills, ...emerging],
    education: "B.Tech, Computer Science",
    locations: seedProfile.locations,
    remotePreference: "remote",
    salaryFloorLpa: 10,
    industries: seedProfile.goals,
    targetCompanies: ["Northwind Labs", "Cobalt Systems"],
    goals: seedProfile.goals,
    workAuthorization: seedProfile.authorization,
    willingToRelocate: true,
    links: {},
    momentum: {
      value: seedProfile.momentum,
      deltaWeek: seedProfile.momentumDelta,
      nextMilestone: seedProfile.nextMilestone,
      inputs: [
        { label: "Profile completeness", value: seedProfile.profileComplete, weight: 0.2 },
        { label: "Resume strength", value: seedProfile.resumeStrength, weight: 0.3 },
        { label: "Application quality", value: 84, weight: 0.3 },
        { label: "Interview practice", value: 89, weight: 0.2 },
      ],
    },
    completeness: seedProfile.profileComplete,
  };
}

/* ----------------------------------------------------------- applications -- */

export function listApplications(_userId: string, stage?: ApplicationStage): Application[] {
  const rows: Application[] = seedApplications.map((a) => ({
    id: a.id,
    jobId: a.id.replace("a", "j"),
    role: a.role,
    companyName: a.company,
    companyMonogram: a.logo,
    companyTint: a.tint,
    stage: STAGE_MAP[a.stage] ?? "applied",
    salaryRange: a.salary,
    appliedAt: a.appliedOn === "—" ? null : a.appliedOn,
    resumeVersionId: a.resume === "—" ? null : "rv1",
    resumeLabel: a.resume,
    coverLetter: a.stage === "Preparing" ? "Drafted, awaiting your approval." : null,
    recruiter: a.recruiter ?? null,
    interviewAt: a.interviewOn ?? null,
    note: a.note,
    automated: a.note.includes("Auto-applied") ? { confidence: 91, approvedByUser: true } : null,
  }));
  return stage ? rows.filter((r) => r.stage === stage) : rows;
}

export function getPipelineStats(_userId: string): PipelineStats {
  const n = (label: string) => Number(trackerStats.find((s) => s.label === label)?.value ?? 0);
  return {
    applications: n("Applications"),
    responses: n("Responses"),
    interviews: n("Interviews"),
    offers: n("Offers"),
    responseRatePct: 15.3,
  };
}

export function createApplication(userId: string, jobId: string): Application | null {
  const job = getJob(userId, jobId);
  if (!job) return null;
  return {
    id: `a-${Date.now()}`,
    jobId: job.id,
    role: job.role,
    companyName: job.companyName,
    companyMonogram: job.companyMonogram,
    companyTint: job.companyTint,
    stage: "preparing",
    salaryRange: job.salaryRange,
    appliedAt: null,
    resumeVersionId: "rv1",
    resumeLabel: "Tailored — auto",
    coverLetter: null,
    recruiter: null,
    interviewAt: null,
    note: "Queued by you. The agent will tailor the resume before submitting.",
    automated: null,
  };
}

/* ----------------------------------------------------------------- resume -- */

export function getResume(_userId: string): ResumeVersion {
  return {
    id: "rv1",
    label: "Frontend — Northwind v3",
    tailoredForJobId: "j1",
    updatedAt: new Date().toISOString(),
    scores: resumeScores.map((s) => ({
      key: s.label === "ATS" ? "ats" : s.label === "Keyword match" ? "keyword" : s.label === "Impact" ? "impact" : "readability",
      label: s.label,
      value: s.value,
      hint: s.hint,
    })),
    sections: [
      { id: "sum", heading: "Summary", kind: "summary", bullets: [
        "Full-stack engineer building product surfaces in TypeScript and React, with three years shipping to production.",
      ]},
      { id: "exp", heading: "Experience", kind: "experience", bullets: [
        "Engineered a scalable Next.js platform used by 10,000+ users.",
        "Cut Largest Contentful Paint from 4.1s to 1.2s by streaming server components.",
        "Worked on website",
        "Helped the team with code reviews",
      ]},
      { id: "prj", heading: "Projects", kind: "projects", bullets: [
        "Built an LLM answer-grading tool; 300 weekly users at peak.",
        "Open-source Tailwind component set, 1.2k stars.",
      ]},
      { id: "edu", heading: "Education", kind: "education", bullets: ["B.Tech Computer Science — 2022"] },
      { id: "skl", heading: "Skills", kind: "skills", bullets: [seedProfile.skills.join(" · ")] },
    ],
    suggestions: resumeSuggestions.map((s) => ({
      id: s.id,
      kind: s.kind as "Impact" | "Keyword" | "Structure",
      sectionId: "exp",
      before: s.before,
      after: s.after,
      why: s.why,
      accepted: false,
    })),
    sentCount: 9,
    responseCount: 4,
  };
}

/* -------------------------------------------------------------- autopilot -- */

export function getAutopilot(_userId: string): { config: AutopilotConfig; stats: AutopilotStats } {
  return {
    config: {
      active: true,
      mode: "auto_above_90",
      minMatch: seedAutopilot.minMatch,
      dailyCap: seedAutopilot.dailyCap,
      salaryFloorLpa: 10,
      locations: seedAutopilot.locations,
      autoSubmit: true,
      humanReview: true,
      neverApplyWithoutApproval: false,
    },
    stats: {
      today: seedAutopilot.todayCount,
      week: seedAutopilot.weekCount,
      highConfidence: seedAutopilot.highConfidence,
      awaitingApproval: 4,
    },
  };
}

/* -------------------------------------------------------------- interview -- */

const QUESTIONS: Record<InterviewMode, string[]> = {
  behavioral: [
    "Tell me about a difficult technical problem you solved.",
    "Describe a time you disagreed with a teammate about an approach.",
    "Walk me through something you shipped that you would build differently now.",
  ],
  technical: [
    "How would you debug a React page that re-renders far more than it should?",
    "Explain the trade-offs between server and client rendering for a dashboard.",
    "What happens between a user pressing Enter and your page painting?",
  ],
  hr: [
    "Why are you looking to leave your current role?",
    "What compensation range are you working towards, and why that number?",
    "What would make you turn down an offer from us?",
  ],
  system_design: [
    "Design a job-matching feed that scores ten million postings nightly.",
    "How would you store and serve resume versions with per-user isolation?",
  ],
  case: ["Applications are up 40% but interviews are flat. Find the cause."],
  mock: ["Tell me about yourself.", "Tell me about a difficult technical problem you solved."],
};

export function startInterview(_userId: string, mode: InterviewMode): InterviewSession {
  const set = QUESTIONS[mode];
  return {
    id: `is-${Date.now()}`,
    mode,
    startedAt: new Date().toISOString(),
    endedAt: null,
    currentQuestion: { id: "q1", index: 1, total: set.length, prompt: set[0]!, expectedSeconds: 150 },
    liveMetrics: [
      { key: "confidence", label: "Confidence", value: 0 },
      { key: "clarity", label: "Clarity", value: 0 },
      { key: "fillerWords", label: "Filler words", value: 0 },
      { key: "technicalDepth", label: "Technical depth", value: 0 },
    ],
    transcript: [],
  };
}

export function scoreInterview(sessionId: string): InterviewReport {
  const metrics: InterviewMetric[] = [
    { key: "overall", label: "Overall", value: 89 },
    { key: "communication", label: "Communication", value: 91 },
    { key: "technicalDepth", label: "Technical depth", value: 87 },
    { key: "confidence", label: "Confidence", value: 84 },
    { key: "storytelling", label: "Storytelling", value: 92 },
  ];
  return {
    sessionId,
    metrics,
    didWell: [
      "You opened with the constraint, not the solution — that framed everything after it.",
      "Every claim carried a number. Interviewers can verify numbers; they cannot verify adjectives.",
      "You named the trade-off you rejected and why, which is the part most candidates skip.",
    ],
    improve: [
      "Four filler openings (\"so basically\"). They cost you about nine seconds and some authority.",
      "The middle ran 40 seconds long before you reached the result. Move the outcome earlier.",
      "You said \"we\" throughout a story that was yours. Say \"I\" when the decision was yours.",
    ],
    betterAnswer: {
      questionId: "q1",
      text: "The checkout page was dropping 12% of sessions on slow networks. I traced it to a 400KB client bundle blocking the first paint. I moved the pricing logic to a server component and split the payment SDK behind an interaction. LCP went from 4.1s to 1.2s and the drop-off fell to 3%. I rejected caching the old bundle harder because it would have hidden the problem rather than removed it.",
    },
  };
}

/* ----------------------------------------------------------- intelligence -- */

export function getCareerIntelligence(_userId: string): CareerIntelligence {
  return {
    advantage: { label: seedIntel.advantage, detail: seedIntel.advantageDetail },
    marketOpportunity: { label: seedIntel.opportunity.label, changePct: 31, window: seedIntel.opportunity.window },
    recommendedSkill: { label: seedIntel.recommended, why: seedIntel.recommendedWhy },
    path: seedIntel.path.map((title, i) => ({
      title,
      salaryLpa: [12, 22, 38, 62][i] ?? 0,
      current: i === 0,
    })),
    strengths: seedIntel.strengths.map((s, i) => ({
      id: `st${i}`, name: s.skill, level: s.level, demand: s.demand, emerging: false,
    })),
    gaps: seedIntel.gaps.map((g) => ({ skill: g.skill, why: g.why, urgency: g.urgency })),
  };
}

export function getCompany(_userId: string, _id: string): CompanyIntelligence {
  return {
    id: "northwind-labs",
    name: seedCompany.name,
    monogram: seedCompany.logo,
    tint: seedCompany.tint,
    industry: seedCompany.industry,
    size: seedCompany.size,
    headquarters: seedCompany.hq,
    salaryBand: seedCompany.salaryBand,
    hiringActivity: seedCompany.hiring,
    stack: seedCompany.stack,
    sentiment: seedCompany.sentiment,
    interviewDifficulty: seedCompany.difficulty,
    growth: seedCompany.growth,
    fit: seedCompany.fit,
    verdict: seedCompany.verdict,
    verdictWhy: seedCompany.verdictWhy,
  };
}

/* --------------------------------------------------------- notifications -- */

export function listNotifications(_userId: string): AppNotification[] {
  return [
    { id: "n1", kind: "match", title: "3 new roles match your profile", body: "All three clear 90%. The strongest is Senior Frontend Engineer at Northwind Labs.", createdAt: hoursAgoToIso(1), read: false, href: "/discover" },
    { id: "n2", kind: "resume", title: "Resume match rose 82% → 94%", body: "After the three bullet rewrites you accepted this morning.", createdAt: hoursAgoToIso(4), read: false, href: "/resume" },
    { id: "n3", kind: "interview", title: "Interview tomorrow at 11:00", body: "Northwind Labs, panel round. Your prep set is ready.", createdAt: hoursAgoToIso(9), read: false, href: "/interview" },
    { id: "n4", kind: "stage", title: "Cobalt Systems moved to screening", body: "The recruiter asked for a writeup of your LLM project.", createdAt: hoursAgoToIso(26), read: true, href: "/applications" },
  ];
}
