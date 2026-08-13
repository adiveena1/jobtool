"use client";

import { useState } from "react";
import Link from "next/link";
import { CountUp, Meter, Ring } from "@/components/Primitives";
import { Logo } from "@/components/Shell";
import { ThemeToggle } from "@/components/Theme";
import { IconArrow, IconCheck, IconLink, IconSpark, IconUpload } from "@/components/Icons";

/**
 * Career DNA.
 *
 * Built as one continuous surface rather than a paginated form: every answer
 * stays visible, and the profile assembling on the right is the reason to keep
 * going. The last step is not a submit button — it is the DNA itself.
 */

const WHO = [
  "Student", "Graduate", "Software Engineer", "Designer",
  "Cybersecurity Professional", "Data Scientist", "Product Manager", "Other",
];
const LEVELS = ["Student", "Entry level", "1–3 years", "3–6 years", "6+ years"];
const MODES = ["Remote", "Hybrid", "On-site", "No preference"];
const LOCATIONS = ["Bangalore", "Hyderabad", "Pune", "Delhi NCR", "Mumbai", "Remote — India", "Open to relocate"];
const INDUSTRIES = ["AI", "SaaS", "Cybersecurity", "Fintech", "Developer tools", "Healthtech", "Gaming"];
const SKILLS = ["React", "Next.js", "TypeScript", "Python", "PostgreSQL", "Tailwind", "Go", "Docker", "AWS", "Kubernetes", "System Design", "LLM Applications"];
const SALARY = ["₹6L+", "₹10L+", "₹15L+", "₹25L+", "₹40L+"];
const COMPANIES = ["Northwind Labs", "Cobalt Systems", "Meridian", "Halcyon", "Ridgeline", "Bluepeak"];

type Step = { id: string; rail: string; title: string; hint: string };

const STEPS: Step[] = [
  { id: "who",       rail: "01", title: "Who are you right now?",        hint: "This sets the level the agent scores you against." },
  { id: "seeking",   rail: "02", title: "What are you looking for?",     hint: "Roles, level and how you want to work." },
  { id: "where",     rail: "03", title: "Where, and for how much?",      hint: "The floor below which the agent will not apply." },
  { id: "skills",    rail: "04", title: "What can you actually do?",     hint: "Pick what you would defend in an interview, not what you have read about." },
  { id: "direction", rail: "05", title: "Where is this going?",          hint: "Industries and companies you are aiming at." },
  { id: "import",    rail: "06", title: "Bring in what already exists",  hint: "Optional. Everything here can be typed instead." },
];

function Toggle({
  label, on, onClick,
}: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="chip transition-all"
      style={on
        ? { background: "var(--iris)", color: "#fff", borderColor: "var(--iris)" }
        : { cursor: "pointer" }}
    >
      {on && <IconCheck size={11} />}
      {label}
    </button>
  );
}

