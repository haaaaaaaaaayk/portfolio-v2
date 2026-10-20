export { profile, links } from './profile'
export type { LinkItem } from './profile'
export { about, capabilities, skills, cities } from './about'
export type { City } from './about'
export { resume, experience } from './resume'
export { projects, projectById } from './projects'
export type { Project, CaseId, Stat } from './projects'

/** Section list shared by navigation surfaces. */
export const sections = [
  { id: 'work', n: '01', label: 'Work' },
  { id: 'about', n: '02', label: 'About' },
  { id: 'resume', n: '03', label: 'Résumé' },
  { id: 'contact', n: '04', label: 'Contact' },
] as const

export type SectionId = (typeof sections)[number]['id']
