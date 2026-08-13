"use client";

import { useMemo, useState } from "react";
import { CountUp, Mark, Meter } from "@/components/Primitives";
import { EmptyState, PageHead } from "@/components/States";
import { IconBolt, IconCheck, IconClose, IconStack } from "@/components/Icons";
import { applications as seed, trackerStats, autopilot } from "@/lib/data";

const STAGES = [
  "Saved", "Preparing", "Applied", "Screening", "Interview", "Offer", "Rejected",
] as const;

type Stage = (typeof STAGES)[number];

const TONE: Record<Stage, string> = {
  Saved: "var(--ink-3)", Preparing: "var(--caution)", Applied: "var(--iris)",
  Screening: "var(--iris)", Interview: "var(--positive)", Offer: "var(--positive)",
  Rejected: "var(--critical)",
};

type Mode = "review_every" | "auto_above_90" | "auto_by_preferences";

const MODES: { id: Mode; label: string; detail: string }[] = [
  { id: "review_every", label: "Review every application", detail: "Nothing is submitted until you press send. Slowest, safest." },
  { id: "auto_above_90", label: "Auto-apply above 90%", detail: "Only near-certain matches go out unattended. Everything else waits." },
  { id: "auto_by_preferences", label: "Auto-apply by preferences", detail: "Anything clearing your rules is submitted. Fastest, least oversight." },
];

