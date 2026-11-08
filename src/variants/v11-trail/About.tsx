/** Trail's about: where he is right now, hello in his languages, and who he is. */
import { useEffect, useId, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { profile } from '../../content'
import { reveal } from '../../lib/motion'
import { ABOUT_VERSIONS, FINAL_VERSION } from './aboutVersions'
import saved from './aboutText.json'
import { Block, EditBar, EditableText, LookBar } from './TextEditor'
import type { Look } from './textStyles'

/* hello in each of his languages, picked by the visitor's time of day; late at night it's just hello.
   kept lowercase on purpose: a casual hello, unlike the rest of the page */
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

/* his local time, 4:46 PM style */
const HIS_TIME = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: profile.timezone,
})
const hisTime = (d: Date) => HIS_TIME.format(d)

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
        className="cursor-help rounded-mark text-ink underline decoration-ink-muted decoration-dotted decoration-1 underline-offset-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
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

/* which draft of the paragraph shows: the final copy, or ?about=N to look at an earlier one */
const inRange = (n: number) => Number.isInteger(n) && n >= 0 && n < ABOUT_VERSIONS.length
function initialVersion() {
  const q = new URLSearchParams(window.location.search).get('about')
  return q !== null && inRange(Number(q)) ? Number(q) : FINAL_VERSION
}

type AboutText = typeof saved
type BlockId = 'location' | 'hello' | 'intro' | 'more'

export function About() {
  const reduced = useReducedMotion()
  const now = useMinute()
  const greeting = GREETINGS[periodOf(now.getHours())]
  const [version] = useState(initialVersion)
  const isFinal = version === FINAL_VERSION
  const draft = ABOUT_VERSIONS[version]
  const inView = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: reveal,
      }

  /* the words and their looks come from aboutText.json; in npm run dev they can be edited in place */
  const [text, setText] = useState<AboutText>(saved)
  const [base, setBase] = useState<AboutText>(saved)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<BlockId | null>(null)
  const canEdit = import.meta.env.DEV && isFinal
  const on = canEdit && editing
  const dirty = JSON.stringify(text) !== JSON.stringify(base)
  const set = <K extends BlockId>(id: K, patch: Partial<AboutText[K]>) =>
    setText((t) => ({ ...t, [id]: { ...t[id], ...patch } }))
  const block = (id: BlockId) => ({
    editing: on,
    selected: on && selected === id,
    onSelect: () => setSelected(id),
    look: { style: text[id].style, color: text[id].color, strong: text[id].strong } as Look,
  })
  const bar = (id: BlockId, extra?: ReactNode) => (
    <LookBar look={block(id).look} onChange={(l) => set(id, l as Partial<AboutText[typeof id]>)}>
      {extra}
    </LookBar>
  )
  const save = async () => {
    const res = await fetch('/__about-text', { method: 'POST', body: JSON.stringify(text, null, 2) })
    if (!res.ok) throw new Error(await res.text())
    setBase(text)
  }

  /* a centered column with wide margins either side; the text inside stays left-aligned to read well.
     who he is (the paragraphs) is the main thing; above it, two quiet lines: where he is now and hello.
     each block's style and color is a design-system token picked in aboutText.json (or the editor).
     the page's h1 is for screen readers only. everything sits on the 4px grid */
  return (
    <section id="about" className="mx-auto w-full max-w-2xl px-6 py-section sm:px-8 sm:py-32">
      <motion.div {...inView} className="relative">
        <h1 className="sr-only">Hayk Sargsyan, product designer and design engineer</h1>
        <Block {...block('location')} bar={bar('location')}>
          <EditableText
            editing={on}
            label="Location"
            value={text.location.text}
            onChange={(v) => set('location', { text: v })}
          />{' '}
          <time className="ml-2 tabular-nums">{hisTime(now)}</time>
        </Block>
        <Block
          {...block('hello')}
          className="mt-1 text-balance"
          bar={bar('hello', <span className="text-ink-muted">Changes with the time of day</span>)}
        >
          {greeting.map((g, i) => (
            <span key={LANGS[i]}>
              {/* each hello stays whole; lines only break after a comma */}
              <span lang={LANGS[i]} className="whitespace-nowrap">
                {g}
              </span>
              {i < greeting.length - 1 ? ', ' : ''}
            </span>
          ))}
        </Block>
        <div className="mt-8 space-y-7 sm:mt-10">
          <Block
            {...block('intro')}
            className="text-pretty"
            bar={bar(
              'intro',
              <label className="flex min-w-60 flex-1 items-center gap-2">
                <span className="shrink-0 text-ink-muted">Name note</span>
                <input
                  value={text.intro.note}
                  onChange={(e) => set('intro', { note: e.target.value })}
                  className="h-8 w-full rounded-control bg-control px-3 text-compact text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                />
              </label>,
            )}
          >
            {isFinal ? (
              <>
                <EditableText editing={on} label="Before the name" value={text.intro.before} onChange={(v) => set('intro', { before: v })} />
                {on ? (
                  <span className="text-ink underline decoration-ink-muted decoration-dotted decoration-1 underline-offset-4">
                    <EditableText editing label="Name" value={text.intro.name} onChange={(v) => set('intro', { name: v })} />
                  </span>
                ) : (
                  <NameNote note={text.intro.note}>{text.intro.name}</NameNote>
                )}
                <EditableText editing={on} label="After the name" value={text.intro.after} onChange={(v) => set('intro', { after: v })} />
              </>
            ) : (
              <>
                {draft.before}
                <NameNote note={text.intro.note}>{text.intro.name}</NameNote>
                {draft.after}
              </>
            )}
          </Block>
          {(isFinal ? text.more.text : draft.more) && (
            <Block {...block('more')} className="text-pretty" bar={bar('more')}>
              {isFinal ? (
                <EditableText editing={on} label="Second paragraph" value={text.more.text} onChange={(v) => set('more', { text: v })} />
              ) : (
                draft.more
              )}
            </Block>
          )}
        </div>
      </motion.div>
      {canEdit && (
        <EditBar
          editing={editing}
          setEditing={(v) => {
            setEditing(v)
            if (!v) setSelected(null)
          }}
          dirty={dirty}
          onSave={save}
          onReset={() => setText(base)}
        />
      )}
    </section>
  )
}
