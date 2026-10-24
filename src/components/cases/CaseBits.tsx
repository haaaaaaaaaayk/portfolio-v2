import type { ReactNode } from 'react'

/** Section label with a hairline rule. */
export function CaseLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="whitespace-nowrap text-compact text-ink-muted">
        {children}
      </span>
      <span aria-hidden className="h-px flex-1 bg-rule" />
    </div>
  )
}

/** Band of big numbers — size carries the hierarchy, not weight. */
export function StatBand({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="border-l-2 border-accent pl-4">
          <div className="font-display text-specimen tabular-nums text-ink">{s.value}</div>
          <div className="mt-2 text-compact text-ink-muted">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

/** Large editorial pull-quote. */
export function PullQuote({
  children,
  attribution,
}: {
  children: ReactNode
  attribution?: string
}) {
  return (
    <figure className="py-2">
      <blockquote className="max-w-3xl text-title text-ink sm:text-role">
        <span aria-hidden className="text-ink-muted">“</span>
        {children}
        <span aria-hidden className="text-ink-muted">”</span>
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 text-compact text-ink-muted">
          — {attribution}
        </figcaption>
      )}
    </figure>
  )
}

/** Numbered compact card (problems, solutions, decisions). */
export function NumBlock({
  n,
  title,
  body,
}: {
  n: string
  title: string
  body?: string
}) {
  return (
    <div className="glass rounded-card p-5">
      <div className="text-caption text-ink-muted tabular-nums">{n}</div>
      <div className="mt-2 text-secondary text-ink">{title}</div>
      {body && <p className="mt-2 text-compact text-ink-muted">{body}</p>}
    </div>
  )
}

/** Two-message AI-vs-designer exchange. */
export function Exchange({
  ai,
  human,
  caption,
}: {
  ai: string
  human: string
  caption: string
}) {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="glass rounded-card rounded-tl-[4px] p-5">
        <div className="mb-2 text-caption text-ink-muted">AI · Claude</div>
        <p className="text-secondary">{ai}</p>
      </div>
      <div className="glass-dark ml-6 rounded-card rounded-tr-[4px] p-5 text-white sm:ml-14">
        <div className="mb-2 text-caption text-white/60">Hayk</div>
        <p className="text-secondary">{human}</p>
      </div>
      <p className="pt-1 text-compact text-ink-muted">{caption}</p>
    </div>
  )
}

/** Short bulleted list with accent markers. */
export function DotList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="max-w-2xl space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-body">
          <span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Labeled glass note (limitations, outcomes, next steps). */
export function Note({
  label,
  tone = 'neutral',
  children,
}: {
  label: string
  tone?: 'neutral' | 'success' | 'media'
  children: ReactNode
}) {
  const labelColor =
    tone === 'success' ? 'text-success' : tone === 'media' ? 'text-media' : 'text-ink-muted'
  return (
    <div className="glass rounded-card p-6 sm:p-8">
      <div className={`mb-3 text-compact ${labelColor}`}>{label}</div>
      {children}
    </div>
  )
}
