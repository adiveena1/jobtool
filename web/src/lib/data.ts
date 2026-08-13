/**
 * The single career brain.
 *
 * Every screen reads from this one profile rather than holding its own state —
 * that is the product thesis, so it is also the data shape. Swap this module
 * for real API calls and nothing above it needs to change.
 */

export type MatchFacet = { label: string; score: number };

export type Job = {
  id: string;
  role: string;
  company: string;
  logo: string;          // monogram; a real build swaps in company marks
  tint: string;
  location: string;
  remote: "Remote" | "Hybrid" | "On-site";
  salary: string;
  experience: string;
  postedHoursAgo: number;
  match: number;
  facets: MatchFacet[];
  strengths: string[];
  gaps: string[];
  recommendation: string;
  competition: "Low" | "Moderate" | "High";
  applicants: number;
};

export type Stage =
  | "Discovered" | "Saved" | "Preparing" | "Applied"
  | "Screening" | "Interview" | "Offer" | "Rejected";

export type Application = {
  id: string;
  role: string;
  company: string;
  logo: string;
  tint: string;
  stage: Stage;
  salary: string;
  appliedOn: string;
  resume: string;
  recruiter?: string;
  interviewOn?: string;
  note: string;
};

export const profile = {
  name: "Aditya",
  title: "Software Engineer",
  level: "Entry Level",
  momentum: 87,
  momentumDelta: 12,
  nextMilestone: 90,
  skills: ["React", "Next.js", "TypeScript", "Python", "PostgreSQL", "Tailwind"],
  emerging: ["LLM Applications", "System Design", "Kubernetes"],
  goals: ["AI", "SaaS", "Cybersecurity"],
  locations: ["India", "Remote"],
  authorization: "Indian citizen · open to relocation",
  resumeStrength: 92,
  profileComplete: 78,
};

export const momentumInputs = [
  { label: "Jobs discovered",     value: 248, delta: "+31 this week", tone: "iris" as const },
  { label: "Applications ready",  value: 12,  delta: "4 awaiting you", tone: "signal" as const },
  { label: "Interview invites",   value: 8,   delta: "+2 this week",  tone: "positive" as const },
  { label: "Resume strength",     value: 92,  delta: "+6 after edits", tone: "iris" as const, suffix: "%" },
  { label: "Profile complete",    value: 78,  delta: "3 fields left", tone: "caution" as const, suffix: "%" },
];

export const pipeline: { stage: Stage; count: number }[] = [
  { stage: "Discovered", count: 248 },
  { stage: "Saved", count: 34 },
  { stage: "Preparing", count: 12 },
  { stage: "Applied", count: 124 },
  { stage: "Screening", count: 19 },
  { stage: "Interview", count: 8 },
  { stage: "Offer", count: 2 },
];

export const jobs: Job[] = [
  {
    id: "j1",
    role: "Senior Frontend Engineer",
    company: "Northwind Labs",
    logo: "NL",
    tint: "#5B47FF",
    location: "Bangalore",
    remote: "Remote",
    salary: "₹25L – ₹40L",
    experience: "3–6 years",
    postedHoursAgo: 5,
    match: 98,
    facets: [
      { label: "Skills", score: 98 },
      { label: "Experience", score: 91 },
      { label: "Education", score: 86 },
      { label: "Location", score: 100 },
      { label: "Salary", score: 88 },
      { label: "Industry", score: 93 },
      { label: "Growth", score: 95 },
      { label: "Company fit", score: 90 },
    ],
    strengths: ["React", "TypeScript", "Next.js", "3 years experience"],
    gaps: ["System Design"],
    recommendation: "Strong match. Apply within 24 hours — this posting is 5 hours old and roles like it close fast.",
    competition: "Moderate",
    applicants: 62,
  },
  {
    id: "j2",
    role: "AI Product Engineer",
    company: "Cobalt Systems",
    logo: "CS",
    tint: "#12855B",
    location: "Remote — India",
    remote: "Remote",
    salary: "₹22L – ₹34L",
    experience: "2–5 years",
    postedHoursAgo: 19,
    match: 94,
    facets: [
      { label: "Skills", score: 92 },
      { label: "Experience", score: 88 },
      { label: "Education", score: 90 },
      { label: "Location", score: 100 },
      { label: "Salary", score: 84 },
      { label: "Industry", score: 99 },
      { label: "Growth", score: 97 },
      { label: "Company fit", score: 94 },
    ],
    strengths: ["Python", "React", "LLM tooling", "AI interest"],
    gaps: ["Vector databases", "Production ML"],
    recommendation: "Aligned with your AI goal. Tailor your resume around the LLM side project first.",
    competition: "High",
    applicants: 148,
  },
  {
    id: "j3",
    role: "Full Stack Engineer",
    company: "Meridian",
    logo: "MD",
    tint: "#A66A00",
    location: "Hyderabad",
    remote: "Hybrid",
    salary: "₹18L – ₹28L",
    experience: "1–4 years",
    postedHoursAgo: 42,
    match: 89,
    facets: [
      { label: "Skills", score: 94 },
      { label: "Experience", score: 96 },
      { label: "Education", score: 85 },
      { label: "Location", score: 72 },
      { label: "Salary", score: 80 },
      { label: "Industry", score: 88 },
      { label: "Growth", score: 84 },
      { label: "Company fit", score: 86 },
    ],
    strengths: ["Next.js", "PostgreSQL", "TypeScript"],
    gaps: ["Hybrid — 3 days in Hyderabad"],
    recommendation: "Good skill fit, weak location fit. Worth applying only if you would relocate.",
    competition: "Low",
    applicants: 27,
  },
  {
    id: "j4",
    role: "Security Engineer, Application",
    company: "Halcyon",
    logo: "HL",
    tint: "#C2373B",
    location: "Pune / Remote",
    remote: "Remote",
    salary: "₹20L – ₹32L",
    experience: "2–5 years",
    postedHoursAgo: 8,
    match: 82,
    facets: [
      { label: "Skills", score: 74 },
      { label: "Experience", score: 80 },
      { label: "Education", score: 88 },
      { label: "Location", score: 100 },
      { label: "Salary", score: 86 },
      { label: "Industry", score: 92 },
      { label: "Growth", score: 90 },
      { label: "Company fit", score: 78 },
    ],
    strengths: ["Web fundamentals", "Cybersecurity goal", "Python"],
    gaps: ["Threat modelling", "OWASP depth", "Security tooling"],
    recommendation: "A stretch, in the direction you said you want. Close two gaps and this becomes a 90.",
    competition: "Low",
    applicants: 19,
  },
];

