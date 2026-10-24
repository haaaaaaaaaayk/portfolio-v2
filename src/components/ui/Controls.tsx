import { useId, type ButtonHTMLAttributes, type CSSProperties, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { CircleAlert, CircleCheck, Info, X } from '../../lib/icons'

/* 24th controls ported to the portfolio tokens.
   Buttons/inputs: full radius, 44 (touch) / 36 (field) / 32 (compact).
   Textarea: 20px radius. Alerts/toasts: full radius. Weight 400 everywhere. */

export function Button({
  variant = 'primary',
  size,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'glass' | 'glass-dark'
  size?: 'compact'
}) {
  const look =
    variant === 'primary'
      ? 'ctl-primary'
      : variant === 'secondary'
        ? 'ctl-secondary hover:text-ink-active'
        : variant === 'glass'
          ? 'glass !bg-none text-ink-muted hover:!bg-white/40 hover:text-ink-active cursor-pointer'
          : 'glass-dark text-white hover:!bg-pressed cursor-pointer'
  return (
    <button
      type="button"
      {...props}
      data-size={size}
      className={`ctl inline-flex items-center justify-center gap-2 whitespace-nowrap ${look} ${className}`}
    >
      {children}
    </button>
  )
}

function FieldFrame({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-2 text-compact">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-caption text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function TextField({
  label,
  hint,
  error,
  className = '',
  id: givenId,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const gen = useId()
  const id = givenId ?? gen
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error}>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`ctl ctl-field ${className}`}
      />
    </FieldFrame>
  )
}

export function TextArea({
  label,
  hint,
  error,
  className = '',
  id: givenId,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  const gen = useId()
  const id = givenId ?? gen
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error}>
      <textarea
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`ctl ctl-field ctl-area ${className}`}
      />
    </FieldFrame>
  )
}

export function Switch({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={`relative flex min-h-11 cursor-pointer items-center gap-2 text-compact ${
        disabled ? 'cursor-not-allowed text-disabled-ink' : ''
      }`}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-inherit appearance-none opacity-0"
      />
      <span
        aria-hidden
        className={`relative block h-4 w-7 shrink-0 rounded-full transition-colors duration-[180ms] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
          disabled ? 'bg-disabled' : checked ? 'bg-ink' : 'bg-[#a0a0a0]'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full transition-transform duration-[180ms] ${
            disabled ? 'bg-disabled-ink' : 'bg-white'
          } ${checked ? 'translate-x-3' : ''}`}
        />
      </span>
      <span>{label}</span>
    </label>
  )
}

export type Tone = 'info' | 'success' | 'error'
const toneIcon = { info: Info, success: CircleCheck, error: CircleAlert }
const toneColor = { info: 'text-media', success: 'text-success', error: 'text-error' }
const toneBg = {
  info: 'bg-[color-mix(in_srgb,var(--color-media)_6%,white)]',
  success: 'bg-[color-mix(in_srgb,var(--color-success)_6%,white)]',
  error: 'bg-[color-mix(in_srgb,var(--color-error)_6%,white)]',
}

/** Single-line alert: full radius per the updated radius rule. */
export function Alert({
  tone = 'info',
  children,
  onDismiss,
}: {
  tone?: Tone
  children: ReactNode
  onDismiss?: () => void
}) {
  const Icon = toneIcon[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex min-h-11 items-center gap-2 rounded-full py-2 pl-4 pr-2 text-compact ${toneBg[tone]}`}
    >
      <Icon size={16} className={`shrink-0 ${toneColor[tone]}`} />
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-hover hover:text-ink-active"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

/** Token-styled range. Thumb is 16px; the row is 44px for touch. */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  valueLabel,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  valueLabel?: string
}) {
  const id = useId()
  const range = max - min
  const progress = range > 0 ? ((value - min) / range) * 100 : 0
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4 text-compact">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="tabular-nums text-ink-muted">
          {valueLabel ?? value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="token-slider"
        style={{ '--slider-progress': `${progress}%` } as CSSProperties}
      />
    </div>
  )
}
