import { ImageSlot } from '../ImageSlot'
import { CaseLabel, StatBand, PullQuote, NumBlock, Exchange } from './CaseBits'

/** Expanded case study 01 — mymizu. Visual-heavy, scannable. */
export function MymizuBody() {
  return (
    <div className="space-y-16 sm:space-y-20">
      {/* hero mock */}
      <ImageSlot label="mymizu — hero mock, 1600×1000" ratio="16 / 10" />

      {/* context stats */}
      <div>
        <CaseLabel>context — a free app, by principle</CaseLabel>
        <StatBand
          stats={[
            { value: '500K+', label: 'downloads' },
            { value: '1M+', label: 'plastic bottles saved' },
            { value: '2,500+', label: 'partner refill spots' },
          ]}
        />
      </div>

      {/* problem */}
      <div>
        <CaseLabel>problem — the ask was invisible</CaseLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumBlock n="P·1" title="Support buried 3 layers deep" />
          <NumBlock
            n="P·2"
            title="“Support us” kicked users to the browser"
            body="70% hit cancel at the hand-off."
          />
          <NumBlock n="P·3" title="Nav bar underused for the core goal" />
          <NumBlock
            n="P·4"
            title="No visual hierarchy"
            body="Only 40% ever reached the ask."
          />
        </div>
      </div>

      {/* north star */}
      <PullQuote>
        If a user never donates, the app must still feel complete.
      </PullQuote>

      {/* solution */}
      <div>
        <CaseLabel>solution — four moves</CaseLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumBlock
            n="01"
            title="Persistent Support tab"
            body="A first-class home in the nav — not a buried menu item."
          />
          <NumBlock
            n="02"
            title="One respectful, dismissible pop-up"
            body="Shown once, at the right moment, easy to decline."
          />
          <NumBlock
            n="03"
            title="Streamlined payment flow"
            body="Six screens — the irreducible minimum."
          />
          <NumBlock
            n="04"
            title="A thank-you moment"
            body="Turns donors into advocates instead of ending on a receipt."
          />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ImageSlot label="mymizu — support tab, 1200×800" />
          <ImageSlot label="mymizu — donation pop-up, 1200×800" />
          <ImageSlot label="mymizu — payment flow (6 screens), 1200×800" />
          <ImageSlot label="mymizu — thank-you screen, 1200×800" />
        </div>
      </div>

      {/* method — directing the AI */}
      <div>
        <CaseLabel>method — directing the AI</CaseLabel>
        <p className="mb-6 max-w-2xl leading-relaxed text-ink-soft">
          I used AI to widen the comparison set — Signal, Wikipedia, Khan
          Academy, Apple IAP, YouVersion, Itch.io — and compile behavioral
          analysis. But the output was a draft to interrogate, not an answer.
        </p>
        <Exchange
          ai="Hiding the donation link is optimal — surfacing the ask triggers psychological reactance and erodes goodwill."
          human="Reactance is real, but timing-based prompts lift conversion without the penalty. Optimize for WHEN we ask, not for hiding the ask."
          caption="AI compressed days of reading into an afternoon. The skepticism and judgment were mine."
        />
      </div>

      {/* messaging framework */}
      <div>
        <CaseLabel>messaging framework — five rules</CaseLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <NumBlock n="R·1" title="Why before what" />
          <NumBlock n="R·2" title="Resilience, not pity" />
          <NumBlock n="R·3" title="Donor as hero" />
          <NumBlock n="R·4" title="No guilt" />
          <NumBlock n="R·5" title="Five-element ceiling per screen" />
        </div>
      </div>

      {/* handoff */}
      <div>
        <CaseLabel>handoff — production-ready, not a concept</CaseLabel>
        <ul className="max-w-2xl space-y-3">
          {[
            'Rebuilt every screen in mymizu’s native design system, QA’d, with real end-to-end interactivity.',
            'Android APK + video walkthrough for the team.',
            'Journey map + annotated messaging docs.',
            'Poster was runner-up for best project at an international forum.',
          ].map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-acid-deep" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <ImageSlot
            label="mymizu — before/after: AI prototype vs rebuilt in design system, 1600×900"
            ratio="16 / 9"
          />
        </div>
      </div>

      {/* honest limitation */}
      <div className="glass rounded-2xl border-l-4 border-l-orange p-6 sm:p-8">
        <div className="tech-label mb-3 text-orange">honest limitation</div>
        <p className="max-w-2xl leading-relaxed">
          Engagement ended at handoff, so live conversion data wasn’t
          available. What’s real: a production-ready system engineers could
          ship as-is, strong stakeholder validation, and a CEO-sparked
          post-donation feature that became the most-praised part.
        </p>
      </div>
    </div>
  )
}
