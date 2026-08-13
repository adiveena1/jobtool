import Link from "next/link";
import type { Metadata } from "next";
import { CountUp, Meter, Ring, Mark } from "@/components/Primitives";
import PipelineRail from "@/components/PipelineRail";
import { IconArrow, IconBolt, IconCheck, IconSpark } from "@/components/Icons";
import { getProfile, listApplications, listJobs, listNotifications } from "@/server/repository";

export const metadata: Metadata = { title: "Mission Control" };

const STAGES = [
  { key: "discover",  label: "Discover",  count: 248, detail: "248 roles pulled from 41 sources in the last 24 hours. 31 clear your 85% bar." },
  { key: "match",     label: "Match",     count: 31,  detail: "Each scored across eight axes. Four are above 94% and worth today's attention." },
  { key: "prepare",   label: "Prepare",   count: 12,  detail: "Resumes tailored and notes drafted. Four are waiting on your approval before they go out." },
  { key: "apply",     label: "Apply",     count: 124, detail: "Submitted to date. Autopilot sent 61 of them at high confidence, all inside your rules." },
  { key: "interview", label: "Interview", count: 8,   detail: "Eight invitations. The Northwind panel is tomorrow at 11:00 and your prep set is ready." },
  { key: "offer",     label: "Offer",     count: 2,   detail: "Two offers open. Ridgeline is verbal at ₹28L — below the band for your level." },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const profile = getProfile("demo-user");
  const jobs = listJobs("demo-user");
  const apps = listApplications("demo-user");
  const notes = listNotifications("demo-user").filter((n) => !n.read);
  const top = jobs[0];

  const signals = [
    { label: "Jobs discovered",    value: 248, suffix: "",  delta: "+31 today",       tone: "iris" as const },
    { label: "High-fit roles",     value: 31,  suffix: "",  delta: "above 85%",       tone: "iris" as const },
    { label: "Applications ready", value: 12,  suffix: "",  delta: "4 need approval", tone: "signal" as const },
    { label: "Interviews",         value: 8,   suffix: "",  delta: "+2 this week",    tone: "positive" as const },
    { label: "Resume strength",    value: 92,  suffix: "%", delta: "+6 after edits",  tone: "iris" as const },
    { label: "Profile complete",   value: 78,  suffix: "%", delta: "3 fields left",   tone: "caution" as const },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ header */}
      <header className="flex flex-wrap items-end justify-between gap-5 pb-8 pt-9">
        <div>
          <h1 className="h1 mb-2">{greeting()}, {profile.title === "Software Engineer" ? "Aditya" : "there"}.</h1>
          <p className="flex flex-wrap items-center gap-2.5 text-[15px]" style={{ color: "var(--ink-2)" }}>
            <span className="pulse" />
            Your AI Career Agent is working for you.
            <span className="chip" style={{ background: "var(--signal-soft)", borderColor: "transparent", height: 22, fontSize: 11.5 }}>
              Active
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/discover" className="btn btn-quiet btn-sm">Open feed</Link>
          <Link href="/applications" className="btn btn-primary btn-sm">
            Review 4 applications <IconArrow size={15} />
          </Link>
        </div>
      </header>

      {/* -------------------------------------------------- momentum + signals */}
      <section className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="panel flex flex-col items-center justify-center p-7">
          <Ring value={profile.momentum.value} size={168} stroke={9}>
            <span className="tnum text-[44px] font-semibold leading-none">
              <CountUp to={profile.momentum.value} />
            </span>
            <span className="rail mt-1.5">/ 100</span>
          </Ring>
          <p className="h3 mt-5">Career Momentum</p>
          <p className="caption mt-1 text-center">
            +{profile.momentum.deltaWeek}% this week · next milestone {profile.momentum.nextMilestone}
          </p>
          <div className="mt-5 w-full space-y-2.5">
            {profile.momentum.inputs.map((inp, i) => (
              <div key={inp.label}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[12px]" style={{ color: "var(--ink-2)" }}>{inp.label}</span>
                  <span className="tnum text-[12px] font-semibold">{inp.value}</span>
                </div>
                <Meter value={inp.value} height={3} delay={i * 90} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {signals.map((s) => (
            <div key={s.label} className="panel flex flex-col justify-between p-5">
              <p className="rail">{s.label}</p>
              <p className="tnum mt-4 text-[34px] font-semibold leading-none">
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p className="caption mt-2 flex items-center gap-1.5">
                <span
                  className="h-[5px] w-[5px] rounded-full"
                  style={{ background: `var(--${s.tone === "signal" ? "signal" : s.tone})` }}
                />
                {s.delta}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- the pipeline */}
      <section className="pt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="rail mb-1.5">Your pipeline</p>
            <h2 className="h2">Discover → Match → Prepare → Apply → Interview → Offer</h2>
          </div>
          <Link href="/applications" className="btn btn-ghost btn-sm">
            Full tracker <IconArrow size={14} />
          </Link>
        </div>
        <PipelineRail stages={STAGES} />
      </section>

      {/* ---------------------------------------------------- today + notices */}
      <section className="grid gap-4 pt-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel p-6">
          <div className="mb-5 flex items-center gap-2">
            <IconSpark size={15} style={{ color: "var(--iris)" }} />
            <p className="rail">What the agent recommends today</p>
          </div>

          {top && (
            <div className="mb-5 flex flex-wrap items-start gap-4 rounded-[12px] p-4"
                 style={{ background: "var(--iris-soft)", border: "1px solid var(--iris-line)" }}>
              <Mark text={top.companyMonogram} tint={top.companyTint} size={40} />
              <div className="min-w-0 flex-1">
                <p className="h3">{top.role}</p>
                <p className="caption">{top.companyName} · {top.location} · {top.salaryRange}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {top.match?.recommendation}
                </p>
              </div>
              <div className="text-right">
                <p className="tnum text-[26px] font-semibold leading-none" style={{ color: "var(--iris)" }}>
                  {top.match?.overall}%
                </p>
                <p className="rail mt-1">match</p>
              </div>
            </div>
          )}

          <ul className="stagger space-y-2.5">
            {[
              "Approve the four prepared applications — they expire from the feed in two days.",
              "Accept the three resume rewrites; your keyword match moves 82% → 94%.",
              "Run one system-design round. It is the only gap in all four top matches.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[14px]" style={{ color: "var(--ink-2)" }}>
                <span
                  className="mt-[3px] flex h-[17px] w-[17px] flex-none items-center justify-center rounded-full"
                  style={{ background: "var(--iris-soft)", color: "var(--iris)" }}
                >
                  <IconCheck size={10} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="rail">Notifications</p>
            <span className="chip chip-iris">{notes.length} new</span>
          </div>
          <ul className="space-y-4">
            {notes.map((n) => (
              <li key={n.id}>
                <Link href={n.href ?? "#"} className="group block">
                  <p className="text-[14px] font-medium leading-snug group-hover:underline">{n.title}</p>
                  <p className="caption mt-1">{n.body}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-2 rounded-[10px] p-3"
               style={{ background: "var(--surface-2)" }}>
            <IconBolt size={14} style={{ color: "var(--iris)" }} />
            <p className="caption">
              Autopilot sent {apps.filter((a) => a.automated).length} application today, inside your rules.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
