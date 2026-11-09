/**
 * A word that spins: a drum of words seen head-on. Ported from D4 · Spin in github.com/haaaaaaaaaayk/something-word,
 * where the exploration lives. Used for the asks (attention, money, data) and the cities.
 *
 * Rests on its first word. Hover and the drum whips a full turn and slows onto the next word, then loops on its
 * own, one word every 1.2s, for as long as you stay. Leave and it whips round again, at least a full turn, back to
 * the resting word. With `restOnly`, the resting word shows only at rest and the loop skips it (the cities rest on
 * "six cities" and loop through the cities). It blurs with its speed (up to 3px), so the whips read as motion and
 * the loop stays sharp. Every turn starts from the drum's current angle and velocity, so leaving mid-spin carries
 * the momentum back. The slot is always as wide as the longest word, so nothing around it ever moves.
 * Each word crossing the front clicks with the trail's typing sound, like a split-flap board: the whip is a run
 * of clicks that slows as the drum settles, the loop one click per word. Same random pitch as the typing, at
 * most one click per 30ms, and silent when the visitor has turned the trail's sound off.
 * Touch: tap to start, tap again to stop. Reduced motion: no spin, the words crossfade in the same loop.
 */
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { play } from './sound'

const LOOP_EVERY = 1200 // ms per word in the loop: a 0.5s turn, then 0.7s at rest to read it
const SPIN = { type: 'spring' as const, bounce: 0, visualDuration: 0.9 } // fast start, slows into place
const TURN = { type: 'spring' as const, bounce: 0, visualDuration: 0.5 }

/* A full ring: the words repeat round the drum, at least 12 faces, so it can spin forever. RADIUS puts
   neighbouring words one line (28px, the paragraph's line height) apart where they cross the front:
   r = 14 / tan(step / 2). Three words: 12 faces, 30°, 52px. Seven: 14 faces, ~26°, 61px. */
function ring(count: number) {
  const faces = count * Math.ceil(12 / count)
  const step = 360 / faces
  return { faces, step, radius: 14 / Math.tan(((step / 2) * Math.PI) / 180) }
}

export function SpinWord({
  words,
  label,
  restOnly = false,
  driven,
}: {
  words: readonly string[]
  label: string
  restOnly?: boolean
  /** when set, something outside drives it (a card hovered as a whole): true spins and loops, false spins back */
  driven?: boolean
}) {
  const { faces: FACES, step: STEP, radius: RADIUS } = useMemo(() => ring(words.length), [words.length])
  const isRest = (angle: number) => (((Math.round(angle / STEP) % FACES) + FACES) % FACES) % words.length === 0

  const reduced = !!useReducedMotion()
  const rot = useMotionValue(0) // degrees turned; the face at angle a is in front when rot ≡ a
  const [on, setOn] = useState(false)
  const active = useRef(false) // read synchronously by the loop, unlike state
  const timer = useRef(0)
  const anim = useRef<{ stop: () => void } | null>(null)

  const go = (to: number, t: typeof SPIN) => {
    anim.current?.stop()
    if (reduced) rot.set(to)
    else anim.current = animate(rot, to, t)
  }
  const nearest = () => Math.round(rot.get() / STEP) * STEP
  // the loop: a turn, a rest, the next turn; each step schedules the next and checks it's still wanted
  const next = (from: number) => (restOnly && isRest(from + STEP) ? from + 2 * STEP : from + STEP)
  const tick = () => {
    if (!active.current) return
    go(next(nearest()), TURN)
    timer.current = window.setTimeout(tick, LOOP_EVERY)
  }
  const start = () => {
    active.current = true
    setOn(true)
    clearTimeout(timer.current)
    go(next(nearest() + 360), SPIN) // one full turn plus a step, onto the next word
    timer.current = window.setTimeout(tick, 900 + LOOP_EVERY - 500) // once the spin has landed and rested
  }
  const stop = () => {
    active.current = false
    setOn(false)
    clearTimeout(timer.current)
    const cycle = STEP * words.length // at least a full turn, onto the next resting face
    go(Math.ceil((rot.get() + 360) / cycle) * cycle, SPIN)
  }
  useEffect(() => () => (clearTimeout(timer.current), anim.current?.stop()), [])
  const onPointerEnter = useHoverZone(start, stop)
  const firstDrive = useRef(true)
  useEffect(() => {
    if (driven === undefined) return
    if (firstDrive.current) {
      firstDrive.current = false
      if (!driven) return // nothing to undo on mount
    }
    if (driven && !active.current) start()
    else if (!driven && active.current) stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driven])
  // a click each time a word crosses the front (rot passes a face's angle), like a split-flap board
  const lastFace = useRef(0)
  const lastClick = useRef(0)
  useMotionValueEvent(rot, 'change', (r) => {
    const face = Math.round(r / STEP)
    if (face === lastFace.current) return
    lastFace.current = face
    const now = performance.now()
    if (now - lastClick.current < 30 || !soundOn()) return
    lastClick.current = now
    play('key', { pitch: 0.92 + Math.random() * 0.16 })
  })

  // reduced motion swaps words by re-rendering which face is in front (no rotation to follow)
  const [, force] = useState(0)
  useMotionValueEvent(rot, 'change', () => reduced && force((n) => n + 1))

  const drum = useTransform(rot, (r) => `translateZ(${-RADIUS}px) rotateX(${-r}deg)`)
  const speed = useVelocity(rot) // degrees per second
  const blur = useTransform(speed, (v) => (reduced ? 'none' : `blur(${Math.min(3, Math.abs(v) / 500).toFixed(2)}px)`))

  return (
    <button
      type="button"
      aria-label={label}
      onPointerEnter={driven === undefined ? onPointerEnter : undefined}
      onClick={() => (on ? stop() : start())}
      className="relative inline-block cursor-pointer touch-manipulation select-none text-left text-ink outline-offset-2 focus-visible:rounded-mark focus-visible:outline-2 focus-visible:outline-ink after:pointer-events-none after:absolute after:inset-x-0 after:bottom-[3px] after:border-b after:border-dotted after:border-ink-muted"
    >
      {/* fixed width: every face sits in one grid cell, so the slot is always as wide as the longest word;
          it never resizes, and nothing around it moves */}
      <span aria-hidden="true" className="pointer-events-none inline-grid">
        {/* the fixed point of view: perspective here, the cylinder keeps its faces in 3D */}
        <motion.span className="inline-grid [perspective:320px]" style={{ filter: blur }}>
          <motion.span className="inline-grid [transform-style:preserve-3d]" style={{ transform: drum }}>
            {Array.from({ length: FACES }, (_, k) => (
              <Face key={k} word={words[k % words.length]} angle={k * STEP} radius={RADIUS} front={Math.round(rot.get() / STEP) % FACES === k} rot={rot} reduced={reduced} step={STEP} />
            ))}
          </motion.span>
        </motion.span>
      </span>
    </button>
  )
}

