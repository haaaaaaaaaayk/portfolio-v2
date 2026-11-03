/** Ink Trail — the five ink panels as one pen-drawn strip; pull Hayk through them, then the work. */
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CaseDialog } from '../../components/CaseDialog'
import { ProjectPane } from '../../components/GlassMatter'
import { Slider } from '../../components/ui/Controls'
import { profile, projects } from '../../content'
import type { CaseId } from '../../content/projects'
import { fadeUp, reveal } from '../../lib/motion'
import { mountInkTrail, type InkTrailOptions } from './scene'

export default function InkTrail() {
  const reduced = useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const api = useRef<ReturnType<typeof mountInkTrail> | null>(null)
  const [caseId, setCaseId] = useState<CaseId | null>(null)
  const [boil, setBoil] = useState(45)
  const [bleed, setBleed] = useState(40)
  const [grain, setGrain] = useState(35)
  const [said, setSaid] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  /* one live object the scene reads every frame, so the sliders never remount it */
  const opts = useRef<InkTrailOptions>({ boil: 0.45, bleed: 0.4, grain: 0.35 })
  useEffect(() => {
    Object.assign(opts.current, { boil: boil / 100, bleed: bleed / 100, grain: grain / 100 })
  }, [boil, bleed, grain])

  useEffect(() => {
    if (!stage.current || !canvas.current) return
    Object.assign(opts.current, {
      onThought: setSaid,
      onDone: () => setDone(true),
      onFinale: () => document.getElementById('work')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }),
    })
    const t = mountInkTrail(stage.current, canvas.current, !!reduced, opts.current)
    api.current = t
    return () => {
      t.destroy()
      api.current = null
    }
  }, [reduced])

  const inView = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: reveal,
      }

  return (
    <div className="relative min-h-svh bg-paper">
      <main>
        <section className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 py-12">
          <motion.div {...fadeUp(0.1, reduced)} className="flex w-full justify-center">
            <div
              ref={stage}
              className="relative h-[52svh] w-[min(92vw,100%)] max-h-[640px] max-w-[1120px] overflow-hidden rounded-card sm:h-[64svh] sm:w-[min(80vw,100%)]"
            >
              <canvas
                ref={canvas}
                tabIndex={0}
                aria-label="Five ink-drawn panels: a slope, a river, a fallen log, a rock face with a rope, and a summit. Point ahead of Hayk, or use the arrow keys, to pull him along."
                className="absolute inset-0 block h-full w-full cursor-crosshair touch-none outline-none"
              />
            </div>
          </motion.div>
          <p aria-live="polite" className="sr-only">
            {said}
          </p>
          <motion.p {...fadeUp(0.2, reduced)} className="text-center text-caption text-ink-muted">
            {done
              ? 'He made it. Click him to see the projects.'
              : 'Point ahead of me, or hold the arrow keys. Click me when I give up.'}
          </motion.p>
          <motion.div
            {...fadeUp(0.3, reduced)}
            data-chrome
            className="glass glass-edge mt-2 grid w-full max-w-[720px] gap-5 rounded-card p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
          >
            <Slider label="Boil" value={boil} onChange={setBoil} valueLabel={`${boil}`} />
            <Slider label="Bleed" value={bleed} onChange={setBleed} valueLabel={`${bleed}`} />
            <Slider label="Grain" value={grain} onChange={setGrain} valueLabel={`${grain}`} />
            <button
              type="button"
              className="ctl ctl-secondary"
              onClick={() => {
                setDone(false)
                api.current?.reset()
              }}
            >
              Start over
            </button>
          </motion.div>
          <a href="#pitch" className="reading-link mt-6 text-compact">
            Scroll ↓
          </a>
        </section>

        <section id="pitch" className="mx-auto max-w-[1440px] px-4 py-section sm:px-8 sm:py-32 lg:px-16">
          <motion.p {...inView} className="text-compact text-ink-muted">
            {profile.name} · {profile.location}
          </motion.p>
          <motion.h1 {...inView} className="mt-8 max-w-5xl font-display text-role sm:text-specimen">
            {profile.pitch.lead} <span className="text-ink-muted">{profile.pitch.tail}</span>
          </motion.h1>
          <motion.p {...inView} className="mt-8 max-w-xl text-title text-ink-muted">
            {profile.looking}
          </motion.p>
        </section>

        <section id="work" className="mx-auto max-w-[1440px] px-4 pb-40 sm:px-8 lg:px-16">
          <p className="text-compact text-ink-muted">Selected work</p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {projects.map((p) => (
              <ProjectPane key={p.id} project={p} onOpen={(id) => setCaseId(id)} />
            ))}
          </div>
        </section>
      </main>

      <CaseDialog id={caseId} onClose={() => setCaseId(null)} />
    </div>
  )
}
