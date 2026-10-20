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
      className={`relative flex items-center justify-center overflow-hidden rounded-media border border-dashed border-rule bg-paper/80 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span className="px-4 text-center text-caption text-ink-muted">
        [IMAGE: {label}]
      </span>
    </div>
  )
}
