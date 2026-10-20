import type { ReactNode } from 'react'

/** Page-width container shared by every section. */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Section header in the 24th slide pattern: a full-width ink rule,
 * the section number in the rail, the topic aligned to the content column.
 */
export function SectionHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="grid grid-cols-4 gap-6 border-t border-ink pt-4">
      <span className="col-span-1 text-secondary tabular-nums">{n}</span>
      <h2 className="col-span-3 text-secondary">{title}</h2>
    </div>
  )
}

/**
 * Rail + content layout: a short explanation on the left,
 * the material on the right (stacks on small screens).
 */
export function RailLayout({
  rail,
  children,
}: {
  rail: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mt-12 grid gap-8 sm:mt-16 lg:grid-cols-4 lg:gap-6">
      <div className="text-secondary text-ink-muted lg:col-span-1 lg:max-w-xs">
        {rail}
      </div>
      <div className="lg:col-span-3">{children}</div>
    </div>
  )
}
