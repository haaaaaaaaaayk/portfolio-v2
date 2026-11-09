/**
 * Playground: small things Hayk builds to learn how things feel. Caleb Wu's biggest lesson is visible practice, so
 * every card is a working miniature of its piece, not a screenshot:
 *  - Fogged Glass: a pane of the Shinagawa fog you wipe with the cursor, which slowly fogs back up (the experiment
 *    itself, in miniature)
 *  - Spin: the real spinning word, started by hovering the card
 *  - The trail: teaches the hidden controls of the game above, and takes you back up ready to walk
 * Hover adds one thing per card: an arrow that slides in after the title (Caleb's 200ms slide), so it reads as a link.
 */
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { reveal } from '../../lib/motion'
import { SpinWord } from './SpinWord'
import './playground.css'

const base = import.meta.env.BASE_URL

export function Playground() {
  const reduced = useReducedMotion()
  const inView = reduced
    ? {}
    : { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: reveal }

  return (
    <section id="playground" className="mx-auto w-full max-w-4xl px-6 py-section sm:px-8 sm:py-32">
      <motion.div {...inView}>
        {/* Caleb's section opening: a small label, then one sentence that says what this is */}
        <p className="text-compact text-ink-muted">Playground</p>
        <h2 className="mt-2 text-balance text-heading text-ink sm:text-title">Small things I build to learn how things feel.</h2>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2">
          <PlayCard
            className="sm:col-span-2"
            href={`${base}foggy_shinagawa/`}
            title="Fogged Glass"
            meta="Interaction · 2026"
            line="Write on the fogged-up windows of Shinagawa. Wipe this one with your cursor."
            media={() => <FogPane src={`${base}foggy_shinagawa/scenes/gate.jpg`} />}
            ratio="aspect-[16/9] sm:aspect-[16/7]"
          />
          <PlayCard
            href="https://github.com/haaaaaaaaaayk/something-word"
            external
            title="Spin"
            meta="Animation · 2026"
            line="A word that turns into what a product really asks for. Sixteen versions, one kept."
            media={(hover) => (
              <p className="pointer-events-none px-6 text-center text-body text-ink-muted">
                A product asks people for{' '}
                <span className="whitespace-nowrap">
                  <SpinWord words={['attention', 'money', 'data']} label="money, data, attention" driven={hover} />.
                </span>
              </p>
            )}
          />
          <PlayCard
            href="#top"
            title="The trail"
            meta="Game · 2026"
            line="The hike up top is playable. Hold the up arrow to walk him to the top."
            arrow="↑"
            onActivate={() => {
              /* back up to the scene, with the canvas focused so the arrow keys work straight away */
              const cv = document.querySelector<HTMLCanvasElement>('canvas[role="application"]')
              window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
              cv?.focus({ preventScroll: true })
            }}
            media={(hover) => <TrailKey active={hover} />}
          />
        </div>
      </motion.div>
    </section>
  )
}

function PlayCard({
  href,
  external,
  title,
  meta,
  line,
  media,
  ratio = 'aspect-[4/3]',
  arrow = '↗',
  className = '',
  onActivate,
}: {
  href: string
  external?: boolean
  title: string
  meta: string
  line: string
  media: (hover: boolean) => ReactNode
  ratio?: string
  arrow?: string
  className?: string
  onActivate?: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(e) => {
        if (onActivate) {
          e.preventDefault()
          onActivate()
        }
      }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`group block rounded-card outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink ${className}`}
    >
      <div className={`relative grid place-items-center overflow-hidden rounded-media bg-surface ring-1 ring-rule-soft ${ratio}`}>
        {media(hover)}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <span className="flex items-baseline gap-2 text-body text-ink">
          {title}
          {/* the arrow slides in from the left on hover, like Caleb's tooltips (200ms) */}
          <span
            aria-hidden
            className="-translate-x-2 text-ink-muted opacity-0 transition-[opacity,translate] duration-200 ease-fast group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          >
            {arrow}
          </span>
        </span>
        <span className="shrink-0 text-compact text-ink-muted">{meta}</span>
      </div>
      <p className="mt-1 max-w-[52ch] text-compact text-ink-muted">{line}</p>
    </a>
  )
}

/* ---------- Fogged Glass, in miniature ---------- */

/** draw an image to fill w×h, cropped from the centre (CSS object-fit: cover) */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * s
  const dh = img.naturalHeight * s
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

/**
 * The photo, sharp, with a canvas of fog over it. Moving the cursor wipes the fog away with a soft round finger;
 * the fog re-condenses over about four seconds, then the loop stops. The blur is made by drawing the photo tiny and
 * scaling it back up, which works in every browser (canvas filters don't in Safari). Touch screens just open the
 * piece on tap, so scrolling past the card never paints it.
 */
