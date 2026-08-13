"use client";

import { useState } from "react";
import { IconArrow } from "./Icons";

/**
 * The career pipeline, shown as one continuous rail rather than eight separate
 * cards. Selecting a stage is a filter everywhere it appears, so the same
 * component drives Mission Control and the tracker.
 */

export type RailStage = { key: string; label: string; count: number; detail: string };

export default function PipelineRail({
  stages, value, onChange,
}: { stages: RailStage[]; value?: string; onChange?: (key: string) => void }) {
  const [internal, setInternal] = useState(stages[0]?.key ?? "");
  const active = value ?? internal;

  function pick(k: string) {
    setInternal(k);
    onChange?.(k);
  }

  const max = Math.max(...stages.map((s) => s.count), 1);
  const current = stages.find((s) => s.key === active);

  return (
    <div className="panel overflow-hidden">
      <div className="no-scrollbar flex overflow-x-auto" role="tablist" aria-label="Career pipeline">
        {stages.map((s, i) => {
          const on = s.key === active;
          return (
            <button
              key={s.key}
              role="tab"
              aria-selected={on}
              onClick={() => pick(s.key)}
              className="group relative flex min-w-[124px] flex-1 flex-col items-start gap-2 px-4 py-4 text-left transition-colors"
              style={{
                background: on ? "var(--iris-soft)" : "transparent",
                borderRight: i < stages.length - 1 ? "1px solid var(--line)" : undefined,
              }}
            >
              <span className="flex w-full items-center gap-2">
                <span className="rail" style={{ color: on ? "var(--iris)" : undefined }}>{s.label}</span>
                {i < stages.length - 1 && (
                  <IconArrow size={12} className="ml-auto opacity-25" />
                )}
              </span>
              <span className="tnum text-[22px] font-semibold leading-none">{s.count}</span>
              <span
                className="mt-1 block h-[3px] w-full overflow-hidden rounded-full"
                style={{ background: "var(--surface-2)" }}
              >
                <span
                  className="block h-full rounded-full transition-all duration-700"
                  style={{ width: `${(s.count / max) * 100}%`, background: on ? "var(--iris)" : "var(--line-2)" }}
                />
              </span>
            </button>
          );
        })}
      </div>

      {current && (
        <p
          key={current.key}
          className="fade body px-5 py-4"
          style={{ borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}
        >
          {current.detail}
        </p>
      )}
    </div>
  );
}
