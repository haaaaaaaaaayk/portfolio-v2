/** Shared content — about. */
export const about = {
  lead: 'I’ve been the PM, the designer, the one opening the terminal, and the one hanging art in a gallery.',
  tail: 'I’ve studied and interned across San Francisco, Seoul, Berlin, Buenos Aires, Taipei, and Tokyo — bringing a multidisciplinary, global read on the patterns that shape good products.',
  railNote: 'Six cities, four continents.',
} as const

export const capabilities = [
  'Product Design',
  'Design Engineering',
  'Research',
  'Prototyping',
  'Front-end',
] as const

/** Skills/tools surfaced across the case studies — used for marquees and chips. */
export const skills = [
  'Product Design',
  'Design Engineering',
  'Research',
  'Prototyping',
  'Front-end',
  'Figma',
  'React',
  'Next.js',
  'TypeScript',
  'Python',
  'SQL',
  'Claude',
  'Cursor',
  'v0',
  'Adobe CC',
  'Gemini',
  'OpenAI',
] as const

export interface City {
  name: string
  lat: string
  /** approximate map coordinates (lon, lat) for spatial layouts */
  lon: number
  latNum: number
}

export const cities: City[] = [
  { name: 'San Francisco', lat: '37.77° N', lon: -122.42, latNum: 37.77 },
  { name: 'Seoul', lat: '37.56° N', lon: 126.98, latNum: 37.56 },
  { name: 'Berlin', lat: '52.52° N', lon: 13.4, latNum: 52.52 },
  { name: 'Buenos Aires', lat: '34.60° S', lon: -58.38, latNum: -34.6 },
  { name: 'Taipei', lat: '25.03° N', lon: 121.56, latNum: 25.03 },
  { name: 'Tokyo', lat: '35.68° N', lon: 139.69, latNum: 35.68 },
]
