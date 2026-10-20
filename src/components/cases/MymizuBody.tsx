import { ImageSlot } from '../ImageSlot'
import { CaseLabel, DotList, Exchange, Note, NumBlock, PullQuote, StatBand } from './CaseBits'

/** Expanded case study 01 — mymizu. Visual-heavy, scannable. */
export function MymizuBody() {
  return (
    <div className="space-y-16">
      <ImageSlot label="mymizu — hero mock, 1600×1000" ratio="16 / 10" />

      <div>
        <CaseLabel>Context — a free app, by principle</CaseLabel>
        <StatBand
          stats={[
            { value: '500K+', label: 'Downloads' },
            { value: '1M+', label: 'Plastic bottles saved' },
            { value: '2,500+', label: 'Partner refill spots' },
          ]}
        />
      </div>

      <div>
        <CaseLabel>Problem — the ask was invisible</CaseLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumBlock n="P1" title="Support buried 3 layers deep" />
          <NumBlock
            n="P2"
            title="“Support us” kicked users to the browser"
            body="70% hit cancel at the hand-off."
          />
          <NumBlock n="P3" title="Nav bar underused for the core goal" />
          <NumBlock n="P4" title="No visual hierarchy" body="Only 40% ever reached the ask." />
        </div>
      </div>

      <PullQuote>If a user never donates, the app must still feel complete.</PullQuote>

      <div>
        <CaseLabel>Solution — four moves</CaseLabel>
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

      <div>
        <CaseLabel>Method — directing the AI</CaseLabel>
        <p className="mb-6 max-w-2xl text-body text-ink-muted">
          I used AI to widen the comparison set — Signal, Wikipedia, Khan
          Academy, Apple IAP, YouVersion, Itch.io — and compile behavioral
          analysis. But the output was a draft to interrogate, not an answer.
        </p>
        <Exchange
          ai="Hiding the donation link is optimal — surfacing the ask triggers psychological reactance and erodes goodwill."
          human="Reactance is real, but timing-based prompts lift conversion without the penalty. Optimize for when we ask, not for hiding the ask."
          caption="AI compressed days of reading into an afternoon. The skepticism and judgment were mine."
        />
      </div>

      <div>
        <CaseLabel>Messaging framework — five rules</CaseLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <NumBlock n="R1" title="Why before what" />
          <NumBlock n="R2" title="Resilience, not pity" />
          <NumBlock n="R3" title="Donor as hero" />
          <NumBlock n="R4" title="No guilt" />
          <NumBlock n="R5" title="Five-element ceiling per screen" />
        </div>
      </div>

      <div>
        <CaseLabel>Handoff — production-ready, not a concept</CaseLabel>
        <DotList
          items={[
            'Rebuilt every screen in mymizu’s native design system, QA’d, with real end-to-end interactivity.',
            'Android APK + video walkthrough for the team.',
            'Journey map + annotated messaging docs.',
            'Poster was runner-up for best project at an international forum.',
          ]}
        />
        <div className="mt-6">
          <ImageSlot
            label="mymizu — before/after: AI prototype vs rebuilt in design system, 1600×900"
            ratio="16 / 9"
          />
        </div>
      </div>

      <Note label="Honest limitation">
        <p className="max-w-2xl text-body">
          Engagement ended at handoff, so live conversion data wasn’t
          available. What’s real: a production-ready system engineers could
          ship as-is, strong stakeholder validation, and a CEO-sparked
          post-donation feature that became the most-praised part.
        </p>
      </Note>
    </div>
  )
}
