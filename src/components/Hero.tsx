import { motion, useReducedMotion } from 'framer-motion'
import { useClock } from '../hooks/useClock'
import { profile } from '../content'
import { Container } from './Section'

const reveal = (delay: number, reduced: boolean | null) =>
  reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.72, delay, ease: [0.22, 0.61, 0.36, 1] as const },
      }

/**
 * Hero — a chapter opener. Name at display size in the single weight,
 * the statement underneath, availability on glass in the rail.
 */
export function Hero() {
  const time = useClock()
  const reduced = useReducedMotion()

  return (
    <section id="top" className="relative flex min-h-svh flex-col">
      <Container className="flex min-h-svh flex-col">
        <header className="flex h-14 items-center justify-between border-b border-rule">
          <a href="#top" className="text-secondary text-ink-muted hover:text-ink-active">
            {profile.name} <span className="hidden sm:inline">Portfolio</span>
          </a>
          <span className="text-compact text-ink-muted tabular-nums">
            {profile.location} · {time}
          </span>
        </header>

        <div className="grid flex-1 content-center gap-10 py-16 lg:grid-cols-4 lg:gap-6">
          <motion.div
            {...reveal(0.1, reduced)}
            className="flex flex-col gap-4 lg:col-span-1 lg:pt-6"
          >
            <span className="glass inline-flex h-8 w-fit items-center gap-2 rounded-full px-3 text-compact">
              <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
              {profile.availability}
            </span>
            <p className="max-w-xs text-secondary text-ink-muted">{profile.intro}</p>
          </motion.div>

          <div className="lg:col-span-3">
            <motion.h1
              {...reveal(0, reduced)}
              className="font-display text-[clamp(64px,11vw,176px)] leading-[0.95]"
            >
              {profile.firstName}
              <br />
              {profile.lastName}
            </motion.h1>
            <motion.p
              {...reveal(0.2, reduced)}
              className="mt-8 max-w-3xl text-title text-ink-muted sm:text-role"
            >
              {profile.statement.lead}{' '}
              <span className="text-ink-muted">{profile.statement.tail}</span>
            </motion.p>
          </div>
        </div>

        <a
          href="#work"
          className="reading-link mb-24 w-fit text-compact sm:mb-28"
        >
          Selected work ↓
        </a>
      </Container>
    </section>
  )
}
