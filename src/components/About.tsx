import { motion, useReducedMotion } from 'framer-motion'
import { Container, RailLayout, SectionHead } from './Section'

import { about, capabilities as CAPABILITIES, cities } from '../content'

export function About() {
  const reduced = useReducedMotion()
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <Container>
        <SectionHead n="02" title="About" />
        <RailLayout
          rail={
            <>
              <p>{about.railNote}</p>
              <ul className="mt-4 space-y-1 text-compact">
                {cities.map((c) => (
                  <li key={c.name} className="flex justify-between gap-4 tabular-nums">
                    <span className="text-ink">{c.name}</span>
                    <span>{c.lat}</span>
                  </li>
                ))}
              </ul>
            </>
          }
        >
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.72, ease: [0.22, 0.61, 0.36, 1] }}
            className="max-w-3xl text-title sm:text-role"
          >
            {about.lead} <span className="text-ink-muted">{about.tail}</span>
          </motion.p>

          <ul className="mt-10 flex flex-wrap gap-2">
            {CAPABILITIES.map((c, i) => (
              <motion.li
                key={c}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.36, ease: [0.22, 0.61, 0.36, 1] }}
                className="glass inline-flex h-11 items-center rounded-full px-5 text-secondary"
              >
                {c}
              </motion.li>
            ))}
          </ul>
        </RailLayout>
      </Container>
    </section>
  )
}
