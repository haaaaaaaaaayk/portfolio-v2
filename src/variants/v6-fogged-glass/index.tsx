/** Fogged Glass OS — Finger Wetness Fog is the whole weather; wiping the pane reveals the work. */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LiquidField } from '../../components/LiquidField'
import { CaseDialog } from '../../components/CaseDialog'
import { AboutPane, ContactPane, ResumePane, WorkPanes } from '../../components/GlassMatter'
import { profile, SOURCE_LINES } from '../../content'
import { useClock } from '../../hooks/useClock'
import { close, open } from '../../lib/motion'
import { Atmosphere, type AtmosphereHandle } from '../../shaders/Atmosphere'
import { foggedCopy } from '../../shaders/copy'
import { bindPhotoDrop, isChromeTarget, loadImageFile } from '../../shaders/io'
import type { CaseId } from '../../content/projects'

export default function FoggedGlass() {
  const time = useClock()
  const reduced = useReducedMotion()
  const atmo = useRef<AtmosphereHandle>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [caseId, setCaseId] = useState<CaseId | null>(null)
  const [humidity, setHumidity] = useState(92)
  const [photoName, setPhotoName] = useState<string | null>(null)
  const [shot, setShot] = useState<string | null>(null)
  const [finger, setFinger] = useState(12)
  const [wet, setWet] = useState(55)
  const [fog, setFog] = useState(55)

  useEffect(() => bindPhotoDrop((img) => {
    atmo.current?.setPhoto(img)
    setPhotoName('Dropped photo')
  }), [])

  const snapshot = () => {
    const url = atmo.current?.snapshot()
    if (url) setShot(url)
  }

  useEffect(() => {
    const interactive = (t: EventTarget | null) =>
      t instanceof Element &&
      !!t.closest('a, button, input, textarea, [data-switcher], [data-chrome], [role="dialog"]')
    const onMenu = (e: MouseEvent) => {
      if (interactive(e.target) || isChromeTarget(e.target)) return
      e.preventDefault()
      snapshot()
    }
    let press = 0
    const onDown = (e: PointerEvent) => {
      if (interactive(e.target) || isChromeTarget(e.target)) return
      press = window.setTimeout(snapshot, 560)
    }
    const onUp = () => window.clearTimeout(press)
    window.addEventListener('contextmenu', onMenu)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('contextmenu', onMenu)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.clearTimeout(press)
    }
  }, [])

  return (
    <div className="relative min-h-svh bg-paper">
      <LiquidField intensity={0.8} />
      <Atmosphere
        ref={atmo}
        mix={{ fog: 1, tone: 0, over: 0 }}
        fog={fog / 100}
        finger={finger / 60}
        wet={wet / 100}
        drawOnDrag
        freezeOnStill
        sourceLines={SOURCE_LINES}
        className="z-[20]"
        onHeatMean={(n) => setHumidity(Math.round((1 - n) * 100))}
      />

      <main className="relative z-10 mx-auto flex min-h-svh max-w-[1440px] flex-col gap-6 px-4 pb-40 pt-16 sm:px-8">
        <motion.header
          initial={false}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          data-chrome
          className="relative z-30 glass glass-edge max-w-xl rounded-card p-5 sm:p-8"
        >
          <p className="text-caption text-ink-muted">{foggedCopy.mode}</p>
          <h1 className="mt-2 font-display text-role sm:text-specimen">{foggedCopy.title}</h1>
          <p className="mt-4 text-heading text-ink">{foggedCopy.draw}</p>
          <p className="mt-2 text-compact text-ink-muted">
            {profile.name} · {profile.location} · cursor heat clears the pane; lift off and it beads again.
          </p>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-2">
          <WorkPanes onOpen={(id) => setCaseId(id)} />
          <AboutPane />
          <ResumePane />
          <ContactPane />
        </div>
      </main>

      <footer
        data-chrome
        className="glass glass-edge fixed inset-x-3 bottom-3 z-30 flex flex-col gap-3 rounded-card px-4 py-3 sm:inset-x-4 sm:px-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-compact">{foggedCopy.snapshot}</span>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-caption tabular-nums">
            <div className="flex gap-2">
              <dt className="text-ink-muted">Humidity</dt>
              <dd>{humidity}%</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-muted">Dew</dt>
              <dd>{profile.location}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-muted">Time</dt>
              <dd>{time}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <DockSlider label={foggedCopy.finger} value={finger} min={4} max={60} onChange={setFinger} />
          <DockSlider label={foggedCopy.wetness} value={wet} onChange={setWet} />
          <DockSlider label={foggedCopy.fog} value={fog} onChange={setFog} />
          <button type="button" className="ctl ctl-secondary h-11 w-fit" onClick={() => fileRef.current?.click()}>
            {foggedCopy.photo}
          </button>
          <button type="button" className="ctl ctl-primary h-11 w-fit" onClick={snapshot}>
            Snapshot
          </button>
          <p className="text-caption text-ink-muted">
            {photoName ? `Using ${photoName}. ` : ''}
            {foggedCopy.save}
          </p>
        </div>
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
              setPhotoName(file.name)
            })
          }}
        />
      </footer>

      <AnimatePresence>
        {shot && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1, transition: open }}
            exit={{ opacity: 0, transition: close }}
            onClick={() => setShot(null)}
          >
            <figure
              role="dialog"
              aria-label={foggedCopy.snapshot}
              className="grid max-w-3xl justify-items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={shot}
                alt={foggedCopy.snapshot}
                className="max-h-[72vh] w-auto rounded-media shadow-glass-lift"
              />
              <figcaption className="text-compact text-white/80">{foggedCopy.save}</figcaption>
              <button type="button" className="ctl ctl-secondary" onClick={() => setShot(null)}>
                Close
              </button>
            </figure>
          </motion.div>
        )}
      </AnimatePresence>

      <CaseDialog id={caseId} onClose={() => setCaseId(null)} />
    </div>
  )
}

function DockSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  const range = max - min
  const progress = range > 0 ? ((value - min) / range) * 100 : 0
  return (
    <label className="flex h-11 items-center gap-2 text-caption text-ink-muted">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="token-slider w-[92px]"
        style={{ '--slider-progress': `${progress}%` } as CSSProperties}
      />
    </label>
  )
}
