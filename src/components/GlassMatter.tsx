import type { MouseEvent } from 'react'
import { ImageSlot } from './ImageSlot'
import { about, capabilities, cities, experience, links, profile, projects, resume } from '../content'
import type { CaseId, Project } from '../content/projects'

export function ProjectPane({
  project,
  onOpen,
  kicker,
}: {
  project: Project
  onOpen: (id: CaseId, e: MouseEvent<HTMLButtonElement>) => void
  kicker?: string
}) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(project.id, e)}
      className="glass glass-edge sheen rounded-card p-5 text-left transition-[box-shadow] duration-[260ms] hover:shadow-glass-lift"
    >
      <p className="text-caption text-ink-muted tabular-nums">{kicker ?? `Case ${project.index}`}</p>
      <h2 className="mt-2 text-title">{project.title}</h2>
      <p className="mt-3 text-compact text-ink-muted">{project.hook}</p>
      <ImageSlot label={project.cardSlot.label} ratio={project.cardSlot.ratio} className="mt-4" />
      <span className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-4 text-compact text-white">
        Open case
      </span>
    </button>
  )
}

export function AboutPane() {
  return (
    <section className="glass glass-edge rounded-card p-5 sm:p-8">
      <p className="text-caption text-ink-muted">About</p>
      <p className="mt-4 text-heading">
        {about.lead} <span className="text-ink-muted">{about.tail}</span>
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {cities.map((c) => (
          <li key={c.name}>
            <div className="text-compact">{c.name}</div>
            <div className="text-caption tabular-nums text-ink-muted">{c.lat}</div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        {capabilities.map((c) => (
          <span key={c} className="inline-flex h-8 items-center rounded-full border border-rule px-3 text-caption">
            {c}
          </span>
        ))}
      </div>
    </section>
  )
}

export function ResumePane() {
  return (
    <section className="glass glass-edge rounded-card p-5 sm:p-8">
      <p className="text-caption text-ink-muted">Résumé</p>
      <h2 className="mt-2 text-title">{resume.title}</h2>
      <p className="mt-3 text-compact text-ink-muted">{resume.summary}</p>
      <ul className="mt-6 space-y-3">
        {experience.map((row) => (
          <li key={row.id} className="border-t border-rule pt-3">
            <div className="text-compact">{row.org}</div>
            <div className="text-caption text-ink-muted">{row.role}</div>
          </li>
        ))}
      </ul>
      <a href={resume.pdfHref} title={resume.pdfNote} className="ctl ctl-primary mt-6 inline-flex w-fit items-center">
        {resume.downloadLabel}
      </a>
    </section>
  )
}

export function ContactPane({ ink = false }: { ink?: boolean }) {
  return (
    <section className={`rounded-card p-5 sm:p-8 ${ink ? 'glass-dark text-white' : 'glass glass-edge'}`}>
      <p className={`text-caption ${ink ? 'text-white/60' : 'text-ink-muted'}`}>Contact</p>
      <p className="mt-3 text-title">
        {profile.contactLine.lead}{' '}
        <span className="rounded-mark bg-accent px-1 text-ink">{profile.contactLine.accent}</span>
        {profile.contactLine.end}
      </p>
      <p className={`mt-3 text-compact ${ink ? 'text-white/70' : 'text-ink-muted'}`}>{profile.looking}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.id}>
            <a
              href={l.href}
              title={l.note}
              className={`inline-flex h-11 items-center rounded-full px-4 text-compact ${
                ink ? 'bg-white/10 text-white' : 'bg-control'
              }`}
            >
              {l.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function WorkPanes({
  onOpen,
}: {
  onOpen: (id: CaseId, e: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <>
      {projects.map((p) => (
        <ProjectPane key={p.id} project={p} onOpen={onOpen} />
      ))}
    </>
  )
}

