import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { spring } from '../../lib/motion'

export interface SegmentOption<T extends string | number> {
  value: T
  label: string
  /** optional accessible label when `label` is terse (e.g. "1") */
  title?: string
}

/**
 * 24th segmented control, ported: a radio group styled as one pill.
 * Keyboard: arrows move between options (native radio behaviour).
 * The raised thumb slides with a layout animation.
 */
export function Segmented<T extends string | number>({
  label,
  value,
  onChange,
  options,
  size = 'regular',
  className = '',
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: readonly SegmentOption<T>[]
  /** regular = 44px row (36 thumb), compact = 32px row */
  size?: 'regular' | 'compact'
  className?: string
}) {
  const id = useId()
  const reduced = useReducedMotion()
  const rowH = size === 'compact' ? 'h-8' : 'h-11'
  const thumbPad = size === 'compact' ? 'p-0.5' : 'p-1'
  return (
    <fieldset
      className={`m-0 min-w-0 border-0 p-0 ${className}`}
      aria-label={label}
    >
      <div
        className={`flex ${rowH} ${thumbPad} items-stretch gap-0.5 rounded-full bg-black/[0.06]`}
      >
        {options.map((o, i) => {
          const checked = o.value === value
          return (
            <label
              key={String(o.value)}
              htmlFor={`${id}-${i}`}
              title={o.title}
              className={`relative flex min-w-8 cursor-pointer select-none items-center justify-center rounded-full px-3 text-compact transition-colors duration-[180ms] ${
                checked ? 'text-ink' : 'text-ink-muted hover:text-ink-active'
              }`}
            >
              {checked && (
                <motion.span
                  layoutId={`${id}-thumb`}
                  transition={reduced ? { duration: 0 } : spring}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgb(22_22_22/10%),inset_0_0_0_1px_rgb(255_255_255/80%)]"
                />
              )}
              <input
                id={`${id}-${i}`}
                type="radio"
                name={id}
                value={String(o.value)}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none opacity-0"
              />
              <span className="pointer-events-none absolute inset-0 rounded-full ring-accent peer-focus-visible:ring-2" />
              <span className="relative z-10 whitespace-nowrap">{o.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