export default function Onboarding() {
  const [who, setWho] = useState("Software Engineer");
  const [level, setLevel] = useState("1–3 years");
  const [roles, setRoles] = useState("Frontend Engineer, Full Stack Engineer");
  const [mode, setMode] = useState("Remote");
  const [locations, setLocations] = useState<string[]>(["Bangalore", "Remote — India"]);
  const [salary, setSalary] = useState("₹15L+");
  const [skills, setSkills] = useState<string[]>(["React", "Next.js", "TypeScript", "Python"]);
  const [industries, setIndustries] = useState<string[]>(["AI", "SaaS", "Cybersecurity"]);
  const [targets, setTargets] = useState<string[]>(["Northwind Labs"]);
  const [relocate, setRelocate] = useState(true);
  const [links, setLinks] = useState({ linkedin: "", github: "", portfolio: "" });
  const [resume, setResume] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggle(list: string[], set: (v: string[]) => void, v: string) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  // Completeness is honest: it counts what has actually been answered.
  const filled = [
    Boolean(who), Boolean(level), roles.trim().length > 3, Boolean(mode),
    locations.length > 0, Boolean(salary), skills.length >= 3, industries.length > 0,
    targets.length > 0, Boolean(resume || links.linkedin || links.github),
  ];
  const completeness = Math.round((filled.filter(Boolean).length / filled.length) * 100);
  const momentum = Math.min(96, 44 + Math.round(completeness * 0.45));

  /* ------------------------------------------------------------ generated */
  if (done) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-[1000px] px-4 pb-24 pt-12 md:px-8">
          <div className="mb-8 text-center">
            <span className="chip chip-iris mb-5"><IconSpark size={12} /> Generated from everything you gave us</span>
            <h1 className="display mb-4" style={{ fontSize: "clamp(36px,5.6vw,58px)" }}>Your Career DNA</h1>
            <p className="body-lg mx-auto max-w-[520px]">
              This is the profile every other screen reads from. Change it once and discovery, matching,
              your resume and your interview prep all move with it.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
            <div className="panel flex flex-col items-center p-7">
              <Ring value={momentum} size={162} stroke={9}>
                <span className="tnum text-[42px] font-semibold leading-none"><CountUp to={momentum} /></span>
                <span className="rail mt-1">/ 100</span>
              </Ring>
              <p className="h3 mt-5">Career Momentum</p>
              <p className="caption mt-1 text-center">Your starting score. It moves as you apply and practise.</p>

              <div className="mt-6 w-full">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="rail">Profile complete</span>
                  <span className="tnum text-[12px] font-semibold">{completeness}%</span>
                </div>
                <Meter value={completeness} tone={completeness > 85 ? "positive" : "caution"} />
              </div>
            </div>

            <div className="panel grid-field p-7 md:p-9">
              <dl className="grid gap-7 sm:grid-cols-2">
                <Field k="Role" v={who} />
                <Field k="Experience" v={level} />
                <Field k="Targeting" v={roles} />
                <Field k="Work mode" v={mode} />
                <Field k="Expected salary" v={salary} />
                <Field k="Work authorization" v={`Indian citizen · ${relocate ? "open to relocation" : "no relocation"}`} />
                <div className="sm:col-span-2">
                  <dt className="rail mb-2.5">Top skills</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {skills.map((s) => <span key={s} className="chip chip-iris">{s}</span>)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="rail mb-2.5">Preferred locations</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {locations.map((s) => <span key={s} className="chip">{s}</span>)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="rail mb-2.5">Career goals</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {industries.map((s) => <span key={s} className="chip">{s}</span>)}
                  </dd>
                </div>
                {targets.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="rail mb-2.5">Target companies</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {targets.map((s) => <span key={s} className="chip">{s}</span>)}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-8 flex flex-wrap gap-3 border-t pt-6" style={{ borderColor: "var(--line)" }}>
                <Link href="/dashboard" className="btn btn-primary">
                  Open Mission Control <IconArrow size={16} />
                </Link>
                <button onClick={() => setDone(false)} className="btn btn-quiet">Edit my DNA</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ---------------------------------------------------------------- build */
  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto grid max-w-shell gap-8 px-4 pb-24 pt-10 md:px-8 lg:grid-cols-[1fr_330px]">
        <div>
          <div className="mb-9">
            <span className="chip chip-iris mb-4"><span className="pulse" style={{ background: "var(--iris)" }} /> Building your Career DNA</span>
            <h1 className="h1 mb-2">Six questions. Then the agent takes over.</h1>
            <p className="body-lg">
              Nothing here is a required field. Answer what is true and skip the rest — the agent will tell you
              which gaps are costing you.
            </p>
          </div>

          <div className="space-y-4">
            <Card step={STEPS[0]!}>
              <div className="flex flex-wrap gap-2">
                {WHO.map((w) => <Toggle key={w} label={w} on={who === w} onClick={() => setWho(w)} />)}
              </div>
            </Card>

            <Card step={STEPS[1]!}>
              <label htmlFor="roles" className="rail mb-2 block">Preferred roles</label>
              <input
                id="roles" value={roles} onChange={(e) => setRoles(e.target.value)}
                placeholder="Frontend Engineer, Full Stack Engineer"
                className="mb-5 w-full rounded-[9px] px-3.5 text-[14px] outline-none"
                style={{ height: 42, background: "var(--surface-2)", border: "1px solid var(--line-2)", color: "var(--ink)" }}
              />
              <p className="rail mb-2">Experience level</p>
              <div className="mb-5 flex flex-wrap gap-2">
                {LEVELS.map((l) => <Toggle key={l} label={l} on={level === l} onClick={() => setLevel(l)} />)}
              </div>
              <p className="rail mb-2">How you want to work</p>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => <Toggle key={m} label={m} on={mode === m} onClick={() => setMode(m)} />)}
              </div>
            </Card>

            <Card step={STEPS[2]!}>
              <p className="rail mb-2">Preferred locations</p>
              <div className="mb-5 flex flex-wrap gap-2">
                {LOCATIONS.map((l) => (
                  <Toggle key={l} label={l} on={locations.includes(l)} onClick={() => toggle(locations, setLocations, l)} />
                ))}
              </div>
              <p className="rail mb-2">Expected salary — the agent will not apply below this</p>
              <div className="mb-5 flex flex-wrap gap-2">
                {SALARY.map((s) => <Toggle key={s} label={s} on={salary === s} onClick={() => setSalary(s)} />)}
              </div>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={relocate} onChange={(e) => setRelocate(e.target.checked)}
                       className="h-4 w-4 accent-[var(--iris)]" />
                <span className="text-[13.5px]">I would relocate for the right role</span>
              </label>
            </Card>

            <Card step={STEPS[3]!}>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <Toggle key={s} label={s} on={skills.includes(s)} onClick={() => toggle(skills, setSkills, s)} />
                ))}
              </div>
              {skills.length < 3 && (
                <p className="caption mt-3" style={{ color: "var(--caution)" }}>
                  Pick at least three. Below that the match scores are not worth showing you.
                </p>
              )}
            </Card>

            <Card step={STEPS[4]!}>
              <p className="rail mb-2">Industries</p>
              <div className="mb-5 flex flex-wrap gap-2">
                {INDUSTRIES.map((s) => (
                  <Toggle key={s} label={s} on={industries.includes(s)} onClick={() => toggle(industries, setIndustries, s)} />
                ))}
              </div>
              <p className="rail mb-2">Target companies</p>
              <div className="flex flex-wrap gap-2">
                {COMPANIES.map((s) => (
                  <Toggle key={s} label={s} on={targets.includes(s)} onClick={() => toggle(targets, setTargets, s)} />
                ))}
              </div>
            </Card>

            <Card step={STEPS[5]!}>
              <button
                onClick={() => setResume("aditya-resume.pdf")}
                className="mb-4 flex w-full items-center gap-3 rounded-[12px] p-4 text-left transition-colors"
                style={{ border: `1.5px dashed ${resume ? "var(--positive)" : "var(--line-2)"}`,
                         background: resume ? "var(--positive-soft)" : "var(--surface-2)" }}
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px]"
                      style={{ background: "var(--surface)", color: resume ? "var(--positive)" : "var(--iris)" }}>
                  {resume ? <IconCheck size={17} /> : <IconUpload size={17} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium">
                    {resume ?? "Upload your resume"}
                  </span>
                  <span className="caption block">
                    {resume ? "Parsed — 11 bullets, 6 skills, 2 projects found." : "PDF up to 5MB. The file is never stored, only what it says."}
                  </span>
                </span>
              </button>

              <div className="space-y-2.5">
                {([
                  ["linkedin", "LinkedIn profile URL"],
                  ["github", "GitHub username"],
                  ["portfolio", "Portfolio URL"],
                ] as const).map(([k, label]) => (
                  <div key={k} className="flex items-center gap-2.5 rounded-[9px] px-3"
                       style={{ height: 42, background: "var(--surface-2)", border: "1px solid var(--line-2)" }}>
                    <IconLink size={14} style={{ color: "var(--ink-3)" }} />
                    <input
                      value={links[k]}
                      onChange={(e) => setLinks((l) => ({ ...l, [k]: e.target.value }))}
                      placeholder={label}
                      aria-label={label}
                      className="flex-1 bg-transparent text-[13.5px] outline-none"
                      style={{ color: "var(--ink)" }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <button onClick={() => setDone(true)} className="btn btn-primary btn-lg mt-7 w-full sm:w-auto">
            Generate my Career DNA <IconArrow size={17} />
          </button>
        </div>

        {/* Live profile */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="pulse" />
              <p className="rail">Assembling</p>
            </div>

            <div className="mb-5">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[12.5px]" style={{ color: "var(--ink-2)" }}>Profile completeness</span>
                <span className="tnum text-[12.5px] font-semibold">{completeness}%</span>
              </div>
              <Meter value={completeness} tone={completeness > 85 ? "positive" : "iris"} height={5} />
            </div>

            <dl className="space-y-3.5">
              <MiniField k="Role" v={who} />
              <MiniField k="Level" v={level} />
              <MiniField k="Mode" v={mode} />
              <MiniField k="Salary" v={salary} />
              <MiniField k="Skills" v={skills.length ? `${skills.length} selected` : "none yet"} />
              <MiniField k="Locations" v={locations.length ? `${locations.length} selected` : "none yet"} />
            </dl>

            <p className="caption mt-5 border-t pt-4" style={{ borderColor: "var(--line)" }}>
              Everything you enter stays yours. The agent reads it; nobody else does.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------- fragments -- */

function Header() {
  return (
    <header className="glass sticky top-0 z-50" style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}>
      <div className="mx-auto flex max-w-shell items-center gap-4 px-4 md:px-8" style={{ height: 60 }}>
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[15px] font-semibold tracking-[-0.02em]">
            Career<span style={{ color: "var(--iris)" }}>OS</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard" className="btn btn-ghost btn-sm">Skip for now</Link>
        </div>
      </div>
    </header>
  );
}

function Card({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <section className="panel p-5 md:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="tnum rail flex-none pt-1" style={{ color: "var(--iris)" }}>{step.rail}</span>
        <div className="min-w-0">
          <h2 className="h2">{step.title}</h2>
          <p className="caption mt-1">{step.hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="rail mb-1.5">{k}</dt>
      <dd className="text-[16px] font-medium leading-snug">{v}</dd>
    </div>
  );
}

function MiniField({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="rail">{k}</dt>
      <dd className="truncate text-[13px] font-medium">{v}</dd>
    </div>
  );
}
