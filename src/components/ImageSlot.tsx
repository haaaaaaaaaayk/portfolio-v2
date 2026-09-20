/**
 * Labeled image placeholder. Search the codebase for `[IMAGE:` to find
 * every slot. Replace each with a real <img> keeping the same wrapper
 * so the layout holds.
 */
export function ImageSlot({
  label,
  ratio = '3 / 2',
  className = '',
}: {
  /** e.g. "mymizu — support tab, 1200×800" */
  label: string
  /** CSS aspect-ratio value */
  ratio?: string
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label={`Image placeholder: ${label}`}
      className={`dither relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-ink/25 bg-bone-2/60 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span className="tech-label px-4 text-center text-ink-soft normal-case">
        [IMAGE: {label}]
      </span>
      {/* corner ticks — technical ornament */}
      <span aria-hidden className="absolute left-1.5 top-1.5 h-2 w-2 border-l border-t border-ink/40" />
      <span aria-hidden className="absolute right-1.5 top-1.5 h-2 w-2 border-r border-t border-ink/40" />
      <span aria-hidden className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l border-ink/40" />
      <span aria-hidden className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r border-ink/40" />
    </div>
  )
}
