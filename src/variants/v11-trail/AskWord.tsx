/**
 * The word in "a product asks people for ___": a drum of three asks seen head-on. Ported from D4 · Spin in
 * github.com/haaaaaaaaaayk/something-word, where the five-version exploration lives.
 *
 * Rests on "attention". Hover and the drum whips a full turn and slows onto "money", then loops on its own, one
 * word every 1.2s, for as long as you stay. Leave and it whips round again, at least a full turn, back to
 * "attention". It blurs with its speed (up to 3px), so the whips read as motion and the loop stays sharp. Every
 * turn starts from the drum's current angle and velocity, so leaving mid-spin carries the momentum back.
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
import { useCallback, useEffect, useRef, useState } from 'react'

const WORDS = ['attention', 'money', 'data'] as const

/* A full ring: 12 faces 30° apart, each word four times, so the drum can spin forever. RADIUS puts neighbouring
   words one line (28px, the paragraph's line height) apart where they cross the front: r = 14 / tan(15°). */
const STEP = 30
const FACES = 360 / STEP
const RADIUS = 14 / Math.tan(((STEP / 2) * Math.PI) / 180) // ≈ 52px
const LOOP_EVERY = 1200 // ms per word in the loop: a 0.5s turn, then 0.7s at rest to read it
const SPIN = { type: 'spring' as const, bounce: 0, visualDuration: 0.9 } // fast start, slows into place
const TURN = { type: 'spring' as const, bounce: 0, visualDuration: 0.5 }

export function AskWord() {
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
  const tick = () => {
    if (!active.current) return
    go(nearest() + STEP, TURN)
    timer.current = window.setTimeout(tick, LOOP_EVERY)
  }
  const start = () => {
    active.current = true
    setOn(true)
    clearTimeout(timer.current)
    go(nearest() + 360 + STEP, SPIN) // one full turn plus a step, onto the next word
    timer.current = window.setTimeout(tick, 900 + LOOP_EVERY - 500) // once the spin has landed and rested
  }
  const stop = () => {
    active.current = false
    setOn(false)
    clearTimeout(timer.current)
    const cycle = STEP * WORDS.length // at least a full turn, onto the next "attention" face
    go(Math.ceil((rot.get() + 360) / cycle) * cycle, SPIN)
  }
  useEffect(() => () => (clearTimeout(timer.current), anim.current?.stop()), [])
  const onPointerEnter = useHoverZone(start, stop)

  const drum = useTransform(rot, (r) => `translateZ(${-RADIUS}px) rotateX(${-r}deg)`)
  const speed = useVelocity(rot) // degrees per second
  const blur = useTransform(speed, (v) => (reduced ? 'none' : `blur(${Math.min(3, Math.abs(v) / 500).toFixed(2)}px)`))

  return (
    <button
      type="button"
      aria-label="money, data, attention"
      onPointerEnter={onPointerEnter}
      onClick={() => (on ? stop() : start())}
      className="relative inline-block cursor-pointer touch-manipulation select-none text-left text-ink outline-offset-2 focus-visible:rounded-mark focus-visible:outline-2 focus-visible:outline-ink after:pointer-events-none after:absolute after:inset-x-0 after:bottom-[3px] after:border-b after:border-dotted after:border-ink-muted"
    >
      {/* fixed width: every face sits in one grid cell, so the slot is always as wide as "attention", the
          longest word; it never resizes, and nothing around it moves */}
      <span aria-hidden="true" className="pointer-events-none inline-grid">
        {/* the fixed point of view: perspective here, the cylinder keeps its faces in 3D */}
        <motion.span className="inline-grid [perspective:320px]" style={{ filter: blur }}>
          <motion.span className="inline-grid [transform-style:preserve-3d]" style={{ transform: drum }}>
            {Array.from({ length: FACES }, (_, k) => (
              <Face key={k} k={k} rot={rot} reduced={reduced} />
            ))}
          </motion.span>
        </motion.span>
      </span>
    </button>
  )
}

function Face({ k, rot, reduced }: { k: number; rot: MotionValue<number>; reduced: boolean }) {
  const angle = k * STEP
  // how far this face is from the front, in steps, the short way round; opacity follows, so at rest only the
  // front word shows and the neighbours appear only while the drum turns
  const away = useTransform(rot, (r) => Math.abs(((((angle - r) % 360) + 540) % 360) - 180) / STEP)
  const opacity = useTransform(away, (a) => Math.max(0, 1 - a))
  const [, force] = useState(0)
  useMotionValueEvent(rot, 'change', () => reduced && force((n) => n + 1))
  return (
    <motion.span
      className="whitespace-nowrap [grid-area:1/1] [backface-visibility:hidden]"
      style={{
        transform: reduced ? 'none' : `rotateX(${angle}deg) translateZ(${RADIUS}px)`,
        opacity: reduced ? (Math.round(rot.get() / STEP) % FACES === k ? 1 : 0) : opacity,
        transition: reduced ? 'opacity 200ms ease' : undefined,
      }}
    >
      {WORDS[k % WORDS.length]}
    </motion.span>
  )
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
