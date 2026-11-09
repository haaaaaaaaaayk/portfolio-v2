/**
 * Wayfinding for a page that grew past one screen: a small pill pinned to the top, "Hayk ▸ About", whose section
 * name rolls as you scroll into the next section. It stays hidden over the trail, so the first screen is still the
 * scene and nothing else, and appears the moment you scroll past it. Caleb Wu's rules: the pill forms first
 * (300ms), then the word rolls in (700ms, 150ms later), all on his curve; changing section rolls the word up and
 * springs the pill to the new width. "Hayk" takes you back up to the trail.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { EASE_FAST, RollingLabel } from './RollingLabel'

export const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'hello', label: 'Say hello' },
] as const

/** the section whose top has passed 40% of the window; none while the trail fills the screen */
function useCurrentSection() {
  const [current, setCurrent] = useState<(typeof SECTIONS)[number] | null>(null)
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const line = window.innerHeight * 0.4
      let found: (typeof SECTIONS)[number] | null = null
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) found = s
      }
      // the last section is short and can't scroll up to the line: reaching the bottom counts as being in it
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
      if (atEnd && found) found = SECTIONS[SECTIONS.length - 1]
      setCurrent((c) => (c?.id === found?.id ? c : found))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return current
}

export function SectionPill() {
  const reduced = useReducedMotion()
  const current = useCurrentSection()
  const toTop = () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })

  return (
    <AnimatePresence>
      {current && (
        <motion.nav
          aria-label="Sections"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: EASE_FAST } }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.2, ease: EASE_FAST } }}
          className="fixed left-1/2 top-4 z-40 flex h-10 -translate-x-1/2 items-center gap-2 rounded-full bg-surface/90 px-4 text-compact shadow-glass backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={toTop}
            className="cursor-pointer rounded-mark text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"
            aria-label="Back to the trail"
          >
            Hayk
          </button>
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden className="text-ink-muted">
            <path d="M2 1l4 3-4 3z" fill="currentColor" />
          </svg>
          {/* the pill appears first, the word rolls in after it */}
          <RollingLabel id={current.id} delay={0.15} className="h-5 text-ink-muted">
            {current.label}
          </RollingLabel>
          <span className="sr-only">{`Section: ${current.label}`}</span>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
