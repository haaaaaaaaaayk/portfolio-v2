import { useCallback, useSyncExternalStore } from 'react'

/**
 * Global preferences: which variant (1–5) and which font stack is active.
 * Source order: URL (?v=, ?font=) → localStorage → default.
 * Both are mirrored back to the URL and localStorage so a link can be shared.
 * `?ui=0` hides the floating switcher.
 */
export const FONTS = [
  { id: 'sf', label: 'SF' },
  { id: 'haas', label: 'Haas' },
  { id: 'helvetica-now', label: 'Helvetica Now' },
] as const
export type FontId = (typeof FONTS)[number]['id']

export const VARIANTS = [
  { id: 1, slug: 'desktop-os', name: 'Desktop OS' },
  { id: 2, slug: 'index', name: 'Index' },
  { id: 3, slug: 'spatial-canvas', name: 'Spatial canvas' },
  { id: 4, slug: 'editorial', name: 'Editorial' },
  { id: 5, slug: 'lab', name: 'Lab' },
] as const
export type VariantId = (typeof VARIANTS)[number]['id']

const KEY_V = 'portfolio.variant'
const KEY_FONT = 'portfolio.font'

const isFont = (x: unknown): x is FontId => FONTS.some((f) => f.id === x)
const isVariant = (x: unknown): x is VariantId => VARIANTS.some((v) => v.id === x)

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}
function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* private mode etc. */
  }
}

function initialFont(): FontId {
  const q = new URLSearchParams(window.location.search).get('font')
  if (isFont(q)) return q
  const s = readStorage(KEY_FONT)
  return isFont(s) ? s : 'sf'
}
function initialVariant(): VariantId {
  const q = Number(new URLSearchParams(window.location.search).get('v'))
  if (isVariant(q)) return q
  const s = Number(readStorage(KEY_V))
  return isVariant(s) ? s : 1
}

interface Prefs {
  variant: VariantId
  font: FontId
  showUi: boolean
}

let state: Prefs = {
  variant: initialVariant(),
  font: initialFont(),
  showUi: new URLSearchParams(window.location.search).get('ui') !== '0',
}
const listeners = new Set<() => void>()

function applyFont(font: FontId) {
  document.documentElement.dataset.font = font
}

function syncUrl() {
  const url = new URL(window.location.href)
  url.searchParams.set('v', String(state.variant))
  url.searchParams.set('font', state.font)
  window.history.replaceState(window.history.state, '', url)
}

function set(next: Partial<Prefs>) {
  state = { ...state, ...next }
  if (next.font) {
    applyFont(state.font)
    writeStorage(KEY_FONT, state.font)
  }
  if (next.variant) writeStorage(KEY_V, String(state.variant))
  syncUrl()
  listeners.forEach((l) => l())
}

/** Call once before first paint so the right font is on <html>. */
export function bootPrefs() {
  applyFont(state.font)
}

export function setVariant(variant: VariantId) {
  set({ variant })
}
export function setFont(font: FontId) {
  set({ font })
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
const getSnapshot = () => state

export function usePrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const setV = useCallback((v: VariantId) => set({ variant: v }), [])
  const setF = useCallback((f: FontId) => set({ font: f }), [])
  return { ...prefs, setVariant: setV, setFont: setF }
}
