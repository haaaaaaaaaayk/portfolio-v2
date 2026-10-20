import { useMemo, useState, type CSSProperties } from 'react'
import { LiquidField, type Pool } from '../../components/LiquidField'
import { CaseDialog } from '../../components/CaseDialog'
import { ImageSlot } from '../../components/ImageSlot'
import { Alert, Button, Slider, Switch, TextArea, TextField } from '../../components/ui/Controls'
import { Segmented } from '../../components/ui/Segmented'
import { about, capabilities, links, profile, projects, resume } from '../../content'
import { useFps } from '../../hooks/useFps'
import { useClock } from '../../hooks/useClock'
import type { CaseId } from '../../content/projects'

type Specimen = 'work' | 'about' | 'contact'

export default function Lab() {
  const fps = useFps()
  const time = useClock()
  const [blur, setBlur] = useState(16)
  const [saturate, setSaturate] = useState(1.4)
  const [tint, setTint] = useState(100)
  const [intensity, setIntensity] = useState(1)
  const [follow, setFollow] = useState(0.12)
  const [fieldBlur, setFieldBlur] = useState(48)
  const [specimen, setSpecimen] = useState<Specimen>('work')
  const [caseId, setCaseId] = useState<CaseId | null>(null)
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [copy, setCopy] = useState(true)

  const tintRgb = `${Math.round(255 - (255 - 26) * ((100 - tint) / 100))} ${Math.round(
    255 - (255 - 237) * ((100 - tint) / 100),
  )} ${Math.round(255 - (255 - 197) * ((100 - tint) / 100))}`

  const vars = {
    '--glass-blur': `${blur}px`,
    '--glass-saturate': String(saturate),
    '--glass-tint': tintRgb,
  } as CSSProperties

  const pools: Pool[] = useMemo(
    () => [
      { x: 0.18, y: 0.2, size: 52, mix: 100, opacity: 0.5, amp: 0.06, speed: 0.00012, phase: 0, shape: '42% 58% 63% 37% / 41% 44% 56% 59%' },
      { x: 0.78, y: 0.28, size: 40, mix: 70, opacity: 0.42, amp: 0.07, speed: 0.00009, phase: 1.8, shape: '61% 39% 46% 54% / 52% 61% 39% 48%' },
      { x: 0.5, y: 0.82, size: 58, mix: 50, opacity: 0.38, amp: 0.05, speed: 0.00008, phase: 3.4, shape: '48% 52% 38% 62% / 58% 43% 57% 42%' },
      { x: 0.5, y: 0.5, size: 28, mix: 100, opacity: 0.45, amp: 0, speed: 0.00014, phase: 1, shape: '50% 50% 46% 54% / 55% 48% 52% 45%', follow: true },
    ],
    [],
  )

  return (
    <div className="relative min-h-svh bg-canvas" style={vars}>
      <LiquidField pools={pools} intensity={intensity} pointerEase={follow} blur={fieldBlur} />

      <div className="relative z-10 mx-auto grid max-w-[1440px] gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(240px,360px)_1fr] lg:px-8">
        <aside className="glass glass-edge h-fit rounded-card p-5 lg:sticky lg:top-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-caption text-ink-muted">Lab · 24th tokens live</p>
              <h1 className="mt-1 text-title">{profile.firstName}’s controls</h1>
            </div>
            <span className="glass inline-flex h-11 items-center rounded-full px-3 text-compact tabular-nums">
              {fps} fps
            </span>
          </div>
          <p className="mt-3 text-compact text-ink-muted">
            Knobs drive the glass CSS variables and the pointer-reactive liquid field. Content is Hayk’s — nothing invented.
          </p>
          <div className="mt-6 flex flex-col gap-5">
            <Slider label="Glass blur" value={blur} min={4} max={40} onChange={setBlur} valueLabel={`${blur}px`} />
            <Slider
              label="Glass saturate"
              value={Math.round(saturate * 10)}
              min={10}
              max={20}
              onChange={(v) => setSaturate(v / 10)}
              valueLabel={saturate.toFixed(1)}
            />
            <Slider label="Glass tint → accent" value={tint} min={0} max={100} onChange={setTint} valueLabel={`${tint}% white`} />
            <Slider
              label="Field intensity"
              value={Math.round(intensity * 100)}
              min={20}
              max={150}
              onChange={(v) => setIntensity(v / 100)}
              valueLabel={intensity.toFixed(2)}
            />
            <Slider
              label="Pointer follow"
              value={Math.round(follow * 100)}
              min={2}
              max={24}
              onChange={(v) => setFollow(v / 100)}
              valueLabel={follow.toFixed(2)}
            />
            <Slider label="Field blur" value={fieldBlur} min={16} max={80} onChange={setFieldBlur} valueLabel={`${fieldBlur}px`} />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-2 border-t border-rule pt-4 text-caption">
            <div>
              <dt className="text-ink-muted">Ink</dt>
              <dd className="tabular-nums">#161616</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Accent</dt>
              <dd className="tabular-nums">#1AEDC5</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Clock</dt>
              <dd className="tabular-nums">{time}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Location</dt>
              <dd>{profile.location}</dd>
            </div>
          </dl>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <section className="glass glass-edge sheen rounded-card p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-caption text-ink-muted">{profile.role}</p>
                <h2 className="text-role">{profile.name}</h2>
              </div>
              <span className="inline-flex h-11 items-center gap-2 rounded-full bg-control px-4 text-compact">
                <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
                {profile.availability}
              </span>
            </div>
            <p className="mt-6 max-w-2xl text-title">
              {profile.statement.lead} <span className="text-ink-muted">{profile.statement.tail}</span>
            </p>
          </section>

          <section className="glass glass-edge rounded-card p-5 sm:p-8">
            <p className="mb-4 text-caption text-ink-muted">24th segmented control</p>
            <Segmented
              label="Specimen"
              value={specimen}
              onChange={setSpecimen}
              options={[
                { value: 'work', label: 'Work' },
                { value: 'about', label: 'About' },
                { value: 'contact', label: 'Contact' },
              ]}
            />
            <div className="mt-8">
              {specimen === 'work' && (
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCaseId(p.id)}
                      className="glass sheen rounded-card p-4 text-left"
                    >
                      <ImageSlot label={p.cardSlot.label} ratio={p.cardSlot.ratio} />
                      <p className="mt-3 text-caption tabular-nums text-ink-muted">{p.index}</p>
                      <h3 className="mt-1 text-heading">{p.title}</h3>
                      <p className="mt-2 text-compact text-ink-muted">{p.hook}</p>
                    </button>
                  ))}
                </div>
              )}
              {specimen === 'about' && (
                <div className="flex flex-col gap-6">
                  <p className="text-title">
                    {about.lead} <span className="text-ink-muted">{about.tail}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {capabilities.map((c) => (
                      <span key={c} className="glass inline-flex h-11 items-center rounded-full px-4 text-compact">
                        {c}
                      </span>
                    ))}
                  </div>
                  <p className="text-secondary text-ink-muted">{resume.summary}</p>
                </div>
              )}
              {specimen === 'contact' && (
                <form
                  className="flex max-w-form flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSent(true)
                  }}
                >
                  <p className="text-heading">{profile.looking}</p>
                  <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={profile.name}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="[LINK: mailto]"
                  />
                  <TextArea
                    label="Note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="A role, a product, a question."
                  />
                  <Switch label="Send me a copy" checked={copy} onChange={setCopy} />
                  {sent && (
                    <Alert tone="success" onDismiss={() => setSent(false)}>
                      Demo only — nothing was sent. {links[0].note}
                    </Alert>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" type="submit">
                      Send
                    </Button>
                    <Button
                      variant="glass"
                      onClick={() => {
                        setName('')
                        setEmail('')
                        setNote('')
                        setSent(false)
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {links.map((l) => (
                      <li key={l.id}>
                        <a href={l.href} title={l.note} className="glass inline-flex h-11 items-center rounded-full px-4 text-compact">
                          {l.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </form>
              )}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <Swatch name="Ink" hex="#161616" className="bg-ink text-white" />
            <Swatch name="Accent" hex="#1AEDC5" className="bg-accent text-ink" />
            <Swatch name="Media" hex="#3786FF" className="bg-media text-white" />
            <Swatch name="Error" hex="#B3261E" className="bg-error text-white" />
            <Swatch name="Success" hex="#276738" className="bg-success text-white" />
            <Swatch name="Canvas" hex="#EEEEF0" className="bg-canvas text-ink" />
          </section>
        </div>
      </div>
      <CaseDialog id={caseId} onClose={() => setCaseId(null)} />
    </div>
  )
}

function Swatch({ name, hex, className }: { name: string; hex: string; className: string }) {
  return (
    <div className={`rounded-card p-4 ${className}`}>
      <div className="text-compact">{name}</div>
      <div className="text-caption tabular-nums opacity-80">{hex}</div>
    </div>
  )
}
