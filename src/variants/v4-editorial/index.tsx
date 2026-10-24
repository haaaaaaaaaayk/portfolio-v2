import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { LiquidField } from '../../components/LiquidField'
import { CaseArticle } from '../../components/CaseArticle'
import { about, capabilities, cities, experience, links, profile, projects, resume, skills } from '../../content'
import { useClock } from '../../hooks/useClock'

export default function Editorial() {
  const time = useClock()
  const reduced = useReducedMotion()
  const xRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const { scrollXProgress } = useScroll({ container: xRef })
  const mastH = useTransform(scrollY, [0, 180], [168, 56])
  const nameSize = useTransform(scrollY, [0, 180], [reduced ? 48 : 96, 20])
  const nameLh = useTransform(scrollY, [0, 180], [reduced ? 56 : 104, 28])
  const fadeSub = useTransform(scrollY, [0, 80], [1, 0])
  const progressW = useTransform(scrollXProgress, [0, 1], ['0%', '100%'])

  return (
    <div className="relative min-h-svh bg-paper">
      <LiquidField intensity={0.55} />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5 bg-rule">
        <motion.div className="h-full bg-accent origin-left" style={{ width: progressW }} />
      </div>

      <motion.header
        style={{ height: reduced ? 56 : mastH }}
        className="glass glass-edge sticky top-0 z-30 overflow-hidden"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-4 pr-36 sm:px-8 sm:pr-52">
          <div className="min-w-0">
            <motion.h1
              style={{ fontSize: reduced ? 20 : nameSize, lineHeight: reduced ? '28px' : nameLh }}
              className="truncate font-display"
            >
              {profile.name}
            </motion.h1>
            {!reduced && (
              <motion.p style={{ opacity: fadeSub }} className="hidden text-compact text-ink-muted sm:block">
                {profile.role} · {profile.location}
              </motion.p>
            )}
          </div>
          <span className="shrink-0 text-compact tabular-nums text-ink-muted">{time}</span>
        </div>
      </motion.header>

      <main className="relative z-10">
        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 sm:py-16 lg:px-16">
          <p className="glass mb-16 inline-flex h-11 items-center gap-2 rounded-full px-4 text-compact">
            <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
            {profile.availability}
          </p>
          <h2 className="max-w-5xl font-display text-[clamp(40px,12vw,96px)] leading-[1.08]">
            {profile.statement.lead}{' '}
            <span className="text-ink-muted">{profile.statement.tail}</span>
          </h2>
          <p className="mt-8 max-w-xl text-title text-ink-muted">{profile.intro}</p>
        </section>

        <section aria-label="Case studies" className="border-y border-rule">
          <div
            ref={xRef}
            className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
          >
            {projects.map((p, i) => (
              <article
                key={p.id}
                className="flex h-[100svh] w-screen shrink-0 snap-start flex-col overflow-y-auto px-4 py-16 sm:px-8 lg:px-16"
              >
                <p className="text-compact tabular-nums text-ink-muted">
                  Case {p.index} · {i + 1} / {projects.length} · swipe sideways
                </p>
                <div className="mx-auto mt-8 w-full max-w-5xl">
                  <CaseArticle project={p} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <Marquee />

        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-16">
          <p className="text-compact text-ink-muted">About</p>
          <p className="mt-8 max-w-4xl text-role text-ink sm:text-specimen">
            {about.lead} <span className="text-ink-muted">{about.tail}</span>
          </p>
          <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c) => (
              <li key={c.name} className="glass rounded-card p-4">
                <div className="text-heading text-ink">{c.name}</div>
                <div className="text-compact tabular-nums text-ink-muted">{c.lat}</div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            {capabilities.map((c) => (
              <span key={c} className="glass inline-flex h-11 items-center rounded-full px-4 text-compact">
                {c}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-16">
          <p className="text-compact text-ink-muted">Résumé</p>
          <div className="glass glass-edge mt-8 rounded-card p-6 sm:p-8">
            <h3 className="text-title">{resume.title}</h3>
            <p className="mt-4 max-w-2xl text-body text-ink-muted">{resume.summary}</p>
            <ul className="mt-8 space-y-4">
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
              className="ctl ctl-primary mt-8 inline-flex w-fit items-center"
            >
              {resume.downloadLabel}
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-16">
          <p className="text-compact text-ink-muted">Contact</p>
          <p className="mt-8 max-w-5xl font-display text-[clamp(40px,12vw,96px)] leading-[1.08] text-ink">
            {profile.contactLine.lead}{' '}
            <span className="rounded-mark bg-accent px-2">{profile.contactLine.accent}</span>
            {profile.contactLine.end}
          </p>
          <p className="mt-6 text-title text-ink-muted">{profile.looking}</p>
          <ul className="mt-12 flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.id}>
                <a href={l.href} title={l.note} className="glass inline-flex h-11 items-center rounded-full px-5 text-secondary text-ink-muted hover:text-ink-active">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t border-rule pt-4 text-caption text-ink-muted">
            <span>
              © {new Date().getFullYear()} {profile.name} · {profile.location}
            </span>
            <span>{profile.colophon}</span>
          </footer>
        </section>
      </main>
    </div>
  )
}

function Marquee() {
  const items = [...skills, ...skills]
  return (
    <div className="overflow-hidden border-b border-rule py-8">
      <div className="marquee-track flex w-max gap-8 pr-8">
        {items.map((s, i) => (
          <span key={`${s}-${i}`} className="text-title text-ink-muted whitespace-nowrap">
            {s}
            <span className="ml-8 text-accent">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
