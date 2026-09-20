import type { ReactNode } from 'react'

/** Mono section label with a hairline rule — technical annotation style. */
export function CaseLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="tech-label whitespace-nowrap text-ink-soft">
        {children}
      </span>
      <span aria-hidden className="h-px flex-1 bg-ink/15" />
    </div>
  )
}

/** Band of big numbers. */
export function StatBand({
  stats,
  accent = 'text-ink',
}: {
  stats: { value: string; label: string }[]
  accent?: string
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="border-l-2 border-acid pl-4">
          <div
            className={`font-grotesk text-4xl font-black tracking-tight sm:text-5xl ${accent}`}
          >
            {s.value}
          </div>
          <div className="tech-label mt-2 text-ink-soft normal-case">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Big editorial pull-quote. */
export function PullQuote({
  children,
  attribution,
}: {
  children: ReactNode
  attribution?: string
}) {
  return (
    <figure className="relative py-4">
      <span
        aria-hidden
        className="absolute -left-2 -top-4 font-serif text-7xl italic text-acid-deep sm:-left-8"
      >
        “
      </span>
      <blockquote className="max-w-3xl font-serif text-3xl italic leading-tight sm:text-4xl">
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="tech-label mt-4 text-ink-soft normal-case">
          — {attribution}
        </figcaption>
      )}
    </figure>
  )
}

/** Numbered compact block (problems, solutions, decisions). */
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
    <div className="glass rounded-2xl p-5">
      <div className="font-grotesk text-xs font-bold text-acid-deep">{n}</div>
      <div className="mt-2 font-grotesk text-base font-bold leading-snug">
        {title}
      </div>
      {body && (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
      )}
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
      <div className="glass rounded-2xl rounded-tl-sm p-5">
        <div className="tech-label mb-2 text-blu">AI · claude</div>
        <p className="text-sm leading-relaxed sm:text-base">{ai}</p>
      </div>
      <div className="glass-dark ml-6 rounded-2xl rounded-tr-sm p-5 text-bone sm:ml-14">
        <div className="tech-label mb-2 text-acid">Hayk</div>
        <p className="text-sm leading-relaxed sm:text-base">{human}</p>
      </div>
      <p className="tech-label pt-1 text-ink-soft normal-case">{caption}</p>
    </div>
  )
}
