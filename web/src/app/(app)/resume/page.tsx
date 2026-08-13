"use client";

import { useMemo, useState } from "react";
import { CountUp, Meter, Ring } from "@/components/Primitives";
import { PageHead } from "@/components/States";
import { IconArrow, IconCheck, IconDoc, IconSpark, IconTarget } from "@/components/Icons";
import { resumeScores, resumeSuggestions } from "@/lib/data";
import { listMatches } from "@/lib/matches";

const SECTIONS = [
  { id: "sum", heading: "Summary", bullets: [
    "Full-stack engineer building product surfaces in TypeScript and React, with three years shipping to production.",
  ]},
  { id: "exp", heading: "Experience", bullets: [
    "Engineered a scalable Next.js platform used by 10,000+ users.",
    "Cut Largest Contentful Paint from 4.1s to 1.2s by streaming server components.",
    "Worked on website",
    "Helped the team with code reviews",
  ]},
  { id: "prj", heading: "Projects", bullets: [
    "Built an LLM answer-grading tool; 300 weekly users at peak.",
    "Open-source Tailwind component set, 1.2k stars.",
  ]},
  { id: "edu", heading: "Education", bullets: ["B.Tech Computer Science — 2022"] },
  { id: "skl", heading: "Skills", bullets: ["React · Next.js · TypeScript · Python · PostgreSQL · Tailwind"] },
];

const ACTIONS = [
  "Improve bullet", "Rewrite summary", "Add keywords",
  "Generate achievements", "ATS optimize", "Quantify impact",
];

