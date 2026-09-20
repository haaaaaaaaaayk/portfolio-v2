import { useClock } from '../hooks/useClock'
import { Magnetic } from './Magnetic'

const LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Résumé', href: '#resume' },
  { label: 'Contact', href: '#contact' },
]

export function Nav() {
  const time = useClock()
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-5">
      <nav
        aria-label="Primary"
        className="glass flex w-full max-w-5xl items-center justify-between gap-2 rounded-full py-2 pl-5 pr-2"
      >
        <a
          href="#top"
          className="font-grotesk text-sm font-bold uppercase tracking-tight"
        >
          Hayk&nbsp;S.
        </a>
        <div className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((l) => (
            <Magnetic key={l.href} strength={0.2}>
              <a
                href={l.href}
                className="rounded-full px-2.5 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-ink hover:text-bone sm:px-3.5"
              >
                {l.label}
              </a>
            </Magnetic>
          ))}
          <span
            className="tech-label ml-1 hidden rounded-full bg-ink px-3 py-2 text-acid tabular-nums sm:block"
            title="Local time"
          >
            {time}
          </span>
        </div>
      </nav>
    </header>
  )
}