function Face({
  word,
  angle,
  radius,
  step,
  front,
  rot,
  reduced,
}: {
  word: string
  angle: number
  radius: number
  step: number
  front: boolean
  rot: MotionValue<number>
  reduced: boolean
}) {
  // how far this face is from the front, in steps, the short way round; opacity follows, so at rest only the
  // front word shows and the neighbours appear only while the drum turns
  const away = useTransform(rot, (r) => Math.abs(((((angle - r) % 360) + 540) % 360) - 180) / step)
  const opacity = useTransform(away, (a) => Math.max(0, 1 - a))
  return (
    <motion.span
      className="whitespace-nowrap [grid-area:1/1] [backface-visibility:hidden]"
      style={{
        transform: reduced ? 'none' : `rotateX(${angle}deg) translateZ(${radius}px)`,
        opacity: reduced ? (front ? 1 : 0) : opacity,
        transition: reduced ? 'opacity 200ms ease' : undefined,
      }}
    >
      {word}
    </motion.span>
  )
}

/* the trail's sound setting: on unless this visitor turned it off (index.tsx stores it under this key) */
function soundOn() {
  try {
    return window.localStorage.getItem('trail-sound') !== 'off'
  } catch {
    return true
  }
}

/**
 * Hover that survives layout changes. Hovering the word starts it; only real pointer movement ends it. The word
 * resizes and the sentence reflows, so it can slide out from under a still cursor; element boundary events
 * would read that as leaving and loop. Instead each pointer move checks whether the cursor is still within 8px
 * of where the word started or where it is now. Reflow and scroll never move the mouse, so they can't end it.
 */
function useHoverZone(onEnter: () => void, onLeave: () => void) {
  const active = useRef<(() => void) | null>(null)
  const cb = useRef({ onEnter, onLeave })
  cb.current = { onEnter, onLeave }
  useEffect(() => () => active.current?.(), [])
  return useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || active.current) return
    const word = e.currentTarget as HTMLElement
    let start = word.getBoundingClientRect()
    const near = (r: DOMRect, x: number, y: number) =>
      x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8
    const end = () => {
      active.current?.()
      active.current = null
      cb.current.onLeave()
    }
    const move = (ev: PointerEvent) => {
      if (ev.pointerType !== 'mouse') return
      if (!near(start, ev.clientX, ev.clientY) && !near(word.getBoundingClientRect(), ev.clientX, ev.clientY)) end()
    }
    let sx = scrollX
    let sy = scrollY
    const scrolled = () => {
      start = new DOMRect(start.x - (scrollX - sx), start.y - (scrollY - sy), start.width, start.height)
      sx = scrollX
      sy = scrollY
    }
    const root = document.documentElement // pointerleave on the root fires only when leaving the window
    addEventListener('pointermove', move)
    addEventListener('scroll', scrolled, { passive: true })
    root.addEventListener('pointerleave', end)
    active.current = () => {
      removeEventListener('pointermove', move)
      removeEventListener('scroll', scrolled)
      root.removeEventListener('pointerleave', end)
    }
    cb.current.onEnter()
  }, [])
}
