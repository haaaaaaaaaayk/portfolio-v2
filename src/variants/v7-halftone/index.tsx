/** Halftone Specimen — the type engine: copy dissolves into CMYK+accent dots, footer is a live film strip. */
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LiquidField } from '../../components/LiquidField'
import { CaseDialog } from '../../components/CaseDialog'
import { AboutPane, ContactPane, ResumePane, WorkPanes } from '../../components/GlassMatter'
import { Slider } from '../../components/ui/Controls'
import { profile, SOURCE_LINES } from '../../content'
import { Atmosphere, type AtmosphereHandle } from '../../shaders/Atmosphere'
import { halftoneCopy } from '../../shaders/copy'
import { bindPhotoDrop, loadImageFile } from '../../shaders/io'
import type { CaseId } from '../../content/projects'

export default function HalftoneSpecimen() {
  const reduced = useReducedMotion()
  const atmo = useRef<AtmosphereHandle>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [caseId, setCaseId] = useState<CaseId | null>(null)
  const [effect, setEffect] = useState(0)
  const [color, setColor] = useState(100)
  const [grid, setGrid] = useState(180)
  const [tone, setTone] = useState(190)
  const [resolve, setResolve] = useState(0)
  const [usingPhoto, setUsingPhoto] = useState(false)
  const vel = useRef(0)
  const resolveRef = useRef(0)

  useEffect(() => bindPhotoDrop((img) => {
    atmo.current?.setPhoto(img)
    setUsingPhoto(true)
  }), [])

  useEffect(() => {
    let last = window.scrollY
    let lastT = performance.now()
    const onScroll = () => {
      const t = performance.now()
      const dy = Math.abs(window.scrollY - last)
      const dt = Math.max(8, t - lastT)
      vel.current = Math.min(1.8, dy / dt)
      last = window.scrollY
      lastT = t
      resolveRef.current = Math.min(1, resolveRef.current + 0.08)
      setResolve(resolveRef.current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    let raf = 0
    let ui = 0
    const loop = () => {
      vel.current *= 0.92
      if (!reduced) resolveRef.current *= 0.97
      atmo.current?.setParams({
        scrollVel: vel.current,
        resolve: reduced ? 1 : resolveRef.current,
      })
      ui += 1
      if (ui % 8 === 0) setResolve(resolveRef.current)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  const gridF = 12 + (grid / 190) * 36
  const toneF = 0.35 + (tone / 190) * 0.7

  return (
    <div className="relative min-h-svh bg-paper">
      <LiquidField intensity={0.35} />
      <Atmosphere
        ref={atmo}
        mix={{ fog: 0, tone: 1, over: 0 }}
        grid={gridF}
        tone={toneF}
        effect={effect / 100}
        color={color / 100}
        resolve={reduced ? 1 : resolve}
        strip={0.09}
        sourceLines={SOURCE_LINES}
        className="z-0"
      />

      <main className="relative z-10 mx-auto grid max-w-[1440px] gap-6 px-4 pb-36 pt-16 sm:px-8 lg:grid-cols-[minmax(240px,320px)_1fr]">
        <aside data-chrome className="glass glass-edge h-fit rounded-card p-5 lg:sticky lg:top-4">
          <p className="text-caption text-ink-muted">{halftoneCopy.title}</p>
          <p className="mt-1 font-display text-title tabular-nums text-ink-muted">{halftoneCopy.ratio}</p>
          <p className="mt-3 text-compact">{halftoneCopy.move}</p>
          <h2 className="mt-8 text-caption text-ink-muted">{halftoneCopy.customize}</h2>
          <div className="mt-4 flex flex-col gap-5">
            <Slider label={halftoneCopy.effect} value={effect} onChange={setEffect} valueLabel={`${effect}`} />
            <Slider label={halftoneCopy.color} value={color} onChange={setColor} valueLabel={`${color}`} />
            <Slider label={halftoneCopy.grid} value={grid} min={80} max={240} onChange={setGrid} valueLabel={`${grid}`} />
            <Slider label={halftoneCopy.tone} value={tone} min={80} max={240} onChange={setTone} valueLabel={`${tone}`} />
          </div>
          <div className="mt-6 border-t border-rule pt-4">
            <p className="text-caption text-ink-muted">{halftoneCopy.source}</p>
            <p className="mt-2 text-compact">
              {usingPhoto
                ? halftoneCopy.drop
                : 'Page as source. Drop a file on the card, or browse.'}
            </p>
            <button type="button" className="ctl ctl-secondary mt-3" onClick={() => fileRef.current?.click()}>
              {halftoneCopy.pointer}
            </button>
            <p className="mt-2 text-caption text-ink-muted">{halftoneCopy.drag}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                void loadImageFile(file).then((img) => {
                  atmo.current?.setPhoto(img)
                  setUsingPhoto(true)
                })
              }}
            />
          </div>
          <p className="mt-6 text-caption text-ink-muted">
            Fifth ink {`#1AEDC5`}. Scroll velocity opens the dot. Hover a case to resolve the type.
          </p>
        </aside>

        <div className="flex min-w-0 flex-col gap-16">
          <header
            onPointerEnter={() => {
              resolveRef.current = 1
              setResolve(1)
            }}
            onPointerLeave={() => {
              resolveRef.current = Math.max(resolveRef.current, 0.2)
              setResolve(resolveRef.current)
            }}
          >
            <p className="text-compact text-ink-muted">
              {profile.name} · {profile.location}
            </p>
            <h1
              className="mt-6 font-display text-[clamp(40px,10vw,96px)] leading-[1.08] transition-opacity duration-[360ms]"
              style={{ opacity: 0.18 + resolve * 0.82 }}
            >
              {profile.statement.lead}{' '}
              <span className="text-ink-muted">{profile.statement.tail}</span>
            </h1>
          </header>

          <div
            className="grid gap-6"
            onPointerEnter={() => {
              resolveRef.current = 1
              setResolve(1)
            }}
            onPointerLeave={() => {
              resolveRef.current = Math.min(resolveRef.current, 0.35)
              setResolve(resolveRef.current)
            }}
          >
            <WorkPanes onOpen={(id) => setCaseId(id)} />
          </div>
        </div>
      </main>

      <div className="relative z-10 mx-auto grid max-w-[1440px] gap-6 px-4 pb-32 sm:px-8 lg:grid-cols-2">
        <AboutPane />
        <ResumePane />
        <ContactPane />
      </div>

      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-[9vh] border-t border-rule">
        <div data-chrome className="pointer-events-auto glass absolute inset-x-3 bottom-3 flex h-11 items-center justify-between rounded-full px-4 text-caption sm:inset-x-4">
          <span>
            {halftoneCopy.title} · live strip of this section
          </span>
          <span className="tabular-nums text-ink-muted">{halftoneCopy.ratio}</span>
        </div>
      </footer>

      <CaseDialog id={caseId} onClose={() => setCaseId(null)} />
    </div>
  )
}
