/** Trail — the hiking scene opens the page, then who he is, then how to reach him. Mouse, touch or keyboard. */
import { useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Switch } from '../../components/ui/Controls'
import { Segmented } from '../../components/ui/Segmented'
import { links, profile } from '../../content'
import { usePrefs } from '../../lib/prefs'
import { close, fadeUp, open, reveal } from '../../lib/motion'
import { About } from './About'
import { mountTrail, type TrailOptions } from './scene'

type ThoughtStyle = TrailOptions['mode']

/* Five ways Hayk's thoughts can surface; `?thought=1…5` picks one for sharing. */
const STYLES = [
  { value: 1, label: 'Cloud', title: 'Inside the rain cloud — compact 14 on grey' },
  { value: 2, label: 'Type', title: 'No cloud — compact 14 typed out over his head, with soft key ticks' },
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
  return STYLES.some((s) => s.value === q) ? (q as ThoughtStyle) : 2
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
          aria-label="A winding trail through a valley of hills, past houses, waterfalls, a pond, coyotes and butterflies. Hold the up arrow to walk Hayk up the trail and the down arrow to walk him back. When he sits down, press Space or Enter to get him back on his feet, and at the top, to send him home."
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
  const [style, setStyle] = useState<ThoughtStyle>(initialStyle)
  const [said, setSaid] = useState<string | null>(null)
  const [sound, setSound] = useState(initialSound)
  /* once he's been up and back, his send-off becomes a real way down to meet him */
  const [finished, setFinished] = useState(false)
  /* the thought-style picker is a design exploration, so presentation mode (?ui=0) hides it */
  const { showUi } = usePrefs()
  /* one live object the scene reads every frame, so switching style or sound never remounts it */
  const opts = useRef<TrailOptions>({ mode: style, onThought: setSaid, sound, onFinale: () => setFinished(true) })
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
        {/* the first screen is the scene and nothing else; everything about him comes after it */}
        <section className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
          <motion.div {...fadeUp(0.1, reduced)} className="relative flex w-full justify-center">
            <TrailStage opts={opts} />
            {/* his send-off at the end of the walk; it hangs below the scene so nothing shifts */}
            <AnimatePresence initial={false}>
              {finished && (
                <motion.a
                  href="#about"
                  initial={reduced ? false : { opacity: 0, y: 6, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: open }}
                  className="absolute left-1/2 top-full mt-4 inline-flex h-11 -translate-x-1/2 items-center rounded-full bg-ink px-5 text-compact text-white hover:bg-pressed"
                >
                  About me ↓
                </motion.a>
              )}
            </AnimatePresence>
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
        </section>

        <About />

        {/* the case studies are off for now; ProjectPane and CaseDialog are still there to bring back */}
        {/* the page ends with a way to reach him, on the about's column so the page reads down one line */}
        <section id="contact" className="mx-auto w-full max-w-2xl px-6 pb-16 sm:px-8">
          <motion.p {...inView} className="max-w-4xl text-balance font-display text-role text-ink-muted sm:text-specimen">
            {profile.contactLine.lead} <span className="rounded-mark bg-accent px-2 text-ink">{profile.contactLine.accent}</span>
            {profile.contactLine.end}
          </motion.p>
          <ul className="mt-10 flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.href}
                  title={l.note}
                  className="glass inline-flex h-11 items-center rounded-full px-5 text-secondary text-ink-muted transition-transform duration-[260ms] hover:-translate-y-0.5 hover:text-ink-active"
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4 text-caption text-ink-muted">
            <span>
              © {new Date().getFullYear()} {profile.name} · {profile.location}
            </span>
            {/* the scene's settings live down here, out of the way of the first screen */}
            <span className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {showUi && <Segmented label="Thought style" value={style} onChange={pickStyle} options={STYLES} size="compact" />}
              <Switch label="Sound" checked={sound} onChange={setSound} />
              <span>{profile.colophon}</span>
            </span>
          </footer>
        </section>
      </main>

    </div>
  )
}
