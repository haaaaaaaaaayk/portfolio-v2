import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { HalftoneField } from './HalftoneField'
import { Mascot } from './Mascot'

const NAME_LINES = ['HAYK', 'SARGSYAN']

/**
 * Hero. The name renders as crisp ink type with chromatic blur layers
 * bleeding out behind it (pure CSS filters). A `--glow` custom property
 * (0..1) drives blur/offset/opacity; it eases from 1 → rest on load,
 * then rises with cursor proximity. No per-pixel JS.
 */
export function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = nameRef.current
    if (!el || reduced) return

    const REST = 0.18
    let target = 1 // start fully bloomed, sharpen on load
    let current = 1
    let raf = 0
    const start = performance.now()

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const d = Math.hypot(e.clientX - cx, e.clientY - cy)
      const reach = Math.max(r.width, 480) // px at which effect fades out
      const proximity = Math.max(0, 1 - d / reach) // 1 at center → 0 far
      target = REST + proximity * (1 - REST) * 0.9
    }

    const loop = (now: number) => {
      // first 1.4s: force the load-in sharpen regardless of pointer
      if (now - start < 1400) {
        const k = (now - start) / 1400
        target = 1 - (1 - REST) * (1 - Math.pow(1 - k, 3)) // ease-out cubic
      }
      current += (target - current) * 0.08
      el.style.setProperty('--glow', current.toFixed(3))
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  const nameText = NAME_LINES.join(' ')

  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-28"
    >
      {/* PHASE 2: replace hero texture field with WebGL shader canvas here */}
      <div aria-hidden className="absolute inset-0">
        <HalftoneField className="h-full w-full" />
        {/* soft vignette so dots fade toward edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 30%, var(--color-bone) 95%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="tech-label mb-6 flex items-center gap-2 text-ink-soft">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-acid-deep" />
          37.7749° N, 122.4194° W — available for work
        </p>

        <h1
          ref={nameRef}
          className="hero-name font-grotesk text-[16vw] font-black leading-[0.86] tracking-[-0.04em] sm:text-[13vw] lg:text-[10.5rem]"
          aria-label={nameText}
        >
          {/* chromatic glow layers (decorative) */}
          {(['layer-blu', 'layer-pink', 'layer-acid'] as const).map((cls) => (
            <span key={cls} aria-hidden className={`layer ${cls}`}>
              {NAME_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
          ))}
          <span className="layer-ink" aria-hidden>
            {NAME_LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </span>
        </h1>

        <p className="mt-8 max-w-xl font-serif text-2xl italic leading-snug text-ink sm:text-[1.75rem]">
          “I’m a product designer with high curiosity and zero baked-in
          process.”
        </p>

        <p className="tech-label mt-5 text-ink-soft">
          Product Designer · Design Engineer · San Francisco
        </p>
      </div>

      {/* mascot peeking from the lower-right of the hero */}
      <div className="pointer-events-none absolute bottom-0 right-[8%] z-10 hidden overflow-hidden pt-4 md:block">
        <Mascot mode="peek" size={84} />
      </div>

      <a
        href="#work"
        className="tech-label absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-ink-soft transition-colors hover:text-ink"
      >
        ↓ scroll — selected work
      </a>
    </section>
  )
}
