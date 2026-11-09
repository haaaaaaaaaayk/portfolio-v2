/**
 * Work: a wall of case-study tiles, after pdepablo.com. Mixed shapes (square, landscape, portrait) interlock in
 * columns, and every column ends level so the wall has a clean bottom edge.
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
import { useEffect, useState } from 'react'
import { reveal } from '../../lib/motion'
import './work.css'

type Shape = 'square' | 'landscape' | 'portrait'
const SHAPE: Record<Shape, { ratio: string; label: string; asset: string }> = {
  square: { ratio: 'aspect-square', label: 'Square', asset: '544 × 544' },
  landscape: { ratio: 'aspect-[272/180]', label: 'Landscape', asset: '544 × 360' },
  portrait: { ratio: 'aspect-[272/364]', label: 'Portrait', asset: '544 × 728' },
}

type Tile = { id: string; title: string; shape: Shape; href: string }
const tile = (n: number, shape: Shape): Tile => ({ id: `p${n}`, title: `Project ${String(n).padStart(2, '0')}`, shape, href: '#work' })

/* placeholders until the real case studies exist, laid out per column count so every column ends level */
const LAYOUT: Record<1 | 2 | 3, Tile[][]> = {
  3: [
    [tile(1, 'square'), tile(4, 'square')],
    [tile(2, 'landscape'), tile(5, 'portrait')],
    [tile(3, 'portrait'), tile(6, 'landscape')],
  ],
  2: [
    [tile(1, 'square'), tile(2, 'landscape'), tile(3, 'portrait')],
    [tile(4, 'square'), tile(5, 'portrait'), tile(6, 'landscape')],
  ],
  1: [[tile(1, 'square'), tile(2, 'landscape'), tile(3, 'portrait'), tile(4, 'square'), tile(5, 'portrait'), tile(6, 'landscape')]],
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

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {LAYOUT[cols].map((column, c) => (
            <ul key={c} className="flex flex-col gap-4">
              {column.map((t) => (
                <li key={t.id}>
                  <WorkTile {...t} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </motion.div>
      {import.meta.env.DEV && <GridOverlay />}
    </section>
  )
}

function WorkTile({ title, shape, href }: Tile) {
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
