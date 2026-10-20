import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { LiquidField } from '../../components/LiquidField'
import { CaseDialog } from '../../components/CaseDialog'
import { ImageSlot } from '../../components/ImageSlot'
import { about, capabilities, cities, experience, links, profile, projects, resume } from '../../content'
import { spring } from '../../lib/motion'
import type { CaseId } from '../../content/projects'

interface BoardCard {
  id: string
  x: number
  y: number
  w: number
  h: number
}

const CARDS: BoardCard[] = [
  { id: 'mymizu', x: 64, y: 48, w: 420, h: 460 },
  { id: 'minerva', x: 540, y: 24, w: 420, h: 480 },
  { id: 'about', x: 1020, y: 80, w: 380, h: 420 },
  { id: 'cities', x: 80, y: 560, w: 340, h: 320 },
  { id: 'skills', x: 480, y: 560, w: 300, h: 280 },
  { id: 'resume', x: 840, y: 560, w: 380, h: 340 },
  { id: 'contact', x: 1280, y: 520, w: 360, h: 320 },
]

const WORLD = { w: 1760, h: 980 }
const MIN_Z = 0.28
const MAX_Z = 2.2

export default function SpatialCanvas() {
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(40)
  const y = useMotionValue(40)
  const z = useMotionValue(0.72)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const [focused, setFocused] = useState<string | null>(null)
  const [caseId, setCaseId] = useState<CaseId | null>(null)
  const [tick, setTick] = useState(0)

  const go = useCallback(
    (nx: number, ny: number, nz: number) => {
      const nextZ = Math.min(MAX_Z, Math.max(MIN_Z, nz))
      if (reduced) {
        x.set(nx)
        y.set(ny)
        z.set(nextZ)
        setTick((t) => t + 1)
        return
      }
      animate(x, nx, spring)
      animate(y, ny, spring)
      animate(z, nextZ, spring)
      setTick((t) => t + 1)
    },
    [reduced, x, y, z],
  )

  const fitAll = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const pad = 48
    const vw = stage.clientWidth
    const vh = stage.clientHeight
    const scale = Math.min((vw - pad * 2) / WORLD.w, (vh - pad * 2) / WORLD.h, 1)
    const nx = (vw - WORLD.w * scale) / 2
    const ny = (vh - WORLD.h * scale) / 2
    go(nx, ny, scale)
    setFocused(null)
  }, [go])

  const focusCard = useCallback(
    (card: BoardCard) => {
      const stage = stageRef.current
      if (!stage) return
      const vw = stage.clientWidth
      const vh = stage.clientHeight
      const target = Math.min(1.15, (vw - 96) / card.w, (vh - 96) / card.h)
      const nx = vw / 2 - (card.x + card.w / 2) * target
      const ny = vh / 2 - (card.y + card.h / 2) * target
      go(nx, ny, target)
      setFocused(card.id)
    },
    [go],
  )

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let fitted = false
    const ro = new ResizeObserver(() => {
      if (fitted || stage.clientWidth < 32) return
      fitted = true
      fitAll()
    })
    ro.observe(stage)
    return () => ro.disconnect()
  }, [fitAll])

  useEffect(() => {
    let raf = 0
    const sync = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setTick((n) => n + 1)
      })
    }
    const u1 = x.on('change', sync)
    const u2 = y.on('change', sync)
    const u3 = z.on('change', sync)
    return () => {
      u1()
      u2()
      u3()
      cancelAnimationFrame(raf)
    }
  }, [x, y, z])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = stage.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const prev = z.get()
      const next = Math.min(MAX_Z, Math.max(MIN_Z, prev * (e.deltaY > 0 ? 0.92 : 1.08)))
      const wx = (cx - x.get()) / prev
      const wy = (cy - y.get()) / prev
      x.set(cx - wx * next)
      y.set(cy - wy * next)
      z.set(next)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [x, y, z])

  const onPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-card]')) return
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging.current) return
    x.set(x.get() + (e.clientX - last.current.x))
    y.set(y.get() + (e.clientY - last.current.y))
    last.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = () => {
    dragging.current = false
  }

  const cam = { x: x.get(), y: y.get(), z: z.get() }
  void tick

  return (
    <div className="relative h-svh overflow-hidden bg-canvas">
      <LiquidField intensity={0.85} />
      <div
        ref={stageRef}
        className="relative z-10 h-full w-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <motion.div style={{ x, y, scale: z, transformOrigin: '0 0' }} className="relative will-change-transform">
          {CARDS.map((card) => (
            <div
              key={card.id}
              data-card
              style={{ left: card.x, top: card.y, width: card.w, minHeight: card.h }}
              className={`absolute ${focused === card.id ? 'z-10' : ''}`}
            >
              <div
                className={`glass glass-edge sheen h-full w-full rounded-card p-4 text-left ${
                  focused === card.id ? 'shadow-glass-lift' : ''
                }`}
                onClick={() => focusCard(card)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    focusCard(card)
                  }
                }}
                role="group"
                aria-label={card.id}
              >
                <CardFace
                  id={card.id}
                  focused={focused === card.id}
                  onOpenCase={(cid) => setCaseId(cid)}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute top-3 left-3 z-20 sm:top-4 sm:left-4">
        <div className="pointer-events-auto glass glass-edge flex items-center gap-2 rounded-full p-1">
          <button type="button" onClick={fitAll} className="inline-flex h-11 items-center rounded-full px-4 text-compact">
            Fit all
          </button>
          <span className="px-2 text-caption tabular-nums text-ink-muted">{Math.round(cam.z * 100)}%</span>
        </div>
      </div>
      <div className="pointer-events-none absolute right-3 bottom-3 z-20 sm:right-4 sm:bottom-4">
        <Minimap
          cam={cam}
          stage={stageRef}
          onJump={(nx, ny) => {
            x.set(nx)
            y.set(ny)
          }}
        />
      </div>
      <p className="pointer-events-none absolute bottom-4 left-4 z-20 hidden max-w-xs text-caption text-ink-muted sm:block">
        Drag the board · scroll to zoom · click a card to focus
      </p>
      <CaseDialog id={caseId} onClose={() => setCaseId(null)} />
    </div>
  )
}

