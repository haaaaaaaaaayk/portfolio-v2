/**
 * The 24th System's type sizes and text colors, exactly as named in src/index.css, for the about text editor.
 * Class strings are written out in full so Tailwind can find them.
 *
 * - One weight (400). Strong (--weight-strong) is the system's single opt-in emphasis, a separate toggle.
 * - 20px and up set in the display face (SF Pro Display), below 20 in the text face, as Apple's optical sizes do.
 * - body-heading is the one mixed entry: Body on phones, Heading's size from the sm breakpoint, kept in the
 *   text face because it's reading text. The about paragraphs use it, so the page looks as it did.
 */
export const TEXT_STYLES = {
  display: { label: 'Display', size: '96', className: 'font-display text-display' },
  specimen: { label: 'Specimen', size: '48', className: 'font-display text-specimen' },
  role: { label: 'Role', size: '32', className: 'font-display text-role' },
  title: { label: 'Title', size: '24', className: 'font-display text-title' },
  heading: { label: 'Heading', size: '20', className: 'font-display text-heading' },
  'body-heading': { label: 'Body → Heading', size: '18 → 20', className: 'text-body sm:text-heading' },
  body: { label: 'Body', size: '18', className: 'text-body' },
  secondary: { label: 'Secondary', size: '16', className: 'text-secondary' },
  compact: { label: 'Compact', size: '14', className: 'text-compact' },
  caption: { label: 'Caption', size: '12', className: 'text-caption' },
} as const

/* every color token that can be text; the surfaces (paper, canvas, control…) and rules are left out */
export const TEXT_COLORS = {
  ink: { label: 'ink', hex: '#161616', className: 'text-ink' },
  'ink-active': { label: 'ink-active', hex: '#111111', className: 'text-ink-active' },
  pressed: { label: 'pressed', hex: '#333333', className: 'text-pressed' },
  'ink-muted': { label: 'ink-muted', hex: '#666666', className: 'text-ink-muted' },
  'disabled-ink': { label: 'disabled-ink', hex: '#8a8a8a', className: 'text-disabled-ink' },
  accent: { label: 'accent (too light for text on paper)', hex: '#1aedc5', className: 'text-accent' },
  media: { label: 'media', hex: '#3786ff', className: 'text-media' },
  success: { label: 'success', hex: '#276738', className: 'text-success' },
  error: { label: 'error', hex: '#b3261e', className: 'text-error' },
} as const

export type StyleKey = keyof typeof TEXT_STYLES
export type ColorKey = keyof typeof TEXT_COLORS
export interface Look {
  style: StyleKey
  color: ColorKey
  strong?: boolean
}

export const lookClass = ({ style, color, strong }: Look) =>
  [
    TEXT_STYLES[style]?.className ?? TEXT_STYLES.body.className,
    TEXT_COLORS[color]?.className ?? TEXT_COLORS.ink.className,
    strong ? 'font-[var(--weight-strong)]' : '',
  ].join(' ')
