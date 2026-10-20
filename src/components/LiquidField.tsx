import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Liquid field — soft pools of the accent colour drifting behind the page.
 * The glass panels refract it, which is what makes them read as liquid glass.
 * Only transforms animate (GPU-composited); one pool eases toward the pointer.
 * Static under prefers-reduced-motion.
 *
 * Props let a variant re-palette or intensify the field without forking it.
 */
export interface Pool {
  /** home position, fraction of viewport */
  x: number
  y: number
  /** diameter, in vmax */
  size: number
  /** colour mix of the accent with white, 0..100 */
  mix: number
  opacity: number
  /** drift amplitude (fraction of viewport) and speed */
  amp: number
  speed: number
  phase: number
  shape: string
  follow?: boolean
  /** override colour for this pool (any CSS colour) */
  color?: string
}

export const DEFAULT_POOLS: Pool[] = [
  { x: 0.14, y: 0.16, size: 46, mix: 100, opacity: 0.42, amp: 0.05, speed: 0.00009, phase: 0, shape: '42% 58% 63% 37% / 41% 44% 56% 59%' },
  { x: 0.82, y: 0.3, size: 38, mix: 70, opacity: 0.38, amp: 0.06, speed: 0.00007, phase: 2.1, shape: '61% 39% 46% 54% / 52% 61% 39% 48%' },
  { x: 0.56, y: 0.86, size: 52, mix: 55, opacity: 0.34, amp: 0.05, speed: 0.00006, phase: 4.2, shape: '48% 52% 38% 62% / 58% 43% 57% 42%' },
  { x: 0.5, y: 0.5, size: 22, mix: 100, opacity: 0.3, amp: 0, speed: 0.0001, phase: 1, shape: '50% 50% 46% 54% / 55% 48% 52% 45%', follow: true },
]

export interface LiquidFieldProps {
  pools?: Pool[]
  /** base colour the pools are mixed from; defaults to the accent token */
  accent?: string
  /** 0..1 multiplier on every pool's opacity */
  intensity?: number
  /** how quickly the follower pool chases the pointer (0..1 per frame) */
  pointerEase?: number
  /** blur radius in px */
  blur?: number
  /** fixed (default) or absolute positioning (for a scrolling/clipped parent) */
  position?: 'fixed' | 'absolute'
  className?: string
}

export function LiquidField({
  pools = DEFAULT_POOLS,
  accent,
  intensity = 1,
  pointerEase = 0.04,
  blur = 48,
  position = 'fixed',
  className = '',
}: LiquidFieldProps) {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const reduced = useReducedMotion()

  useEffect(() => {
    let raf = 0
    let w = window.innerWidth
    let h = window.innerHeight
    const isFine = window.matchMedia('(pointer: fine)').matches
    const pointer = { x: w * 0.5, y: h * 0.45 }
    const follower = { x: pointer.x, y: pointer.y }

    const place = (t: number) => {
      const vmax = Math.max(w, h) / 100
      pools.forEach((p, i) => {
        const el = refs.current[i]
        if (!el) return
        const d = p.size * vmax
        let cx: number
        let cy: number
        if (p.follow) {
          cx = follower.x
          cy = follower.y
        } else {
          cx = (p.x + Math.sin(t * p.speed + p.phase) * p.amp) * w
          cy = (p.y + Math.cos(t * p.speed * 1.3 + p.phase) * p.amp) * h
        }
        const rot = (t * p.speed * 40 + p.phase * 30) % 360
        const scale = 1 + Math.sin(t * p.speed * 2 + p.phase) * 0.06
        el.style.transform = `translate3d(${cx - d / 2}px, ${cy - d / 2}px, 0) rotate(${rot}deg) scale(${scale})`
      })
    }

    const onResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      if (reduced) place(0)
    }
    window.addEventListener('resize', onResize)

    if (reduced) {
      place(0)
      return () => window.removeEventListener('resize', onResize)
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
    }
    if (isFine) window.addEventListener('pointermove', onMove, { passive: true })

    const loop = (t: number) => {
      if (isFine) {
        follower.x += (pointer.x - follower.x) * pointerEase
        follower.y += (pointer.y - follower.y) * pointerEase
      } else {
        follower.x = w * (0.5 + Math.sin(t * 0.00008) * 0.25)
        follower.y = h * (0.55 + Math.cos(t * 0.0001) * 0.2)
      }
      place(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduced, pools, pointerEase])

  const base = accent ?? 'var(--color-accent)'

  return (
    <div
      aria-hidden
      className={`pointer-events-none inset-0 z-0 overflow-hidden ${position} ${className}`}
    >
      {pools.map((p, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: `${p.size}vmax`,
            height: `${p.size}vmax`,
            borderRadius: p.shape,
            opacity: p.opacity * intensity,
            filter: `blur(${blur}px)`,
            background: `radial-gradient(circle at 42% 40%, ${
              p.color ?? `color-mix(in srgb, ${base} ${p.mix}%, white)`
            }, transparent 72%)`,
          }}
        />
      ))}
    </div>
  )
}
