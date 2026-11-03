/** Trail — the hiking scene opens the page, then the pitch, then the work. Mouse, touch or keyboard. */
import { useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CaseDialog } from '../../components/CaseDialog'
import { ProjectPane } from '../../components/GlassMatter'
import { Switch } from '../../components/ui/Controls'
import { Segmented } from '../../components/ui/Segmented'
import { profile, projects } from '../../content'
import type { CaseId } from '../../content/projects'
import { close, fadeUp, open, reveal } from '../../lib/motion'
import { mountTrail, type TrailOptions } from './scene'

type ThoughtStyle = TrailOptions['mode']

/* Five ways Hayk's thoughts can surface; `?thought=1…5` picks one for sharing. */
const STYLES = [
  { value: 1, label: 'Cloud', title: 'Inside the rain cloud — compact 14 on grey' },
  { value: 2, label: 'Type', title: 'No cloud — caption 12 typed out over his head' },
  { value: 3, label: 'Mark', title: 'Instead of the cloud — accent mark, secondary 16' },
  { value: 4, label: 'Subtitle', title: 'Cloud stays — heading 20 subtitle along the bottom' },
  { value: 5, label: 'Narrator', title: 'Cloud stays — title 24/32 narrated under the scene' },
] as const satisfies readonly { value: ThoughtStyle; label: string; title: string }[]

/* sound is on unless this visitor turned it off before */
const SOUND_KEY = 'trail-sound'
function initialSound() {
  try {
    return window.localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

function initialStyle(): ThoughtStyle {
  const q = Number(new URLSearchParams(window.location.search).get('thought'))
  return STYLES.some((s) => s.value === q) ? (q as ThoughtStyle) : 1
}

/* Feather every edge into the paper; the corners, where both fades meet, go softest. */
const FEATHER = {
  maskImage:
    'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent), linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)',
  maskComposite: 'intersect',
  WebkitMaskImage:
    'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent), linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)',
  WebkitMaskComposite: 'source-in',
} as const

function TrailStage({ opts }: { opts: RefObject<TrailOptions> }) {
  const stage = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLCanvasElement>(null)
  const ui = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!stage.current || !scene.current || !ui.current) return
    return mountTrail(stage.current, scene.current, ui.current, !!reduced, opts.current)
  }, [reduced, opts])

  /* the feather mask would clip a focus ring, so the ring sits on a wrapper outside it */
  return (
    <div className="h-[52svh] w-[min(92vw,100%)] max-h-[760px] max-w-[1120px] rounded-card outline-offset-4 has-[canvas:focus-visible]:outline-2 has-[canvas:focus-visible]:outline-ink sm:h-[72svh] sm:w-[min(80vw,100%)]">
      <div
        ref={stage}
        className="relative h-full w-full overflow-hidden"
        style={FEATHER}
      >
        <canvas
          ref={scene}
          tabIndex={0}
          role="application"
          aria-roledescription="hiking scene"
          aria-label="A winding trail through a valley of hills, past houses, waterfalls, a pond, coyotes and butterflies. Hold the up arrow to walk Hayk up the trail and the down arrow to walk him back. Press Space or Enter to get him back on his feet, and at the top, to send him home."
          aria-keyshortcuts="ArrowUp ArrowDown Space Enter"
          className="absolute inset-0 block h-full w-full cursor-none touch-none outline-none"
        />
        <canvas ref={ui} aria-hidden className="pointer-events-none absolute inset-0 block h-full w-full" />
      </div>
    </div>
  )
}

export default function Trail() {
  const reduced = useReducedMotion()
  const [caseId, setCaseId] = useState<CaseId | null>(null)
  const [style, setStyle] = useState<ThoughtStyle>(initialStyle)
  const [said, setSaid] = useState<string | null>(null)
  const [sound, setSound] = useState(initialSound)
  /* one live object the scene reads every frame, so switching style or sound never remounts it */
  const opts = useRef<TrailOptions>({ mode: style, onThought: setSaid, sound })
  useEffect(() => {
    opts.current.mode = style
  }, [style])
  useEffect(() => {
    opts.current.sound = sound
    try {
      window.localStorage.setItem(SOUND_KEY, sound ? 'on' : 'off')
    } catch {
      /* private mode etc. */
    }
  }, [sound])

  const pickStyle = (v: ThoughtStyle) => {
    setStyle(v)
    const url = new URL(window.location.href)
    url.searchParams.set('thought', String(v))
    window.history.replaceState(null, '', url)
  }
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
            <TrailStage opts={opts} />
          </motion.div>
          {style !== 5 && (
            <p aria-live="polite" className="sr-only">
              {said}
            </p>
          )}
          {style === 5 && (
            <p aria-live="polite" className="flex min-h-16 max-w-3xl items-center justify-center text-center text-title text-ink-muted sm:min-h-20 sm:text-role">
              <AnimatePresence mode="wait" initial={false}>
                {said && (
                  <motion.span
                    key={said}
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: open }}
                    exit={{ opacity: 0, y: -6, transition: close }}
                  >
                    {said}
                  </motion.span>
                )}
              </AnimatePresence>
            </p>
          )}
          <motion.p {...fadeUp(0.2, reduced)} className="text-center text-caption text-ink-muted">
            Move your mouse up the trail, or click it and hold ↑. I have thoughts. Click me, or press Space, when I sit down.
          </motion.p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Segmented label="Thought style" value={style} onChange={pickStyle} options={STYLES} size="compact" />
            <Switch label="Sound" checked={sound} onChange={setSound} />
          </div>
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
