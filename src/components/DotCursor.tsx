/**
 * The cursor is the signature mark: the accent dot from the tab icon. As it moves it leaves a trace of smaller
 * dots that wait a moment and then let go, the way a pen leaves dots on paper.
 *
 * Choices behind it:
 * - The dot follows the pointer 1:1 with no easing. A cursor that lags feels broken, so the trace is where the
 *   motion lives.
 * - Trace dots go onto the page, not the screen. When you scroll they move with the content, like ink would.
 * - Their spacing is left uneven on purpose. A dot drops on each move once you've gone 4px, so slow moves leave a
 *   dense line and fast flicks leave a scatter, and the trace shows how you moved.
 * - The trace is painted in the hiking scene's hill colours, so the cursor carries the valley down the page.
 *   Each hill is three tones; the trace takes the shade and the middle tone and drops the pale highlight,
 *   which would vanish on the paper. The dot itself stays the accent: it's the signature, the trace is the
 *   landscape it walked through. `?cursor=accent` brings back the all-turquoise trace for comparison.
 * - With the hand cursor gone, the dot takes over its job: over anything you can click it grows from 12 to
 *   16px. That's enough to notice, and small enough not to cover what you're pointing at.
 * - Text fields keep the system I-beam, because placing a caret needs it, and the dot steps aside there.
 *   The hiking scene has its own ring cursor, so the dot steps aside there too.
 * - The cursor only appears with a mouse or trackpad (fine pointer + hover); touch screens get nothing.
 *   Under reduced motion the dot stays, since it's the cursor, but the trace is off.
 */
import { useEffect, useRef } from 'react'
import { SETS } from '../variants/v11-trail/palette'

const ACCENT = '#1aedc5'
const HILLS = [...new Set(SETS.flatMap(([shade, mid]) => [shade, mid]))]
const INKS =
  new URLSearchParams(window.location.search).get('cursor') === 'accent' ? [ACCENT] : HILLS
const HOLD = 1000 // ms a trace dot sits still at full strength
const FADE = 320 // ms it then takes to shrink and fade away
const STEP = 4 // px of travel before another dot drops
const INTERACTIVE = 'a, button, [role="button"], summary, label, select, [data-cursor="grow"]'
const STEP_ASIDE = 'input, textarea, [contenteditable], [data-cursor="own"], canvas[role="application"]'

type Mark = { x: number; y: number; r: number; born: number; ink: string }

export function DotCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const trace = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || !dot.current || !trace.current) return
    const el = dot.current
    const cv = trace.current
    const ctx = cv.getContext('2d')!
    const root = document.documentElement
    root.classList.add('dot-cursor')

    let marks: Mark[] = []
    let last: { x: number; y: number } | null = null
    let raf = 0
    let dpr = 1

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.round(window.innerWidth * dpr)
      cv.height = Math.round(window.innerHeight * dpr)
    }
    size()

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      marks = marks.filter((m) => now - m.born < HOLD + FADE)
      for (const m of marks) {
        ctx.fillStyle = m.ink
        const t = Math.max(0, now - m.born - HOLD) / FADE // 0 while holding, then 0→1
        const k = 1 - t * t // eases out slowly at first, then lets go
        ctx.globalAlpha = k
        ctx.beginPath()
        ctx.arc(m.x - window.scrollX, m.y - window.scrollY, m.r * (0.4 + 0.6 * k), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = marks.length ? requestAnimationFrame(draw) : 0
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      const target = e.target instanceof Element ? e.target : null
      const aside = !!target?.closest(STEP_ASIDE)
      el.dataset.state = aside ? 'aside' : target?.closest(INTERACTIVE) ? 'grow' : 'rest'
      if (aside || still.matches) {
        last = null
        return
      }
      const x = e.clientX + window.scrollX
      const y = e.clientY + window.scrollY
      if (last && Math.hypot(x - last.x, y - last.y) < STEP) return
      last = { x, y }
      marks.push({ x, y, r: 2 + Math.random() * 2, born: performance.now(), ink: INKS[Math.floor(Math.random() * INKS.length)] }) // 4–8px across
      wake()
    }
    const leave = () => {
      el.dataset.state = 'gone'
      last = null
    }
    const scroll = () => {
      if (marks.length) wake()
    }

    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerdown', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', size)
    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('dot-cursor')
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerdown', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', size)
    }
  }, [])

  return (
    <>
      <canvas ref={trace} aria-hidden className="pointer-events-none fixed inset-0 z-[9998] h-full w-full" />
      <div ref={dot} aria-hidden data-state="gone" className="dot-cursor-mark">
        <span />
      </div>
    </>
  )
}
