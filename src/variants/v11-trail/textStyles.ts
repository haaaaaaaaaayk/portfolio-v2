/**
 * The design system's text styles and text colors, under the names you pick them by in the editor.
 * Class strings are written out in full so Tailwind can find them.
 */
export const TEXT_STYLES = {
  h1: { label: 'H1', size: '32', className: 'font-display text-role font-[var(--weight-strong)]' },
  h2: { label: 'H2', size: '24', className: 'font-display text-title font-[var(--weight-strong)]' },
  h3: { label: 'H3', size: '20', className: 'font-display text-heading font-[var(--weight-strong)]' },
  body: { label: 'Body', size: '18 → 20', className: 'text-body sm:text-heading' },
  small: { label: 'Small', size: '16', className: 'text-secondary' },
  caption: { label: 'Caption', size: '14', className: 'text-compact' },
  micro: { label: 'Micro', size: '12', className: 'text-caption' },
} as const

/* text colors only; accent (#1aedc5) is left out because it's too light to read as text on paper */
export const TEXT_COLORS = {
  ink: { label: 'Ink', hex: '#161616', className: 'text-ink' },
  'ink-muted': { label: 'Ink muted', hex: '#666666', className: 'text-ink-muted' },
  'disabled-ink': { label: 'Faint', hex: '#8a8a8a', className: 'text-disabled-ink' },
  media: { label: 'Media blue', hex: '#3786ff', className: 'text-media' },
  success: { label: 'Success', hex: '#276738', className: 'text-success' },
  error: { label: 'Error', hex: '#b3261e', className: 'text-error' },
} as const

export type StyleKey = keyof typeof TEXT_STYLES
export type ColorKey = keyof typeof TEXT_COLORS
export interface Look {
  style: StyleKey
  color: ColorKey
}

export const lookClass = ({ style, color }: Look) =>
  `${TEXT_STYLES[style]?.className ?? TEXT_STYLES.body.className} ${TEXT_COLORS[color]?.className ?? TEXT_COLORS.ink.className}`
