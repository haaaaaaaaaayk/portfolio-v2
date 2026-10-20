/**
 * Shared content — profile. Every variant renders these same facts.
 * Do not invent biography here; placeholders are marked `[LINK: …]`.
 */
export const profile = {
  name: 'Hayk Sargsyan',
  firstName: 'Hayk',
  lastName: 'Sargsyan',
  role: 'Product Designer & Design Engineer',
  roleShort: 'Product designer and design engineer',
  location: 'San Francisco',
  timezone: 'America/Los_Angeles',
  availability: 'Available for work',
  intro: 'Product designer and design engineer, based in San Francisco.',
  /** hero statement: lead + muted tail */
  statement: {
    lead: 'I’m a product designer with high curiosity',
    tail: 'and zero baked-in process.',
  },
  looking: 'Currently looking for product design roles at startups in San Francisco.',
  contactLine: { lead: 'Let’s build something people', accent: 'trust', end: '.' },
  colophon: 'Designed and built by hand, and a little AI.',
  siteTitle: 'Hayk Sargsyan — Product Designer',
} as const

export const links = [
  { id: 'email', label: 'Email', href: '#', note: '[LINK: mailto]' },
  { id: 'linkedin', label: 'LinkedIn', href: '#', note: '[LINK: linkedin]' },
  { id: 'instagram', label: 'Instagram', href: '#', note: '[LINK: instagram]' },
  { id: 'github', label: 'GitHub', href: '#', note: '[LINK: github]' },
] as const

export type LinkItem = (typeof links)[number]
