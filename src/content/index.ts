import { about } from './about'
import { profile } from './profile'
import { projects } from './projects'

export { profile, links } from './profile'
export type { LinkItem } from './profile'
export { about, capabilities, skills, cities } from './about'
export type { City } from './about'
export { resume, experience } from './resume'
export { projects, projectById } from './projects'
export type { Project, CaseId, Stat } from './projects'

/** Page-as-source text sampled by the Halftone / Fogged / Overtaken shaders. */
export const SOURCE_LINES = [
  profile.name,
  profile.role,
  profile.statement.lead,
  projects[0].title,
  projects[1].title,
  about.lead,
]

/** Section list shared by navigation surfaces. */
export const sections = [
  { id: 'work', n: '01', label: 'Work' },
  { id: 'about', n: '02', label: 'About' },
  { id: 'resume', n: '03', label: 'Résumé' },
  { id: 'contact', n: '04', label: 'Contact' },
] as const

export type SectionId = (typeof sections)[number]['id']
