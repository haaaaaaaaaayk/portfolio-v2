/**
 * Work: a strict grid of case-study placeholders, ready for real projects.
 *
 * Grid (everything on the 4px grid):
 *  - container 912px max, side padding 24px → 32px from sm: an 848px content width, so three columns are exactly
 *    272px (3 × 272 + 2 × 16 = 848) and each 4:3 image is exactly 272 × 204, all multiples of 4
 *  - columns: 1 → 2 (sm, 640px) → 3 (lg, 1024px)
 *  - gaps: 16px between columns, 32px between rows; inside a card the caption sits 12px under the image, so
 *    inner spacing is always smaller than outer spacing
 *  - card: a 4:3 image box with a 12px radius and nothing else, then a 16px title and a 14px meta line
 *
 * Hover (mouse) or keyboard focus says "this opens", without changing what you're pointing at:
 *  - the image eases a little closer inside its frame (scale 1.04, 700ms in on Caleb's curve, 300ms back)
 *  - the meta line rolls up from "Case study · 2026" to "View case study ↗" (the slot roll, as in the section pill)
 *
 * In development only, press G to overlay the columns and check alignment.
 */
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { reveal } from '../../lib/motion'
import { RollingLabel } from './RollingLabel'

/* placeholders until the real case studies exist */
const ITEMS = Array.from({ length: 6 }, (_, i) => ({
  id: `project-${i + 1}`,
  title: `Project ${String(i + 1).padStart(2, '0')}`,
  meta: 'Case study · 2026',
  href: '#work',
}))

export function Work() {
  const reduced = useReducedMotion()
  const inView = reduced
    ? {}
    : { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: reveal }

  return (
    <section id="work" className="relative mx-auto w-full max-w-[912px] px-6 py-section sm:px-8 sm:py-32">
      <motion.div {...inView}>
        <p className="text-compact text-ink-muted">Work</p>
        <h2 className="mt-2 text-balance text-body text-ink sm:text-heading">Selected case studies.</h2>

        <ul className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <li key={item.id}>
              <WorkCard {...item} n={i + 1} />
            </li>
          ))}
        </ul>
      </motion.div>
      {import.meta.env.DEV && <GridOverlay />}
    </section>
  )
}

function WorkCard({ title, meta, href, n }: { title: string; meta: string; href: string; n: number }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={href}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group block rounded-media outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-media">
        {/* the placeholder image: eases closer on hover, inside the clipped frame */}
        <div
          data-hover={hover}
          className="absolute inset-0 grid place-items-center bg-canvas transition-transform duration-300 ease-fast data-[hover=true]:scale-[1.04] data-[hover=true]:duration-700 motion-reduce:transition-none motion-reduce:data-[hover=true]:scale-100"
        >
          <span className="text-compact text-ink-muted tabular-nums">{String(n).padStart(2, '0')}</span>
        </div>
      </div>
      <p className="mt-3 text-secondary text-ink">{title}</p>
      <p className="text-compact text-ink-muted">
        <RollingLabel id={hover ? 'open' : 'meta'} className="h-5">
          {hover ? 'View case study ↗' : meta}
        </RollingLabel>
      </p>
    </a>
  )
}

/** Development only: press G to see the columns the cards sit on. */
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
