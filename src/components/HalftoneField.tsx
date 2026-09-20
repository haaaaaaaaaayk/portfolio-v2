import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/* PHASE 2: replace hero texture field with WebGL shader canvas here */
/**
 * Canvas-2D halftone dot field. Dots grow + darken near the pointer,
 * with a slow ambient drift so the field never feels dead.
 * Static single render under prefers-reduced-motion.
 */
export function HalftoneField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const GAP = 22 // px between dot centers
    const BASE_R = 1.1
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    let raf = 0
    let t = 0
    const pointer = { x: -9999, y: -9999 }
    const isFine = window.matchMedia('(pointer: fine)').matches

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / GAP) + 1
      rows = Math.ceil(h / GAP) + 1
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      const influence = 170 // px radius of pointer effect
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * GAP
          const y = j * GAP
          // ambient breathing
          const wave = Math.sin(t * 0.0006 + i * 0.35 + j * 0.5) * 0.35
          let r = BASE_R + wave * 0.5
          let alpha = 0.14 + wave * 0.05
          if (isFine) {
            const dx = x - pointer.x
            const dy = y - pointer.y
            const d = Math.hypot(dx, dy)
            if (d < influence) {
              const k = 1 - d / influence // 0..1, strongest at pointer
              r += k * k * 3.2
              alpha += k * 0.5
            }
          }
          if (r <= 0.2) continue
          ctx!.beginPath()
          ctx!.arc(x, y, r, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(22,22,19,${Math.min(alpha, 0.75)})`
          ctx!.fill()
        }
      }
    }

    function loop(now: number) {
      t = now
      draw()
      raf = requestAnimationFrame(loop)
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) draw()
    })
    ro.observe(canvas.parentElement!)

    if (reduced) {
      draw() // single static render
    } else {
      const onMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        pointer.x = e.clientX - rect.left
        pointer.y = e.clientY - rect.top
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      raf = requestAnimationFrame(loop)
      return () => {
        window.removeEventListener('pointermove', onMove)
        cancelAnimationFrame(raf)
        ro.disconnect()
      }
    }
    return () => ro.disconnect()
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ display: 'block' }}
    />
  )
}
