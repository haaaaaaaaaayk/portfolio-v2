import { ImageSlot } from '../ImageSlot'
import { CaseLabel, Note, NumBlock, PullQuote, StatBand } from './CaseBits'

/** Expanded case study 02 — Minerva Academic Dashboard. */
export function MinervaBody() {
  return (
    <div className="space-y-16">
      <ImageSlot label="Minerva dashboard — hero, 1600×1000" ratio="16 / 10" />

      <div>
        <CaseLabel>Problem — a data graveyard</CaseLabel>
        <StatBand
          stats={[
            { value: '~25s', label: 'To open one piece of feedback' },
            { value: '120+', label: 'Assignments to review by senior year' },
            { value: '76', label: 'Competencies to track' },
            {
              value: '0',
              label: "Ways in Forum to see one competency's average across all terms",
            },
          ]}
        />
      </div>

      <div>
        <CaseLabel>Research — 35 students surveyed</CaseLabel>
        <StatBand
          stats={[
            { value: '80%', label: 'Want to view past-course feedback' },
            { value: '83%', label: "Dissatisfied with Forum's feedback view" },
            { value: '89%', label: 'Would use an external tool' },
            { value: '77%', label: 'Push through the slow path anyway' },
          ]}
        />
        <div className="glass mt-8 inline-block rounded-card px-6 py-4">
          <p className="text-heading text-ink">
            “The demand was already there — it was just being underserved.”
          </p>
        </div>
      </div>

      <div>
        <PullQuote>The real gap wasn’t speed. It was insight.</PullQuote>
        <p className="mt-4 max-w-2xl text-body text-ink-muted">
          Even a faster page couldn’t answer “which competencies am I weakest
          in?”
        </p>
      </div>

      <div>
        <CaseLabel>Key decisions</CaseLabel>
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

      <div className="glass-dark rounded-card p-6 text-white sm:p-10">
        <div className="mb-4 text-compact text-white/60">
          Implementation — designed and shipped
        </div>
        <p className="max-w-2xl text-title sm:text-role">
          “I didn’t stop at Figma. I implemented the front-end and parts of the
          back-end with AI tooling — then made sure I understood every piece
          well enough to debug and defend it.”
        </p>
        <div className="mt-8 grid gap-6 border-t border-white/15 pt-6 sm:grid-cols-3">
          {[
            ['Front-end', 'Next.js dashboard with real loading / empty / error states.'],
            ['Back-end', 'Session auth + local SQLite database.'],
            ['AI layer', 'OpenAI summaries distilling feedback per competency.'],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="mb-2 text-caption text-white/60">{k}</div>
              <p className="text-compact text-white/90">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <CaseLabel>Validation — recorded MVP session (~50 min)</CaseLabel>
        <PullQuote attribution="Chaeyeon Kim, third-year student">
          This is really nice — what I wanted from Forum! The average scores of
          all HCs; once I graduate a course, I lose track of them.
        </PullQuote>
        <p className="mt-4 max-w-2xl text-body text-ink-muted">
          Testing changed <strong>4 concrete decisions</strong>: the
          GPA-disclaimer, multi-select discoverability, filter propagation,
          and dead affordances.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ImageSlot label="Minerva — AI summary card, 1200×800" />
          <ImageSlot label="Minerva — v0 → final iteration comparison, 1200×800" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex gap-1.5" aria-hidden>
          {['#d64545', '#e8923a', '#e5c93d', '#8fbf4d', '#3f9b63'].map((c) => (
            <span
              key={c}
              className="h-10 w-10 rounded-mark border border-rule"
              style={{ background: c }}
            />
          ))}
        </div>
        <p className="max-w-md text-compact text-ink-muted">
          <strong>Color decision:</strong> reused Minerva’s existing grade
          colors (1→5) instead of inventing a palette, so charts read
          instantly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Note label="Proven" tone="success">
          <ul className="space-y-2 text-compact">
            <li>Demonstrated problem (35-student survey)</li>
            <li>A shipped working platform any student can run</li>
            <li>A cross-term average Forum can’t produce</li>
            <li>4 decisions changed by real testing</li>
          </ul>
        </Note>
        <Note label="Next" tone="media">
          <ul className="space-y-2 text-compact">
            <li>Instrument time-to-insight</li>
            <li>Measure return behavior</li>
            <li>A hosted version</li>
          </ul>
        </Note>
      </div>
    </div>
  )
}
