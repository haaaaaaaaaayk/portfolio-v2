/**
 * The dot cursor's engine, with no React, so the site and the Cursor Tuner run the exact same code
 * (scripts/build-tuner.mjs bundles this file into tools/cursor-tuner.html).
 *
 * The config object is read live on every frame, so the tuner just mutates it and calls restyle().
 */
import type { CursorConfig } from './cursorConfig'

const INTERACTIVE = 'a, button, [role="button"], summary, label, select, [data-cursor="grow"]'
const STEP_ASIDE = 'input, textarea, select, [contenteditable], [data-cursor="own"], canvas[role="application"]'

type Mark = { x: number; y: number; d: number; born: number; ink: string }

export type CursorMount = {
  /** where pointer moves are heard; the dot shows only while the pointer is inside */
  scope: HTMLElement | Document
  /** the dot's element: an outer box that moves, holding one <span> that is drawn */
  dot: HTMLElement
  /** the trace canvas; it must cover `area` exactly */
  canvas: HTMLCanvasElement
  /** what the canvas covers; omit for the whole viewport */
  area?: HTMLElement
  /** what scrolls under the trace when it's anchored to the page; omit for the window */
  scroller?: HTMLElement
  /** true turns the trace off (reduced motion) */
  still?: () => boolean
}

