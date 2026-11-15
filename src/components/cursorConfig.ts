/**
 * Every tunable detail of the dot cursor. Tune them live in the Cursor Tuner (tools/cursor-tuner.html),
 * press "Copy config", and paste the result over this object.
 */
import { SETS } from '../variants/v11-trail/palette'

/* the hills' shade and middle tones; the pale highlights would vanish on the paper */
export const HILL_COLORS = [...new Set(SETS.flatMap(([shade, mid]) => [shade, mid]))]

export type CursorConfig = {
  dot: {
    size: number // px across at rest
    hoverSize: number // px across over anything clickable
    color: string
    shape: 'circle' | 'square'
    follow: number // 1 = glued to the pointer; lower trails behind it (0.1–1)
    hoverMs: number // how long the grow takes
  }
  trace: {
    on: boolean
    colors: string[] // 'hills' uses the valley's colours
    order: 'random' | 'cycle'
    minSize: number // px across
    maxSize: number
    snap: boolean // sizes land on the 4px grid
    step: number // px of travel before another dot drops
    hold: number // ms at full strength
    fade: number // ms to go away
    ending: 'fade-shrink' | 'fade' | 'shrink' | 'cut'
    shrinkTo: number // size left at the very end, as a share of the start (0–1)
    opacity: number
    shape: 'circle' | 'square'
    anchor: 'page' | 'screen' // page: dots scroll with the content
    blend: 'normal' | 'multiply'
  }
}

export const CURSOR: CursorConfig = {
  dot: { size: 6, hoverSize: 12, color: '#1aedc5', shape: 'circle', follow: 1, hoverMs: 180 },
  trace: {
    on: true,
    colors: ['#1aedc5'],
    order: 'random',
    minSize: 1,
    maxSize: 8,
    snap: true,
    step: 8,
    hold: 1450,
    fade: 780,
    ending: 'fade-shrink',
    shrinkTo: 0.4,
    opacity: 1,
    shape: 'circle',
    anchor: 'screen',
    blend: 'multiply',
  },
}
