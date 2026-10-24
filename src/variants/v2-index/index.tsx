import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LiquidField } from '../../components/LiquidField'
import { CaseArticle } from '../../components/CaseArticle'
import { ImageSlot } from '../../components/ImageSlot'
import { about, capabilities, cities, experience, links, profile, projects, resume } from '../../content'
import { close, open } from '../../lib/motion'
import { useClock } from '../../hooks/useClock'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { CaseId } from '../../content/projects'

type RowId = CaseId | 'about' | 'resume' | 'contact'

const ROWS: { id: RowId; index: string; title: string; kicker: string }[] = [
  { id: 'mymizu', index: '01', title: projects[0].title, kicker: projects[0].name },
  { id: 'minerva', index: '02', title: projects[1].title, kicker: projects[1].name },
  { id: 'about', index: '03', title: about.lead, kicker: 'About' },
  { id: 'resume', index: '04', title: resume.title, kicker: 'Résumé' },
  { id: 'contact', index: '05', title: `${profile.contactLine.lead} ${profile.contactLine.accent}${profile.contactLine.end}`, kicker: 'Contact' },
]

export default function IndexVariant() {
  const time = useClock()
  const reduced = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)')
  const [openId, setOpenId] = useState<RowId | null>(null)
  const [hover, setHover] = useState<CaseId | null>(null)
  const preview = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!finePointer || reduced) return
    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      const el = preview.current
      if (!el) return
      el.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 40}px, 0)`
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [finePointer, reduced])

  return (
    <div className="relative min-h-svh bg-paper">
      <LiquidField intensity={0.7} />
      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8 sm:py-16 lg:px-16">
        <header className="flex flex-col gap-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-compact text-ink-muted">
              {profile.name} · {profile.location} · <span className="tabular-nums">{time}</span>
            </p>
            <span className="glass inline-flex h-11 items-center gap-2 rounded-full px-4 text-compact">
              <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
              {profile.availability}
            </span>
          </div>
          <div>
            <h1 className="font-display text-role sm:text-specimen">{profile.role}</h1>
            <p className="mt-4 max-w-2xl text-title text-ink-muted">
              {profile.statement.lead} {profile.statement.tail}
            </p>
          </div>
        </header>

        <ol className="mt-16">
          {ROWS.map((row) => {
            const expanded = openId === row.id
            return (
              <li key={row.id} className="border-t border-rule">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenId(expanded ? null : row.id)}
                  onPointerEnter={() => {
                    if (row.id === 'mymizu' || row.id === 'minerva') setHover(row.id)
                  }}
                  onPointerLeave={() => {
                    if (row.id === 'mymizu' || row.id === 'minerva') {
                      setHover((h) => (h === row.id ? null : h))
                    }
                  }}
                  className="flex w-full items-baseline gap-8 py-8 text-left sm:gap-16"
                >
                  <span className="w-8 shrink-0 text-compact tabular-nums text-ink-muted sm:w-16">
                    {row.index}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-caption text-ink-muted">{row.kicker}</span>
                    <span className="mt-1 block text-title text-ink sm:text-role">{row.title}</span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1, transition: open }}
                      exit={{ height: 0, opacity: 0, transition: close }}
                      className="overflow-hidden"
                    >
                      <div className="glass glass-edge mb-16 rounded-card p-4 sm:p-8 lg:ml-24">
                        <Expanded id={row.id} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ol>

        <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t border-rule pt-8 text-caption text-ink-muted">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span>{profile.colophon}</span>
        </footer>
      </main>

      {finePointer && !reduced && hover && !openId && (
        <div
          ref={preview}
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-20 w-[280px]"
          style={
            reduced
              ? undefined
              : { transform: 'translate3d(-999px, -999px, 0)' }
          }
        >
          <div className="glass glass-edge sheen rounded-card p-3 shadow-glass-lift">
            <ImageSlot
              label={projects.find((p) => p.id === hover)!.cardSlot.label}
              ratio={projects.find((p) => p.id === hover)!.cardSlot.ratio}
            />
            <p className="mt-3 text-compact text-ink">{projects.find((p) => p.id === hover)!.name}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Expanded({ id }: { id: RowId }) {
  if (id === 'mymizu' || id === 'minerva') {
    const project = projects.find((p) => p.id === id)!
    return <CaseArticle project={project} />
  }
  if (id === 'about') {
    return (
      <div className="flex flex-col gap-8">
        <p className="max-w-3xl text-title text-ink">
          {about.lead} <span className="text-ink-muted">{about.tail}</span>
        </p>
        <p className="text-compact text-ink-muted">{about.railNote}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {cities.map((c) => (
            <li key={c.name} className="flex justify-between gap-4 border-t border-rule pt-2 text-compact tabular-nums">
              <span>{c.name}</span>
              <span className="text-ink-muted">{c.lat}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {capabilities.map((c) => (
            <span key={c} className="glass inline-flex h-11 items-center rounded-full px-4 text-compact">
              {c}
            </span>
          ))}
        </div>
      </div>
    )
  }
  if (id === 'resume') {
    return (
      <div className="flex flex-col gap-8">
        <p className="max-w-2xl text-body text-ink-muted">{resume.summary}</p>
        <ul className="space-y-4">
          {experience.map((row) => (
            <li key={row.id} className="border-t border-rule pt-4">
              <div className="text-heading text-ink">{row.org}</div>
              <div className="text-compact text-ink-muted">{row.role}</div>
              <div className="text-caption text-ink-muted">{row.note}</div>
            </li>
          ))}
        </ul>
        <a
          href={resume.pdfHref}
          title={resume.pdfNote}
          className="ctl ctl-primary inline-flex w-fit items-center"
        >
          {resume.downloadLabel}
        </a>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-8">
      <p className="text-title text-ink">
        {profile.contactLine.lead}{' '}
        <span className="rounded-mark bg-accent px-1">{profile.contactLine.accent}</span>
        {profile.contactLine.end}
      </p>
      <p className="text-secondary text-ink-muted">{profile.looking}</p>
      <ul className="flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.id}>
            <a href={l.href} title={l.note} className="glass inline-flex h-11 items-center rounded-full px-4 text-compact text-ink-muted hover:text-ink-active">
              {l.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
