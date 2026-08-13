"use client";

import { useEffect, useState } from "react";
import { Mark, Meter } from "./Primitives";
import { IconCheck, IconDoc, IconDiscover, IconMic, IconSpark, IconStack, IconTarget } from "./Icons";

/**
 * The hero is a live command centre rather than a screenshot: the agent walks
 * its own pipeline on a loop, so the first thing a visitor sees is the product
 * doing the work it claims to do.
 */

const STAGES = [
  { key: "discover", label: "Discover", icon: IconDiscover, line: "Scanning 41 sources for new postings" },
  { key: "match",    label: "Match",    icon: IconTarget,   line: "Scoring each role against your profile" },
  { key: "resume",   label: "Optimize", icon: IconDoc,      line: "Rewriting bullets for this description" },
  { key: "prepare",  label: "Prepare",  icon: IconSpark,    line: "Drafting the application and cover note" },
  { key: "interview",label: "Interview",icon: IconMic,      line: "Building a question set from their loop" },
  { key: "track",    label: "Track",    icon: IconStack,    line: "Logging the outcome back into your brain" },
];

const CONSOLE = [
  "Scanning opportunities…",
  "Analyzing your profile…",
  "Finding high-fit roles…",
  "Cross-checking salary bands…",
  "Ranking by fit and freshness…",
];

export default function AgentStage() {
  const [active, setActive] = useState(0);
  const [lines, setLines] = useState<string[]>([CONSOLE[0]]);

  useEffect(() => {
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stage = window.setInterval(() => setActive((i) => (i + 1) % STAGES.length), 2600);
    const log = window.setInterval(() => {
      setLines((l) => {
        const next = CONSOLE[(CONSOLE.indexOf(l[l.length - 1]) + 1) % CONSOLE.length];
        return [...l, next].slice(-4);
      });
    }, 1900);

    return () => { window.clearInterval(stage); window.clearInterval(log); };
  }, []);

  return (
    <div className="panel-raised grid-field overflow-hidden" style={{ borderRadius: 20 }}>
      {/* Status bar */}
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-6"
        style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}
      >
        <span className="pulse" />
        <span className="text-[13px] font-medium">AI Career Agent</span>
        <span className="chip" style={{ background: "var(--signal-soft)", color: "var(--ink)", borderColor: "transparent", height: 22, fontSize: 11.5 }}>
          Active
        </span>
        <span className="tnum ml-auto caption hidden sm:inline">248 roles scanned · 12 ready</span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
        {/* Pipeline */}
        <div className="p-4 md:p-6" style={{ borderBottom: "1px solid var(--line)" }}>
          <p className="rail mb-4">Agent pipeline</p>

          <div className="relative">
            {/* Rail behind the nodes */}
            <div
              className="absolute left-0 right-0 hidden md:block"
              style={{ top: 21, height: 2, background: "var(--line)" }}
            />
            <div
              className="absolute left-0 hidden md:block"
              style={{
                top: 21, height: 2, background: "var(--iris)",
                width: `${(active / (STAGES.length - 1)) * 100}%`,
                transition: "width 900ms cubic-bezier(0.16,1,0.3,1)",
              }}
            />

            <ol className="relative grid grid-cols-3 gap-y-5 md:grid-cols-6 md:gap-y-0">
              {STAGES.map((s, i) => {
                const done = i < active;
                const on = i === active;
                return (
                  <li key={s.key} className="flex flex-col items-center gap-2 text-center">
                    <span
                      className="flex items-center justify-center rounded-full transition-all duration-500"
                      style={{
                        width: on ? 44 : 34, height: on ? 44 : 34,
                        marginTop: on ? -5 : 0,
                        background: on ? "var(--iris)" : done ? "var(--iris-soft)" : "var(--surface)",
                        color: on ? "#fff" : done ? "var(--iris)" : "var(--ink-3)",
                        border: `1.5px solid ${on || done ? "var(--iris)" : "var(--line-2)"}`,
                        boxShadow: on ? "0 0 0 6px var(--iris-soft)" : "none",
                      }}
                    >
                      {done ? <IconCheck size={15} /> : <s.icon size={on ? 19 : 15} />}
                    </span>
                    <span
                      className="text-[11.5px] font-medium transition-colors"
                      style={{ color: on ? "var(--ink)" : "var(--ink-3)" }}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div
            className="mt-6 flex items-start gap-3 rounded-[12px] p-3.5"
            style={{ background: "var(--iris-soft)", border: "1px solid var(--iris-line)" }}
          >
            <IconSpark size={15} className="mt-[2px] flex-none" style={{ color: "var(--iris)" }} />
            <p key={active} className="fade text-[13.5px] leading-relaxed" style={{ color: "var(--ink)" }}>
              {STAGES[active].line}
            </p>
          </div>

          {/* Live console */}
          <div className="mt-4 space-y-1.5" aria-live="polite">
            {lines.map((l, i) => (
              <p
                key={`${l}-${i}`}
                className="tnum fade flex items-center gap-2 text-[12px]"
                style={{ color: i === lines.length - 1 ? "var(--ink-2)" : "var(--ink-3)", opacity: 0.4 + i * 0.2 }}
              >
                <span style={{ color: "var(--iris)" }}>›</span>
                {l}
              </p>
            ))}
          </div>
        </div>

        {/* The role the agent surfaced */}
        <div className="p-4 md:p-6" style={{ background: "var(--surface)" }}>
          <p className="rail mb-4">Top result right now</p>

          <div className="flex items-start gap-3">
            <Mark text="NL" tint="#5B47FF" size={42} />
            <div className="min-w-0 flex-1">
              <p className="h3 truncate">Senior Frontend Engineer</p>
              <p className="caption">Northwind Labs · Remote · ₹25L–₹40L</p>
            </div>
            <div className="flex-none text-right">
              <p className="tnum text-[26px] font-semibold leading-none" style={{ color: "var(--iris)" }}>98%</p>
              <p className="rail mt-1">match</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              { label: "Skills", v: 98 },
              { label: "Experience", v: 91 },
              { label: "Location", v: 100 },
              { label: "Salary", v: 88 },
            ].map((f, i) => (
              <div key={f.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12.5px]" style={{ color: "var(--ink-2)" }}>{f.label}</span>
                  <span className="tnum text-[12.5px] font-semibold">{f.v}</span>
                </div>
                <Meter value={f.v} delay={i * 110} />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {["React", "TypeScript", "Next.js"].map((s) => (
              <span key={s} className="chip chip-positive">
                <IconCheck size={11} /> {s}
              </span>
            ))}
            <span className="chip chip-caution">△ System Design</span>
          </div>
        </div>
      </div>
    </div>
  );
}
