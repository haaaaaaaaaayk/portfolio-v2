/**
 * Edit the about text in place (npm run dev only). Click a block to select it: its words become editable and a
 * small bar above it picks the style (H1 … Micro) and color from the design system. Save writes aboutText.json,
 * which is what the published page reads.
 */
import { createElement, useState, type ReactNode } from 'react'
import { TEXT_COLORS, TEXT_STYLES, lookClass, type ColorKey, type Look, type StyleKey } from './textStyles'

/** One run of editable words. Commits on blur; Enter commits too, since these are single paragraphs. */
export function EditableText({
  value,
  onChange,
  editing,
  label,
}: {
  value: string
  onChange: (v: string) => void
  editing: boolean
  label: string
}) {
  if (!editing) return <>{value}</>
  return (
    <span
      key={value}
      role="textbox"
      aria-label={label}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      onBlur={(e) => {
        const v = e.currentTarget.textContent ?? ''
        if (v !== value) onChange(v)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
      /* the block's own outline already marks it; a focus ring around every wrapped line would be noise */
      style={{ outline: 'none' }}
      className="cursor-text whitespace-pre-wrap rounded-mark focus:bg-hover"
    >
      {value}
    </span>
  )
}

/** A styled block. While editing it shows a dashed outline on hover, a solid one when selected, and its bar. */
export function Block({
  as = 'p',
  look,
  className = '',
  editing,
  selected,
  onSelect,
  bar,
  children,
}: {
  as?: 'p' | 'div'
  look: Look
  className?: string
  editing: boolean
  selected: boolean
  onSelect: () => void
  bar: ReactNode
  children: ReactNode
}) {
  const cls = `${lookClass(look)} ${className}`
  if (!editing) return createElement(as, { className: cls }, children)
  return (
    <div className="relative" onPointerDown={onSelect} onFocusCapture={onSelect}>
      {selected && bar}
      {createElement(
        as,
        {
          className: `${cls} -mx-2 rounded-mark px-2 outline-1 outline-offset-4 ${
            selected ? 'outline outline-ink' : 'outline-dashed outline-transparent hover:outline-field-border'
          }`,
        },
        children,
      )}
    </div>
  )
}

/** The bar above a selected block: style, then color, then anything block-specific. */
export function LookBar({
  look,
  onChange,
  children,
}: {
  look: Look
  onChange: (l: Look) => void
  children?: ReactNode
}) {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute bottom-full left-0 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-card bg-surface p-2 pr-3 font-sans text-compact text-ink shadow-glass-lift"
    >
      <label className="flex items-center gap-2">
        <span className="sr-only">Text style</span>
        <select
          value={look.style}
          onChange={(e) => onChange({ ...look, style: e.target.value as StyleKey })}
          className="h-8 cursor-pointer rounded-control bg-control px-3 text-compact text-ink outline-offset-2 hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-ink"
        >
          {Object.entries(TEXT_STYLES).map(([k, s]) => (
            <option key={k} value={k}>
              {s.label} · {s.size}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        aria-pressed={!!look.strong}
        title="--weight-strong, the system's one opt-in weight"
        onClick={() => onChange({ ...look, strong: !look.strong })}
        className={`h-8 cursor-pointer rounded-control px-3 text-compact outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink ${
          look.strong ? 'bg-ink text-white hover:bg-pressed' : 'bg-control text-ink hover:bg-control-hover'
        }`}
      >
        Strong
      </button>
      <div role="radiogroup" aria-label="Text color" className="flex items-center gap-1">
        {Object.entries(TEXT_COLORS).map(([k, c]) => {
          const on = look.color === k
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={c.label}
              title={c.label}
              onClick={() => onChange({ ...look, color: k as ColorKey })}
              className="grid size-8 cursor-pointer place-items-center rounded-control outline-offset-2 hover:bg-hover focus-visible:outline-2 focus-visible:outline-ink"
            >
              <span
                className={`size-5 rounded-control ${on ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`}
                style={{ background: c.hex }}
              />
            </button>
          )
        })}
      </div>
      {children}
    </div>
  )
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/** The pill in the corner: turn editing on, save to aboutText.json, undo unsaved changes, finish. */
export function EditBar({
  editing,
  setEditing,
  dirty,
  onSave,
  onReset,
}: {
  editing: boolean
  setEditing: (v: boolean) => void
  dirty: boolean
  onSave: () => Promise<void>
  onReset: () => void
}) {
  const [state, setState] = useState<SaveState>('idle')
  const save = async () => {
    setState('saving')
    try {
      await onSave()
      setState('saved')
    } catch {
      setState('error')
    }
  }
  const btn =
    'h-8 cursor-pointer rounded-control px-3 text-compact outline-offset-2 transition-transform duration-[120ms] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-default disabled:text-disabled-ink'
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-control bg-surface p-1 font-sans text-compact text-ink shadow-glass-lift">
      {!editing ? (
        <button type="button" className={`${btn} hover:bg-hover`} onClick={() => setEditing(true)}>
          Edit text
        </button>
      ) : (
        <>
          <span className="px-3 text-ink-muted" aria-live="polite">
            {state === 'saving'
              ? 'Saving…'
              : state === 'error'
                ? 'Couldn’t save'
                : dirty
                  ? 'Unsaved changes'
                  : state === 'saved'
                    ? 'Saved'
                    : 'Click any text'}
          </span>
          <button type="button" className={`${btn} hover:bg-hover`} disabled={!dirty} onClick={onReset}>
            Undo all
          </button>
          <button
            type="button"
            className={`${btn} bg-ink text-white hover:bg-pressed disabled:bg-disabled`}
            disabled={!dirty || state === 'saving'}
            onClick={save}
          >
            Save
          </button>
          <button type="button" className={`${btn} hover:bg-hover`} onClick={() => setEditing(false)}>
            Done
          </button>
        </>
      )}
    </div>
  )
}
