"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./Icons";

const KEY = "career-os-theme";

/**
 * Runs before paint so the stored theme is applied to <html> without a flash.
 * Inlined as a blocking script in the document head.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(KEY)});if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(current);
    setReady(true);
  }, []);

  function flip() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch {}
  }

  return (
    <button
      onClick={flip}
      className="btn btn-ghost btn-sm"
      style={{ width: 34, padding: 0 }}
      aria-label={ready ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Switch colour theme"}
    >
      {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
    </button>
  );
}
