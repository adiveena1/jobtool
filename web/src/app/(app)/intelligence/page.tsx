import type { Metadata } from "next";
import { CountUp, Meter } from "@/components/Primitives";
import { PageHead } from "@/components/States";
import { IconArrow, IconBolt, IconChart, IconTarget } from "@/components/Icons";
import { getCareerIntelligence } from "@/server/repository";

export const metadata: Metadata = { title: "Career Intelligence" };

export default function Intelligence() {
  const intel = getCareerIntelligence("demo-user");
  const maxSalary = Math.max(...intel.path.map((p) => p.salaryLpa));

  return (
    <>
      <PageHead
        rail="Career Intelligence"
        title="Where you stand, and where this goes next"
        sub="Your skills read against live market demand — so the next thing you learn is chosen by what it unlocks, not by what is trending."
      />

      {/* Headline reads */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-6" style={{ borderColor: "var(--iris-line)", background: "var(--iris-soft)" }}>
          <p className="rail mb-3">Your strongest advantage</p>
          <p className="h1 mb-3">{intel.advantage.label}</p>
          <p className="body">{intel.advantage.detail}</p>
        </div>

        <div className="panel p-6">
          <p className="rail mb-3">Market opportunity</p>
          <p className="h2 mb-2">{intel.marketOpportunity.label}</p>
          <p className="tnum text-[42px] font-semibold leading-none" style={{ color: "var(--positive)" }}>
            +<CountUp to={intel.marketOpportunity.changePct} />%
          </p>
          <p className="caption mt-2">{intel.marketOpportunity.window}</p>
        </div>

        <div className="panel p-6">
          <div className="mb-3 flex items-center gap-2">
            <IconTarget size={14} style={{ color: "var(--iris)" }} />
            <p className="rail">Learn this next</p>
          </div>
          <p className="h2 mb-3">{intel.recommendedSkill.label}</p>
          <p className="body">{intel.recommendedSkill.why}</p>
        </div>
      </section>

      {/* Path */}
      <section className="pt-10">
        <p className="rail mb-1.5">Career path</p>
        <h2 className="h2 mb-5">The route your current signals point to</h2>
        <div className="panel overflow-hidden">
          <div className="no-scrollbar flex overflow-x-auto">
            {intel.path.map((p, i) => (
              <div
                key={p.title}
                className="relative min-w-[210px] flex-1 p-6"
                style={{
                  borderRight: i < intel.path.length - 1 ? "1px solid var(--line)" : undefined,
                  background: p.current ? "var(--iris-soft)" : undefined,
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="tnum flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{
                      background: p.current ? "var(--iris)" : "var(--surface-2)",
                      color: p.current ? "#fff" : "var(--ink-3)",
                      border: `1px solid ${p.current ? "var(--iris)" : "var(--line-2)"}`,
                    }}
                  >
                    {i + 1}
                  </span>
                  {p.current && <span className="chip chip-iris" style={{ height: 20, fontSize: 10.5 }}>you are here</span>}
                </div>
                <p className="h3 mb-2">{p.title}</p>
                <p className="tnum text-[21px] font-semibold" style={{ color: p.current ? "var(--iris)" : "var(--ink-2)" }}>
                  ₹{p.salaryLpa}L
                </p>
                <div className="mt-3">
                  <Meter value={(p.salaryLpa / maxSalary) * 100} delay={i * 120}
                         tone={p.current ? "iris" : "muted"} height={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills vs demand */}
      <section className="grid gap-4 pt-10 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="mb-5 flex items-center gap-2">
            <IconChart size={14} style={{ color: "var(--iris)" }} />
            <p className="rail">Your skills against market demand</p>
          </div>
          <div className="space-y-5">
            {intel.strengths.map((s, i) => {
              const under = s.demand - s.level > 12;
              return (
                <div key={s.id}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-[13.5px] font-medium">{s.name}</span>
                    {under && <span className="chip chip-caution" style={{ height: 19, fontSize: 10.5 }}>demand outruns you</span>}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="rail w-[46px] flex-none">you</span>
                      <span className="flex-1"><Meter value={s.level} delay={i * 70} tone="iris" /></span>
                      <span className="tnum w-[26px] flex-none text-right text-[12px] font-semibold">{s.level}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="rail w-[46px] flex-none">market</span>
                      <span className="flex-1"><Meter value={s.demand} delay={i * 70 + 40} tone="muted" /></span>
                      <span className="tnum w-[26px] flex-none text-right text-[12px]" style={{ color: "var(--ink-3)" }}>{s.demand}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-5 flex items-center gap-2">
            <IconBolt size={14} style={{ color: "var(--caution)" }} />
            <p className="rail">Career gaps, ordered by what they cost you</p>
          </div>
          <div className="space-y-3">
            {intel.gaps.map((g) => (
              <div key={g.skill} className="rounded-[11px] p-4" style={{ background: "var(--surface-2)" }}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <p className="h3">{g.skill}</p>
                  <span className={g.urgency === "high" ? "chip chip-critical" : "chip"}
                        style={{ height: 20, fontSize: 10.5 }}>
                    {g.urgency}
                  </span>
                </div>
                <p className="body">{g.why}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[11px] p-4" style={{ background: "var(--iris-soft)", border: "1px solid var(--iris-line)" }}>
            <p className="rail mb-2">Recommended learning</p>
            <p className="text-[14px] leading-relaxed">
              Close System Design first. It is the only gap that appears in all four of your strongest matches,
              and it is the difference between the ₹22L and the ₹38L band.
            </p>
            <button className="btn btn-primary btn-sm mt-3">
              Build a three-week plan <IconArrow size={14} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
