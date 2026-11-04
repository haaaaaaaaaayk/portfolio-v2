/** Trail's about: where he is right now, hello in his languages, and who he is. */
import { useEffect, useId, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { profile } from '../../content'
import { reveal } from '../../lib/motion'
import { usePrefs } from '../../lib/prefs'
import { ABOUT_VERSIONS, FINAL_VERSION } from './aboutVersions'

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

/* which draft of the paragraph shows: ?about=N for comparing, otherwise the final copy */
const inRange = (n: number) => Number.isInteger(n) && n >= 0 && n < ABOUT_VERSIONS.length
function initialVersion() {
  const q = new URLSearchParams(window.location.search).get('about')
  return q !== null && inRange(Number(q)) ? Number(q) : FINAL_VERSION
}

/**
 * An internal tool for comparing drafts: previous and next, or ← and → anywhere on the page.
 * It only shows while the switcher UI is on, and the pick goes in the URL so a link shows it.
 * Switching is instant on purpose; it's a tool used many times in a row.
 */
function VersionToggle({ index, onChange }: { index: number; onChange: (n: number) => void }) {
  const v = ABOUT_VERSIONS[index]
  const n = ABOUT_VERSIONS.length
  const step = (d: number) => onChange((index + d + n) % n)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target
      if (e.altKey || e.metaKey || e.ctrlKey || (t instanceof HTMLElement && t.closest('input, textarea, [role=application], [role=dialog]'))) return
      if (e.key === 'ArrowLeft') onChange((index - 1 + n) % n)
      if (e.key === 'ArrowRight') onChange((index + 1) % n)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, n, onChange])
  const btn = 'inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-control-hover hover:text-ink-active active:scale-[0.97]'
  return (
    <div className="glass mb-10 flex items-center gap-2 rounded-full p-1 text-compact xl:hidden" role="group" aria-label="About drafts">
      <button type="button" className={btn} aria-label="Previous draft" onClick={() => step(-1)}>
        ‹
      </button>
      <p className="min-w-0 flex-1 truncate text-center" aria-live="polite">
        <span className="tabular-nums text-ink-muted">
          {index}/{n - 1}
        </span>{' '}
        <span className="text-ink">{v.label}</span>{' '}
        <span className="text-ink-muted">{typeof v.round === 'number' ? `round ${v.round}` : ''}</span>
      </p>
      <button type="button" className={btn} aria-label="Next draft" onClick={() => step(1)}>
        ›
      </button>
    </div>
  )
}

/* the round each draft belongs to, as the list's group names */
const ROUNDS = [
  { round: 'final', title: 'Final' },
  { round: 'draft', title: 'Original' },
  { round: 1, title: 'Round 1, ten framings' },
  { round: 2, title: 'Round 2, ten positionings' },
] as const

/**
 * On wide screens, every draft at once in the margin beside the column, so any one is a click away
 * and the labels can be compared side by side. Same instant switch as the pill it replaces there.
 */
function VersionList({ index, onChange }: { index: number; onChange: (n: number) => void }) {
  return (
    <nav aria-label="About drafts" className="absolute top-0 right-full mr-16 hidden w-56 text-compact xl:block">
      {ROUNDS.map((r) => (
        <div key={r.round} className="mb-5">
          <p className="mb-1 text-ink-muted">{r.title}</p>
          <ul>
            {ABOUT_VERSIONS.map((v, i) =>
              v.round === r.round ? (
                <li key={i}>
                  <button
                    type="button"
                    aria-pressed={i === index}
                    onClick={() => onChange(i)}
                    className="group flex w-full items-baseline gap-2 rounded-mark py-0.5 text-left text-ink-muted hover:text-ink aria-pressed:text-ink focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    <span className="w-5 shrink-0 text-right tabular-nums opacity-60">{i}</span>
                    <span className="truncate">{v.label}</span>
                    <span aria-hidden className="ml-auto size-1.5 shrink-0 self-center rounded-full bg-accent opacity-0 group-aria-pressed:opacity-100" />
                  </button>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function About() {
  const reduced = useReducedMotion()
  const now = useMinute()
  const greeting = GREETINGS[periodOf(now.getHours())]
  const { showUi } = usePrefs()
  const [version, setVersion] = useState(initialVersion)
  const pick = (n: number) => {
    setVersion(n)
    const url = new URL(window.location.href)
    url.searchParams.set('about', String(n))
    window.history.replaceState(window.history.state, '', url)
  }
  const draft = ABOUT_VERSIONS[version]
  const inView = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: reveal,
      }

  /* a centered column with wide margins either side; the text inside stays left-aligned to read well.
     one size per screen (20 on phones, where 24 left ~28 characters a line; 24 above), so hierarchy
     comes from color and space. gaps are counted in lines: half a line holds where and hello together,
     a line and a half sets them apart from who he is, one line between the paragraphs */
  const type = 'text-heading sm:text-lead'
  return (
    <section id="about" className={`mx-auto w-full max-w-2xl px-6 py-section sm:px-8 sm:py-32 ${showUi ? 'xl:min-h-[52rem]' : ''}`}>
      {showUi && <VersionToggle index={version} onChange={pick} />}
      <motion.div {...inView} className={`relative ${type}`}>
        {showUi && <VersionList index={version} onChange={pick} />}
        <p className="text-ink-muted">
          russian hill, sf <time className="ml-2 tabular-nums">{hisTime(now)}</time>
        </p>
        <h1 className="mt-[0.5lh] text-balance text-ink">
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
        <p className="mt-[1.5lh] text-pretty text-ink-muted">
          {draft.before}
          <NameNote note="yes, you read it as hike, and after the above i know you will never forget my name.">
            hayk
          </NameNote>
          {draft.after}
        </p>
        {draft.more && <p className="mt-[1lh] text-pretty text-ink-muted">{draft.more}</p>}
      </motion.div>
    </section>
  )
}
