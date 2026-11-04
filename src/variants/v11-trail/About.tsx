/** Trail's about: where he is right now, hello in his languages, and who he is. */
import { useEffect, useId, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { profile } from '../../content'
import { reveal } from '../../lib/motion'

/* hello in each of his languages, picked by the visitor's time of day; late at night it's just hello */
const LANGS = ['de', 'ko', 'hy', 'uk', 'zh'] as const
const GREETINGS: Record<'morning' | 'afternoon' | 'evening' | 'night', readonly string[]> = {
  morning: ['guten morgen', '좋은 아침', 'բարի լույս', 'доброго ранку', '早上好'],
  /* Korean has no everyday "good afternoon" or "good evening"; 안녕 is what people say */
  afternoon: ['guten tag', '안녕', 'բարի օր', 'добрий день', '下午好'],
  evening: ['guten abend', '안녕', 'բարի երեկո', 'добрий вечір', '晚上好'],
  night: ['hallo', '안녕', 'ողջույն', 'привіт', '你好'],
}
function periodOf(hour: number) {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'night'
}

/* his local time, 4:46pm style */
const HIS_TIME = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: profile.timezone,
})
const hisTime = (d: Date) => HIS_TIME.format(d).replace(/\s?([AP])M$/, (_, m: string) => `${m.toLowerCase()}m`)

/** Ticks on each minute boundary, so the clock changes when the minute does, not up to 59s late. */
function useMinute() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let id = 0
    const tick = () => {
      setNow(new Date())
      id = window.setTimeout(tick, 60_000 - (Date.now() % 60_000))
    }
    id = window.setTimeout(tick, 60_000 - (Date.now() % 60_000))
    return () => window.clearTimeout(id)
  }, [])
  return now
}

/**
 * The name, with the joke behind it. Opens on mouse hover, keyboard focus, or a tap,
 * and the line is also its accessible description, so screen readers get it too.
 */
function NameNote({ children, note }: { children: ReactNode; note: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-describedby={id}
        aria-expanded={open}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="cursor-help rounded-mark text-ink underline decoration-ink-muted decoration-dotted decoration-1 underline-offset-[6px] outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
      >
        {children}
      </button>
      {/* anchored to the word's left edge, where it sits near the column's start, and grows from there;
          the word is about 5rem in, so the width leaves that much room on a phone */}
      <span
        id={id}
        role="tooltip"
        data-open={open}
        className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-max max-w-[min(20rem,calc(100vw-6.5rem))] origin-bottom-left translate-y-1 scale-[0.97] rounded-card bg-ink px-3 py-2 text-compact text-white opacity-0 transition-[opacity,translate,scale] duration-[160ms] ease-[var(--ease-reading)] data-[open=true]:translate-y-0 data-[open=true]:scale-100 data-[open=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-opacity"
      >
        {note}
      </span>
    </span>
  )
}

export function About() {
  const reduced = useReducedMotion()
  const now = useMinute()
  const greeting = GREETINGS[periodOf(now.getHours())]
  const inView = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: reveal,
      }

  /* a centered column with wide margins either side; the text inside stays left-aligned to read well */
  return (
    <section id="about" className="mx-auto w-full max-w-2xl px-6 py-section sm:px-8 sm:py-32">
      <motion.div {...inView}>
        <p className="text-compact text-ink-muted">
          russian hill, sf <time className="ml-2 tabular-nums">{hisTime(now)}</time>
        </p>
        <h1 className="mt-6 text-role text-ink sm:text-specimen">
          {greeting.map((g, i) => (
            <span key={LANGS[i]}>
              {/* each hello stays whole; lines only break after a comma */}
              <span lang={LANGS[i]} className="whitespace-nowrap">
                {g}
              </span>
              {i < greeting.length - 1 ? ', ' : ''}
            </span>
          ))}
        </h1>
        <p className="mt-10 text-title text-ink-muted">
          I am{' '}
          <NameNote note="yes, you read it as hike, and after the above i know you will never forget my name.">
            hayk
          </NameNote>
          , designing for startups who can’t afford confusion, taking products from zero to one. Currently I am a design
          engineer at mymizu, improving donations.
        </p>
      </motion.div>
    </section>
  )
}
