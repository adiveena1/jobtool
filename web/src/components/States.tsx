import Link from "next/link";
import { IconArrow, IconAlert, IconSpark } from "./Icons";

/**
 * Loading, empty and error are designed once and reused everywhere, so no
 * screen invents its own way to say nothing-here or something-broke.
 */

export function EmptyState({
  title, body, cta, href, icon,
}: { title: string; body: string; cta?: string; href?: string; icon?: React.ReactNode }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-16 text-center">
      <span
        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[12px]"
        style={{ background: "var(--iris-soft)", color: "var(--iris)", border: "1px solid var(--iris-line)" }}
      >
        {icon ?? <IconSpark size={19} />}
      </span>
      <p className="h2 mb-2">{title}</p>
      <p className="body mb-7 max-w-[380px]">{body}</p>
      {cta && href && (
        <Link href={href} className="btn btn-primary">
          {cta} <IconArrow size={16} />
        </Link>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong.", body, onRetry,
}: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-16 text-center">
      <span
        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[12px]"
        style={{ background: "var(--critical-soft)", color: "var(--critical)" }}
      >
        <IconAlert size={19} />
      </span>
      <p className="h2 mb-2">{title}</p>
      <p className="body mb-7 max-w-[380px]">
        {body ?? "The fault is on our side. Nothing you did was lost."}
      </p>
      <div className="flex gap-3">
        {onRetry && <button onClick={onRetry} className="btn btn-primary">Try again</button>}
        <Link href="/dashboard" className="btn btn-quiet">Back to Mission Control</Link>
      </div>
    </div>
  );
}

export function Skeleton({ h = 16, w = "100%", radius = 6 }: { h?: number; w?: number | string; radius?: number }) {
  return (
    <span
      className="scan block"
      style={{ height: h, width: w, borderRadius: radius, background: "var(--surface-2)" }}
      aria-hidden="true"
    />
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="panel flex items-center gap-4 p-5">
          <Skeleton h={40} w={40} radius={11} />
          <div className="flex-1 space-y-2">
            <Skeleton h={14} w="45%" />
            <Skeleton h={12} w="28%" />
          </div>
          <Skeleton h={30} w={54} radius={8} />
        </div>
      ))}
    </div>
  );
}

/** Page heading used by every app screen, so hierarchy never drifts. */
export function PageHead({
  rail, title, sub, actions,
}: { rail: string; title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-7 pt-8">
      <div className="min-w-0">
        <p className="rail mb-2">{rail}</p>
        <h1 className="h1">{title}</h1>
        {sub && <p className="body mt-2 max-w-[560px]">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
