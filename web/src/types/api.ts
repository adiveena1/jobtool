/**
 * THE API CONTRACT
 *
 * This file is the single definition of what the backend returns. The Flutter
 * client mirrors it in mobile/lib/shared/models/. When a shape changes here it
 * must change there — nothing else in either client should invent a field.
 *
 * Business logic does not live in this file, and must not live in either
 * client: these are transport shapes only.
 */

/* -------------------------------------------------------------- envelopes -- */

export type ApiOk<T> = { ok: true; data: T; meta?: PageMeta };
export type ApiErr = { ok: false; error: ApiError };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation_failed"
  | "rate_limited"
  | "upstream_unavailable"
  | "internal";

export type ApiError = {
  code: ApiErrorCode;
  /** Safe to render directly. Never contains a stack trace or provider detail. */
  message: string;
  /** Field-level detail for form errors. */
  fields?: Record<string, string>;
  retryAfterSeconds?: number;
};

export type PageMeta = { page: number; perPage: number; total: number; hasMore: boolean };

/** Every async surface in both clients renders exactly one of these. */
export type LoadState = "loading" | "success" | "empty" | "error" | "unauthorized" | "rate_limited";

/* ------------------------------------------------------------------- user -- */

export type User = {
  id: string;
  email: string;
  name: string;
  avatarMonogram: string;
  createdAt: string;
  emailVerified: boolean;
};

export type AuthSession = {
  user: User;
  /** Short-lived. The refresh token is httpOnly and never reaches client JS. */
  accessToken: string;
  expiresAt: string;
};

export type ExperienceLevel = "student" | "entry" | "mid" | "senior" | "staff";
export type RemotePreference = "remote" | "hybrid" | "onsite" | "any";

/* ---------------------------------------------------------- career profile -- */

export type Skill = { id: string; name: string; level: number; demand: number; emerging: boolean };

export type CareerProfile = {
  userId: string;
  title: string;
  level: ExperienceLevel;
  yearsExperience: number;
  skills: Skill[];
  education: string;
  locations: string[];
  remotePreference: RemotePreference;
  salaryFloorLpa: number;
  industries: string[];
  targetCompanies: string[];
  goals: string[];
  workAuthorization: string;
  willingToRelocate: boolean;
  links: { linkedin?: string; github?: string; portfolio?: string };
  momentum: MomentumScore;
  completeness: number;
};

export type MomentumScore = {
  value: number;
  deltaWeek: number;
  nextMilestone: number;
  inputs: { label: string; value: number; weight: number }[];
};

/* -------------------------------------------------------------------- job -- */

export type RemoteStatus = "Remote" | "Hybrid" | "On-site";
export type Competition = "Low" | "Moderate" | "High";

export type MatchFacetKey =
  | "skills" | "experience" | "education" | "location"
  | "salary" | "industry" | "growth" | "companyFit";

export type MatchFacet = { key: MatchFacetKey; label: string; score: number };

export type JobMatch = {
  overall: number;
  facets: MatchFacet[];
  strengths: string[];
  gaps: string[];
  recommendation: string;
  competition: Competition;
  applicantCount: number;
  /** Model-produced, structured. The UI never parses prose to get these. */
  applyWithinHours: number | null;
};

export type Job = {
  id: string;
  role: string;
  companyId: string;
  companyName: string;
  companyMonogram: string;
  companyTint: string;
  location: string;
  remote: RemoteStatus;
  salaryRange: string;
  experienceRange: string;
  postedAt: string;
  sourceCount: number;
  match: JobMatch | null;
};

/* ----------------------------------------------------------------- resume -- */

export type ResumeScoreKey = "ats" | "keyword" | "impact" | "readability";

export type ResumeScore = { key: ResumeScoreKey; label: string; value: number; hint: string };

export type ResumeSuggestion = {
  id: string;
  kind: "Impact" | "Keyword" | "Structure" | "Clarity";
  sectionId: string;
  before: string;
  after: string;
  why: string;
  accepted: boolean;
};

export type ResumeSection = {
  id: string;
  heading: string;
  kind: "summary" | "experience" | "projects" | "education" | "skills";
  bullets: string[];
};

