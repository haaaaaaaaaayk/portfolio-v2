import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion'
import { LiquidField } from '../../components/LiquidField'
import { CaseArticle } from '../../components/CaseArticle'
import { ImageSlot } from '../../components/ImageSlot'
import { about, capabilities, cities, experience, links, profile, projects, resume } from '../../content'
import { useClock } from '../../hooks/useClock'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { Search, X } from '../../lib/icons'
import { close, open } from '../../lib/motion'
import type { CaseId } from '../../content/projects'

type WinId = 'work' | 'about' | 'resume' | 'contact' | CaseId

const APPS: { id: WinId; label: string; hint: string }[] = [
  { id: 'work', label: 'Work', hint: 'Selected work' },
  { id: 'about', label: 'About', hint: 'Bio and cities' },
  { id: 'resume', label: 'Résumé', hint: 'The short version' },
  { id: 'contact', label: 'Contact', hint: 'Links' },
  { id: 'mymizu', label: 'mymizu', hint: 'Case 01' },
  { id: 'minerva', label: 'Minerva', hint: 'Case 02' },
]

const DEFAULT_POS: Record<WinId, { x: number; y: number; w: number }> = {
  work: { x: 32, y: 64, w: 640 },
  about: { x: 420, y: 96, w: 480 },
  resume: { x: 80, y: 280, w: 520 },
  contact: { x: 560, y: 320, w: 460 },
  mymizu: { x: 48, y: 56, w: 720 },
  minerva: { x: 120, y: 72, w: 720 },
}

const INITIAL_OPEN: WinId[] = ['work', 'about']

