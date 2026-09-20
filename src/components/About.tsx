import { motion, useReducedMotion } from 'framer-motion'
import { Mascot } from './Mascot'

const CAPABILITIES = [
  'Product Design',
  'Design Engineering',
  'Research',
  'Prototyping',
  'Front-end',
]

const CITIES = [
  'SFO 37.77°N',
  'SEL 37.56°N',
  'BER 52.52°N',
  'BUE 34.60°S',
  'TPE 25.03°N',
  'TYO 35.68°N',
]

export function About() {
  const reduced = useReducedMotion()
  return (
    <section id="about" className="relative mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="tech-label text-acid-deep">§ 02</span>
        <h2 className="font-grotesk text-sm font-bold uppercase tracking-[0.2em]">
          About
        </h2>
      </div>

      <motion.p
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl text-xl leading-relaxed text-ink sm:text-2xl sm:leading-relaxed"
      >
        I’ve been the PM, the designer, the one opening the terminal, and the
        one hanging art in a gallery. I’ve studied and interned across San
        Francisco, Seoul, Berlin, Buenos Aires, Taipei, and Tokyo — bringing a
        multidisciplinary, global read on the patterns that shape good
        products.
      </motion.p>

      <div className="mt-10 flex flex-wrap gap-2.5">
        {CAPABILITIES.map((c, i) => (
          <motion.span
            key={c}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
            className="glass rounded-full px-4 py-2 text-sm font-medium"
          >
            {c}
          </motion.span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
        {CITIES.map((c) => (
          <span key={c} className="tech-label text-ink-soft">
            {c}
          </span>
        ))}
      </div>

      {/* idle mascot keeping the section company */}
      <div className="pointer-events-none absolute right-4 top-24 hidden opacity-90 lg:block">
        <Mascot mode="idle" size={64} />
      </div>
    </section>
  )
}
