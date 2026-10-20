/** Shared content — résumé (the short version). */
export const resume = {
  title: 'The short version',
  summary:
    'Product designer and design engineer. Sole-designer internship at mymizu (Japan); design-engineered and shipped an academic dashboard end-to-end at Minerva. Trained across six cities on four continents. Comfortable from research to Figma to the terminal.',
  /** [LINK: résumé PDF] — point this at the real file */
  pdfHref: '#',
  pdfNote: '[LINK: résumé PDF]',
  downloadLabel: 'Download résumé ↓',
} as const

/** Compact experience rows derived from the two case studies. */
export const experience = [
  {
    id: 'mymizu',
    org: 'mymizu (Japan)',
    role: 'Sole Designer — Internship',
    note: '100 hrs · in-app donations without breaking trust',
  },
  {
    id: 'minerva',
    org: 'Minerva',
    role: 'Design Engineer — research → design → implementation',
    note: '3-person Scrum · academic feedback dashboard, shipped',
  },
] as const