function CardFace({
  id,
  focused,
  onOpenCase,
}: {
  id: string
  focused: boolean
  onOpenCase: (id: CaseId) => void
}) {
  if (id === 'mymizu' || id === 'minerva') {
    const p = projects.find((x) => x.id === id)!
    return (
      <div className="flex h-full flex-col">
        <span className="text-caption tabular-nums text-ink-muted">{p.index}</span>
        <h3 className="mt-2 text-heading">{p.title}</h3>
        <div className="mt-3">
          <ImageSlot label={p.cardSlot.label} ratio={p.cardSlot.ratio} />
        </div>
        {focused && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenCase(p.id)
            }}
            className="mt-3 inline-flex h-11 w-fit items-center rounded-full bg-ink px-4 text-compact text-white"
          >
            Read case
          </button>
        )}
      </div>
    )
  }
  if (id === 'about') {
    return (
      <div>
        <span className="text-caption text-ink-muted">About</span>
        <p className="mt-2 text-secondary">
          {about.lead} <span className="text-ink-muted">{about.tail}</span>
        </p>
      </div>
    )
  }
  if (id === 'cities') {
    return (
      <div>
        <span className="text-caption text-ink-muted">{about.railNote}</span>
        <ul className="mt-3 space-y-1 text-compact">
          {cities.map((c) => (
            <li key={c.name} className="flex justify-between gap-3 tabular-nums">
              <span>{c.name}</span>
              <span className="text-ink-muted">{c.lat}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (id === 'skills') {
    return (
      <div>
        <span className="text-caption text-ink-muted">Capabilities</span>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {capabilities.map((c) => (
            <span key={c} className="inline-flex h-8 items-center rounded-full bg-control px-3 text-caption">
              {c}
            </span>
          ))}
        </div>
      </div>
    )
  }
  if (id === 'resume') {
    return (
      <div>
        <span className="text-caption text-ink-muted">Résumé</span>
        <h3 className="mt-2 text-heading">{resume.title}</h3>
        <p className="mt-2 text-compact text-ink-muted">{resume.summary}</p>
        {focused && (
          <ul className="mt-3 space-y-2 text-compact">
            {experience.map((row) => (
              <li key={row.id}>
                {row.org}
                <span className="text-ink-muted"> — {row.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
  return (
    <div>
      <span className="text-caption text-ink-muted">Contact</span>
      <p className="mt-2 text-heading">
        {profile.contactLine.lead} {profile.contactLine.accent}
        {profile.contactLine.end}
      </p>
      <p className="mt-2 text-compact text-ink-muted">{profile.looking}</p>
      {focused && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.href}
                title={l.note}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-8 items-center rounded-full bg-control px-3 text-caption"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Minimap({
  cam,
  stage,
  onJump,
}: {
  cam: { x: number; y: number; z: number }
  stage: RefObject<HTMLDivElement | null>
  onJump: (x: number, y: number) => void
}) {
  const w = 160
  const h = Math.round((WORLD.h / WORLD.w) * w)
  const scale = w / WORLD.w
  const vw = stage.current?.clientWidth ?? 1
  const vh = stage.current?.clientHeight ?? 1
  const view = {
    left: (-cam.x / cam.z) * scale,
    top: (-cam.y / cam.z) * scale,
    width: (vw / cam.z) * scale,
    height: (vh / cam.z) * scale,
  }
  return (
    <button
      type="button"
      aria-label="Minimap, click to pan"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        const worldX = mx / scale
        const worldY = my / scale
        onJump(vw / 2 - worldX * cam.z, vh / 2 - worldY * cam.z)
      }}
      className="pointer-events-auto glass glass-edge relative overflow-hidden rounded-media"
      style={{ width: w, height: h }}
    >
      {CARDS.map((c) => (
        <span
          key={c.id}
          className="absolute rounded-mark bg-ink/20"
          style={{
            left: c.x * scale,
            top: c.y * scale,
            width: c.w * scale,
            height: Math.min(c.h, 200) * scale,
          }}
        />
      ))}
      <span
        className="absolute rounded-mark border border-ink/50 bg-accent/20"
        style={{
          left: view.left,
          top: view.top,
          width: view.width,
          height: view.height,
        }}
      />
    </button>
  )
}