export function createCursor(cfg: CursorConfig, m: CursorMount) {
  const ctx = m.canvas.getContext('2d')!
  const span = m.dot.firstElementChild as HTMLElement
  let marks: Mark[] = []
  let last: { x: number; y: number } | null = null
  let target: { x: number; y: number } | null = null
  let shown: { x: number; y: number } | null = null
  let raf = 0
  let dpr = 1
  let cycle = 0
  let w = 0
  let h = 0

  const scrollX = () => (m.scroller ? m.scroller.scrollLeft : window.scrollX)
  const scrollY = () => (m.scroller ? m.scroller.scrollTop : window.scrollY)
  const origin = () => (m.area ? m.area.getBoundingClientRect() : { left: 0, top: 0 })

  const size = () => {
    const r = m.area?.getBoundingClientRect()
    w = r ? r.width : window.innerWidth
    h = r ? r.height : window.innerHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    m.canvas.width = Math.round(w * dpr)
    m.canvas.height = Math.round(h * dpr)
    wake()
  }

  /** push the dot's look from the config onto its element */
  const restyle = () => {
    const d = cfg.dot
    span.style.cssText = `position:absolute;left:${-d.size / 2}px;top:${-d.size / 2}px;width:${d.size}px;height:${d.size}px;border-radius:${d.shape === 'circle' ? '9999px' : '0'};background:${d.color};transition:transform ${m.still?.() ? 0 : d.hoverMs}ms cubic-bezier(0.22,0.61,0.36,1),opacity 160ms cubic-bezier(0.22,0.61,0.36,1)`
    m.dot.style.setProperty('--grow', String(d.hoverSize / d.size))
    m.canvas.style.mixBlendMode = cfg.trace.blend
    wake()
  }

  const place = (p: { x: number; y: number }) => {
    m.dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
  }

  const draw = (now: number) => {
    raf = 0
    const t = cfg.trace
    const life = t.hold + (t.ending === 'cut' ? 0 : t.fade)
    marks = marks.filter((k) => now - k.born < life)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const sx = t.anchor === 'page' ? scrollX() : 0
    const sy = t.anchor === 'page' ? scrollY() : 0
    for (const k of marks) {
      const p = t.ending === 'cut' ? 0 : Math.max(0, now - k.born - t.hold) / Math.max(1, t.fade) // 0 holding → 1 gone
      const ease = 1 - p * p
      const alpha = t.ending === 'fade' || t.ending === 'fade-shrink' ? ease : 1
      const scale = t.ending === 'shrink' || t.ending === 'fade-shrink' ? t.shrinkTo + (1 - t.shrinkTo) * ease : 1
      const d = k.d * scale
      ctx.globalAlpha = alpha * t.opacity
      ctx.fillStyle = k.ink
      const x = k.x - sx
      const y = k.y - sy
      if (t.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(x, y, d / 2, 0, Math.PI * 2)
        ctx.fill()
      } else ctx.fillRect(x - d / 2, y - d / 2, d, d)
    }
    ctx.globalAlpha = 1

    let chasing = false
    if (target && shown) {
      const f = Math.min(1, Math.max(0.02, cfg.dot.follow))
      shown.x += (target.x - shown.x) * f
      shown.y += (target.y - shown.y) * f
      if (Math.hypot(target.x - shown.x, target.y - shown.y) < 0.1) shown = { ...target }
      else chasing = true
      place(shown)
    }
    if (marks.length || chasing) raf = requestAnimationFrame(draw)
  }
  function wake() {
    if (!raf) raf = requestAnimationFrame(draw)
  }

  const pick = () => {
    const c = cfg.trace.colors.length ? cfg.trace.colors : [cfg.dot.color]
    return cfg.trace.order === 'cycle' ? c[cycle++ % c.length] : c[Math.floor(Math.random() * c.length)]
  }
  const diameter = () => {
    const { minSize: lo, maxSize: hi, snap } = cfg.trace
    const d = lo + Math.random() * Math.max(0, hi - lo)
    return snap ? Math.max(4, Math.round(d / 4) * 4) : d
  }

  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const o = origin()
    const x = e.clientX - o.left
    const y = e.clientY - o.top
    target = { x, y }
    if (!shown || cfg.dot.follow >= 1) {
      shown = { x, y }
      place(shown)
    } else wake()

    const el = e.target instanceof Element ? e.target : null
    const aside = !!el?.closest(STEP_ASIDE)
    m.dot.dataset.state = aside ? 'aside' : el?.closest(INTERACTIVE) ? 'grow' : 'rest'
    span.style.opacity = aside ? '0' : '1'
    span.style.transform = aside ? 'scale(0.5)' : m.dot.dataset.state === 'grow' ? 'scale(var(--grow))' : 'scale(1)'

    if (aside || !cfg.trace.on || m.still?.()) {
      last = null
      return
    }
    const px = x + (cfg.trace.anchor === 'page' ? scrollX() : 0)
    const py = y + (cfg.trace.anchor === 'page' ? scrollY() : 0)
    if (last && Math.hypot(px - last.x, py - last.y) < cfg.trace.step) return
    last = { x: px, y: py }
    marks.push({ x: px, y: py, d: diameter(), born: performance.now(), ink: pick() })
    wake()
  }
  const leave = () => {
    m.dot.dataset.state = 'gone'
    span.style.opacity = '0'
    span.style.transform = 'scale(0.5)'
    last = null
    shown = null
  }
  const scroll = () => {
    if (marks.length) wake()
  }

  const leaveTarget: EventTarget = m.scope instanceof Document ? m.scope.documentElement : m.scope
  const scrollTarget: EventTarget = m.scroller ?? window
  m.scope.addEventListener('pointermove', move as EventListener, { passive: true })
  m.scope.addEventListener('pointerdown', move as EventListener, { passive: true })
  leaveTarget.addEventListener('pointerleave', leave)
  window.addEventListener('blur', leave)
  scrollTarget.addEventListener('scroll', scroll, { passive: true })
  window.addEventListener('resize', size)
  const ro = m.area ? new ResizeObserver(size) : null
  if (m.area) ro!.observe(m.area)
  size()
  restyle()
  leave()

  return {
    restyle,
    clear: () => {
      marks = []
      wake()
    },
    destroy: () => {
      cancelAnimationFrame(raf)
      m.scope.removeEventListener('pointermove', move as EventListener)
      m.scope.removeEventListener('pointerdown', move as EventListener)
      leaveTarget.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
      scrollTarget.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', size)
      ro?.disconnect()
    },
  }
}