export const applications: Application[] = [
  { id: "a1", role: "Senior Frontend Engineer", company: "Northwind Labs", logo: "NL", tint: "#5B47FF", stage: "Interview", salary: "₹25L – ₹40L", appliedOn: "2 Aug", resume: "Frontend — Northwind v3", recruiter: "Priya N.", interviewOn: "14 Aug, 11:00", note: "Panel is two engineers plus a manager. They asked about rendering strategy in the screen." },
  { id: "a2", role: "AI Product Engineer", company: "Cobalt Systems", logo: "CS", tint: "#12855B", stage: "Screening", salary: "₹22L – ₹34L", appliedOn: "6 Aug", resume: "AI-focused v2", recruiter: "Dev R.", note: "Recruiter asked for a writeup of the LLM side project." },
  { id: "a3", role: "Full Stack Engineer", company: "Meridian", logo: "MD", tint: "#A66A00", stage: "Applied", salary: "₹18L – ₹28L", appliedOn: "9 Aug", resume: "General v4", note: "Auto-applied at 91% confidence after your review." },
  { id: "a4", role: "Platform Engineer", company: "Ridgeline", logo: "RL", tint: "#5B47FF", stage: "Offer", salary: "₹28L", appliedOn: "12 Jul", resume: "Frontend — Northwind v3", recruiter: "Anita S.", note: "Verbal offer. Comp discussion pending — market band says you can ask for more." },
  { id: "a5", role: "Frontend Engineer II", company: "Bluepeak", logo: "BP", tint: "#12855B", stage: "Preparing", salary: "₹19L – ₹26L", appliedOn: "—", resume: "Frontend — Northwind v3", note: "Resume tailored. Cover letter drafted, awaiting your approval." },
  { id: "a6", role: "Software Engineer", company: "Datum", logo: "DT", tint: "#8A8A94", stage: "Rejected", salary: "₹16L – ₹24L", appliedOn: "18 Jul", resume: "General v3", note: "Rejected at screen. Pattern: three rejections used General v3 — retire it." },
  { id: "a7", role: "Web Engineer", company: "Solace", logo: "SL", tint: "#A66A00", stage: "Saved", salary: "₹17L – ₹25L", appliedOn: "—", resume: "—", note: "Saved from the feed. Match 84%." },
];

export const trackerStats = [
  { label: "Applications", value: "124" },
  { label: "Responses", value: "19" },
  { label: "Interviews", value: "8" },
  { label: "Offers", value: "2" },
  { label: "Response rate", value: "15.3%" },
];

export const resumeScores = [
  { label: "ATS", value: 92, hint: "Parses cleanly in the three most common systems." },
  { label: "Keyword match", value: 94, hint: "Against Senior Frontend Engineer at Northwind Labs." },
  { label: "Impact", value: 87, hint: "7 of 11 bullets carry a number." },
  { label: "Readability", value: 96, hint: "Reads at a scannable density for a 6-second first pass." },
];