export type ResumeVersion = {
  id: string;
  label: string;
  tailoredForJobId: string | null;
  updatedAt: string;
  scores: ResumeScore[];
  sections: ResumeSection[];
  suggestions: ResumeSuggestion[];
  sentCount: number;
  responseCount: number;
};

/* ----------------------------------------------------------- applications -- */

export type ApplicationStage =
  | "discovered" | "saved" | "preparing" | "applied"
  | "screening" | "interview" | "offer" | "rejected";

export type Application = {
  id: string;
  jobId: string;
  role: string;
  companyName: string;
  companyMonogram: string;
  companyTint: string;
  stage: ApplicationStage;
  salaryRange: string;
  appliedAt: string | null;
  resumeVersionId: string | null;
  resumeLabel: string;
  coverLetter: string | null;
  recruiter: string | null;
  interviewAt: string | null;
  note: string;
  /** Set when Autopilot submitted it, with the confidence it used. */
  automated: { confidence: number; approvedByUser: boolean } | null;
};

export type PipelineStats = {
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  responseRatePct: number;
};

/* -------------------------------------------------------------- autopilot -- */

export type AutopilotMode = "review_every" | "auto_above_90" | "auto_by_preferences";

export type AutopilotConfig = {
  active: boolean;
  mode: AutopilotMode;
  minMatch: number;
  dailyCap: number;
  salaryFloorLpa: number;
  locations: string[];
  autoSubmit: boolean;
  humanReview: boolean;
  /** Hard stop. When true no submission happens without an explicit approval. */
  neverApplyWithoutApproval: boolean;
};

export type AutopilotStats = { today: number; week: number; highConfidence: number; awaitingApproval: number };

/* -------------------------------------------------------------- interview -- */

export type InterviewMode = "behavioral" | "technical" | "hr" | "system_design" | "case" | "mock";

export type InterviewMetricKey =
  | "overall" | "communication" | "technicalDepth" | "confidence" | "storytelling"
  | "clarity" | "fillerWords" | "structure";

export type InterviewMetric = { key: InterviewMetricKey; label: string; value: number };

export type InterviewQuestion = { id: string; index: number; total: number; prompt: string; expectedSeconds: number };

export type InterviewSession = {
  id: string;
  mode: InterviewMode;
  startedAt: string;
  endedAt: string | null;
  currentQuestion: InterviewQuestion | null;
  liveMetrics: InterviewMetric[];
  transcript: { questionId: string; text: string; atSeconds: number }[];
};

export type InterviewReport = {
  sessionId: string;
  metrics: InterviewMetric[];
  didWell: string[];
  improve: string[];
  betterAnswer: { questionId: string; text: string };
};

/* ---------------------------------------------------------- intelligence -- */

export type CareerIntelligence = {
  advantage: { label: string; detail: string };
  marketOpportunity: { label: string; changePct: number; window: string };
  recommendedSkill: { label: string; why: string };
  path: { title: string; salaryLpa: number; current: boolean }[];
  strengths: Skill[];
  gaps: { skill: string; why: string; urgency: "low" | "medium" | "high" }[];
};

export type CompanyIntelligence = {
  id: string;
  name: string;
  monogram: string;
  tint: string;
  industry: string;
  size: string;
  headquarters: string;
  salaryBand: string;
  hiringActivity: string;
  stack: string[];
  sentiment: number;
  interviewDifficulty: string;
  growth: string;
  fit: { label: string; value: number }[];
  verdict: string;
  verdictWhy: string;
};

/* ------------------------------------------------------------------- ai -- */

export type AiRole = "user" | "agent";

export type AiMessage = {
  id: string;
  role: AiRole;
  text: string;
  /** Structured evidence pulled from the brain. Rendered as a list, not prose. */
  facts?: string[];
  createdAt: string;
};

export type AiConversation = { id: string; messages: AiMessage[] };

/* --------------------------------------------------------- notifications -- */

export type NotificationKind = "match" | "resume" | "interview" | "stage" | "opportunity";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href: string | null;
};
