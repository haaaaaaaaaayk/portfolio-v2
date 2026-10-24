import { useClock } from '../hooks/useClock'
import { Container, RailLayout, SectionHead } from './Section'

import { links as LINKS, profile } from '../content'

export function Contact() {
  const time = useClock()
  return (
    <section id="contact" className="relative pb-32 pt-24 sm:pb-36 sm:pt-32">
      <Container>
        <SectionHead n="04" title="Contact" />
        <RailLayout rail={<p>{profile.looking}</p>}>
          <p className="max-w-4xl font-display text-role text-ink sm:text-specimen xl:text-display">
            {profile.contactLine.lead}{' '}
            <span className="rounded-mark bg-accent px-2">{profile.contactLine.accent}</span>
            {profile.contactLine.end}
          </p>

          <ul className="mt-12 flex flex-wrap gap-2">
            {LINKS.map((l) => (
              <li key={l.label}>
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
        </RailLayout>

        <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4 text-caption text-ink-muted">
          <span>
            © {new Date().getFullYear()} {profile.name} · {profile.location} ·{' '}
            <span className="tabular-nums">{time}</span> local
          </span>
          <span>{profile.colophon}</span>
        </footer>
      </Container>
    </section>
  )
}
