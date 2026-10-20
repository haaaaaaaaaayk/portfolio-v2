/** Offscreen 2D maps uploaded as WebGL textures each frame. */

export class PaintMap {
  readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  readonly size: number

  constructor(size = 256) {
    this.size = size
    this.canvas = document.createElement('canvas')
    this.canvas.width = size
    this.canvas.height = size
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('2d context missing')
    this.ctx = ctx
    this.ctx.fillStyle = '#000'
    this.ctx.fillRect(0, 0, size, size)
  }

  clear() {
    this.ctx.globalCompositeOperation = 'source-over'
    this.ctx.fillStyle = '#000'
    this.ctx.fillRect(0, 0, this.size, this.size)
  }

  /** Slow black-over so stamped white decays (refog / forget). */
  fade(amount: number) {
    if (amount <= 0) return
    this.ctx.globalCompositeOperation = 'source-over'
    this.ctx.fillStyle = `rgba(0,0,0,${amount})`
    this.ctx.fillRect(0, 0, this.size, this.size)
  }

  /** Gravity streak: shift the map downward a fraction of a pixel. */
  gravity(px: number) {
    if (px === 0) return
    this.ctx.globalCompositeOperation = 'source-over'
    this.ctx.drawImage(this.canvas, 0, px)
  }

  stamp(nx: number, ny: number, radius: number, strength: number) {
    const x = nx * this.size
    const y = ny * this.size
    const r = Math.max(1, radius * this.size)
    const g = this.ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(255,255,255,${Math.min(1, strength)})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    this.ctx.globalCompositeOperation = 'lighter'
    this.ctx.fillStyle = g
    this.ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  mean(): number {
    const { data } = this.ctx.getImageData(0, 0, this.size, this.size)
    let s = 0
    let n = 0
    for (let i = 0; i < data.length; i += 32) {
      s += data[i]
      n += 1
    }
    return n ? s / (255 * n) : 0
  }
}

export class SourceField {
  readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  photo: HTMLImageElement | HTMLCanvasElement | null = null

  constructor(w = 512, h = 512) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = w
    this.canvas.height = h
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('2d context missing')
    this.ctx = ctx
  }

  paint(lines: string[]) {
    const { ctx, canvas } = this
    const w = canvas.width
    const h = canvas.height
    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, w, h)

    if (this.photo) {
      const img = this.photo
      const iw = img instanceof HTMLImageElement ? img.naturalWidth : img.width
      const ih = img instanceof HTMLImageElement ? img.naturalHeight : img.height
      if (iw > 0 && ih > 0) {
        const scale = Math.max(w / iw, h / ih)
        const dw = iw * scale
        const dh = ih * scale
        ctx.save()
        ctx.globalAlpha = 0.88
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
        ctx.restore()
      }
    }

    const family = getComputedStyle(document.body).fontFamily
    ctx.fillStyle = '#161616'
    ctx.textBaseline = 'top'
    let y = 36
    lines.forEach((line, i) => {
      const size = i === 0 ? 42 : i === 1 ? 28 : 22
      ctx.font = `400 ${size}px ${family}`
      wrap(ctx, line, w - 72).forEach((row) => {
        ctx.fillText(row, 36, y)
        y += size * 1.25
      })
      y += 18
    })

    // density blocks so the specimen has tonal range even without a photo
    ctx.globalAlpha = 0.18
    ctx.fillStyle = '#161616'
    for (let i = 0; i < 8; i++) {
      const bh = 18 + (i % 3) * 12
      ctx.fillRect(36, Math.min(h - 48, y + i * 28), w - 72 - (i % 4) * 40, bh)
    }
    ctx.globalAlpha = 1
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const rows: string[] = []
  let row = ''
  for (const word of words) {
    const next = row ? `${row} ${word}` : word
    if (ctx.measureText(next).width > maxW && row) {
      rows.push(row)
      row = word
    } else {
      row = next
    }
  }
  if (row) rows.push(row)
  return rows
}
