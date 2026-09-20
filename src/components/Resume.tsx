import { Magnetic } from './Magnetic'

export function Resume() {
  return (
    <section id="resume" className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="tech-label text-acid-deep">§ 03</span>
        <h2 className="font-grotesk text-sm font-bold uppercase tracking-[0.2em]">
          Résumé
        </h2>
      </div>

      <div className="glass halftone-acid rounded-3xl p-8 sm:p-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <h3 className="font-grotesk text-2xl font-black uppercase tracking-tight sm:text-3xl">
              The short version
            </h3>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Product designer and design engineer. Sole-designer internship at
              mymizu (Japan); design-engineered and shipped an academic
              dashboard end-to-end at Minerva. Trained across six cities on
              four continents. Comfortable from research to Figma to the
              terminal.
            </p>
          </div>
          <Magnetic strength={0.3}>
            {/* [LINK: résumé PDF] — point this at the real file */}
            <a
              href="#"
              className="glass-dark inline-block whitespace-nowrap rounded-full px-8 py-4 font-grotesk font-bold uppercase tracking-wide text-acid transition-transform hover:scale-105"
            >
              Résumé PDF ↓
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
