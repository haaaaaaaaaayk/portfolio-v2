import { useClock } from '../hooks/useClock'
import { Magnetic } from './Magnetic'
import { Mascot } from './Mascot'

// [LINK: ...] placeholders — point each href at the real destination
const LINKS = [
  { label: 'Email', href: '#', note: '[LINK: mailto]' },
  { label: 'LinkedIn', href: '#', note: '[LINK: linkedin]' },
  { label: 'Instagram', href: '#', note: '[LINK: instagram]' },
  { label: 'GitHub', href: '#', note: '[LINK: github]' },
]

export function Contact() {
  const time = useClock()
  return (
    <section id="contact" className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 sm:pt-32">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="tech-label text-acid-deep">§ 04</span>
        <h2 className="font-grotesk text-sm font-bold uppercase tracking-[0.2em]">
          Contact
        </h2>
      </div>

      <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-14">
        <div aria-hidden className="halftone absolute inset-0 opacity-60" />
        <div className="relative">
          <p className="max-w-2xl font-grotesk text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl">
            Let’s build something people{' '}
            <span className="bg-acid px-2 italic">trust</span>.
          </p>
          <p className="mt-6 max-w-md font-serif text-xl italic text-ink-soft">
            Currently looking for product design roles at startups in San
            Francisco.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {LINKS.map((l) => (
              <Magnetic key={l.label} strength={0.3}>
                <a
                  href={l.href}
                  title={l.note}
                  className="glass-dark inline-block rounded-full px-7 py-3.5 font-grotesk text-lg font-bold text-bone transition-colors hover:text-acid"
                >
                  {l.label} ↗
                </a>
              </Magnetic>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-end justify-between gap-6 border-t border-ink/10 pt-6">
            <div className="tech-label text-ink-soft">
              © {new Date().getFullYear()} Hayk Sargsyan · San Francisco ·{' '}
              <span className="tabular-nums text-ink">{time}</span> local
            </div>
            <div className="tech-label text-ink-soft">
              designed + built by hand (and a little AI)
            </div>
          </div>
        </div>

        {/* idle mascot waving goodbye */}
        <div className="pointer-events-none absolute bottom-4 right-6 hidden sm:block">
          <Mascot mode="idle" size={72} />
        </div>
      </div>
    </section>
  )
}
