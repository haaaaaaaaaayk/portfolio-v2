/**
 * A word in a one-line window that rolls when it changes: the old word leaves through the top, the new one
 * arrives from below, and the window springs to the new word's width so nothing around it jumps. A
 * slot roll (700ms on the ease-fast curve, always upward). Reduced motion swaps the words with a crossfade.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export const EASE_FAST = [0.62, 0.61, 0.02, 1] as const

export function RollingLabel({
  id,
  children,
  delay = 0,
  className = '',
}: {
  /** changes when the content should roll */
  id: string
  children: ReactNode
  /** seconds before the first word arrives: lets a surface form first (container first, content second) */
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const measure = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  const first = useRef(true)
  useLayoutEffect(() => {
    if (measure.current) setWidth(Math.ceil(measure.current.getBoundingClientRect().width))
  }, [id])
  const wait = first.current ? delay : 0
  first.current = false

  return (
    <motion.span
      className={`relative inline-block overflow-hidden align-top ${className}`}
      initial={false}
      animate={width === null ? undefined : { width }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, ease: EASE_FAST }}
    >
      <AnimatePresence initial>
        <motion.span
          key={id}
          className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap"
          initial={reduced ? { opacity: 0 } : { y: '100%' }}
          animate={reduced ? { opacity: 1 } : { y: '0%' }}
          exit={reduced ? { opacity: 0 } : { y: '-100%' }}
          transition={reduced ? { duration: 0.2 } : { duration: 0.7, ease: EASE_FAST, delay: wait }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
      {/* sets the height and measures the target width, in the same type */}
      <span ref={measure} aria-hidden className="invisible inline-flex items-center whitespace-nowrap">
        {children}
      </span>
    </motion.span>
  )
}