export default function Applications() {
  const [stage, setStage] = useState<Stage | "All">("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("auto_above_90");
  const [hardStop, setHardStop] = useState(false);
  const [minMatch, setMinMatch] = useState(autopilot.minMatch);
  const [cap, setCap] = useState(autopilot.dailyCap);

  const rows = useMemo(
    () => (stage === "All" ? seed : seed.filter((a) => a.stage === stage)),
    [stage],
  );
  const open = seed.find((a) => a.id === openId) ?? null;
  const counts = useMemo(() => {
    const c = {} as Record<string, number>;
    for (const a of seed) c[a.stage] = (c[a.stage] ?? 0) + 1;
    return c;
  }, []);

  return (
    <>
      <PageHead
        rail="Career pipeline"
        title="Every application, end to end"
        sub="Discovery through offer in one board. What happens here feeds back into how the agent ranks the next role."
        actions={<span className="chip"><span className="pulse" /> Autopilot active</span>}
      />

      {/* Analytics */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {trackerStats.map((s) => (
          <div key={s.label} className="panel p-4">
            <p className="rail">{s.label}</p>
            <p className="tnum mt-3 text-[27px] font-semibold leading-none">
              {s.value.includes("%")
                ? s.value
                : <CountUp to={Number(s.value)} />}
            </p>
          </div>
        ))}
      </section>

      {/* Autopilot */}
      <section className="panel mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5" style={{ borderBottom: "1px solid var(--line)" }}>
          <IconBolt size={17} style={{ color: "var(--iris)" }} />
          <div className="min-w-0 flex-1">
            <p className="h3">AI Application Autopilot</p>
            <p className="caption">Every automated submission is logged with the confidence that produced it.</p>
          </div>
          <span className="chip" style={{ background: "var(--signal-soft)", borderColor: "transparent" }}>
            <span className="pulse" /> Active
          </span>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[auto_1fr]">
          <div className="flex gap-6">
            {[
              { k: "Today", v: autopilot.todayCount },
              { k: "This week", v: autopilot.weekCount },
              { k: "High confidence", v: autopilot.highConfidence },
            ].map((x) => (
              <div key={x.k}>
                <p className="rail">{x.k}</p>
                <p className="tnum mt-2 text-[30px] font-semibold leading-none"><CountUp to={x.v} /></p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="minmatch" className="rail">Minimum match</label>
                <span className="tnum text-[13px] font-semibold">{minMatch}%</span>
              </div>
              <input
                id="minmatch" type="range" min={50} max={100} value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                className="w-full accent-[var(--iris)]"
              />
            </div>
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="cap" className="rail">Max applications / day</label>
                <span className="tnum text-[13px] font-semibold">{cap}</span>
              </div>
              <input
                id="cap" type="range" min={1} max={50} value={cap}
                onChange={(e) => setCap(Number(e.target.value))}
                className="w-full accent-[var(--iris)]"
              />
            </div>
            <div className="sm:col-span-2">
              <p className="rail mb-2">Locations & floor</p>
              <div className="flex flex-wrap gap-1.5">
                {autopilot.locations.map((l) => <span key={l} className="chip">{l}</span>)}
                <span className="chip">{autopilot.salaryFloor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5" style={{ borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}>
          <p className="rail mb-3">How much rope the agent gets</p>
          <div className="grid gap-2 md:grid-cols-3">
            {MODES.map((mo) => {
              const on = mode === mo.id && !hardStop;
              return (
                <button
                  key={mo.id}
                  onClick={() => { setMode(mo.id); setHardStop(false); }}
                  aria-pressed={on}
                  disabled={hardStop}
                  className="panel p-4 text-left transition-all disabled:opacity-45"
                  style={on ? { borderColor: "var(--iris)", background: "var(--iris-soft)" } : undefined}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="flex h-[15px] w-[15px] flex-none items-center justify-center rounded-full"
                      style={{ border: `1.5px solid ${on ? "var(--iris)" : "var(--line-2)"}`,
                               background: on ? "var(--iris)" : "transparent", color: "#fff" }}
                    >
                      {on && <IconCheck size={9} />}
                    </span>
                    <span className="text-[13.5px] font-medium">{mo.label}</span>
                  </span>
                  <span className="caption mt-1.5 block">{mo.detail}</span>
                </button>
              );
            })}
          </div>

          <label
            className="mt-3 flex cursor-pointer items-center gap-3 rounded-[10px] p-3.5"
            style={{ background: hardStop ? "var(--critical-soft)" : "var(--surface)",
                     border: `1px solid ${hardStop ? "var(--critical)" : "var(--line)"}` }}
          >
            <input
              type="checkbox" checked={hardStop}
              onChange={(e) => setHardStop(e.target.checked)}
              className="h-4 w-4 accent-[var(--critical)]"
            />
            <span className="min-w-0">
              <span className="block text-[13.5px] font-medium">Never apply without my approval</span>
              <span className="caption block">
                Overrides every mode above. While this is on, the agent prepares applications and stops.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* Stage filter */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStage("All")}
          className="chip flex-none"
          style={stage === "All" ? { background: "var(--iris-soft)", color: "var(--iris)", borderColor: "var(--iris-line)" } : undefined}
        >
          All {seed.length}
        </button>
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className="chip flex-none"
            style={stage === s ? { background: "var(--iris-soft)", color: "var(--iris)", borderColor: "var(--iris-line)" } : undefined}
          >
            {s} {counts[s] ?? 0}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<IconStack size={19} />}
          title="Your career pipeline is empty."
          body="Nothing sits at this stage yet. The feed has 31 roles above your bar right now."
          cta="Find your first opportunity"
          href="/discover"
        />
      ) : (
        <div className="stagger space-y-2.5">
          {rows.map((a) => (
            <button
              key={a.id}
              onClick={() => setOpenId(a.id)}
              className="panel flex w-full flex-wrap items-center gap-4 p-4 text-left transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <Mark text={a.logo} tint={a.tint} size={38} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{a.role}</span>
                <span className="caption block truncate">{a.company} · {a.salary}</span>
              </span>
              <span className="tnum caption hidden flex-none sm:block">{a.appliedOn}</span>
              <span
                className="chip flex-none"
                style={{ color: TONE[a.stage as Stage], borderColor: "transparent",
                         background: "color-mix(in srgb, currentColor 11%, transparent)" }}
              >
                {a.stage}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {open && (
        <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label={`${open.role} at ${open.company}`}>
          <div className="absolute inset-0" style={{ background: "color-mix(in srgb, var(--ink) 30%, transparent)" }}
               onClick={() => setOpenId(null)} />
          <aside className="panel-raised relative flex h-full w-full max-w-[460px] flex-col overflow-y-auto rise"
                 style={{ borderRadius: 0, borderTop: 0, borderRight: 0, borderBottom: 0 }}>
            <header className="flex items-center gap-3 px-5" style={{ height: 62, borderBottom: "1px solid var(--line)" }}>
              <Mark text={open.logo} tint={open.tint} size={34} />
              <div className="min-w-0 flex-1">
                <p className="h3 truncate">{open.role}</p>
                <p className="caption truncate">{open.company}</p>
              </div>
              <button onClick={() => setOpenId(null)} className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }} aria-label="Close">
                <IconClose size={16} />
              </button>
            </header>

            <div className="space-y-5 p-5">
              <dl className="grid grid-cols-2 gap-4">
                {[
                  ["Stage", open.stage], ["Salary", open.salary],
                  ["Applied", open.appliedOn], ["Resume used", open.resume],
                  ["Recruiter", open.recruiter ?? "—"], ["Interview", open.interviewOn ?? "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="rail">{k}</dt>
                    <dd className="mt-1 text-[13.5px]">{v}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="rail mb-2">Notes</p>
                <p className="body">{open.note}</p>
              </div>

              <div className="rounded-[11px] p-4" style={{ background: "var(--iris-soft)", border: "1px solid var(--iris-line)" }}>
                <p className="rail mb-2">Agent recommendation</p>
                <p className="text-[13.5px] leading-relaxed">
                  {open.stage === "Interview"
                    ? "Run one system-design round before this panel. It is the only axis where you scored under 90 for this role."
                    : open.stage === "Offer"
                    ? "This sits below the band for your level in this city. Ask for the top of the range with the growth data attached."
                    : open.stage === "Rejected"
                    ? "Third rejection on this resume version. Retire it and re-send the tailored one to the still-open roles."
                    : "Approve the tailored resume and this goes out today. The posting is four days old and closing."}
                </p>
              </div>

              <div>
                <p className="rail mb-2">Cover letter</p>
                <p className="body">{open.stage === "Preparing" ? "Drafted, awaiting your approval." : "Sent with the application."}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary btn-sm">Move stage</button>
                <button className="btn btn-quiet btn-sm">Open resume used</button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