function FogPane({ src }: { src: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)

  // load the photo only when the card is near
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        const i = new Image()
        i.decoding = 'async'
        i.onload = () => setImg(i)
        i.src = src
        io.disconnect()
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [src])

  useEffect(() => {
    const c = cv.current
    const w = wrap.current
    if (!img || !c || !w) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let fog: HTMLCanvasElement | null = null
    let raf = 0
    let lastInput = 0
    let last: { x: number; y: number } | null = null

    const build = () => {
      const r = w.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      c.width = Math.max(1, Math.round(r.width * dpr))
      c.height = Math.max(1, Math.round(r.height * dpr))
      const tiny = document.createElement('canvas')
      tiny.width = Math.max(8, Math.round(c.width / 18))
      tiny.height = Math.max(8, Math.round(c.height / 18))
      const t = tiny.getContext('2d')!
      drawCover(t, img, tiny.width, tiny.height)
      fog = document.createElement('canvas')
      fog.width = c.width
      fog.height = c.height
      const f = fog.getContext('2d')!
      f.imageSmoothingEnabled = true
      f.imageSmoothingQuality = 'high'
      f.drawImage(tiny, 0, 0, c.width, c.height)
      f.fillStyle = 'rgba(236, 239, 242, 0.42)' // the cold white of breath on glass
      f.fillRect(0, 0, c.width, c.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.drawImage(fog, 0, 0)
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(w)

    // re-condense: lay the fog back down a little each frame, for a few seconds after the last wipe
    const loop = () => {
      raf = 0
      if (!fog) return
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 0.014
      ctx.drawImage(fog, 0, 0)
      ctx.globalAlpha = 1
      if (performance.now() - lastInput < 6000) raf = requestAnimationFrame(loop)
    }
    const stamp = (x: number, y: number, R: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, R)
      g.addColorStop(0, 'rgba(0,0,0,0.85)')
      g.addColorStop(0.55, 'rgba(0,0,0,0.45)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, R, 0, Math.PI * 2)
      ctx.fill()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = c.getBoundingClientRect()
      const k = c.width / r.width
      const p = { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k }
      const R = 22 * k
      ctx.globalCompositeOperation = 'destination-out'
      if (last) {
        const n = Math.max(1, Math.ceil(Math.hypot(p.x - last.x, p.y - last.y) / (R * 0.3)))
        for (let i = 1; i <= n; i++) stamp(last.x + ((p.x - last.x) * i) / n, last.y + ((p.y - last.y) * i) / n, R)
      } else stamp(p.x, p.y, R)
      ctx.globalCompositeOperation = 'source-over'
      last = p
      lastInput = performance.now()
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onLeave = () => {
      last = null
    }
    c.addEventListener('pointermove', onMove)
    c.addEventListener('pointerleave', onLeave)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      c.removeEventListener('pointermove', onMove)
      c.removeEventListener('pointerleave', onLeave)
    }
  }, [img])

  // pressing and dragging is writing, as in the real piece: a press that travels more than 6px doesn't open the link
  const down = useRef<{ x: number; y: number } | null>(null)
  return (
    <div
      ref={wrap}
      className="absolute inset-0 bg-canvas"
      onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
      onClickCapture={(e) => {
        const d = down.current
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) {
          e.preventDefault()
          e.stopPropagation()
        }
        down.current = null
      }}
    >
      {img && <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {/* not draggable: pressing and moving over a link would otherwise start dragging the link */}
      <canvas ref={cv} aria-hidden draggable={false} onDragStart={(e) => e.preventDefault()} className="absolute inset-0 h-full w-full cursor-crosshair" />
    </div>
  )
}

/* ---------- the trail's hidden control ---------- */

const TRAIL = 'M44 62 C 20 52, 66 44, 42 34 S 30 14, 48 2'

/** An up-arrow key and a winding path. Hovering presses the key in a walking rhythm while the path draws upward. */
function TrailKey({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="88" height="64" viewBox="0 0 88 64" fill="none" aria-hidden>
        {/* the trail, faint and dotted; on hover a solid line walks up it */}
        <path d={TRAIL} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 6" className="text-rule" />
        <path d={TRAIL} stroke="currentColor" strokeWidth="2" strokeLinecap="round" pathLength={1} className="trail-path text-ink" data-active={active} />
      </svg>
      <span
        data-active={active}
        className="trail-key grid size-12 place-items-center rounded-media bg-surface text-heading text-ink shadow-[0_2px_0_rgb(0_0_0/12%),0_0_0_1px_rgb(0_0_0/8%)]"
      >
        ↑
      </span>
      <span className="text-compact text-ink-muted">hold to walk</span>
    </div>
  )
}