export default function ResumeStudio() {
  const jobs = listMatches();
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [tailorTo, setTailorTo] = useState<string>("");
  const [section, setSection] = useState("exp");

  const bullets = useMemo(() => {
    const base = SECTIONS.find((s) => s.id === section)?.bullets ?? [];
    return base.map((b) => {
      const hit = resumeSuggestions.find((s) => s.before === b);
      return hit && accepted[hit.id] ? hit.after : b;
    });
  }, [section, accepted]);

  const lift = Object.values(accepted).filter(Boolean).length * 2;
  const job = jobs.find((j) => j.id === tailorTo);

  return (
    <>
      <PageHead
        rail="Resume Studio"
        title="One resume per role, not one resume"
        sub="Weak bullets become measured claims. Then the whole document is re-cut against the exact description you are applying to."
        actions={
          <>
            <button className="btn btn-quiet btn-sm"><IconDoc size={14} /> Versions (4)</button>
            <button className="btn btn-primary btn-sm">Export PDF</button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[210px_1fr_340px]">
        {/* ------------------------------------------------------ structure */}
        <aside className="panel h-fit p-4">
          <p className="rail mb-3">Structure</p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => {
              const on = s.id === section;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  aria-current={on}
                  className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[13.5px] transition-colors"
                  style={{ background: on ? "var(--iris-soft)" : "transparent",
                           color: on ? "var(--iris)" : "var(--ink-2)", fontWeight: on ? 550 : 400 }}
                >
                  {s.heading}
                  <span className="tnum caption">{s.bullets.length}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line)" }}>
            <p className="rail mb-2">This version</p>
            <p className="text-[13px] font-medium">Frontend — Northwind v3</p>
            <p className="caption mt-1">9 sent · 4 responses</p>
          </div>
        </aside>

        {/* --------------------------------------------------- live document */}
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 px-5 py-3.5"
               style={{ borderBottom: "1px solid var(--line)", background: "var(--surface-2)" }}>
            <p className="rail flex-1">Live preview</p>
            {lift > 0 && (
              <span className="chip chip-positive">
                <IconCheck size={11} /> keyword match +{lift}
              </span>
            )}
          </div>

          <div className="p-6 md:p-9" style={{ minHeight: 460 }}>
            <div className="mb-7 border-b pb-5" style={{ borderColor: "var(--line)" }}>
              <p className="text-[22px] font-semibold tracking-[-0.02em]">Aditya</p>
              <p className="caption mt-1">Software Engineer · Bangalore / Remote · 3 years</p>
            </div>

            <p className="rail mb-3">{SECTIONS.find((s) => s.id === section)?.heading}</p>
            <ul className="space-y-3">
              {bullets.map((b, i) => {
                const sug = resumeSuggestions.find((s) => s.after === b);
                const improved = Boolean(sug && accepted[sug.id]);
                return (
                  <li key={i} className="flex gap-3 text-[14.5px] leading-[1.62]"
                      style={{ color: improved ? "var(--ink)" : "var(--ink-2)" }}>
                    <span className="mt-[9px] h-[3px] w-[3px] flex-none rounded-full"
                          style={{ background: improved ? "var(--positive)" : "var(--ink-3)" }} />
                    <span
                      style={improved
                        ? { background: "var(--positive-soft)", borderRadius: 4, padding: "1px 4px", margin: "-1px -4px" }
                        : undefined}
                    >
                      {b}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ------------------------------------------------ AI intelligence */}
        <aside className="space-y-4">
          <div className="panel p-5">
            <p className="rail mb-4">Document intelligence</p>
            <div className="flex justify-center pb-4">
              <Ring value={resumeScores[0]!.value + lift} size={124} stroke={8} tone="positive">
                <span className="tnum text-[30px] font-semibold leading-none">
                  <CountUp to={resumeScores[0]!.value + lift} />
                </span>
                <span className="rail mt-1">ATS</span>
              </Ring>
            </div>
            <div className="space-y-3">
              {resumeScores.map((s, i) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-[12.5px]" style={{ color: "var(--ink-2)" }}>{s.label}</span>
                    <span className="tnum text-[12.5px] font-semibold">
                      {Math.min(100, s.value + (i === 1 ? lift : 0))}%
                    </span>
                  </div>
                  <Meter value={Math.min(100, s.value + (i === 1 ? lift : 0))} delay={i * 80}
                         tone={s.value >= 90 ? "positive" : "iris"} />
                  <p className="caption mt-1">{s.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <IconSpark size={14} style={{ color: "var(--iris)" }} />
              <p className="rail">AI suggestions</p>
            </div>
            <div className="space-y-3">
              {resumeSuggestions.map((s) => {
                const on = accepted[s.id];
                return (
                  <div key={s.id} className="rounded-[11px] p-3.5"
                       style={{ background: "var(--surface-2)", border: `1px solid ${on ? "var(--positive)" : "var(--line)"}` }}>
                    <span className="chip mb-2" style={{ height: 20, fontSize: 11 }}>{s.kind}</span>
                    <p className="text-[12.5px] line-through" style={{ color: "var(--ink-3)" }}>{s.before}</p>
                    <p className="mt-1.5 text-[13px] font-medium leading-snug">{s.after}</p>
                    <p className="caption mt-2">{s.why}</p>
                    <button
                      onClick={() => setAccepted((a) => ({ ...a, [s.id]: !a[s.id] }))}
                      className={on ? "btn btn-ghost btn-sm mt-2.5" : "btn btn-primary btn-sm mt-2.5"}
                      aria-pressed={on}
                    >
                      {on ? <>Accepted <IconCheck size={13} /></> : "Apply this"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {ACTIONS.map((a) => <button key={a} className="chip hover:border-[var(--ink-3)]">{a}</button>)}
            </div>
          </div>

          {/* Job-specific mode */}
          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <IconTarget size={14} style={{ color: "var(--iris)" }} />
              <p className="rail">Job-specific resume</p>
            </div>
            <label htmlFor="tailor" className="caption mb-2 block">Pick the role to cut against</label>
            <select
              id="tailor"
              value={tailorTo}
              onChange={(e) => setTailorTo(e.target.value)}
              className="w-full rounded-[9px] px-3 text-[13.5px] outline-none"
              style={{ height: 38, background: "var(--surface-2)", border: "1px solid var(--line-2)", color: "var(--ink)" }}
            >
              <option value="">Select a role…</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.role} — {j.companyName}</option>)}
            </select>

            {job && (
              <div className="fade mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[10px] p-3" style={{ background: "var(--surface-2)" }}>
                    <p className="rail mb-1.5">Your resume</p>
                    <p className="text-[12.5px]" style={{ color: "var(--ink-2)" }}>
                      {job.match?.strengths.join(", ")}
                    </p>
                  </div>
                  <div className="rounded-[10px] p-3" style={{ background: "var(--critical-soft)" }}>
                    <p className="rail mb-1.5">Description asks</p>
                    <p className="text-[12.5px]" style={{ color: "var(--ink-2)" }}>
                      {[...(job.match?.strengths ?? []), ...(job.match?.gaps ?? [])].join(", ")}
                    </p>
                  </div>
                </div>
                <p className="caption mt-3">
                  Missing: {job.match?.gaps.join(", ") || "nothing material"}. The agent will foreground your
                  nearest evidence rather than claim the skill.
                </p>
                <button className="btn btn-primary btn-sm mt-3 w-full">
                  Generate tailored version <IconArrow size={14} />
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
