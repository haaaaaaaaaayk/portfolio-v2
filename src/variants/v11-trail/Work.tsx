/**
 * Work: a wall of live pieces, after pdepablo.com. For now three: Fogged Glass leads, big, as a loop recorded from the
 * piece; Spin a word and Halftone Specimen stack beside it as squares. Every column ends level. The eight-placeholder
 * wall (squares, landscapes, portraits) is saved at git tag `wall-placeholders`.
 *
 * Exact grid, all multiples of 4, inside the page's 912px boundary:
 *  - container 912px max, 32px side padding → 848px content = 3 columns × 272 + 2 gaps × 16
 *  - Fogged Glass 560×560 over two columns; beside it two 272×272 squares + a 16 gap = 560
 *  - 2 columns from 640px (Fogged Glass full width at 16:9, then the two squares), 1 column on phones
 *
 * Hover or keyboard focus, as on pdepablo.com:
 *  - the image eases to 1.02 (600ms, ease-reading, which is the ease-fast curve)
 *  - the name and a one-line description sit bottom left, always shown (see Caption), so the hover is just the zoom
 *
 * In development, press G to see the columns.
 */
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { reveal } from '../../lib/motion'
import { SpinWord } from './SpinWord'

type Shape = 'square' | 'landscape' | 'portrait'
const SHAPE: Record<Shape, { ratio: string; label: string; asset: string }> = {
  square: { ratio: 'aspect-square', label: 'Square', asset: '544 × 544' },
  landscape: { ratio: 'aspect-[272/180]', label: 'Landscape', asset: '544 × 360' },
  portrait: { ratio: 'aspect-[272/364]', label: 'Portrait', asset: '544 × 728' },
}

/* A live piece shows as a 10-second loop made from the piece itself; `big` is the lead tile, whose shape follows the columns. */
type Loop = { kind: 'loop'; id: string; name: string; line: string; label: string; path: string; media: string; shape: Shape | 'big' }
type Tile = Loop | { kind: 'spin'; id: 'spin' }
const FOG: Tile = {
  kind: 'loop', id: 'fog', name: 'Foggy Shinagawa', line: 'Write on a fogged-up window in Tokyo.',
  label: 'Foggy Shinagawa: write on a fogged-up window in Tokyo',
  path: 'foggy_shinagawa/', media: 'work/fogged-glass', shape: 'big',
}
const SPIN: Tile = { kind: 'spin', id: 'spin' }
const HALFTONE: Tile = {
  kind: 'loop', id: 'halftone', name: 'Halftone Specimen', line: 'Turn any image into analog print.',
  label: 'Halftone Specimen: turn any image into analog print',
  path: 'halftone/', media: 'work/halftone', shape: 'square',
}

/* Three live pieces for now. The full wall with eight placeholder tiles is saved at git tag `wall-placeholders`.
   3 columns: [Fogged Glass 560×560 over two columns | Spin 272 + Halftone 272 + gap 16 = 560], level
   2 columns: Fogged Glass full width at 16:9, then Spin and Halftone side by side
   1 column:  all three stacked */
type Column = { span?: 2; tiles: Tile[] }
const LAYOUT: Record<1 | 2 | 3, Column[][]> = {
  3: [[{ span: 2, tiles: [FOG] }, { tiles: [SPIN, HALFTONE] }]],
  2: [[{ span: 2, tiles: [FOG] }], [{ tiles: [SPIN] }, { tiles: [HALFTONE] }]],
  1: [[{ tiles: [FOG, SPIN, HALFTONE] }]],
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
                    <li key={t.id}>
                      {t.kind === 'loop' ? <LoopTile {...t} cols={cols} /> : <SpinTile />}
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

/**
 * A live piece as a seamless 10-second loop made from the piece itself:
 *  - Fogged Glass (big): its own Scribble drawing on the Shinagawa fog, dissolving back to clean glass.
 *    560×560 on desktop, 16:9 across two columns on tablets.
 *  - Halftone Specimen (square, cropped from its 3:4 loop): ten effects on the Golden Gate, each printing over the last (scripts/record-halftone).
 * It loads late and plays only while on screen, pausing when scrolled away; with reduced motion it stays on its poster
 * frame. Same hover as every tile: the video eases to 1.02.
 */
function LoopTile({ name, line, label, path, media, shape, cols }: Loop & { cols: 1 | 2 | 3 }) {
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
      href={`${base}${path}`}
      aria-label={label}
      className={`group relative block overflow-hidden rounded-card bg-canvas outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink ${shape === 'big' ? (cols === 2 ? 'aspect-video' : 'aspect-square') : SHAPE[shape].ratio}`}
    >
      <video
        ref={video}
        data-src={`${base}${media}.mp4`}
        poster={`${base}${media}.jpg`}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-reading group-hover:scale-[1.02] group-focus-visible:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <Caption name={name} line={line} onVideo />
    </a>
  )
}

/**
 * Spin a word (hayko.me/spin): the tile is the piece itself, not a recording. The site's own spinning word, at
 * twice the paragraph size, loops through "hello" in five languages while the tile is on screen (silent: it runs
 * on its own, so it doesn't click). Hover zooms it a touch, like every tile.
 */
const HELLOS = ['hello', 'բարև', 'hola', 'こんにちは', 'bonjour'] as const
function SpinTile() {
  const ref = useRef<HTMLAnchorElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const a = ref.current
    if (!a) return
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.4 })
    io.observe(a)
    return () => io.disconnect()
  }, [])
  const base = import.meta.env.BASE_URL
  return (
    <a
      ref={ref}
      href={`${base}spin/`}
      aria-label="Spin a word: nineteen ways to animate your word"
      className={`group relative grid place-items-center overflow-hidden rounded-card bg-canvas pb-16 outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink ${SHAPE.square.ratio}`}
    >
      <span aria-hidden className="scale-200 text-body text-ink transition-transform duration-[600ms] ease-reading group-hover:scale-[2.04] motion-reduce:transition-none">
        <SpinWord words={HELLOS} label="hello in five languages" driven={seen} silent />
      </span>
      <Caption name="Spin a word" line="19 ways to animate your word." />
    </a>
  )
}

/**
 * The tile's name and one line on what you can do there, bottom left and always shown, so people know what they're
 * clicking into before they hover. On video the type is white over a soft dark fade: the fade has a job, keeping
 * the words readable over any frame (Halftone's Toner shot is nearly white). On a light tile it's ink, no fade.
 */
function Caption({ name, line, onVideo = false }: { name: string; line: string; onVideo?: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col px-4 pb-4 pt-12 text-compact ${
        onVideo ? 'bg-linear-to-t from-[rgb(0_0_0/56%)] to-transparent text-white' : 'text-ink'
      }`}
    >
      <span>{name}</span>
      <span className={onVideo ? 'text-[rgb(255_255_255/76%)]' : 'text-ink-muted'}>{line}</span>
    </span>
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
