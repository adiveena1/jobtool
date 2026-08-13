"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Mark, MatchDNA, Meter } from "./Primitives";
import { IconAlert, IconArrow, IconCheck, IconChevron, IconSpark } from "./Icons";
import type { Job } from "@/types/api";

function freshness(iso: string): string {
  const h = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3600_000));
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/**
 * One opportunity.
 *
 * The match number is never shown alone — the axes that produced it are one
 * tap away, because a single percentage is exactly the thing that makes job
 * boards untrustworthy.
 */
export default function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [swipe, setSwipe] = useState(0);
  const startX = useRef<number | null>(null);
  const m = job.match;

  function onTouchStart(e: React.TouchEvent) { startX.current = e.touches[0]?.clientX ?? null; }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current == null) return;
    const dx = (e.touches[0]?.clientX ?? 0) - startX.current;
    setSwipe(Math.max(-140, Math.min(140, dx)));
  }
  function onTouchEnd() {
    // Right saves, left skips — the gesture the mobile app uses, mirrored here.
    if (swipe > 90) setSaved(true);
    setSwipe(0);
    startX.current = null;
  }

  const tone = (m?.overall ?? 0) >= 95 ? "positive" : (m?.overall ?? 0) >= 85 ? "iris" : "caution";

  return (
    <article
      className="panel relative overflow-hidden transition-shadow hover:shadow-[var(--shadow-md)]"
      style={{
        transform: swipe ? `translateX(${swipe}px)` : undefined,
        transition: swipe ? "none" : "transform 260ms cubic-bezier(0.16,1,0.3,1)",
        animationDelay: `${index * 60}ms`,
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Mark text={job.companyMonogram} tint={job.companyTint} size={44} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="h2 truncate">{job.role}</h3>
              {m && m.applyWithinHours != null && (
                <span className="chip chip-critical">Apply within {m.applyWithinHours}h</span>
              )}
            </div>
            <p className="caption mt-1">
              {job.companyName} · {job.location} · {job.remote} · {freshness(job.postedAt)}
            </p>
            <p className="tnum mt-2 text-[14px] font-medium">
              {job.salaryRange}
              <span className="caption ml-2 font-normal">{job.experienceRange}</span>
            </p>
          </div>

          <div className="flex flex-none flex-col items-end">
            <p className="tnum text-[30px] font-semibold leading-none" style={{ color: `var(--${tone})` }}>
              {m?.overall ?? "—"}%
            </p>
            <p className="rail mt-1">AI match</p>
          </div>
        </div>

        {m && (
          <>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.strengths.map((s) => (
                <span key={s} className="chip chip-positive"><IconCheck size={11} /> {s}</span>
              ))}
              {m.gaps.map((g) => (
                <span key={g} className="chip chip-caution"><IconAlert size={11} /> {g}</span>
              ))}
            </div>

            <div
              className="mt-4 flex items-start gap-2.5 rounded-[10px] p-3"
              style={{ background: "var(--surface-2)" }}
            >
              <IconSpark size={14} className="mt-[2px] flex-none" style={{ color: "var(--iris)" }} />
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                {m.recommendation}
              </p>
            </div>
          </>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn btn-primary btn-sm">Apply with AI <IconArrow size={14} /></button>
          <button
            onClick={() => setSaved((v) => !v)}
            className="btn btn-quiet btn-sm"
            aria-pressed={saved}
          >
            {saved ? "Saved" : "Save"}
          </button>
          <Link href={`/companies`} className="btn btn-ghost btn-sm">View role</Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn btn-ghost btn-sm ml-auto"
            aria-expanded={open}
            aria-controls={`why-${job.id}`}
          >
            Ask AI — why should I apply?
            <IconChevron size={14} style={{ transform: open ? "rotate(90deg)" : undefined, transition: "transform 200ms" }} />
          </button>
        </div>
      </div>

      {open && m && (
        <div
          id={`why-${job.id}`}
          className="fade grid gap-6 p-5 lg:grid-cols-[auto_1fr]"
          style={{ borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}
        >
          <div className="flex justify-center">
            <MatchDNA facets={m.facets} size={286} />
          </div>

          <div className="min-w-0">
            <p className="rail mb-3">The agent&apos;s read</p>

            <dl className="stagger space-y-3.5">
              <div>
                <dt className="text-[13px] font-semibold">Why it fits</dt>
                <dd className="body mt-1">
                  {m.facets.filter((f) => f.score >= 90).map((f) => f.label).join(", ")} all score above 90.
                  Your {m.strengths.slice(0, 2).join(" and ")} map directly onto the first two requirements.
                </dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold">What is missing</dt>
                <dd className="body mt-1">
                  {m.gaps.length > 0
                    ? `${m.gaps.join(", ")}. Named in the description but absent from your resume — it is the one thing an interviewer will probe.`
                    : "Nothing material. Every stated requirement appears in your profile."}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold">Competition</dt>
                <dd className="body mt-1">
                  {m.competition} — about {m.applicantCount} applicants so far.
                  {m.competition === "High" && " Tailor before sending; a generic resume will not clear this pile."}
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-[13px] font-semibold">Estimated application strength</dt>
                <dd>
                  <Meter value={m.overall - 6} tone="iris" height={5} />
                  <p className="caption mt-1.5">
                    {m.overall - 6}% as your resume stands. Tailoring adds roughly 8 points.
                  </p>
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/resume" className="btn btn-quiet btn-sm">Tailor my resume</Link>
              <Link href="/interview" className="btn btn-ghost btn-sm">Prep for this loop</Link>
            </div>
          </div>
        </div>
      )}

      {swipe > 60 && (
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold"
          style={{ color: "var(--positive)" }}
        >
          Save
        </span>
      )}
    </article>
  );
}
