import { ImageSlot } from '../ImageSlot'
import { CaseLabel, StatBand, PullQuote, NumBlock } from './CaseBits'

/** Expanded case study 02 — Minerva Academic Dashboard. */
export function MinervaBody() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <ImageSlot label="Minerva dashboard — hero, 1600×1000" ratio="16 / 10" />

      {/* problem stats */}
      <div>
        <CaseLabel>problem — a data graveyard</CaseLabel>
        <StatBand
          stats={[
            { value: '~25s', label: 'to open ONE piece of feedback' },
            { value: '120+', label: 'assignments to review by senior year' },
            { value: '76', label: 'competencies to track' },
            {
              value: '0',
              label: "ways in Forum to see one competency's average across all terms",
            },
          ]}
        />
      </div>

      {/* research */}
      <div>
        <CaseLabel>research — 35 students surveyed</CaseLabel>
        <StatBand
          stats={[
            { value: '80%', label: 'want to view past-course feedback' },
            { value: '83%', label: "dissatisfied with Forum's feedback view" },
            { value: '89%', label: 'would use an external tool' },
            { value: '77%', label: 'push through the slow path anyway' },
          ]}
        />
        <div className="glass mt-8 inline-block rounded-2xl px-6 py-4">
          <p className="font-serif text-xl italic sm:text-2xl">
            “The demand was already there — it was just being underserved.”
          </p>
        </div>
      </div>

      {/* reframe */}
      <div>
        <PullQuote>The real gap wasn’t speed. It was insight.</PullQuote>
        <p className="max-w-2xl leading-relaxed text-ink-soft">
          Even a faster page couldn’t answer “which competencies am I weakest
          in?”
        </p>
      </div>

      {/* key decisions */}
      <div>
        <CaseLabel>key decisions</CaseLabel>
        <div className="grid gap-4 lg:grid-cols-3">
          <NumBlock
            n="01"
            title="Build a new insight layer"
            body="Not a faster version of the old page."
          />
          <NumBlock
            n="02"
            title="Local-first architecture"
            body="Data never leaves the student's device: auth through their own live Forum session, scrape to local SQLite, serve a private localhost dashboard, optional AI summaries."
          />
          <NumBlock
            n="03"
            title="Four modes of analysis"
            body="By HC/LO · By Course · By Term · Score Range — with one persistent filter state."
          />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ImageSlot label="Minerva — filtering UI, 1200×800" />
          <ImageSlot label="Minerva — HC performance view, 1200×800" />
        </div>
      </div>

      {/* implementation — differentiator */}
      <div className="glass-dark rounded-2xl p-6 text-bone sm:p-10">
        <div className="tech-label mb-4 text-acid">
          implementation — designed AND shipped
        </div>
        <p className="max-w-2xl font-serif text-2xl italic leading-snug sm:text-3xl">
          “I didn’t stop at Figma. I implemented the front-end and parts of the
          back-end with AI tooling — then made sure I understood every piece
          well enough to debug and defend it.”
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <div className="tech-label mb-2 text-bone/60">front-end</div>
            <p className="text-sm leading-relaxed text-bone/90">
              Next.js dashboard with real loading / empty / error states.
            </p>
          </div>
          <div>
            <div className="tech-label mb-2 text-bone/60">back-end</div>
            <p className="text-sm leading-relaxed text-bone/90">
              Session auth + local SQLite database.
            </p>
          </div>
          <div>
            <div className="tech-label mb-2 text-bone/60">AI layer</div>
            <p className="text-sm leading-relaxed text-bone/90">
              OpenAI summaries distilling feedback per competency.
            </p>
          </div>
        </div>
      </div>

      {/* validation */}
      <div>
        <CaseLabel>validation — recorded MVP session (~50 min)</CaseLabel>
        <PullQuote attribution="Chaeyeon Kim, third-year student">
          This is really nice — what I wanted from Forum! The average scores of
          all HCs; once I graduate a course, I lose track of them.
        </PullQuote>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          Testing changed <strong className="text-ink">4 concrete decisions</strong>:
          the GPA-disclaimer, multi-select discoverability, filter propagation,
          and dead affordances.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ImageSlot label="Minerva — AI summary card, 1200×800" />
          <ImageSlot label="Minerva — v0 → final iteration comparison, 1200×800" />
        </div>
      </div>

      {/* color decision */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex gap-1.5" aria-hidden>
          {['#d64545', '#e8923a', '#e5c93d', '#8fbf4d', '#3f9b63'].map((c) => (
            <span
              key={c}
              className="h-10 w-10 rounded-lg border border-ink/10"
              style={{ background: c }}
            />
          ))}
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-soft">
          <strong className="text-ink">Color decision:</strong> reused
          Minerva’s existing grade colors (1→5) instead of inventing a palette,
          so charts read instantly.
        </p>
      </div>

      {/* impact */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl border-l-4 border-l-acid-deep p-6 sm:p-8">
          <div className="tech-label mb-3 text-acid-deep">proven</div>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>· Demonstrated problem (35-student survey)</li>
            <li>· A shipped working platform any student can run</li>
            <li>· A cross-term average Forum can’t produce</li>
            <li>· 4 decisions changed by real testing</li>
          </ul>
        </div>
        <div className="glass rounded-2xl border-l-4 border-l-blu p-6 sm:p-8">
          <div className="tech-label mb-3 text-blu">next</div>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>· Instrument time-to-insight</li>
            <li>· Measure return behavior</li>
            <li>· A hosted version</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
