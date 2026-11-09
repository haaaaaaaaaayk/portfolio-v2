/**
 * Fogged Glass in miniature: the photo, sharp, under a canvas of fog. Moving the cursor wipes the fog with a soft
 * round finger; it re-condenses over about four seconds, then the loop stops. Pressing and dragging writes too,
 * as in the real piece, and a press that travels more than 6px doesn't open the link it sits in. The blur is the
 * photo drawn tiny and scaled back up, which works in every browser. Touch screens just open the piece on tap.
 */
import { useEffect, useRef, useState } from 'react'

/** draw an image to fill w×h, cropped from the centre (CSS object-fit: cover) */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * s
  const dh = img.naturalHeight * s
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

/**
 * The photo, sharp, with a canvas of fog over it. Moving the cursor wipes the fog away with a soft round finger;
 * the fog re-condenses over about four seconds, then the loop stops. The blur is made by drawing the photo tiny and
 * scaling it back up, which works in every browser (canvas filters don't in Safari). Touch screens just open the
 * piece on tap, so scrolling past the card never paints it.
 */
export function FogPane({ src }: { src: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)

  // load the photo only when the card is near
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        const i = new Image()
        i.decoding = 'async'
        i.onload = () => setImg(i)
        i.src = src
        io.disconnect()
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [src])

  useEffect(() => {
    const c = cv.current
    const w = wrap.current
    if (!img || !c || !w) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let fog: HTMLCanvasElement | null = null
    let raf = 0
    let lastInput = 0
    let last: { x: number; y: number } | null = null

    const build = () => {
      const r = w.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      c.width = Math.max(1, Math.round(r.width * dpr))
      c.height = Math.max(1, Math.round(r.height * dpr))
      const tiny = document.createElement('canvas')
      tiny.width = Math.max(8, Math.round(c.width / 18))
      tiny.height = Math.max(8, Math.round(c.height / 18))
      const t = tiny.getContext('2d')!
      drawCover(t, img, tiny.width, tiny.height)
      fog = document.createElement('canvas')
      fog.width = c.width
      fog.height = c.height
      const f = fog.getContext('2d')!
      f.imageSmoothingEnabled = true
      f.imageSmoothingQuality = 'high'
      f.drawImage(tiny, 0, 0, c.width, c.height)
      f.fillStyle = 'rgba(236, 239, 242, 0.42)' // the cold white of breath on glass
      f.fillRect(0, 0, c.width, c.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.drawImage(fog, 0, 0)
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(w)

    // re-condense: lay the fog back down a little each frame, for a few seconds after the last wipe
    const loop = () => {
      raf = 0
      if (!fog) return
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 0.014
      ctx.drawImage(fog, 0, 0)
      ctx.globalAlpha = 1
      if (performance.now() - lastInput < 6000) raf = requestAnimationFrame(loop)
    }
    const stamp = (x: number, y: number, R: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, R)
      g.addColorStop(0, 'rgba(0,0,0,0.85)')
      g.addColorStop(0.55, 'rgba(0,0,0,0.45)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, R, 0, Math.PI * 2)
      ctx.fill()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = c.getBoundingClientRect()
      const k = c.width / r.width
      const p = { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k }
      const R = 22 * k
      ctx.globalCompositeOperation = 'destination-out'
      if (last) {
        const n = Math.max(1, Math.ceil(Math.hypot(p.x - last.x, p.y - last.y) / (R * 0.3)))
        for (let i = 1; i <= n; i++) stamp(last.x + ((p.x - last.x) * i) / n, last.y + ((p.y - last.y) * i) / n, R)
      } else stamp(p.x, p.y, R)
      ctx.globalCompositeOperation = 'source-over'
      last = p
      lastInput = performance.now()
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onLeave = () => {
      last = null
    }
    c.addEventListener('pointermove', onMove)
    c.addEventListener('pointerleave', onLeave)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      c.removeEventListener('pointermove', onMove)
      c.removeEventListener('pointerleave', onLeave)
    }
  }, [img])

  // pressing and dragging is writing, as in the real piece: a press that travels more than 6px doesn't open the link
  const down = useRef<{ x: number; y: number } | null>(null)
  return (
    <div
      ref={wrap}
      className="absolute inset-0 bg-canvas"
      onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
      onClickCapture={(e) => {
        const d = down.current
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) {
          e.preventDefault()
          e.stopPropagation()
        }
        down.current = null
      }}
    >
      {img && <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {/* not draggable: pressing and moving over a link would otherwise start dragging the link */}
      <canvas ref={cv} aria-hidden draggable={false} onDragStart={(e) => e.preventDefault()} className="absolute inset-0 h-full w-full cursor-crosshair" />
    </div>
  )
}
