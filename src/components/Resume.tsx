import { resume } from '../content'
import { Container, RailLayout, SectionHead } from './Section'

export function Resume() {
  return (
    <section id="resume" className="relative py-24 sm:py-32">
      <Container>
        <SectionHead n="03" title="Résumé" />
        <RailLayout rail={<p>The short version, and the full PDF.</p>}>
          <div className="glass rounded-card p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-xl">
                <h3 className="text-title">{resume.title}</h3>
                <p className="mt-4 text-body text-ink-muted">{resume.summary}</p>
              </div>
              {/* [LINK: résumé PDF] — point this at the real file */}
              <a
                href={resume.pdfHref}
                title={resume.pdfNote}
                className="glass-dark inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-5 text-secondary text-white transition-colors duration-[260ms] hover:bg-pressed"
              >
                {resume.downloadLabel}
              </a>
            </div>
          </div>
        </RailLayout>
      </Container>
    </section>
  )
}
