"use client";

import { useState } from "react";
import { Mark, MatchDNA, Meter, Ring } from "@/components/Primitives";
import { PageHead } from "@/components/States";
import { IconAlert, IconArrow, IconCheck } from "@/components/Icons";
import { listMatches } from "@/lib/matches";

/**
 * AI Matches is the Match DNA screen: one role at a time, every axis visible,
 * and a direct comparison against the rest of the shortlist.
 */
export default function Matches() {
  const jobs = listMatches();
  const [activeId, setActiveId] = useState(jobs[0]?.id ?? "");
  const job = jobs.find((j) => j.id === activeId) ?? jobs[0];
  const m = job?.match;

  return (
    <>
      <PageHead
        rail="Match DNA"
        title="Why each role fits — axis by axis"
        sub="A single percentage hides the one weak axis that decides the outcome. Every match is broken into eight."
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Shortlist */}
        <div className="no-scrollbar flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
          {jobs.map((j) => {
            const on = j.id === job?.id;
            return (
              <button
                key={j.id}
                onClick={() => setActiveId(j.id)}
                aria-current={on}
                className="panel flex min-w-[236px] items-center gap-3 p-3.5 text-left transition-all lg:min-w-0"
                style={on
                  ? { borderColor: "var(--iris)", background: "var(--iris-soft)", boxShadow: "var(--shadow-sm)" }
                  : undefined}
              >
                <Mark text={j.companyMonogram} tint={j.companyTint} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{j.role}</span>
                  <span className="caption block truncate">{j.companyName}</span>
                </span>
                <span className="tnum flex-none text-[15px] font-semibold"
                      style={{ color: on ? "var(--iris)" : "var(--ink-3)" }}>
                  {j.match?.overall}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        {job && m && (
          <div key={job.id} className="fade panel p-6 md:p-8">
            <div className="flex flex-wrap items-start gap-4 pb-6">
              <Mark text={job.companyMonogram} tint={job.companyTint} size={46} />
              <div className="min-w-0 flex-1">
                <h2 className="h1">{job.role}</h2>
                <p className="body mt-1">
                  {job.companyName} · {job.location} · {job.remote} · {job.salaryRange}
                </p>
              </div>
              <button className="btn btn-primary btn-sm">Apply with AI <IconArrow size={14} /></button>
            </div>

            <div className="grid items-center gap-8 border-t pt-7 lg:grid-cols-[auto_1fr]"
                 style={{ borderColor: "var(--line)" }}>
              <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col">
                <Ring value={m.overall} size={150} stroke={9}>
                  <span className="tnum text-[38px] font-semibold leading-none">{m.overall}</span>
                  <span className="rail mt-1">overall</span>
                </Ring>
                <MatchDNA facets={m.facets} size={300} />
              </div>

              <div className="min-w-0">
                <p className="rail mb-4">Every axis</p>
                <div className="space-y-3">
                  {m.facets.map((f, i) => (
                    <div key={f.key}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <span className="text-[13px]" style={{ color: "var(--ink-2)" }}>{f.label}</span>
                        <span className="tnum text-[13px] font-semibold">{f.score}</span>
                      </div>
                      <Meter
                        value={f.score}
                        delay={i * 70}
                        tone={f.score >= 90 ? "positive" : f.score >= 75 ? "iris" : "caution"}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {m.strengths.map((s) => (
                    <span key={s} className="chip chip-positive"><IconCheck size={11} /> {s}</span>
                  ))}
                  {m.gaps.map((g) => (
                    <span key={g} className="chip chip-caution"><IconAlert size={11} /> {g}</span>
                  ))}
                </div>

                <div className="mt-5 rounded-[11px] p-4"
                     style={{ background: "var(--iris-soft)", border: "1px solid var(--iris-line)" }}>
                  <p className="rail mb-2">Recommendation</p>
                  <p className="text-[14px] leading-relaxed">{m.recommendation}</p>
                  <p className="caption mt-3">
                    Competition {m.competition.toLowerCase()} · ~{m.applicantCount} applicants so far
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