export default function DesktopOs() {
  const isMobile = useIsMobile()
  const time = useClock()
  const reduced = useReducedMotion()
  const [openIds, setOpenIds] = useState<WinId[]>(INITIAL_OPEN)
  const [zOrder, setZOrder] = useState<WinId[]>(INITIAL_OPEN)
  const [palette, setPalette] = useState(false)
  const [sheet, setSheet] = useState<WinId | null>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const focused = zOrder[zOrder.length - 1] ?? null

  const openWin = useCallback((id: WinId) => {
    if (isMobile) {
      setSheet(id)
      return
    }
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setZOrder((prev) => [...prev.filter((x) => x !== id), id])
  }, [isMobile])

  const closeWin = useCallback((id: WinId) => {
    setOpenIds((prev) => prev.filter((x) => x !== id))
    setZOrder((prev) => prev.filter((x) => x !== id))
    setSheet((s) => (s === id ? null : s))
  }, [])

  const focusWin = useCallback((id: WinId) => {
    setZOrder((prev) => [...prev.filter((x) => x !== id), id])
  }, [])

  const toggleWin = useCallback(
    (id: WinId) => {
      if (isMobile) {
        setSheet((s) => (s === id ? null : id))
        return
      }
      setOpenIds((prev) => {
        if (prev.includes(id)) {
          setZOrder((z) => z.filter((x) => x !== id))
          return prev.filter((x) => x !== id)
        }
        setZOrder((z) => [...z.filter((x) => x !== id), id])
        return [...prev, id]
      })
    },
    [isMobile],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField = e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
        return
      }
      if (e.key === 'Escape') {
        if (palette) {
          setPalette(false)
          return
        }
        if (isMobile && sheet) {
          setSheet(null)
          return
        }
        if (!isMobile && focused && !inField) closeWin(focused)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [palette, focused, closeWin, isMobile, sheet])

  return (
    <div className="relative h-svh overflow-hidden overscroll-none bg-canvas">
      <LiquidField />
      <MenuBar time={time} onPalette={() => setPalette(true)} />

      {!isMobile && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="select-none text-center font-display text-[clamp(64px,12vw,160px)] leading-[0.9] text-ink/[0.08]">
            {profile.firstName}
            <br />
            {profile.lastName}
          </p>
        </div>
      )}

      {!isMobile && (
        <div ref={deskRef} className="absolute inset-x-0 top-11 bottom-20">
          {openIds.map((id) => (
            <OsWindow
              key={id}
              id={id}
              z={10 + zOrder.indexOf(id)}
              focused={focused === id}
              reduced={!!reduced}
              constraints={deskRef}
              onFocus={() => focusWin(id)}
              onClose={() => closeWin(id)}
              onOpen={openWin}
            />
          ))}
        </div>
      )}

      {isMobile && (
        <MobileDesk onOpen={openWin} />
      )}

      <AnimatePresence>
        {isMobile && sheet && (
          <Sheet id={sheet} onClose={() => setSheet(null)} onOpen={openWin} />
        )}
      </AnimatePresence>

      <Dock
        openIds={isMobile ? (sheet ? [sheet] : []) : openIds}
        focused={isMobile ? sheet : focused}
        onToggle={toggleWin}
      />

      <AnimatePresence>
        {palette && (
          <Palette
            onClose={() => setPalette(false)}
            onRun={(id) => {
              setPalette(false)
              openWin(id)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuBar({ time, onPalette }: { time: string; onPalette: () => void }) {
  return (
    <header className="glass glass-edge relative z-[50] flex h-11 items-center justify-between gap-4 px-3 pr-36 sm:px-4 sm:pr-52">
      <span className="truncate text-compact">
        {profile.name}
        <span className="hidden text-ink-muted sm:inline"> · {profile.roleShort}</span>
      </span>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-2 rounded-full bg-white/50 px-3 text-compact sm:inline-flex">
          <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
          {profile.availability}
        </span>
        <button
          type="button"
          onClick={onPalette}
          className="inline-flex h-8 items-center rounded-full px-3 text-compact text-ink-muted hover:bg-white/60 hover:text-ink"
        >
          ⌘K
        </button>
        <span className="text-compact tabular-nums text-ink-muted">
          {profile.location} · {time}
        </span>
      </div>
    </header>
  )
}

function OsWindow({
  id,
  z,
  focused,
  reduced,
  constraints,
  onFocus,
  onClose,
  onOpen,
}: {
  id: WinId
  z: number
  focused: boolean
  reduced: boolean
  constraints: RefObject<HTMLDivElement | null>
  onFocus: () => void
  onClose: () => void
  onOpen: (id: WinId) => void
}) {
  const controls = useDragControls()
  const app = APPS.find((a) => a.id === id)!
  const pos = DEFAULT_POS[id]
  return (
    <motion.div
      drag={!reduced}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={constraints}
      dragElastic={0.08}
      onPointerDown={onFocus}
      initial={{ x: pos.x, y: pos.y, opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.98 }}
      animate={{ opacity: 1, scale: 1, transition: open }}
      className={`absolute top-0 left-0 flex max-h-[min(72svh,720px)] flex-col overflow-hidden rounded-card ${
        focused ? 'shadow-glass-lift' : ''
      } glass glass-edge`}
      style={{ zIndex: z, width: `min(${pos.w}px, calc(100vw - 24px))` }}
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="flex h-11 shrink-0 cursor-grab items-center gap-3 px-3 active:cursor-grabbing"
      >
        <button
          type="button"
          aria-label={`Close ${app.label}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-control text-ink-muted hover:bg-control-hover hover:text-ink"
        >
          <X size={14} />
        </button>
        <span className="flex-1 truncate text-compact">{app.label}</span>
        {focused && <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5 sm:pb-5">
        <WindowBody id={id} onOpen={onOpen} />
      </div>
    </motion.div>
  )
}

function MobileDesk({ onOpen }: { onOpen: (id: WinId) => void }) {
  return (
    <div className="relative z-10 flex h-[calc(100svh-7.5rem)] flex-col justify-end px-4 pb-4 pt-4">
      <p className="mb-auto font-display text-role">{profile.firstName} {profile.lastName}</p>
      <p className="mb-8 max-w-sm text-secondary text-ink-muted">{profile.intro}</p>
      <ul className="grid grid-cols-2 gap-2">
        {APPS.slice(0, 4).map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onOpen(a.id)}
              className="glass sheen flex h-20 w-full flex-col items-start justify-end rounded-card p-3 text-left text-compact"
            >
              {a.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Sheet({
  id,
  onClose,
  onOpen,
}: {
  id: WinId
  onClose: () => void
  onOpen: (id: WinId) => void
}) {
  const reduced = useReducedMotion()
  const app = APPS.find((a) => a.id === id)!
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={app.label}
      initial={reduced ? false : { y: '100%' }}
      animate={{ y: 0, transition: open }}
      exit={{ y: '100%', transition: close }}
      className="glass glass-edge fixed inset-x-0 bottom-0 z-40 flex max-h-[85svh] flex-col rounded-t-card"
    >
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <span className="text-compact">{app.label}</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 items-center rounded-full bg-control px-3 text-compact"
        >
          Close
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24">
        <WindowBody id={id} onOpen={onOpen} />
      </div>
    </motion.div>
  )
}

function WindowBody({ id, onOpen }: { id: WinId; onOpen: (id: WinId) => void }) {
  if (id === 'work') {
    return (
      <div className="flex flex-col gap-3">
        {projects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen(p.id)}
            className="glass sheen rounded-card p-3 text-left"
          >
            <ImageSlot label={p.cardSlot.label} ratio={p.cardSlot.ratio} />
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="text-caption tabular-nums text-ink-muted">{p.index}</span>
              <span className="text-compact text-ink-muted">{p.meta[0].v}</span>
            </div>
            <h3 className="mt-1 text-secondary">{p.title}</h3>
          </button>
        ))}
      </div>
    )
  }
  if (id === 'about') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body">
          {about.lead} <span className="text-ink-muted">{about.tail}</span>
        </p>
        <ul className="space-y-1 text-compact">
          {cities.map((c) => (
            <li key={c.name} className="flex justify-between gap-4 tabular-nums">
              <span>{c.name}</span>
              <span className="text-ink-muted">{c.lat}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {capabilities.map((c) => (
            <span key={c} className="inline-flex h-8 items-center rounded-full bg-control px-3 text-compact">
              {c}
            </span>
          ))}
        </div>
      </div>
    )
  }
  if (id === 'resume') {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-title">{resume.title}</h3>
        <p className="text-secondary text-ink-muted">{resume.summary}</p>
        <ul className="space-y-3">
          {experience.map((row) => (
            <li key={row.id} className="border-t border-rule pt-3">
              <div className="text-secondary">{row.org}</div>
              <div className="text-compact text-ink-muted">{row.role}</div>
              <div className="text-caption text-ink-muted">{row.note}</div>
            </li>
          ))}
        </ul>
        <a
          href={resume.pdfHref}
          title={resume.pdfNote}
          className="ctl ctl-primary inline-flex w-fit items-center"
        >
          {resume.downloadLabel}
        </a>
      </div>
    )
  }
  if (id === 'contact') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-title">
          {profile.contactLine.lead}{' '}
          <span className="rounded-mark bg-accent px-1">{profile.contactLine.accent}</span>
          {profile.contactLine.end}
        </p>
        <p className="text-compact text-ink-muted">{profile.looking}</p>
        <ul className="flex flex-wrap gap-2">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.href}
                title={l.note}
                className="glass inline-flex h-11 items-center rounded-full px-4 text-compact"
              >
                {l.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  const project = projects.find((p) => p.id === id)
  if (!project) return null
  return <CaseArticle project={project} compact />
}

function Dock({
  openIds,
  focused,
  onToggle,
}: {
  openIds: WinId[]
  focused: WinId | null
  onToggle: (id: WinId) => void
}) {
  return (
    <nav
      aria-label="Dock"
      className="absolute inset-x-0 bottom-3 z-[50] flex justify-center px-3 sm:bottom-4"
    >
      <div className="glass glass-edge flex max-w-full items-center gap-1 overflow-x-auto rounded-full p-1 no-scrollbar">
        {APPS.map((a) => {
          const isOpen = openIds.includes(a.id)
          const isFocused = focused === a.id
          return (
            <button
              key={a.id}
              type="button"
              title={a.hint}
              aria-pressed={isOpen}
              onClick={() => onToggle(a.id)}
              className={`inline-flex h-11 shrink-0 items-center rounded-full px-3 text-compact sm:px-4 ${
                isFocused ? 'bg-white text-ink shadow-[0_1px_2px_rgb(22_22_22/10%)]' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {a.label}
              {isOpen && !isFocused && (
                <span aria-hidden className="ml-2 inline-block h-1 w-1 rounded-full bg-ink" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

interface Command {
  id: string
  label: string
  hint: string
  run: () => void
}

function Palette({
  onClose,
  onRun,
}: {
  onClose: () => void
  onRun: (id: WinId) => void
}) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()

  const commands: Command[] = [
    ...APPS.map((a) => ({
      id: a.id,
      label: `Open ${a.label}`,
      hint: a.hint,
      run: () => onRun(a.id),
    })),
    ...links.map((l) => ({
      id: l.id,
      label: l.label,
      hint: l.note,
      run: () => {
        onClose()
        window.open(l.href, '_self')
      },
    })),
  ]

  const filtered = commands.filter((c) => {
    const hay = `${c.label} ${c.hint}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })
  const current = filtered[Math.min(active, Math.max(0, filtered.length - 1))]

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/20 p-4 pt-[18svh] backdrop-blur-sm"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1, transition: open }}
      exit={{ opacity: 0, transition: close }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        role="dialog"
        aria-label="Command palette"
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0, transition: open }}
        exit={{ opacity: 0, y: -8, transition: close }}
        className="glass glass-edge w-full max-w-[520px] overflow-hidden rounded-card"
      >
        <div className="flex h-11 items-center gap-2 border-b border-rule px-3">
          <Search size={16} className="text-ink-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((i) => Math.min(i + 1, filtered.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter' && current) {
                e.preventDefault()
                current.run()
              }
            }}
            placeholder="Open a window, jump to a case, or a link…"
            className="h-11 flex-1 bg-transparent text-compact outline-none"
            aria-autocomplete="list"
            aria-controls="palette-list"
          />
          <span className="text-caption text-ink-muted">Esc</span>
        </div>
        <ul id="palette-list" role="listbox" className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <li className="px-3 py-4 text-compact text-ink-muted">No matches.</li>
          )}
          {filtered.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => c.run()}
                className={`flex h-11 w-full items-center justify-between rounded-full px-3 text-left text-compact ${
                  i === active ? 'bg-white' : 'hover:bg-white/50'
                }`}
              >
                <span>{c.label}</span>
                <span className="text-caption text-ink-muted">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}
