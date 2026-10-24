import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FONTS, VARIANTS, usePrefs } from '../lib/prefs'
import { close, open } from '../lib/motion'
import { Segmented } from './ui/Segmented'

/**
 * Global floating glass switcher (top-right): a 44px pill showing the
 * current variant + font; opens into a 1–10 variant pad and font
 * SF / Haas / Helvetica Now. Full radius, single weight,
 * keyboard accessible (Enter/Space opens, Esc closes). Hidden with `?ui=0`.
 */
export function Switcher() {
  const { variant, font, showUi, setVariant, setFont } = usePrefs()
  const [expanded, setExpanded] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target
      if (!(t instanceof Node) || !rootRef.current?.contains(t)) setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [expanded])

  if (!showUi) return null
  const current = VARIANTS.find((v) => v.id === variant)
  const currentFont = FONTS.find((f) => f.id === font)

  return (
    <div
      ref={rootRef}
      className="fixed right-3 top-3 z-[90] flex flex-col items-end gap-2 sm:right-4 sm:top-4"
      data-switcher
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="variant-switcher-panel"
        onClick={() => setExpanded((e) => !e)}
        className="group glass glass-edge inline-flex h-11 items-center gap-2 rounded-full pl-4 pr-3 text-compact text-ink-muted transition-[box-shadow,color] duration-[260ms] hover:text-ink-active hover:shadow-glass-lift"
      >
        <span className="tabular-nums">
          {variant}
          <span className="text-ink-muted group-hover:text-ink-active"> · {current?.name}</span>
        </span>
        <span aria-hidden className="h-4 w-px bg-rule" />
        <span className="text-ink-muted group-hover:text-ink-active">{currentFont?.label}</span>
        <span
          aria-hidden
          className={`ml-1 inline-block h-2 w-2 rounded-full transition-colors ${
            expanded ? 'bg-ink' : 'bg-accent'
          }`}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            id="variant-switcher-panel"
            role="group"
            aria-label="Portfolio variant and font"
            initial={reduced ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: open }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: close }}
            className="glass glass-edge flex w-[calc(100vw-24px)] max-w-[400px] flex-col gap-4 rounded-card p-4 shadow-glass-lift sm:w-auto"
          >
            <div className="flex flex-col gap-2">
              <span className="text-caption text-ink-muted">Variant</span>
              <div
                role="radiogroup"
                aria-label="Variant"
                className="grid grid-cols-5 gap-1 rounded-card bg-black/[0.06] p-1"
              >
                {VARIANTS.map((v) => {
                  const checked = v.id === variant
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      title={v.name}
                      onClick={() => setVariant(v.id)}
                      className={`relative flex h-11 items-center justify-center rounded-full text-compact ${
                        checked ? 'bg-white text-ink shadow-[0_1px_2px_rgb(22_22_22/10%)]' : 'text-ink-muted hover:text-ink-active'
                      }`}
                    >
                      {v.id}
                    </button>
                  )
                })}
              </div>
              <span className="text-compact">{current?.name}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-caption text-ink-muted">Font</span>
              <Segmented
                label="Font"
                value={font}
                onChange={setFont}
                options={FONTS.map((f) => ({ value: f.id, label: f.label, title: f.label }))}
              />
              <span className="text-caption text-ink-muted">
                {font === 'haas'
                  ? 'Alte Haas Grotesk · −4% tracking'
                  : font === 'helvetica-now'
                    ? 'Helvetica Now · falls back to Helvetica if not installed'
                    : 'SF Pro · system stack'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-rule pt-3 text-caption text-ink-muted">
              <span>?v=1…10</span>
              <span>?font=sf|haas|helvetica-now</span>
              <span>?ui=0 hides this</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