export const resumeSuggestions = [
  {
    id: "s1",
    kind: "Impact",
    before: "Worked on website",
    after: "Engineered a scalable Next.js platform used by 10,000+ users.",
    why: "The original states presence, not result. The rewrite carries scale and ownership.",
  },
  {
    id: "s2",
    kind: "Keyword",
    before: "Made the site faster",
    after: "Cut Largest Contentful Paint from 4.1s to 1.2s by streaming server components.",
    why: "Adds two terms the job description asks for, and replaces a vague claim with a measurement.",
  },
  {
    id: "s3",
    kind: "Structure",
    before: "Helped the team with code reviews",
    after: "Reviewed ~40 pull requests a month and wrote the team's TypeScript conventions.",
    why: "Turns a supporting verb into a scope you can defend in an interview.",
  },
];

export const interviewModes = [
  { id: "behavioral", name: "Behavioral", detail: "Story structure, ownership, conflict", minutes: 25 },
  { id: "technical", name: "Technical", detail: "Language depth, debugging, trade-offs", minutes: 45 },
  { id: "system", name: "System Design", detail: "Scale, storage, failure modes", minutes: 45 },
  { id: "hr", name: "HR & Fit", detail: "Motivation, compensation, notice", minutes: 20 },
  { id: "case", name: "Case Study", detail: "Ambiguous problem, structured answer", minutes: 35 },
  { id: "mock", name: "Full Mock Loop", detail: "All four rounds, back to back", minutes: 120 },
];

export const interviewScores = [
  { label: "Overall", value: 89 },
  { label: "Communication", value: 91 },
  { label: "Technical depth", value: 87 },
  { label: "Confidence", value: 84 },
  { label: "Storytelling", value: 92 },
];

export const intelligence = {
  advantage: "Full-stack JavaScript",
  advantageDetail:
    "You ship both sides of the stack alone. In your target band that is rarer than either half on its own.",
  opportunity: { label: "AI Engineering demand", change: "+31%", window: "last 12 months" },
  recommended: "LLM Application Development",
  recommendedWhy: "It sits one step from what you already do and appears in 6 of your 10 highest-match roles.",
  path: ["Software Engineer", "Full Stack Engineer", "AI Engineer", "Senior AI Engineer"],
  pathSalary: ["₹12L", "₹22L", "₹38L", "₹62L"],
  strengths: [
    { skill: "React", level: 92, demand: 88 },
    { skill: "TypeScript", level: 89, demand: 91 },
    { skill: "Next.js", level: 86, demand: 79 },
    { skill: "Python", level: 74, demand: 94 },
    { skill: "PostgreSQL", level: 68, demand: 72 },
  ],
  gaps: [
    { skill: "System Design", why: "Blocks 9 of your saved roles", urgency: "high" as const },
    { skill: "LLM Applications", why: "Named in 6 high-match roles", urgency: "high" as const },
    { skill: "Kubernetes", why: "Appears in 3 roles, none critical", urgency: "low" as const },
  ],
};

export const company = {
  name: "Northwind Labs",
  logo: "NL",
  tint: "#5B47FF",
  industry: "Developer infrastructure",
  size: "220–400",
  hq: "Bangalore · Remote-first",
  salaryBand: "₹25L – ₹40L",
  hiring: "14 open roles · 6 opened this month",
  stack: ["TypeScript", "React", "Go", "PostgreSQL", "Kubernetes", "AWS"],
  sentiment: 4.3,
  difficulty: "Moderate — 4 rounds, one take-home",
  growth: "Headcount +38% YoY · Series C",
  fit: [
    { label: "Career fit", value: 91 },
    { label: "Growth", value: 94 },
    { label: "Compensation", value: 88 },
    { label: "Culture", value: 86 },
    { label: "Skill alignment", value: 96 },
  ],
  verdict: "Strong target company.",
  verdictWhy:
    "Their stack overlaps yours on four of six items, the band clears your floor, and they are hiring into the level above you — which is where you want to be in eighteen months.",
};

export const autopilot = {
  todayCount: 17,
  weekCount: 83,
  highConfidence: 61,
  minMatch: 85,
  dailyCap: 20,
  salaryFloor: "₹10L+",
  locations: ["India", "Remote"],
};

export const commands = [
  { cmd: "/find-jobs", detail: "Search roles across every connected source" },
  { cmd: "/tailor-resume", detail: "Rewrite your resume against one job" },
  { cmd: "/mock-interview", detail: "Start a timed practice round" },
  { cmd: "/analyze-job", detail: "Break down fit, gaps and competition" },
  { cmd: "/track-application", detail: "Log or move an application" },
  { cmd: "/career-plan", detail: "Rebuild your path from current signals" },
  { cmd: "/company-intelligence", detail: "Profile a company end to end" },
];

export const copilotPrompts = [
  "Find me 10 frontend jobs above ₹15L.",
  "Why am I not getting interviews?",
  "Tailor my resume for the Northwind role.",
  "Prepare me for tomorrow's interview.",
  "Show me my weakest career skill.",
];

export function freshness(hours: number): string {
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const d = Math.round(hours / 24);
  return `${d}d ago`;
}
