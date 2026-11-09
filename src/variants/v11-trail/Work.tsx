/**
 * Work: a wall of case-study tiles, after pdepablo.com. Fogged Glass leads, big, as a loop recorded from the piece; the rest are mixed shapes
 * (square, landscape, portrait) that interlock in columns, and every column ends level so each band has a clean edge.
 *
 * Exact grid, all multiples of 4, inside the page's 912px boundary:
 *  - container 912px max, 32px side padding → 848px content = 3 columns × 272 + 2 gaps × 16
 *  - tiles: square 272×272, landscape 272×180 (≈3:2), portrait 272×364 (≈3:4)
 *  - columns: [square, square] · [landscape, portrait] · [portrait, landscape], each 560px tall
 *  - because landscape + portrait = 2 squares in height (180 + 364 = 544 = 2 × 272), the columns stay level at any
 *    width, not just the widest
 *  - 2 columns from 640px (each column holds one of each shape, so they also end level), 1 column on phones
 *
 * Hover or keyboard focus, as on pdepablo.com:
 *  - the image eases to 1.02 (600ms, ease-reading, which is his curve)
 *  - a dark glass pill with the project's name pops in at the tile's centre (fade 200ms, settle from 0.97 and 6px
 *    lower over 350ms). The blur keeps the name readable over any image.
 * Touch screens can't hover, so there the pill is always shown.
 *
 * Placeholders show the exact asset size to export for each slot. In development, press G to see the columns.
 */
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { reveal } from '../../lib/motion'
import './work.css'

type Shape = 'square' | 'landscape' | 'portrait'
const SHAPE: Record<Shape, { ratio: string; label: string; asset: string }> = {
  square: { ratio: 'aspect-square', label: 'Square', asset: '544 × 544' },
  landscape: { ratio: 'aspect-[272/180]', label: 'Landscape', asset: '544 × 360' },
  portrait: { ratio: 'aspect-[272/364]', label: 'Portrait', asset: '544 × 728' },
}

type Tile = { kind: 'placeholder'; id: string; title: string; shape: Shape; href: string } | { kind: 'fog' }
const tile = (n: number, shape: Shape): Tile => ({ kind: 'placeholder', id: `p${n}`, title: `Project ${String(n).padStart(2, '0')}`, shape, href: '#work' })
const FOG: Tile = { kind: 'fog' }

/* A band is a row of columns; a column can span two. Every column in a band ends level:
   3 columns: [Fogged Glass 560×560 over two columns | portrait 364 + landscape 180 = 560]
              [square + square | landscape + portrait | portrait + landscape], each 560
   2 columns: [Fogged Glass full width, 16:9] then [P L P L | S S P L], each 4 widths + 3 gaps
   1 column:  Fogged Glass first, then the rest */
type Column = { span?: 2; tiles: Tile[] }
const LAYOUT: Record<1 | 2 | 3, Column[][]> = {
  3: [
    [{ span: 2, tiles: [FOG] }, { tiles: [tile(1, 'portrait'), tile(2, 'landscape')] }],
    [{ tiles: [tile(3, 'square'), tile(4, 'square')] }, { tiles: [tile(5, 'landscape'), tile(6, 'portrait')] }, { tiles: [tile(7, 'portrait'), tile(8, 'landscape')] }],
  ],
  2: [
    [{ span: 2, tiles: [FOG] }],
    [{ tiles: [tile(1, 'portrait'), tile(2, 'landscape'), tile(6, 'portrait'), tile(5, 'landscape')] }, { tiles: [tile(3, 'square'), tile(4, 'square'), tile(7, 'portrait'), tile(8, 'landscape')] }],
  ],
  1: [[{ tiles: [FOG, tile(1, 'portrait'), tile(2, 'landscape'), tile(3, 'square'), tile(4, 'square'), tile(5, 'landscape'), tile(6, 'portrait'), tile(7, 'portrait'), tile(8, 'landscape')] }]],
}

function useColumns(): 1 | 2 | 3 {
  const get = () => (matchMedia('(min-width: 1024px)').matches ? 3 : matchMedia('(min-width: 640px)').matches ? 2 : 1)
  const [n, setN] = useState<1 | 2 | 3>(get)
  useEffect(() => {
    const on = () => setN(get())
    const qs = [matchMedia('(min-width: 1024px)'), matchMedia('(min-width: 640px)')]
    qs.forEach((q) => q.addEventListener('change', on))
    return () => qs.forEach((q) => q.removeEventListener('change', on))
  }, [])
  return n
}

