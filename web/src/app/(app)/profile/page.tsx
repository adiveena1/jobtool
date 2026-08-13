import type { Metadata } from "next";
import Link from "next/link";
import { CountUp, Meter, Ring } from "@/components/Primitives";
import { PageHead } from "@/components/States";
import { IconArrow, IconCheck, IconGear, IconLink } from "@/components/Icons";
import { getProfile, listNotifications } from "@/server/repository";

export const metadata: Metadata = { title: "Profile" };

export default function Profile() {
  const p = getProfile("demo-user");
  const notes = listNotifications("demo-user");
  const core = p.skills.filter((s) => !s.emerging);
  const emerging = p.skills.filter((s) => s.emerging);

  return (
    <>
      <PageHead
        rail="Your Career DNA"
        title="What the agent knows about you"
        sub="One profile behind every screen. Change it here and discovery, matching, resume and interview prep all move with it."
        actions={
          <>
            <Link href="/onboarding" className="btn btn-quiet btn-sm">Edit DNA</Link>
            <button className="btn btn-ghost btn-sm"><IconGear size={14} /> Settings</button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <div className="panel flex flex-col items-center p-7">
            <span
              className="tnum mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] text-[22px] font-semibold"
              style={{ background: "var(--iris-soft)", color: "var(--iris)", border: "1px solid var(--iris-line)" }}
            >
              AD
            </span>
            <p className="h2">Aditya</p>
            <p className="caption mt-1">{p.title} · {p.yearsExperience} years</p>

            <div className="my-6">
              <Ring value={p.momentum.value} size={140} stroke={8}>
                <span className="tnum text-[36px] font-semibold leading-none">
                  <CountUp to={p.momentum.value} />
                </span>
                <span className="rail mt-1">momentum</span>
              </Ring>
            </div>

            <div className="w-full">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="rail">Profile complete</span>
                <span className="tnum text-[12px] font-semibold">{p.completeness}%</span>
              </div>
              <Meter value={p.completeness} tone="caution" height={5} />
              <p className="caption mt-2">Three fields left: portfolio, GitHub, education detail.</p>
            </div>
          </div>

          <div className="panel p-5">
            <p className="rail mb-3">Connected</p>
            <div className="space-y-2">
              {[
                ["Resume", "aditya-resume.pdf", true],
                ["LinkedIn", "Not connected", false],
                ["GitHub", "Not connected", false],
                ["Portfolio", "Not connected", false],
              ].map(([k, v, on]) => (
                <div key={k as string} className="flex items-center gap-2.5">
                  <span
                    className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full"
                    style={{ background: on ? "var(--positive-soft)" : "var(--surface-2)",
                             color: on ? "var(--positive)" : "var(--ink-3)" }}
                  >
                    {on ? <IconCheck size={10} /> : <IconLink size={10} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{k as string}</span>
                    <span className="caption block truncate">{v as string}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-6">
            <p className="rail mb-5">Momentum inputs</p>
            <div className="space-y-4">
              {p.momentum.inputs.map((inp, i) => (
                <div key={inp.label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>{inp.label}</span>
                    <span className="tnum text-[13px]">
                      <span className="font-semibold">{inp.value}</span>
                      <span className="caption ml-2">weight {Math.round(inp.weight * 100)}%</span>
                    </span>
                  </div>
                  <Meter value={inp.value} delay={i * 80} tone={inp.value >= 88 ? "positive" : "iris"} height={5} />
                </div>
              ))}
            </div>
            <p className="caption mt-5">
              Momentum is not a vanity number — each input is something you can move this week.
            </p>
          </div>

          <div className="panel p-6">
            <p className="rail mb-4">Skills the agent scores you on</p>
            <div className="mb-5 flex flex-wrap gap-1.5">
              {core.map((s) => <span key={s.id} className="chip chip-iris">{s.name}</span>)}
            </div>
            <p className="rail mb-3">Emerging — claimed but not yet evidenced</p>
            <div className="flex flex-wrap gap-1.5">
              {emerging.map((s) => <span key={s.id} className="chip chip-caution">{s.name}</span>)}
            </div>
          </div>

          <div className="panel p-6">
            <dl className="grid gap-6 sm:grid-cols-2">
              {[
                ["Experience level", "Entry level · 3 years"],
                ["Education", p.education],
                ["Preferred locations", p.locations.join(" · ")],
                ["Work mode", "Remote"],
                ["Salary floor", `₹${p.salaryFloorLpa}L+`],
                ["Work authorization", p.workAuthorization],
                ["Industries", p.industries.join(" · ")],
                ["Target companies", p.targetCompanies.join(" · ")],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="rail mb-1.5">{k}</dt>
                  <dd className="text-[14px] leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="panel p-6">
            <p className="rail mb-4">Recent activity</p>
            <ul className="space-y-3.5">
              {notes.map((n) => (
                <li key={n.id} className="flex items-start gap-3">
                  <span
                    className="mt-[6px] h-[6px] w-[6px] flex-none rounded-full"
                    style={{ background: n.read ? "var(--line-2)" : "var(--iris)" }}
                  />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-medium">{n.title}</span>
                    <span className="caption block">{n.body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="btn btn-ghost btn-sm mt-4">
              Back to Mission Control <IconArrow size={13} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
