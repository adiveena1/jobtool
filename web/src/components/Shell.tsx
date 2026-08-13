"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CommandCenter from "./CommandCenter";
import Copilot from "./Copilot";
import { ThemeToggle } from "./Theme";
import {
  IconBell, IconBuilding, IconChart, IconDiscover, IconDoc, IconHome,
  IconMic, IconSpark, IconStack, IconUser,
} from "./Icons";

const NAV = [
  { href: "/dashboard",    label: "Home",         icon: IconHome },
  { href: "/discover",     label: "Discover",     icon: IconDiscover },
  { href: "/matches",      label: "AI Matches",   icon: IconSpark },
  { href: "/applications", label: "Applications", icon: IconStack },
  { href: "/resume",       label: "Resume",       icon: IconDoc },
  { href: "/interview",    label: "Interview",    icon: IconMic },
  { href: "/intelligence", label: "Intelligence", icon: IconChart },
  { href: "/companies",    label: "Companies",    icon: IconBuilding },
];

/** Mobile keeps five destinations. The agent is one of them, never buried. */
const MOBILE = [
  { href: "/dashboard",    label: "Home",     icon: IconHome },
  { href: "/discover",     label: "Jobs",     icon: IconDiscover },
  { href: "/applications", label: "Pipeline", icon: IconStack },
  { href: "/resume",       label: "Resume",   icon: IconDoc },
  { href: "/profile",      label: "Profile",  icon: IconUser },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [cmd, setCmd] = useState(false);
  const [pilot, setPilot] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") { e.preventDefault(); setPilot(false); setCmd((v) => !v); }
      if (meta && e.key.toLowerCase() === "j") { e.preventDefault(); setCmd(false); setPilot((v) => !v); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen">
      <header
        className="glass sticky top-0 z-50"
        style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}
      >
        <div className="mx-auto flex max-w-shell items-center gap-4 px-4 md:px-8" style={{ height: 60 }}>
          <Link href="/" className="flex flex-none items-center gap-2.5" aria-label="Career OS home">
            <Logo />
            <span className="hidden text-[15px] font-semibold tracking-[-0.02em] sm:inline">Career<span style={{ color: "var(--iris)" }}>OS</span></span>
          </Link>

          <nav className="no-scrollbar hidden flex-1 items-center gap-0.5 overflow-x-auto lg:flex" aria-label="Primary">
            {NAV.map((n) => {
              const on = path.startsWith(n.href);
              return (
                <Link
                  key={n.href} href={n.href}
                  aria-current={on ? "page" : undefined}
                  className="flex items-center gap-2 rounded-[9px] px-3 py-2 text-[13.5px] font-medium transition-colors"
                  style={{
                    color: on ? "var(--ink)" : "var(--ink-3)",
                    background: on ? "var(--surface-2)" : "transparent",
                  }}
                >
                  <n.icon size={15} />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setCmd(true)}
              className="hidden items-center gap-2 rounded-[9px] px-2.5 text-[13px] transition-colors sm:flex"
              style={{ height: 34, border: "1px solid var(--line-2)", color: "var(--ink-3)", background: "var(--surface)" }}
              aria-label="Open command center"
            >
              <IconDiscover size={14} />
              <span className="hidden md:inline">Search</span>
              <kbd className="tnum text-[11px] opacity-70">⌘K</kbd>
            </button>

            <button className="btn btn-ghost btn-sm relative" style={{ width: 34, padding: 0 }} aria-label="Notifications, 3 unread">
              <IconBell size={16} />
              <span
                className="absolute right-1.5 top-1.5 h-[6px] w-[6px] rounded-full"
                style={{ background: "var(--iris)" }}
              />
            </button>

            <ThemeToggle />

            <Link
              href="/profile"
              className="tnum ml-1 flex flex-none items-center justify-center rounded-[9px] text-[12.5px] font-semibold"
              style={{ width: 34, height: 34, background: "var(--iris-soft)", color: "var(--iris)", border: "1px solid var(--iris-line)" }}
              aria-label="Your profile"
            >
              AD
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-shell px-4 pb-28 md:px-8 lg:pb-16">{children}</main>

      {/* Mobile destinations */}
      <nav
        className="glass fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 lg:hidden"
        style={{ borderLeft: 0, borderRight: 0, borderBottom: 0, paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary mobile"
      >
        {MOBILE.map((n) => {
          const on = path.startsWith(n.href);
          return (
            <Link
              key={n.href} href={n.href}
              aria-current={on ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 py-2.5"
              style={{ color: on ? "var(--iris)" : "var(--ink-3)" }}
            >
              <n.icon size={19} />
              <span className="text-[10.5px] font-medium">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <CommandCenter open={cmd} onClose={() => setCmd(false)} />
      <Copilot open={pilot} onOpen={() => setPilot(true)} onClose={() => setPilot(false)} />
    </div>
  );
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <rect x="0.5" y="0.5" width="27" height="27" rx="8" fill="var(--ink)" />
      {/* Four rising marks — the momentum motif, repeated across the product. */}
      <rect x="7"    y="17" width="2.6" height="5"  rx="1.3" fill="var(--canvas)" opacity="0.5" />
      <rect x="11.2" y="13" width="2.6" height="9"  rx="1.3" fill="var(--canvas)" opacity="0.7" />
      <rect x="15.4" y="9"  width="2.6" height="13" rx="1.3" fill="var(--canvas)" />
      <circle cx="20.9" cy="7.6" r="2.1" fill="var(--signal)" />
    </svg>
  );
}
