/** Triptych shader stage — Fogged / Halftone / Overtaken on one mixer; scroll crossfades, 1/2/3 solo. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LiquidField } from '../../components/LiquidField'
import { CaseDialog } from '../../components/CaseDialog'
import { AboutPane, ContactPane, ResumePane, WorkPanes } from '../../components/GlassMatter'
import { Slider } from '../../components/ui/Controls'
import { profile, SOURCE_LINES } from '../../content'
import { useClock } from '../../hooks/useClock'
import { Atmosphere, type AtmosphereHandle } from '../../shaders/Atmosphere'
import { foggedCopy, halftoneCopy, overtakenCopy } from '../../shaders/copy'
import type { CaseId } from '../../content/projects'

type Solo = 0 | 1 | 2 | 3

export default function Triptych() {
  const time = useClock()
  const reduced = useReducedMotion()
  const atmo = useRef<AtmosphereHandle>(null)
  const [caseId, setCaseId] = useState<CaseId | null>(null)
  const [fog, setFog] = useState(70)
  const [tone, setTone] = useState(40)
  const [over, setOver] = useState(20)
  const [solo, setSolo] = useState<Solo>(0)
  const [warp, setWarp] = useState(0.35)
  const [scrollMix, setScrollMix] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight)
      setScrollMix(window.scrollY / max)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable]')) return
      if (e.key === '1') setSolo((s) => (s === 1 ? 0 : 1))
      if (e.key === '2') setSolo((s) => (s === 2 ? 0 : 2))
      if (e.key === '3') setSolo((s) => (s === 3 ? 0 : 3))
    }
    const onDrag = (e: PointerEvent) => {
      if (!e.buttons) return
      if (e.target instanceof Element && e.target.closest('[data-switcher], [data-chrome], [role="dialog"]')) return
      setSolo(0)
      const x = e.clientX / Math.max(1, window.innerWidth)
      const y = e.clientY / Math.max(1, window.innerHeight)
      setFog(Math.round((1 - x) * 100))
      setTone(Math.round(x * 100))
      setOver(Math.round(y * 100))
      setWarp(0.2 + x * 0.5)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', onDrag, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onDrag)
    }
  }, [])

  const mix = useMemo(() => {
    if (solo === 1) return { fog: 1, tone: 0, over: 0 }
    if (solo === 2) return { fog: 0, tone: 1, over: 0 }
    if (solo === 3) return { fog: 0, tone: 0, over: 1 }
    const s = reduced ? 0 : scrollMix
    return {
      fog: Math.max(0, fog / 100 * (1 - s * 0.35)),
      tone: Math.max(0, tone / 100 * (0.45 + s * 0.7)),
      over: Math.max(0, over / 100 * (0.2 + s)),
    }
  }, [fog, tone, over, solo, scrollMix, reduced])

  const bars = useMemo(() => Array.from({ length: 32 }, (_, i) => i), [])

  return (
    <div className="relative min-h-svh bg-paper">
      <LiquidField intensity={0.5} />
      <Atmosphere
        ref={atmo}
        mix={mix}
        fog={1}
        grid={26}
        tone={0.8}
        color={1}
        gain={0.35 + mix.over * 0.5}
        trail={mix.over}
        warp={reduced ? 0 : warp}
        strip={0.07}
        dprCap={1.25}
        sourceLines={SOURCE_LINES}
        className="z-[5]"
      />

      <main className="relative z-10 mx-auto max-w-[1440px] px-4 pb-36 pt-16 sm:px-8">
        <header data-chrome className="glass glass-edge rounded-card p-5 sm:p-8">
          <p className="text-caption text-ink-muted">Triptych · glass mixer</p>
          <h1 className="mt-2 font-display text-role">{profile.name}</h1>
          <p className="mt-3 max-w-2xl text-heading text-ink-muted">
            Three stages on one context. Drag the bus, scroll to crossfade, pointer warps locally. Keys 1 / 2 / 3 solo a shader.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <Slider label={foggedCopy.title} value={fog} onChange={(v) => { setSolo(0); setFog(v) }} />
            <Slider label={halftoneCopy.title} value={tone} onChange={(v) => { setSolo(0); setTone(v) }} />
            <Slider label="Overtaken" value={over} onChange={(v) => { setSolo(0); setOver(v) }} />
          </div>
          <Slider label="Pointer warp" value={Math.round(warp * 100)} onChange={(v) => setWarp(v / 100)} />
          <div className="mt-4 flex flex-wrap gap-2">
            {([0, 1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSolo(n)}
                className={`inline-flex h-11 items-center rounded-full px-4 text-compact ${
                  solo === n ? 'bg-ink text-white' : 'glass text-ink-muted hover:text-ink-active'
                }`}
              >
                {n === 0 ? 'Mix' : n === 1 ? `1 · ${foggedCopy.title}` : n === 2 ? `2 · Halftone` : `3 · Overtaken`}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <WorkPanes onOpen={(id) => setCaseId(id)} />
          <AboutPane />
          <ResumePane />
          <ContactPane />
        </div>
      </main>

      <footer data-chrome className="glass glass-edge fixed inset-x-3 bottom-3 z-30 rounded-card px-4 py-3 sm:inset-x-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-caption text-ink-muted">Mix bus · {time}</p>
            <p className="text-compact tabular-nums">
              F {Math.round(mix.fog * 100)} · H {Math.round(mix.tone * 100)} · O {Math.round(mix.over * 100)}
            </p>
          </div>
          <div className="flex h-11 items-end gap-0.5" aria-hidden>
            {bars.map((i) => {
              const t = Number(time.slice(-2)) / 60 + i * 0.08
              const h =
                8 +
                mix.fog * 18 * (0.4 + Math.abs(Math.sin(t * 3.1 + i))) +
                mix.tone * 12 * (0.4 + Math.abs(Math.sin(t * 5.2 + i * 0.4))) +
                mix.over * 14 * (0.4 + Math.abs(Math.sin(t * 2.2 + i * 0.2)))
              return (
                <span
                  key={i}
                  className="w-1 rounded-full bg-ink"
                  style={{ height: `${Math.min(44, h)}px` }}
                />
              )
            })}
          </div>
          <p className="hidden text-caption text-ink-muted sm:block">{overtakenCopy.hint}</p>
        </div>
      </footer>

      <CaseDialog id={caseId} onClose={() => setCaseId(null)} />
    </div>
  )
}
