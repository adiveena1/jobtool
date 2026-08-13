import Link from "next/link";
import AgentStage from "@/components/AgentStage";
import { Logo } from "@/components/Shell";
import { ThemeToggle } from "@/components/Theme";
import { MatchDNA } from "@/components/Primitives";
import {
  IconArrow, IconBolt, IconChart, IconDoc, IconMic, IconSpark, IconStack, IconTarget,
} from "@/components/Icons";
import { jobs } from "@/lib/data";

const CAPABILITIES = [
  { icon: IconTarget, title: "Match, not keyword search", body: "Every role is scored across eight axes — skills, experience, location, salary, growth — so you can see which one is weak instead of trusting a single number." },
  { icon: IconDoc,    title: "A resume per role",         body: "The studio rewrites weak bullets into measured claims and tailors a version against the exact description you are applying to." },
  { icon: IconBolt,   title: "Autopilot with a hand brake", body: "The agent prepares applications continuously and submits only inside the rules you set. Nothing goes out unreviewed unless you say so." },
  { icon: IconMic,    title: "Interview rooms that score", body: "Timed rounds across behavioural, technical and system design, graded on structure, depth, confidence and filler." },
  { icon: IconChart,  title: "Market-aware planning",     body: "Your skills read against live demand, with the next skill worth learning chosen by how many of your target roles it unlocks." },
  { icon: IconStack,  title: "One pipeline, end to end",  body: "Discovery through offer in a single board, with the outcome of every application fed back into the brain that ranks the next one." },
];

const STEPS = [
  { n: "01", title: "Build your Career DNA", body: "Upload a resume or connect GitHub and LinkedIn. The agent extracts your skills, level and trajectory into one profile." },
  { n: "02", title: "The agent goes to work", body: "It scans continuously, scores every opening against your DNA, and surfaces only what clears your bar." },
  { n: "03", title: "You decide, it executes",  body: "Approve an application and it tailors the resume, drafts the note, submits, and tracks the reply." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50" style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}>
        <div className="mx-auto flex max-w-shell items-center gap-4 px-4 md:px-8" style={{ height: 62 }}>
          <Link href="/" className="flex items-center gap-2.5" aria-label="Career OS home">
            <Logo />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              Career<span style={{ color: "var(--iris)" }}>OS</span>
            </span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Marketing">
            <a href="#how" className="btn btn-ghost btn-sm">How it works</a>
            <a href="#capabilities" className="btn btn-ghost btn-sm">Capabilities</a>
            <a href="#match" className="btn btn-ghost btn-sm">Match DNA</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard" className="btn btn-quiet btn-sm">Open app</Link>
            <Link href="/onboarding" className="btn btn-primary btn-sm">Build my agent</Link>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- Hero */}
      <section className="mx-auto max-w-shell px-4 pb-14 pt-14 md:px-8 md:pt-24">
        <div className="mx-auto max-w-[860px] text-center">
          <span className="chip chip-iris mb-7">
            <span className="pulse" style={{ background: "var(--iris)" }} />
            One career brain, not ten disconnected tools
          </span>

          <h1 className="display mb-6">
            Your Career.
            <br />
            <span style={{ color: "var(--iris)" }}>Powered by AI.</span>
          </h1>

          <p className="body-lg mx-auto mb-9 max-w-[620px]">
            Find the right opportunities, build stronger applications, and let your AI
            career agent handle the repetitive work.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/onboarding" className="btn btn-primary btn-lg">
              Build My Career Agent <IconArrow size={17} />
            </Link>
            <a href="#how" className="btn btn-quiet btn-lg">Explore How It Works</a>
          </div>
        </div>

        <div className="rise mx-auto mt-14 max-w-[1080px]">
          <AgentStage />
        </div>
      </section>

      {/* ----------------------------------------------------------- How it works */}
      <section id="how" className="mx-auto max-w-shell px-4 py-20 md:px-8">
        <p className="rail mb-3">How it works</p>
        <h2 className="h1 mb-12 max-w-[620px]">
          Three moves, then the agent runs on its own.
        </h2>
        <div className="grid gap-px overflow-hidden md:grid-cols-3" style={{ background: "var(--line)", borderRadius: 16, border: "1px solid var(--line)" }}>
          {STEPS.map((s) => (
            <div key={s.n} className="p-7 md:p-8" style={{ background: "var(--surface)" }}>
              <span className="tnum rail" style={{ color: "var(--iris)" }}>{s.n}</span>
              <h3 className="h2 mb-3 mt-4">{s.title}</h3>
              <p className="body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- Match DNA */}
      <section id="match" className="mx-auto max-w-shell px-4 py-20 md:px-8">
        <div className="panel grid items-center gap-10 overflow-hidden p-7 md:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="rail mb-3">Match DNA</p>
            <h2 className="h1 mb-5 max-w-[520px]">
              A percentage hides the one thing that will sink you.
            </h2>
            <p className="body-lg mb-7 max-w-[520px]">
              So we never show only a percentage. Every role is broken into eight axes,
              and the shape of the polygon tells you where the fit actually breaks —
              before you spend an evening on the application.
            </p>
            <ul className="stagger space-y-2.5">
              {[
                "Skills, experience and education from your resume",
                "Location, salary and industry from your preferences",
                "Growth and company fit from where you said you want to be",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[14.5px]" style={{ color: "var(--ink-2)" }}>
                  <span className="mt-[9px] h-[3px] w-[3px] flex-none rounded-full" style={{ background: "var(--iris)" }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <MatchDNA facets={jobs[0].facets} size={330} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Capabilities */}
      <section id="capabilities" className="mx-auto max-w-shell px-4 py-20 md:px-8">
        <p className="rail mb-3">Capabilities</p>
        <h2 className="h1 mb-12 max-w-[620px]">Everything feeds one brain.</h2>
        <div className="grid gap-px overflow-hidden md:grid-cols-2 lg:grid-cols-3"
             style={{ background: "var(--line)", borderRadius: 16, border: "1px solid var(--line)" }}>
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="p-7" style={{ background: "var(--surface)" }}>
              <span
                className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-[10px]"
                style={{ background: "var(--iris-soft)", color: "var(--iris)", border: "1px solid var(--iris-line)" }}
              >
                <c.icon size={17} />
              </span>
              <h3 className="h3 mb-2">{c.title}</h3>
              <p className="body">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- Closing */}
      <section className="mx-auto max-w-shell px-4 pb-24 md:px-8">
        <div className="panel grid-field p-10 text-center md:p-16" style={{ borderRadius: 20 }}>
          <IconSpark size={26} className="mx-auto mb-5" style={{ color: "var(--iris)" }} />
          <h2 className="h1 mx-auto mb-4 max-w-[560px]">
            Stop running ten tools. Run one agent.
          </h2>
          <p className="body-lg mx-auto mb-8 max-w-[500px]">
            It takes about four minutes to build your Career DNA. Everything after that
            is the agent&apos;s job.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/onboarding" className="btn btn-primary btn-lg">
              Build My Career Agent <IconArrow size={17} />
            </Link>
            <Link href="/dashboard" className="btn btn-quiet btn-lg">See a live dashboard</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)" }}>
        <div className="mx-auto flex max-w-shell flex-wrap items-center gap-4 px-4 py-8 md:px-8">
          <Logo size={22} />
          <p className="caption">Career OS — a concept build. Every figure on these screens is sample data.</p>
          <p className="caption ml-auto tnum">⌘K command center · ⌘J copilot</p>
        </div>
      </footer>
    </div>
  );
}
