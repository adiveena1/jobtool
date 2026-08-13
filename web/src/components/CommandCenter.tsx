"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { commands, jobs, applications } from "@/lib/data";
import { IconArrow, IconBolt, IconBuilding, IconDiscover, IconDoc, IconStack } from "./Icons";

type Item = { id: string; label: string; hint: string; group: string; href: string; icon: React.ReactNode };

/**
 * Career Command Center — ⌘K.
 *
 * Every object in the product is addressable from one input: routes, jobs,
 * applications and slash commands share a single result list, ranked by a
 * plain substring match. No modes, no tabs.
 */
export default function CommandCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const items = useMemo<Item[]>(() => [
    { id: "r1", label: "Mission Control", hint: "Your daily brief", group: "Navigate", href: "/dashboard", icon: <IconBolt size={15} /> },
    { id: "r2", label: "Discover Jobs", hint: "Opportunity feed", group: "Navigate", href: "/discover", icon: <IconDiscover size={15} /> },
    { id: "r3", label: "Applications", hint: "Pipeline and analytics", group: "Navigate", href: "/applications", icon: <IconStack size={15} /> },
    { id: "r4", label: "Resume Studio", hint: "Edit and tailor", group: "Navigate", href: "/resume", icon: <IconDoc size={15} /> },
    { id: "r5", label: "Interview Room", hint: "Practice rounds", group: "Navigate", href: "/interview", icon: <IconArrow size={15} /> },
    { id: "r6", label: "Career Intelligence", hint: "Skills and market", group: "Navigate", href: "/intelligence", icon: <IconArrow size={15} /> },
    { id: "r7", label: "Companies", hint: "Company intelligence", group: "Navigate", href: "/companies", icon: <IconBuilding size={15} /> },
    ...commands.map((c, k) => ({
      id: `c${k}`, label: c.cmd, hint: c.detail, group: "Commands",
      href: c.cmd === "/mock-interview" ? "/interview" : c.cmd === "/tailor-resume" ? "/resume" : "/discover",
      icon: <IconBolt size={15} />,
    })),
    ...jobs.map((j) => ({
      id: `j${j.id}`, label: j.role, hint: `${j.company} · ${j.match}% match`, group: "Jobs",
      href: "/discover", icon: <IconDiscover size={15} />,
    })),
    ...applications.slice(0, 5).map((a) => ({
      id: `a${a.id}`, label: `${a.role} — ${a.company}`, hint: a.stage, group: "Applications",
      href: "/applications", icon: <IconStack size={15} />,
    })),
  ], []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items.slice(0, 9);
    return items
      .filter((x) => `${x.label} ${x.hint} ${x.group}`.toLowerCase().includes(term))
      .slice(0, 10);
  }, [q, items]);

  useEffect(() => { setI(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    setQ("");
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open]);

  // Trap Escape and arrow keys while the palette owns the screen.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "ArrowDown") { e.preventDefault(); setI((v) => Math.min(v + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setI((v) => Math.max(v - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        const hit = results[i];
        if (hit) { router.push(hit.href); onClose(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, i, onClose, router]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${i}"]`)?.scrollIntoView({ block: "nearest" });
  }, [i]);

  if (!open) return null;

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: "color-mix(in srgb, var(--ink) 34%, transparent)", backdropFilter: "blur(6px)" }}
      onMouseDown={onClose}
      role="dialog" aria-modal="true" aria-label="Career command center"
    >
      <div
        className="panel-raised w-full max-w-[620px] overflow-hidden rise"
        style={{ borderRadius: 16 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4" style={{ borderBottom: "1px solid var(--line)", height: 54 }}>
          <IconDiscover size={17} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs, applications, commands…"
            className="h-full flex-1 bg-transparent text-[15px] outline-none"
            style={{ color: "var(--ink)" }}
            aria-label="Search everything"
          />
          <kbd className="chip tnum" style={{ height: 22, fontSize: 11 }}>ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-[54vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="body px-3 py-8 text-center">
              Nothing matches “{q}”. Try a role, a company, or a slash command.
            </p>
          )}
          {results.map((r, k) => {
            const head = r.group !== lastGroup ? ((lastGroup = r.group), r.group) : null;
            return (
              <div key={r.id}>
                {head && <p className="rail px-3 pb-1.5 pt-3">{head}</p>}
                <button
                  data-i={k}
                  onMouseEnter={() => setI(k)}
                  onClick={() => { router.push(r.href); onClose(); }}
                  className="flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left transition-colors"
                  style={{ background: i === k ? "var(--iris-soft)" : "transparent" }}
                >
                  <span style={{ color: i === k ? "var(--iris)" : "var(--ink-3)" }}>{r.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{r.label}</span>
                    <span className="caption block truncate">{r.hint}</span>
                  </span>
                  {i === k && <IconArrow size={15} className="flex-none" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
