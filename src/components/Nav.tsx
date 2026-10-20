import { useActiveSection } from '../hooks/useActiveSection'

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'resume', label: 'Résumé' },
]

/**
 * Floating navigation — the 24th System's bottom pill: a glass segment
 * for the sections, with the current one raised, and a dark "Let’s talk".
 */
export function Nav() {
  const active = useActiveSection(['top', 'work', 'about', 'resume', 'contact'])

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6"
    >
      <div className="flex items-center gap-2">
        <div className="glass flex items-center gap-1 rounded-full p-1.5">
          {LINKS.map((l) => {
            const current = active === l.id
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                aria-current={current ? 'location' : undefined}
                className={`inline-flex h-8 items-center rounded-full px-3.5 text-compact transition-[background-color,color,box-shadow] duration-[260ms] ease-(--ease-close) sm:px-4 ${
                  current
                    ? 'bg-white text-ink shadow-[0_1px_2px_rgb(22_22_22/8%)]'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {l.label}
              </a>
            )
          })}
        </div>
        <a
          href="#contact"
          aria-current={active === 'contact' ? 'location' : undefined}
          className="glass-dark inline-flex h-11 items-center rounded-full px-5 text-compact text-white transition-colors duration-[260ms] hover:bg-pressed"
        >
          Let’s talk
        </a>
      </div>
    </nav>
  )
}
