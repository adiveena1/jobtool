"use client";

import { useEffect, useRef, useState } from "react";

/** Fires once when the element first scrolls into view. Drives every reveal. */
export function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") return setSeen(true);
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);

  return [ref, seen] as const;
}

/** Counts up to a value when it enters view. Reduced-motion jumps straight there. */
export function CountUp({
  to, duration = 1100, suffix = "", className = "",
}: { to: number; duration?: number; suffix?: string; className?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(to);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      // Ease-out cubic: fast commit, soft landing.
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);

  return <span ref={ref} className={className}>{n}{suffix}</span>;
}

/** Horizontal meter. Width animates in on reveal. */
export function Meter({
  value, tone = "iris", height = 4, delay = 0,
}: { value: number; tone?: "iris" | "signal" | "positive" | "caution" | "critical" | "muted"; height?: number; delay?: number }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const color = tone === "muted" ? "var(--ink-3)" : `var(--${tone})`;

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden"
      style={{ height, borderRadius: height, background: "var(--surface-2)" }}
    >
      <div
        style={{
          height: "100%",
          width: seen ? `${Math.max(0, Math.min(100, value))}%` : 0,
          background: color,
          borderRadius: height,
          transition: `width 1000ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        }}
      />
    </div>
  );
}

/** Radial score. The stroke sweeps clockwise from twelve o'clock. */
export function Ring({
  value, size = 148, stroke = 8, tone = "iris", children,
}: { value: number; size?: number; stroke?: number; tone?: "iris" | "positive" | "signal"; children?: React.ReactNode }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.35);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`var(--${tone})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={seen ? c - (c * Math.min(value, 100)) / 100 : c}
          style={{ transition: "stroke-dashoffset 1300ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/**
 * Match DNA — the signature visualisation.
 *
 * A percentage collapses eight different judgements into one number and hides
 * which one is weak. This keeps every axis visible: the polygon's shape is the
 * argument, the number is only its summary.
 */
export function MatchDNA({
  facets, size = 300, interactive = true,
}: { facets: { label: string; score: number }[]; size?: number; interactive?: boolean }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const [active, setActive] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 46;
  const n = facets.length;

  const point = (i: number, radius: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius] as const;
  };

  const shape = facets
    .map((f, i) => {
      const [x, y] = point(i, (R * f.score) / 100);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ") + " Z";

  return (
    <div ref={ref} className="relative select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img"
           aria-label={facets.map((f) => `${f.label} ${f.score} percent`).join(", ")}>
        {/* Reference rings at 25/50/75/100 */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <polygon
            key={t}
            points={facets.map((_, i) => point(i, R * t).join(",")).join(" ")}
            fill="none" stroke="var(--line)" strokeWidth={1}
          />
        ))}
        {/* Spokes */}
        {facets.map((_, i) => {
          const [x, y] = point(i, R);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth={1} />;
        })}

        <path
          d={shape}
          fill="var(--iris)" fillOpacity={0.13}
          stroke="var(--iris)" strokeWidth={1.8} strokeLinejoin="round"
          style={{
            transformOrigin: "center",
            transform: seen ? "scale(1)" : "scale(0.1)",
            opacity: seen ? 1 : 0,
            transition: "transform 1100ms cubic-bezier(0.16,1,0.3,1), opacity 700ms ease",
          }}
        />

        {facets.map((f, i) => {
          const [x, y] = point(i, (R * f.score) / 100);
          const on = active === i;
          return (
            <circle
              key={f.label} cx={x} cy={y} r={on ? 5 : 3.2}
              fill={on ? "var(--iris)" : "var(--surface)"}
              stroke="var(--iris)" strokeWidth={1.8}
              style={{ opacity: seen ? 1 : 0, transition: "opacity 500ms ease 700ms, r 160ms ease" }}
            />
          );
        })}

        {facets.map((f, i) => {
          const [x, y] = point(i, R + 24);
          const on = active === i;
          return (
            <g key={f.label}
               onMouseEnter={() => interactive && setActive(i)}
               onMouseLeave={() => interactive && setActive(null)}
               style={{ cursor: interactive ? "default" : undefined }}>
              <text
                x={x} y={y - 3} textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em",
                         fill: on ? "var(--ink)" : "var(--ink-3)", transition: "fill 160ms ease" }}
              >
                {f.label}
              </text>
              <text
                x={x} y={y + 9} textAnchor="middle" dominantBaseline="middle"
                className="tnum"
                style={{ fontSize: 11, fontWeight: 700, fill: on ? "var(--iris)" : "var(--ink-2)" }}
              >
                {f.score}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Company monogram. Stands in for a real logo without pretending to be one. */
export function Mark({ text, tint, size = 38 }: { text: string; tint: string; size?: number }) {
  return (
    <span
      className="tnum inline-flex flex-none items-center justify-center font-semibold"
      style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: `color-mix(in srgb, ${tint} 13%, transparent)`,
        color: tint,
        border: `1px solid color-mix(in srgb, ${tint} 26%, transparent)`,
        fontSize: size * 0.34, letterSpacing: "0.01em",
      }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
