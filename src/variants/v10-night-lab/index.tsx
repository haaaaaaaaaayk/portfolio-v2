/** Night lab — the three shaders are instruments; hold keys and gesture to perform the portfolio. */
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LiquidField } from '../../components/LiquidField'
import { CaseDialog } from '../../components/CaseDialog'
import { AboutPane, ContactPane, ResumePane, WorkPanes } from '../../components/GlassMatter'
import { profile, projects, SOURCE_LINES } from '../../content'
import { useClock } from '../../hooks/useClock'
import { useFps } from '../../hooks/useFps'
import { Atmosphere, type AtmosphereHandle } from '../../shaders/Atmosphere'
import { foggedCopy, halftoneCopy, overtakenCopy } from '../../shaders/copy'
import type { CaseId } from '../../content/projects'

interface Tone {
  ctx: AudioContext
  osc: OscillatorNode
  gain: GainNode
}

function startTone(): Tone | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  const ctx = new AC()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  gain.gain.value = 0
  osc.type = 'sine'
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  return { ctx, osc, gain }
}

export default function NightLab() {
  const time = useClock()
  const fps = useFps()
  const reduced = useReducedMotion()
  const atmo = useRef<AtmosphereHandle>(null)
  const [caseId, setCaseId] = useState<CaseId | null>(null)
  const [fog, setFog] = useState(0.25)
  const [tone, setTone] = useState(0.2)
  const [over, setOver] = useState(0.15)
  const [held, setHeld] = useState({ f: false, h: false, o: false })
  const [armed, setArmed] = useState(false)
  const audio = useRef<Tone | null>(null)

  useEffect(() => {
    const keys = new Set<string>()
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.repeat) return
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable]')) return
      const k = e.key.toLowerCase()
      if (k === 'f' || k === '1') keys.add('f')
      if (k === 'h' || k === '2') keys.add('h')
      if (k === 'o' || k === '3') keys.add('o')
      setHeld({ f: keys.has('f'), h: keys.has('h'), o: keys.has('o') })
    }
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'f' || k === '1') keys.delete('f')
      if (k === 'h' || k === '2') keys.delete('h')
      if (k === 'o' || k === '3') keys.delete('o')
      setHeld({ f: keys.has('f'), h: keys.has('h'), o: keys.has('o') })
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    let raf = 0
    let ui = 0
    const fogR = { v: 0.25 }
    const toneR = { v: 0.2 }
    const overR = { v: 0.15 }
    const loop = () => {
      fogR.v = clamp(fogR.v + (keys.has('f') ? 0.012 : -0.006), 0.04, 1)
      toneR.v = clamp(toneR.v + (keys.has('h') ? 0.012 : -0.006), 0.04, 1)
      overR.v = clamp(overR.v + (keys.has('o') ? 0.012 : -0.006), 0.04, 1)
      atmo.current?.setParams({
        mix: { fog: fogR.v, tone: toneR.v, over: overR.v },
        fog: fogR.v,
        grid: 18 + toneR.v * 36,
        tone: 0.5 + toneR.v * 0.5,
        gain: overR.v,
        trail: overR.v,
        warp: 0.25 + fogR.v * 0.4,
      })
      ui += 1
      if (ui % 8 === 0) {
        setFog(fogR.v)
        setTone(toneR.v)
        setOver(overR.v)
      }
      raf = requestAnimationFrame(loop)
    }
    if (!reduced) raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  useEffect(() => {
    const onVis = () => {
      const a = audio.current
      if (!a) return
      if (document.visibilityState === 'hidden') void a.ctx.suspend()
      else void a.ctx.resume()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      const a = audio.current
      if (!a) return
      a.gain.gain.value = 0
      try {
        a.osc.stop()
        void a.ctx.close()
      } catch {
        /* already closed */
      }
    }
  }, [])

  const armAudio = () => {
    if (reduced || audio.current) {
      setArmed(true)
      return
    }
    const t = startTone()
    audio.current = t
    setArmed(true)
  }

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const a = audio.current
      if (!a || reduced) return
      const freq = 80 + (e.clientX / Math.max(1, window.innerWidth)) * 420
      const vel = Math.min(0.08, (fog + tone + over) * 0.03)
      a.osc.frequency.setTargetAtTime(freq, a.ctx.currentTime, 0.05)
      a.gain.gain.setTargetAtTime(e.buttons ? vel : vel * 0.25, a.ctx.currentTime, 0.08)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [fog, tone, over, reduced])

  return (
    <div className="relative min-h-svh bg-ink text-white">
      <LiquidField intensity={0.55} accent="#1AEDC5" />
      <Atmosphere
        ref={atmo}
        mix={{ fog, tone, over }}
        fog={fog}
        grid={18 + tone * 36}
        tone={0.5 + tone * 0.5}
        color={1}
        gain={over}
        trail={over}
        warp={0.25 + fog * 0.4}
        feedback={0.85}
        dprCap={1.25}
        sourceLines={SOURCE_LINES}
        className="z-[5]"
      />

      <main className="relative z-10 mx-auto max-w-[1440px] px-4 pb-36 pt-16 sm:px-8">
        <header data-chrome className="glass-dark rounded-card p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-caption text-white/50">Night lab · performance</p>
              <h1 className="mt-2 font-display text-role">{profile.name}</h1>
              <p className="mt-3 max-w-xl text-heading text-white/70">
                Hold F / H / O (or 1 / 2 / 3) to layer fog density, halftone frequency, overtaken gain. Case studies are tracks.
              </p>
            </div>
            <span className="glass inline-flex h-11 items-center rounded-full px-3 text-compact tabular-nums text-ink-muted">
              {fps === 0 ? '—' : fps} fps
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Meter label={`${foggedCopy.title} · F`} value={fog} hot={held.f} />
            <Meter label={`${halftoneCopy.title} · H`} value={tone} hot={held.h} />
            <Meter label={`Overtaken · O`} value={over} hot={held.o} />
          </div>
          <button
            type="button"
            onClick={armAudio}
            className="ctl ctl-secondary mt-6 bg-white/10 text-white"
          >
            {armed ? 'Pointer oscillator live' : 'Arm pointer oscillator (no files)'}
          </button>
        </header>

        <section className="mt-10">
          <p className="text-caption text-white/50">Tracks</p>
          <div className="mt-4 grid gap-4">
            {projects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={(e) => {
                  atmo.current?.punch(e.clientX / window.innerWidth, e.clientY / window.innerHeight, 0.2)
                  setCaseId(p.id)
                }}
                className="glass-dark flex items-center justify-between gap-4 rounded-card p-5 text-left"
              >
                <span>
                  <span className="text-caption tabular-nums text-white/50">Track {String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-1 block text-title">{p.name}</span>
                  <span className="mt-1 block text-compact text-white/60">{p.title}</span>
                </span>
                <span className="inline-flex h-11 items-center rounded-full bg-accent px-4 text-compact text-ink">
                  Play
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-6 text-ink-muted lg:grid-cols-2">
          <WorkPanes onOpen={(id) => setCaseId(id)} />
          <AboutPane />
          <ResumePane />
          <ContactPane ink />
        </div>
      </main>

      <footer data-chrome className="glass-dark fixed inset-x-3 bottom-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-full px-4 py-2 sm:inset-x-4">
        <span className="text-compact text-white/80">{overtakenCopy.title}</span>
        <span className="text-caption tabular-nums text-white/50">{time} · dpr cap 1.25</span>
      </footer>

      <CaseDialog id={caseId} onClose={() => setCaseId(null)} />
    </div>
  )
}

function Meter({ label, value, hot }: { label: string; value: number; hot: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-caption text-white/60">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(value * 100)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${hot ? 'bg-accent' : 'bg-white/70'}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  )
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}
