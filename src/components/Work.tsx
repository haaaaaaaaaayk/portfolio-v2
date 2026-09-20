import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ImageSlot } from './ImageSlot'
import { Mascot } from './Mascot'
import { MymizuBody } from './cases/MymizuBody'
import { MinervaBody } from './cases/MinervaBody'

type CaseId = 'mymizu' | 'minerva'

interface CaseMeta {
  id: CaseId
  index: string
  title: string
  hook: string
  tags: string[]
  meta: { k: string; v: string }[]
  cardSlot: { label: string; ratio: string }
  body: () => ReactNode
}

const CASES: CaseMeta[] = [
  {
    id: 'mymizu',
    index: '01',
    title: 'Designing in-app donations without breaking trust',
    hook: 'A free, ad-free water-refill app with 500K+ downloads needed to fund itself — without betraying the free-by-principle promise.',
    tags: ['Mobile', 'Payments', 'Trust', 'AI-assisted research'],
    meta: [
      { k: 'role', v: 'Sole Designer' },
      { k: 'company', v: 'mymizu (Japan)' },
      { k: 'tools', v: 'Figma · Claude · Adobe CC · Gemini' },
      { k: 'duration', v: '100 hrs (Internship)' },
    ],
    cardSlot: { label: 'mymizu — card cover, 1200×900', ratio: '4 / 3' },
    body: () => <MymizuBody />,
  },
  {
    id: 'minerva',
    index: '02',
    title: 'From data graveyard to strategic dashboard',
    hook: "Minerva's feedback lived behind a 25-second click-path most students dreaded. I designed AND shipped the fix — front-end, some back-end, tests, SQL — into one private, searchable dashboard.",
    tags: ['Design Engineering', 'Dashboard', 'Local-first', 'AI'],
    meta: [
      { k: 'role', v: 'Design Engineer (research → design → implementation)' },
      { k: 'team', v: '3-person Scrum (PM · back-end eng · design engineer = Hayk)' },
      {
        k: 'stack',
        v: 'Next.js · React · Python · OpenAI + AI-assisted build (Claude, v0, Cursor)',
      },
    ],
    cardSlot: { label: 'Minerva dashboard — card cover, 1200×750', ratio: '8 / 5' },
    body: () => <MinervaBody />,
  },
]

const spring = { type: 'spring' as const, stiffness: 210, damping: 26 }

export function Work() {
  const [openId, setOpenId] = useState<CaseId | null>(null)
  const reduced = useReducedMotion()
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const openCase = CASES.find((c) => c.id === openId)

  // scroll lock + Escape + focus management while a case is open
  useEffect(() => {
    if (!openId) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null)
    }
    window.addEventListener('keydown', onKey)
    closeBtnRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [openId])

  return (
    <section id="work" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="mb-14 flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <span className="tech-label text-acid-deep">§ 01</span>
          <h2 className="font-grotesk text-sm font-bold uppercase tracking-[0.2em]">
            Selected Work
          </h2>
        </div>
        <span className="tech-label hidden text-ink-soft sm:block">
          n = 2 · click to expand
        </span>
      </div>

      {/* intentionally asymmetric canvas grid */}
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <CaseCard
          c={CASES[0]}
          className="lg:col-span-7"
          onOpen={() => setOpenId('mymizu')}
          hidden={openId === 'mymizu'}
        />
        <CaseCard
          c={CASES[1]}
          className="lg:col-span-5 lg:mt-24"
          onOpen={() => setOpenId('minerva')}
          hidden={openId === 'minerva'}
        />
      </div>

      {/* mascot hops whenever a case study opens */}
      <div className="pointer-events-none absolute -bottom-4 left-6 hidden lg:block">
        <Mascot mode="hop" hopKey={openId ?? 'closed'} size={60} />
      </div>

      {/* expanded case-study overlay */}
      <AnimatePresence>
        {openCase && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60] overflow-y-auto bg-ink/25 p-2 backdrop-blur-sm sm:p-4 lg:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpenId(null)
            }}
          >
            <motion.article
              layoutId={reduced ? undefined : `case-${openCase.id}`}
              transition={spring}
              role="dialog"
              aria-modal="true"
              aria-label={`Case study: ${openCase.title}`}
              className="glass mx-auto min-h-full max-w-5xl rounded-3xl"
            >
              <div className="p-5 sm:p-10 lg:p-14">
                {/* sticky close */}
                <div className="sticky top-3 z-10 flex justify-end sm:top-5">
                  <button
                    ref={closeBtnRef}
                    onClick={() => setOpenId(null)}
                    className="glass-dark rounded-full px-5 py-2.5 text-sm font-medium text-bone transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-acid-deep"
                  >
                    Close ✕ <span className="tech-label ml-1 text-bone/50">esc</span>
                  </button>
                </div>

                <motion.header
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="mb-12 mt-2"
                >
                  <div className="font-grotesk text-7xl font-black text-acid-deep/90 sm:text-8xl">
                    {openCase.index}
                  </div>
                  <h3 className="mt-4 max-w-3xl font-grotesk text-3xl font-black uppercase leading-[1.02] tracking-tight sm:text-5xl">
                    {openCase.title}
                  </h3>
                  <p className="mt-6 max-w-2xl font-serif text-xl italic leading-snug text-ink-soft sm:text-2xl">
                    {openCase.hook}
                  </p>
                  <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-ink/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                    {openCase.meta.map((m) => (
                      <div key={m.k}>
                        <dt className="tech-label text-ink-soft">{m.k}</dt>
                        <dd className="mt-1 text-sm font-medium leading-snug">
                          {m.v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </motion.header>

                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.55 }}
                >
                  {openCase.body()}
                </motion.div>

                <div className="mt-16 flex justify-center">
                  <button
                    onClick={() => setOpenId(null)}
                    className="glass rounded-full px-8 py-3 font-medium transition-transform hover:scale-105"
                  >
                    ← Back to work
                  </button>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function CaseCard({
  c,
  className = '',
  onOpen,
  hidden,
}: {
  c: CaseMeta
  className?: string
  onOpen: () => void
  hidden: boolean
}) {
  const reduced = useReducedMotion()
  return (
    <motion.button
      layoutId={reduced ? undefined : `case-${c.id}`}
      transition={spring}
      onClick={onOpen}
      whileHover={reduced ? undefined : { y: -6 }}
      aria-haspopup="dialog"
      className={`glass sheen group block w-full rounded-3xl p-6 text-left transition-shadow hover:shadow-glass-lift focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid-deep sm:p-8 ${className}`}
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-grotesk text-5xl font-black text-acid-deep/80">
          {c.index}
        </span>
        <span className="tech-label rounded-full border border-ink/15 px-3 py-1.5 text-ink-soft transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-acid">
          expand +
        </span>
      </div>
      <h3 className="mt-6 font-grotesk text-2xl font-black uppercase leading-[1.05] tracking-tight sm:text-3xl">
        {c.title}
      </h3>
      <p className="tech-label mt-3 text-ink-soft normal-case">{c.meta[0].v}</p>
      <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">{c.hook}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {c.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink-soft"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-6">
        <ImageSlot label={c.cardSlot.label} ratio={c.cardSlot.ratio} />
      </div>
    </motion.button>
  )
}
