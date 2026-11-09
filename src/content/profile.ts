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
  /** Trail variant pitch: lead + muted tail. Draft copy — rewrite in your own words. */
  pitch: {
    lead: 'I’m a design engineer who designs the product and ships the code,',
    tail: 'and I want to do it with a small team at an early-stage startup.',
  },
  looking: 'Currently looking for product design roles at startups in San Francisco.',
  contactLine: { lead: 'Let’s build something people', accent: 'trust', end: '.' },
  colophon: 'Designed and built by hand, and a little AI.',
  siteTitle: 'Hayk Sargsyan — Product Designer',
} as const

export const links = [
  { id: 'email', label: 'Email', href: '#', note: '[LINK: mailto]' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/sargsyan-hayk--/' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/haykhateshiking/' },
  { id: 'github', label: 'GitHub', href: '#', note: '[LINK: github]' },
] as const

export type LinkItem = (typeof links)[number]
