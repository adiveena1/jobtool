import type { Metadata } from "next";
import { CountUp, Mark, Meter, Ring } from "@/components/Primitives";
import { PageHead } from "@/components/States";
import { IconArrow, IconBuilding, IconCheck } from "@/components/Icons";
import { getCompany, listJobs } from "@/server/repository";

export const metadata: Metadata = { title: "Company Intelligence" };

export default function Companies() {
  const c = getCompany("demo-user", "northwind-labs");
  const roles = listJobs("demo-user");
  const overall = Math.round(c.fit.reduce((a, f) => a + f.value, 0) / c.fit.length);

  return (
    <>
      <PageHead
        rail="Company Intelligence"
        title="Should you work here?"
        sub="The question a job board never answers. Fit, growth, compensation and skill alignment, scored against your profile rather than in the abstract."
        actions={<button className="btn btn-quiet btn-sm"><IconBuilding size={14} /> Compare companies</button>}
      />

      {/* Identity */}
      <section className="panel mb-4 p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-5">
          <Mark text={c.monogram} tint={c.tint} size={58} />
          <div className="min-w-0 flex-1">
            <h2 className="h1 mb-1.5">{c.name}</h2>
            <p className="body">{c.industry} · {c.size} people · {c.headquarters}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.stack.map((s) => <span key={s} className="chip">{s}</span>)}
            </div>
          </div>
          <div className="flex flex-none flex-col items-center">
            <Ring value={overall} size={116} stroke={8}>
              <span className="tnum text-[28px] font-semibold leading-none"><CountUp to={overall} /></span>
              <span className="rail mt-1">fit</span>
            </Ring>
          </div>
        </div>

        <dl className="mt-7 grid gap-5 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--line)" }}>
          {[
            ["Salary band", c.salaryBand],
            ["Hiring activity", c.hiringActivity],
            ["Interview difficulty", c.interviewDifficulty],
            ["Growth", c.growth],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="rail mb-1.5">{k}</dt>
              <dd className="text-[13.5px] leading-snug">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Fit breakdown */}
        <div className="panel p-6">
          <p className="rail mb-5">How you score against them</p>
          <div className="space-y-4">
            {c.fit.map((f, i) => (
              <div key={f.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>{f.label}</span>
                  <span className="tnum text-[13.5px] font-semibold">{f.value}%</span>
                </div>
                <Meter value={f.value} delay={i * 80} tone={f.value >= 90 ? "positive" : "iris"} height={5} />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-[11px] p-4" style={{ background: "var(--surface-2)" }}>
            <span className="tnum text-[24px] font-semibold" style={{ color: "var(--positive)" }}>
              {c.sentiment}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium">Employee sentiment</p>
              <p className="caption">Across public reviews from the last eighteen months.</p>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className="panel p-6" style={{ borderColor: "var(--iris-line)", background: "var(--iris-soft)" }}>
          <p className="rail mb-3">AI recommendation</p>
          <p className="h1 mb-4">{c.verdict}</p>
          <p className="body-lg mb-6" style={{ color: "var(--ink-2)" }}>{c.verdictWhy}</p>

          <ul className="stagger space-y-2.5">
            {[
              "Stack overlaps yours on four of six items — TypeScript, React, PostgreSQL and AWS.",
              "Band clears your floor by ₹15L at the bottom of the range.",
              "They hire into the level above yours, which is where you want to be in eighteen months.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[14px]" style={{ color: "var(--ink-2)" }}>
                <span className="mt-[3px] flex h-[17px] w-[17px] flex-none items-center justify-center rounded-full"
                      style={{ background: "var(--surface)", color: "var(--iris)" }}>
                  <IconCheck size={10} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Open roles */}
      <section className="pt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="rail mb-1.5">Open roles</p>
            <h2 className="h2">What they are hiring right now</h2>
          </div>
        </div>
        <div className="stagger space-y-2.5">
          {roles.map((j) => (
            <div key={j.id} className="panel flex flex-wrap items-center gap-4 p-4">
              <Mark text={j.companyMonogram} tint={j.companyTint} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-medium">{j.role}</p>
                <p className="caption truncate">{j.location} · {j.remote} · {j.salaryRange}</p>
              </div>
              <span className="tnum flex-none text-[17px] font-semibold" style={{ color: "var(--iris)" }}>
                {j.match?.overall}%
              </span>
              <button className="btn btn-quiet btn-sm flex-none">
                View <IconArrow size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