export function Work() {
  const reduced = useReducedMotion()
  const cols = useColumns()
  const inView = reduced
    ? {}
    : { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: reveal }

  return (
    <section id="work" className="relative mx-auto w-full max-w-[912px] px-6 py-section sm:px-8 sm:py-32">
      <motion.div {...inView}>
        <p className="text-compact text-ink-muted">Work</p>
        <h2 className="mt-2 text-balance text-body text-ink sm:text-heading">Selected case studies.</h2>

        <div className="mt-8 flex flex-col gap-4 sm:mt-10">
          {LAYOUT[cols].map((band, b) => (
            <div key={b} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {band.map((column, c) => (
                <ul key={c} className={`flex flex-col gap-4 ${column.span === 2 ? 'sm:col-span-2' : ''}`}>
                  {column.tiles.map((t) => (
                    <li key={t.kind === 'fog' ? 'fog' : t.id}>
                      {t.kind === 'fog' ? <FogTile cols={cols} /> : <WorkTile {...t} />}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
      {import.meta.env.DEV && <GridOverlay />}
    </section>
  )
}

function WorkTile({ title, shape, href }: Extract<Tile, { kind: 'placeholder' }>) {
  const s = SHAPE[shape]
  return (
    <a
      href={href}
      aria-label={title}
      className={`group relative block overflow-hidden rounded-card outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink ${s.ratio}`}
    >
      {/* the image (a placeholder for now): eases a little closer on hover */}
      <div className="absolute inset-0 bg-canvas transition-transform duration-[600ms] ease-reading group-hover:scale-[1.02] group-focus-visible:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
        <span className="absolute bottom-4 left-4 text-compact text-ink-muted tabular-nums">
          {s.label} · {s.asset} @2x
        </span>
      </div>
      {/* the name: a dark glass pill that pops in at the centre on hover; always shown where there's no hover */}
      <span className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="work-pill inline-flex h-9 items-center rounded-full bg-[rgb(20_20_20/72%)] px-4 text-secondary text-white backdrop-blur-xl backdrop-saturate-150">
          {title}
        </span>
      </span>
    </a>
  )
}

/**
 * The big one: Fogged Glass, as a 10-second loop recorded from the real piece (its own Scribble drawing on the
 * Shinagawa fog, dissolving back to clean glass so the loop has no seam). It loads late and plays only while on
 * screen, pausing when scrolled away (Caleb's pattern); with reduced motion it stays on its poster frame. Same hover
 * as every tile: the video eases to 1.02 and the name pill pops in at the centre. 560×560 on desktop, 16:9 across two
 * columns on tablets.
 */
function FogTile({ cols }: { cols: 1 | 2 | 3 }) {
  const video = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const v = video.current
    if (!v || reduced) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) v.src = v.dataset.src!
          v.play().catch(() => {})
        } else v.pause()
      },
      { rootMargin: '200px 0px', threshold: 0.2 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])
  const base = import.meta.env.BASE_URL
  return (
    <a
      href={`${base}foggy_shinagawa/`}
      aria-label="Fogged Glass: write on the fogged-up windows of Shinagawa"
      className={`group relative block overflow-hidden rounded-card bg-canvas outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink ${cols === 2 ? 'aspect-video' : 'aspect-square'}`}
    >
      <video
        ref={video}
        data-src={`${base}work/fogged-glass.mp4`}
        poster={`${base}work/fogged-glass.jpg`}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-reading group-hover:scale-[1.02] group-focus-visible:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="work-pill inline-flex h-9 items-center rounded-full bg-[rgb(20_20_20/72%)] px-4 text-secondary text-white backdrop-blur-xl backdrop-saturate-150">
          Fogged Glass
        </span>
      </span>
    </a>
  )
}

/** Development only: press G to see the columns the tiles sit on. */
function GridOverlay() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'g' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement
      if (t.isContentEditable || /input|textarea|select/i.test(t.tagName)) return
      setOn((v) => !v)
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [])
  if (!on) return null
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 mx-auto w-full max-w-[912px] px-6 sm:px-8">
      <div className="grid h-full grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-full bg-[rgb(255_0_80/6%)] outline outline-1 outline-[rgb(255_0_80/30%)] ${i > 0 ? 'hidden sm:block' : ''} ${i > 1 ? 'sm:hidden lg:block' : ''}`} />
        ))}
      </div>
    </div>
  )
}
