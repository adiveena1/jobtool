import type { Config } from "tailwindcss";

/**
 * Tailwind is deliberately thin. Colour, elevation and motion live in
 * styles/globals.css as CSS custom properties so a single token flips both
 * themes at once; Tailwind only reaches for them.
 */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        iris: "var(--iris)",
        signal: "var(--signal)",
        positive: "var(--positive)",
        caution: "var(--caution)",
        critical: "var(--critical)",
      },
      borderRadius: {
        xs: "6px", sm: "8px", md: "10px", lg: "14px", xl: "18px", "2xl": "24px",
      },
      maxWidth: { shell: "1320px" },
    },
  },
  plugins: [],
} satisfies Config;
