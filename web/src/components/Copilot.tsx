"use client";

import { useEffect, useRef, useState } from "react";
import { copilotPrompts, profile } from "@/lib/data";
import { IconArrow, IconClose, IconSpark } from "./Icons";

type Turn = { role: "you" | "agent"; text: string; facts?: string[] };

/**
 * Career Copilot.
 *
 * Deliberately not a chat bubble stack. Answers arrive as briefs — a claim,
 * then the evidence from the profile it was drawn from — because the point of
 * one career brain is that the agent can always show its working.
 */
const CANNED: Record<string, Turn> = {
  interviews: {
    role: "agent",
    text: "Three rejections and eleven silent applications all used General v3. Your tailored resumes convert at 4x that rate.",
    facts: ["General v3 — 14 sent, 0 responses", "Northwind v3 — 9 sent, 4 responses", "Retire General v3"],
  },
  weakest: {
    role: "agent",
    text: "System Design. It blocks nine of your saved roles and it is the only gap that appears in every one of your top four matches.",
    facts: ["Named in 9 saved roles", "Blocks the ₹30L+ band", "~3 weeks to a credible answer"],
  },
  default: {
    role: "agent",
    text: `Working from your profile: ${profile.title}, ${profile.level}, strongest in ${profile.skills.slice(0, 3).join(", ")}. Ask me to tailor a resume, explain a match, or run a mock round.`,
    facts: ["248 roles scanned today", "12 applications ready for review", "Momentum 87 — next milestone 90"],
  },
};

function answer(q: string): Turn {
  const s = q.toLowerCase();
  if (s.includes("interview") && (s.includes("not") || s.includes("why"))) return CANNED.interviews;
  if (s.includes("weak")) return CANNED.weakest;
  return CANNED.default;
}

export default function Copilot({ open, onOpen, onClose }: { open: boolean; onOpen: () => void; onClose: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([CANNED.default]);
  const [q, setQ] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, thinking]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function send(text: string) {
    if (!text.trim() || thinking) return;
    setTurns((t) => [...t, { role: "you", text }]);
    setQ("");
    setThinking(true);
    window.setTimeout(() => {
      setTurns((t) => [...t, answer(text)]);
      setThinking(false);
    }, 700);
  }

  return (
    <>
      {!open && (
        <button
          onClick={onOpen}
          className="fixed bottom-[86px] right-4 z-[70] flex items-center gap-2.5 md:bottom-6 md:right-6"
          aria-label="Open Career Copilot"
          style={{
            height: 48, paddingInline: 18, borderRadius: 14,
            background: "var(--ink)", color: "var(--canvas)",
            boxShadow: "var(--shadow-lg)", border: "1px solid var(--line-2)",
          }}
        >
          <span className="pulse" />
          <span className="text-[14px] font-medium tracking-[-0.01em]">Copilot</span>
          <kbd className="tnum hidden text-[11px] opacity-55 sm:inline">⌘J</kbd>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label="Career Copilot">
          <div
            className="absolute inset-0"
            style={{ background: "color-mix(in srgb, var(--ink) 30%, transparent)" }}
            onClick={onClose}
          />

          <aside
            className="panel-raised relative flex h-full w-full max-w-[440px] flex-col rise"
            style={{ borderRadius: 0, borderRight: 0, borderTop: 0, borderBottom: 0 }}
          >
            <header className="flex items-center gap-3 px-5" style={{ height: 62, borderBottom: "1px solid var(--line)" }}>
              <span className="pulse" />
              <div className="min-w-0 flex-1">
                <p className="h3">Career Copilot</p>
                <p className="caption truncate">Reading your full profile · {profile.skills.length} skills · 124 applications</p>
              </div>
              <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }} aria-label="Close copilot">
                <IconClose size={16} />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {turns.map((t, i) =>
                t.role === "you" ? (
                  <div key={i} className="flex justify-end">
                    <p
                      className="max-w-[85%] px-3.5 py-2.5 text-[14px] leading-relaxed"
                      style={{ background: "var(--iris)", color: "#fff", borderRadius: "12px 12px 3px 12px" }}
                    >
                      {t.text}
                    </p>
                  </div>
                ) : (
                  <div key={i} className="fade">
                    <div className="mb-2 flex items-center gap-2">
                      <IconSpark size={13} className="text-[var(--iris)]" />
                      <span className="rail">Agent</span>
                    </div>
                    <p className="text-[14.5px] leading-[1.62]">{t.text}</p>
                    {t.facts && (
                      <ul className="stagger mt-3 space-y-1.5">
                        {t.facts.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "var(--ink-2)" }}>
                            <span className="mt-[7px] h-[3px] w-[3px] flex-none rounded-full" style={{ background: "var(--iris)" }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
              )}

              {thinking && (
                <div className="flex items-center gap-2.5">
                  <span className="scan h-[18px] w-[140px] rounded" style={{ background: "var(--surface-2)" }} />
                  <span className="caption">reading your profile…</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="px-5 pb-4">
              <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
                {copilotPrompts.map((p) => (
                  <button key={p} onClick={() => send(p)} className="chip flex-none hover:border-[var(--ink-3)]">
                    {p}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); send(q); }}
                className="flex items-center gap-2 rounded-[12px] px-3"
                style={{ border: "1px solid var(--line-2)", background: "var(--surface-2)", height: 46 }}
              >
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ask your career agent…"
                  className="flex-1 bg-transparent text-[14.5px] outline-none"
                  style={{ color: "var(--ink)" }}
                  aria-label="Ask your career agent"
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ width: 32, padding: 0 }} aria-label="Send" disabled={thinking}>
                  <IconArrow size={15} />
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
