"use client";

import { useEffect, useRef, useState } from "react";
import { CountUp, Meter, Ring } from "@/components/Primitives";
import { PageHead } from "@/components/States";
import { IconArrow, IconCheck, IconMic, IconPlay, IconSpark } from "@/components/Icons";
import { interviewModes, interviewScores } from "@/lib/data";

type Phase = "lobby" | "live" | "report";

const QUESTIONS = [
  "Tell me about a difficult technical problem you solved.",
  "Describe a time you disagreed with a teammate about an approach.",
  "Walk me through something you shipped that you would build differently now.",
];

const SAMPLE =
  "So basically the checkout page was dropping about twelve percent of sessions on slow networks. " +
  "I traced it to a four hundred kilobyte client bundle blocking first paint. I moved the pricing " +
  "logic into a server component and split the payment SDK behind an interaction.";

export default function InterviewRoom() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [mode, setMode] = useState(interviewModes[0]!.id);
  const [qi, setQi] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const timer = useRef<number | null>(null);

  // The live round is timed; the clock is part of the pressure being practised.
  useEffect(() => {
    if (phase !== "live") return;
    timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [phase]);

  // Transcript arrives progressively, the way a real speech stream would.
  useEffect(() => {
    if (phase !== "live") return;
    setTranscript("");
    const words = SAMPLE.split(" ");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setTranscript(words.slice(0, i).join(" "));
      if (i >= words.length) window.clearInterval(id);
    }, 130);
    return () => window.clearInterval(id);
  }, [phase, qi]);

  const fillers = (transcript.match(/\b(so basically|basically|like|um|uh)\b/gi) ?? []).length;
  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  const live = [
    { label: "Confidence", value: Math.max(30, 92 - fillers * 8) },
    { label: "Clarity", value: words > 25 ? 88 : 52 },
    { label: "Technical depth", value: words > 35 ? 87 : 48 },
    { label: "Structure", value: words > 30 ? 79 : 40 },
  ];

  function mm(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  /* --------------------------------------------------------------- lobby -- */
  if (phase === "lobby") {
    return (
      <>
        <PageHead
          rail="Interview Room"
          title="Practice the round you are actually about to sit"
          sub="Timed, scored, and graded on the things interviewers notice — structure, depth, and how much of your answer is filler."
          actions={<span className="chip"><IconMic size={12} /> Northwind panel tomorrow 11:00</span>}
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {interviewModes.map((m) => {
            const on = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                aria-pressed={on}
                className="panel p-5 text-left transition-all"
                style={on ? { borderColor: "var(--iris)", background: "var(--iris-soft)", boxShadow: "var(--shadow-sm)" } : undefined}
              >
                <span className="flex items-center justify-between">
                  <span className="h3">{m.name}</span>
                  <span className="tnum caption">{m.minutes}m</span>
                </span>
                <span className="body mt-2 block">{m.detail}</span>
              </button>
            );
          })}
        </div>

        <div className="panel mt-5 flex flex-wrap items-center gap-4 p-6">
          <div className="min-w-0 flex-1">
            <p className="h3 mb-1">Ready when you are</p>
            <p className="body">
              {interviewModes.find((m) => m.id === mode)?.name} round · {QUESTIONS.length} questions ·
              answers are scored live and nothing is recorded to disk.
            </p>
          </div>
          <button onClick={() => { setPhase("live"); setQi(0); setSeconds(0); }} className="btn btn-primary btn-lg">
            <IconPlay size={15} /> Enter the room
          </button>
        </div>
      </>
    );
  }

  /* ---------------------------------------------------------------- live -- */
  if (phase === "live") {
    return (
      <div className="pt-8">
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5"
               style={{ borderBottom: "1px solid var(--line)", background: "var(--surface-2)" }}>
            <span className="pulse" />
            <p className="rail flex-1">
              {interviewModes.find((m) => m.id === mode)?.name} · question {qi + 1} of {QUESTIONS.length}
            </p>
            <span className="tnum text-[14px] font-semibold">{mm(seconds)}</span>
            <button onClick={() => setPhase("report")} className="btn btn-quiet btn-sm">End round</button>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_290px]">
            <div className="p-6 md:p-9">
              <div className="mb-7 flex items-start gap-3">
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
                  style={{ background: "var(--ink)", color: "var(--canvas)" }}
                >
                  <IconMic size={16} />
                </span>
                <div className="min-w-0">
                  <p className="rail mb-1.5">Interviewer</p>
                  <p className="text-[19px] font-medium leading-snug tracking-[-0.015em]">
                    {QUESTIONS[qi]}
                  </p>
                </div>
              </div>

              <div className="rounded-[12px] p-4" style={{ background: "var(--surface-2)", minHeight: 150 }}>
                <p className="rail mb-2.5">Live transcript</p>
                <p className="text-[14.5px] leading-[1.65]" style={{ color: "var(--ink-2)" }}>
                  {transcript}
                  <span className="ml-0.5 inline-block h-[15px] w-[2px] align-middle"
                        style={{ background: "var(--iris)", animation: "fade 900ms ease-in-out infinite alternate" }} />
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="tnum chip">{words} words</span>
                <span className={fillers > 2 ? "chip chip-caution" : "chip"}>{fillers} filler openings</span>
                <span className="tnum chip">target 90–150s</span>

                {qi < QUESTIONS.length - 1 ? (
                  <button onClick={() => { setQi((i) => i + 1); setSeconds(0); }} className="btn btn-primary btn-sm ml-auto">
                    Next question <IconArrow size={14} />
                  </button>
                ) : (
                  <button onClick={() => setPhase("report")} className="btn btn-primary btn-sm ml-auto">
                    Finish and score <IconArrow size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-5" style={{ borderLeft: "1px solid var(--line)" }}>
              <p className="rail mb-4">Live read</p>
              <div className="space-y-3.5">
                {live.map((l) => (
                  <div key={l.label}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-[12.5px]" style={{ color: "var(--ink-2)" }}>{l.label}</span>
                      <span className="tnum text-[12.5px] font-semibold">{l.value}</span>
                    </div>
                    <Meter value={l.value} tone={l.value >= 80 ? "positive" : l.value >= 60 ? "iris" : "caution"} />
                  </div>
                ))}
              </div>
              <p className="caption mt-5">
                Scores move as you speak. They settle once you stop — the number you end on is the one that counts.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- report -- */
  return (
    <>
      <PageHead
        rail="Round complete"
        title="Interview performance"
        sub="Graded on what an interviewer would actually write down afterwards."
        actions={<button onClick={() => setPhase("lobby")} className="btn btn-quiet btn-sm">Run another round</button>}
      />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="panel flex flex-col items-center p-7">
          <Ring value={interviewScores[0]!.value} size={158} stroke={9} tone="positive">
            <span className="tnum text-[42px] font-semibold leading-none">
              <CountUp to={interviewScores[0]!.value} />
            </span>
            <span className="rail mt-1">overall</span>
          </Ring>
          <div className="mt-6 w-full space-y-3">
            {interviewScores.slice(1).map((s, i) => (
              <div key={s.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12.5px]" style={{ color: "var(--ink-2)" }}>{s.label}</span>
                  <span className="tnum text-[12.5px] font-semibold">{s.value}</span>
                </div>
                <Meter value={s.value} delay={i * 90} tone={s.value >= 90 ? "positive" : "iris"} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-6">
            <div className="mb-4 flex items-center gap-2">
              <IconCheck size={14} style={{ color: "var(--positive)" }} />
              <p className="rail">What you did well</p>
            </div>
            <ul className="stagger space-y-2.5">
              {[
                "You opened with the constraint, not the solution — that framed everything after it.",
                "Every claim carried a number. Interviewers can verify numbers; they cannot verify adjectives.",
                "You named the trade-off you rejected and why, which is the part most candidates skip.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[14px]" style={{ color: "var(--ink-2)" }}>
                  <span className="mt-[8px] h-[3px] w-[3px] flex-none rounded-full" style={{ background: "var(--positive)" }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-6">
            <div className="mb-4 flex items-center gap-2">
              <IconSpark size={14} style={{ color: "var(--caution)" }} />
              <p className="rail">What to improve</p>
            </div>
            <ul className="stagger space-y-2.5">
              {[
                "Four filler openings (“so basically”). They cost about nine seconds and some authority.",
                "The middle ran 40 seconds long before you reached the result. Move the outcome earlier.",
                "You said “we” throughout a story that was yours. Say “I” when the decision was yours.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[14px]" style={{ color: "var(--ink-2)" }}>
                  <span className="mt-[8px] h-[3px] w-[3px] flex-none rounded-full" style={{ background: "var(--caution)" }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-6" style={{ borderColor: "var(--iris-line)", background: "var(--iris-soft)" }}>
            <p className="rail mb-3">A stronger version of your answer</p>
            <p className="text-[14.5px] leading-[1.68]">
              “The checkout page was dropping 12% of sessions on slow networks. I traced it to a 400KB client
              bundle blocking the first paint. I moved the pricing logic to a server component and split the
              payment SDK behind an interaction. LCP went from 4.1s to 1.2s and the drop-off fell to 3%.
              I rejected caching the old bundle harder because it would have hidden the problem rather than
              removed it.”
            </p>
            <p className="caption mt-3">
              Same content, 38 fewer words, result stated before the method.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
