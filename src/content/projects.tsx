import type { ReactNode } from 'react'
import { MymizuBody } from '../components/cases/MymizuBody'
import { MinervaBody } from '../components/cases/MinervaBody'

/**
 * Shared content — the two case studies. Structured facts live here so
 * every variant renders the same story; the long-form bodies are the
 * existing `components/cases/*Body.tsx` composed from `CaseBits`.
 */
export type CaseId = 'mymizu' | 'minerva'

export interface Stat {
  value: string
  label: string
}

export interface Project {
  id: CaseId
  index: string
  /** short name for lists, docks, tabs */
  name: string
  title: string
  hook: string
  tags: string[]
  meta: { k: string; v: string }[]
  /** headline numbers (subset of the case body's stat bands) */
  stats: Stat[]
  /** three-beat summary for compact surfaces */
  beats: { label: string; text: string }[]
  cardSlot: { label: string; ratio: string }
  body: () => ReactNode
}

export const projects: Project[] = [
  {
    id: 'mymizu',
    index: '01',
    name: 'mymizu',
    title: 'Designing in-app donations without breaking trust',
    hook: 'A free, ad-free water-refill app with 500K+ downloads needed to fund itself — without betraying the free-by-principle promise.',
    tags: ['Mobile', 'Payments', 'Trust', 'AI-assisted research'],
    meta: [
      { k: 'Role', v: 'Sole Designer' },
      { k: 'Company', v: 'mymizu (Japan)' },
      { k: 'Tools', v: 'Figma · Claude · Adobe CC · Gemini' },
      { k: 'Duration', v: '100 hrs (Internship)' },
    ],
    stats: [
      { value: '500K+', label: 'Downloads' },
      { value: '1M+', label: 'Plastic bottles saved' },
      { value: '2,500+', label: 'Partner refill spots' },
    ],
    beats: [
      {
        label: 'Problem',
        text: 'Support was buried three layers deep; 70% hit cancel at the browser hand-off and only 40% ever reached the ask.',
      },
      {
        label: 'Solution',
        text: 'A persistent Support tab, one respectful dismissible pop-up, a six-screen payment flow and a thank-you moment.',
      },
      {
        label: 'Handoff',
        text: 'Every screen rebuilt in mymizu’s native design system, QA’d, with an Android APK and annotated messaging docs.',
      },
    ],
    cardSlot: { label: 'mymizu — card cover, 1200×900', ratio: '4 / 3' },
    body: () => <MymizuBody />,
  },
  {
    id: 'minerva',
    index: '02',
    name: 'Minerva dashboard',
    title: 'From data graveyard to strategic dashboard',
    hook: 'Minerva’s feedback lived behind a 25-second click-path most students dreaded. I designed and shipped the fix — front-end, some back-end, tests, SQL — into one private, searchable dashboard.',
    tags: ['Design Engineering', 'Dashboard', 'Local-first', 'AI'],
    meta: [
      { k: 'Role', v: 'Design Engineer (research → design → implementation)' },
      { k: 'Team', v: '3-person Scrum (PM · back-end eng · design engineer = Hayk)' },
      { k: 'Stack', v: 'Next.js · React · Python · OpenAI + AI-assisted build (Claude, v0, Cursor)' },
    ],
    stats: [
      { value: '~25s', label: 'To open one piece of feedback' },
      { value: '35', label: 'Students surveyed' },
      { value: '89%', label: 'Would use an external tool' },
      { value: '4', label: 'Decisions changed by testing' },
    ],
    beats: [
      {
        label: 'Problem',
        text: '120+ assignments and 76 competencies to track, and no way in Forum to see one competency’s average across all terms.',
      },
      {
        label: 'Decision',
        text: 'Build a new insight layer, local-first: data never leaves the student’s device; four modes of analysis share one filter state.',
      },
      {
        label: 'Shipped',
        text: 'Next.js front-end with real loading / empty / error states, session auth + local SQLite, OpenAI summaries per competency.',
      },
    ],
    cardSlot: { label: 'Minerva dashboard — card cover, 1200×900', ratio: '4 / 3' },
    body: () => <MinervaBody />,
  },
]

export const projectById = (id: CaseId): Project => projects.find((p) => p.id === id)!
