/** Overtaken — a hostile footer organism climbs the trail; a click clears a reading circle. */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LiquidField } from '../../components/LiquidField'
import { CaseArticle } from '../../components/CaseArticle'
import { AboutPane, ContactPane, ResumePane, WorkPanes } from '../../components/GlassMatter'
import { about, profile, projectById, SOURCE_LINES } from '../../content'
import { useClock } from '../../hooks/useClock'
import { spring } from '../../lib/motion'
import { Atmosphere, type AtmosphereHandle } from '../../shaders/Atmosphere'
import { overtakenCopy } from '../../shaders/copy'
import type { CaseId } from '../../content/projects'

export default function Overtaken() {
  const time = useClock()
  const reduced = useReducedMotion()
  const atmo = useRef<AtmosphereHandle>(null)
  const [caseId, setCaseId] = useState<CaseId | null>(null)
  const [lens, setLens] = useState({ x: 0, y: 0 })
  const [gain, setGain] = useState(0.12)
  const [trail, setTrail] = useState(0)
  const idle = useRef(0)
  const gainRef = useRef(0.12)
  const trailRef = useRef(0)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const y = 1 - e.clientY / Math.max(1, window.innerHeight)
      trailRef.current = y
      idle.current = 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    let raf = 0
    let ui = 0
    const loop = () => {
      idle.current += 1
      const scrolling = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)
      const idlePush = idle.current > 120 ? 0.004 : 0
      gainRef.current = Math.min(1.15, gainRef.current * 0.995 + scrolling * 0.012 + idlePush)
      atmo.current?.setParams({
        gain: reduced ? 0.22 : gainRef.current,
        trail: reduced ? 0.15 : trailRef.current,
      })
      ui += 1
      if (ui % 8 === 0) {
        setGain(gainRef.current)
        setTrail(trailRef.current)
      }
      raf = requestAnimationFrame(loop)
    }
    if (!reduced) raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  const openCase = (id: CaseId, e: { clientX: number; clientY: number }) => {
    const nx = e.clientX / Math.max(1, window.innerWidth)
    const ny = e.clientY / Math.max(1, window.innerHeight)
    atmo.current?.punch(nx, ny, 0.32)
    setLens({ x: e.clientX, y: e.clientY })
    setCaseId(id)
    gainRef.current = Math.max(0.08, gainRef.current * 0.45)
    setGain(gainRef.current)
  }

  const project = caseId ? projectById(caseId) : null

  return (
    <div className="relative min-h-svh bg-paper">
      <LiquidField intensity={0.45} />
      <Atmosphere
        ref={atmo}
        mix={{ fog: 0, tone: 0, over: 1 }}
        gain={reduced ? 0.22 : gain}
        trail={reduced ? 0.15 : trail}
        sourceLines={SOURCE_LINES}
        className="z-[20]"
      />

      <main className="relative z-10 mx-auto max-w-[1440px] px-4 pb-40 pt-16 sm:px-8">
        <header className="max-w-3xl">
          <p className="glass inline-flex h-11 items-center rounded-full px-4 text-compact">
            {profile.name} · {profile.location}
          </p>
          <h1 className="mt-8 font-display text-role sm:text-specimen">{overtakenCopy.title}</h1>
          <p className="mt-4 text-title text-ink-muted">{overtakenCopy.hint}</p>
          <p className="mt-6 max-w-xl text-heading">{about.lead}</p>
        </header>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <WorkPanes onOpen={openCase} />
          <AboutPane />
          <ResumePane />
          <ContactPane />
        </div>
      </main>

      <footer data-chrome className="glass-dark fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-full px-4 py-2 text-white sm:inset-x-4 sm:px-6">
        <span className="text-compact">{overtakenCopy.title}</span>
        <span className="text-caption text-white/60 tabular-nums">
          trail {Math.round(trail * 100)} · gain {Math.round(Math.min(1, gain) * 100)} · {time}
        </span>
      </footer>

      <AnimatePresence>
        {project && (
          <motion.div
            key={project.id}
            className="fixed inset-0 z-[60] overflow-y-auto bg-canvas/40 backdrop-blur-sm"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCaseId(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Case study: ${project.title}`}
              onClick={(e) => e.stopPropagation()}
              initial={
                reduced
                  ? false
                  : { clipPath: `circle(0px at ${lens.x}px ${lens.y}px)` }
              }
              animate={{
                clipPath: `circle(160% at ${lens.x}px ${lens.y}px)`,
                transition: reduced ? { duration: 0 } : spring,
              }}
              exit={{
                clipPath: `circle(0px at ${lens.x}px ${lens.y}px)`,
                transition: { duration: 0.26 },
              }}
              className="min-h-full bg-paper"
            >
              <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-16">
                <button
                  type="button"
                  onClick={() => setCaseId(null)}
                  className="glass-dark inline-flex h-11 items-center rounded-full px-5 text-compact text-white"
                >
                  Close cleared region
                </button>
                <div className="mt-10">
                  <CaseArticle project={project} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
