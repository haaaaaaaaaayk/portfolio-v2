/**
 * Ink primitives and the five panels, ported from the hiker-illustrations
 * generator: wobbly strokes, stippled canopies, hatched trunks, the hiker.
 * Everything is drawn black on white in world units (a panel is 420 × 260).
 */
export type Pt = [number, number]
export type Rng = () => number

export const PW = 420
export const PH = 260

export function mulberry(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class Ink {
  c: CanvasRenderingContext2D
  r: Rng
  constructor(c: CanvasRenderingContext2D, r: Rng) {
    this.c = c
    this.r = r
  }
  u(a: number, b: number) {
    return a + (b - a) * this.r()
  }
  gauss() {
    return Math.sqrt(-2 * Math.log(1 - this.r())) * Math.cos(2 * Math.PI * this.r())
  }
  wob(pts: Pt[], step = 6, j = 0.8): Pt[] {
    const out: Pt[] = []
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i]
      const [x1, y1] = pts[i + 1]
      const L = Math.hypot(x1 - x0, y1 - y0)
      const n = Math.max(1, Math.floor(L / step))
      const nx = L ? -(y1 - y0) / L : 0
      const ny = L ? (x1 - x0) / L : 0
      for (let k = 0; k < n; k++) {
        const t = k / n
        const o = i || k ? this.u(-j, j) : 0
        out.push([x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o])
      }
    }
    out.push(pts[pts.length - 1])
    return out
  }
  trace(pts: Pt[], closed: boolean) {
    const c = this.c
    c.beginPath()
    if (pts.length < 3) {
      c.moveTo(...pts[0])
      for (const p of pts.slice(1)) c.lineTo(...p)
      return
    }
    const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    if (closed) {
      const m0 = mid(pts[pts.length - 1], pts[0])
      c.moveTo(...m0)
      for (let i = 0; i < pts.length; i++) {
        const m = mid(pts[i], pts[(i + 1) % pts.length])
        c.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1])
      }
      c.closePath()
      return
    }
    c.moveTo(...pts[0])
    for (let i = 1; i < pts.length - 1; i++) {
      const m = mid(pts[i], pts[i + 1])
      c.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1])
    }
    c.lineTo(...pts[pts.length - 1])
  }
  stroke(pts: Pt[], w = 1.8, j = 0.8, step = 6) {
    this.trace(this.wob(pts, step, j), false)
    const c = this.c
    c.lineWidth = w
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.strokeStyle = '#000'
    c.stroke()
  }
  fill(pts: Pt[], color = '#000', outline = 0, j = 0.6) {
    this.trace(this.wob(pts, 5, j), true)
    const c = this.c
    c.fillStyle = color
    c.fill()
    if (outline) {
      c.lineWidth = outline
      c.lineJoin = 'round'
      c.strokeStyle = '#000'
      c.stroke()
    }
  }
  dot(x: number, y: number, r: number) {
    const c = this.c
    c.beginPath()
    c.arc(x, y, r, 0, Math.PI * 2)
    c.fillStyle = '#000'
    c.fill()
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, n = 18, j = 0.12, rot = 0): Pt[] {
    const pts: Pt[] = []
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n
      const k = 1 + this.u(-j, j)
      const x = Math.cos(a) * rx * k
      const y = Math.sin(a) * ry * k
      pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)])
    }
    return pts
  }
}

/* ---------- scenery ---------- */

function canopy(d: Ink, x0: number, x1: number, y: number) {
  const pts: Pt[] = []
  for (let x = x0; x <= x1; x += d.u(6, 11)) pts.push([x, y + d.u(-5, 5) + (d.r() < 0.12 ? 8 : 0)])
  for (let i = 0; i < pts.length - 1; ) {
    const n = 3 + Math.floor(d.r() * 5)
    d.stroke(pts.slice(i, i + n + 1), 1.5, 1.2, 4)
    i += n + (d.r() < 0.4 ? 1 : 0)
  }
  for (let k = 0; k < (x1 - x0) * 1.6; k++) {
    const py = y - Math.abs(d.gauss() * 14) + 2
    if (py > 0) d.dot(d.u(x0, x1), py, d.u(0.5, 1.2))
  }
  for (let k = 0; k < (x1 - x0) / 30; k++) {
    d.fill(d.ellipse(d.u(x0, x1), y - d.u(0, 10), d.u(2, 5), d.u(1.5, 3), 8, 0.35))
  }
  for (let k = 0; k < (x1 - x0) / 40; k++) {
    const cx = d.u(x0, x1)
    const cy = y - d.u(4, 22)
    const a0 = d.u(0, 6)
    const curl: Pt[] = [0, 1, 2, 3, 4].map((t) => [cx + 4 * Math.cos(a0 + t * 0.9), cy + 4 * Math.sin(a0 + t * 0.9)])
    d.stroke(curl, 1.2, 0.3, 3)
  }
}

function tree(d: Ink, x: number, gy: number, w: number, top = 38, lean = 0) {
  d.stroke([[x - 3, gy + 2], [x, gy - 6], [x + lean * 0.5, (gy + top) / 2], [x + lean, top]], 2.2, 0.7)
  d.stroke([[x + w + 4, gy + 2], [x + w, gy - 6], [x + w + lean * 0.5, (gy + top) / 2], [x + w + lean, top]], 2.2, 0.7)
  for (let k = 0; k < ((gy - top) * w) / 9; k++) {
    const yy = top + (gy - top) * d.r()
    const xe = x + w + lean * ((gy - yy) / (gy - top))
    const xx = xe - d.u(1, w * 0.45)
    d.stroke([[xx, yy], [xx + d.u(-0.4, 0.4), yy + d.u(2, 9)]], 0.9, 0, 20)
  }
  for (let k = 0; k < 3; k++) {
    const yy = top + (gy - top) * d.u(0.3, 0.8)
    d.fill(d.ellipse(x + w * d.u(0.3, 0.6) + lean * ((gy - yy) / (gy - top)), yy, 1.2, 2.6, 8, 0.2))
  }
  for (let k = 0; k < 4; k++) {
    const xx = x + d.u(-6, w + 6)
    d.stroke([[xx, gy + 1], [xx + d.u(-3, 3), gy - d.u(4, 9)]], 1.3, 0.3, 4)
  }
}

function tuft(d: Ink, x: number, y: number, size = 1, dense = false) {
  const n = dense ? 5 + Math.floor(d.r() * 5) : 3 + Math.floor(d.r() * 4)
  for (let k = 0; k < n; k++) {
    const bx = x + d.u(-4, 4) * size
    const h = d.u(4, 13) * size
    const lean = d.u(-3, 3) * size
    d.stroke([[bx, y], [bx + lean * 0.4, y - h * 0.6], [bx + lean, y - h]], d.u(1, 1.9), 0.2, 4)
  }
  if (d.r() < 0.5) d.fill([[x - 3 * size, y], [x + 3 * size, y], [x + d.u(-1, 1), y - d.u(5, 9) * size]])
}

function ground(d: Ink, pts: Pt[]) {
  const dense = d.wob(pts, 10, 0.6)
  for (let i = 0; i < dense.length; ) {
    const n = 3 + Math.floor(d.r() * 7)
    const seg = dense.slice(i, i + n + 1)
    if (seg.length > 1) d.stroke(seg, 1.8, 0.5)
    i += n + (d.r() < 0.5 ? 1 : 0)
  }
}

function stipple(d: Ink, x0: number, x1: number, y0: number, y1: number, n: number, rmax = 1, fn?: (x: number, y: number) => boolean) {
  for (let k = 0; k < n; k++) {
    const x = d.u(x0, x1)
    const y = d.u(y0, y1)
    if (fn && !fn(x, y)) continue
    d.dot(x, y, d.u(0.4, rmax))
  }
}

function rock(d: Ink, cx: number, cy: number, rx: number, ry: number) {
  const pts = d.ellipse(cx, cy, rx, ry, 14, 0.15)
  d.fill(pts)
  d.fill(pts.map(([x, y]): Pt => [cx + (x - cx) * 0.82 - rx * 0.12, cy + (y - cy) * 0.7 - ry * 0.2]), '#fff')
  d.stroke(pts.slice(0, 9), 1.6, 0.2, 8)
}

function mushroom(d: Ink, x: number, y: number, s = 1) {
  d.stroke([[x, y], [x + 0.5 * s, y - 6 * s]], 2 * s, 0.2, 3)
  d.fill([[x - 6 * s, y - 5 * s], [x - 4 * s, y - 9 * s], [x, y - 10.5 * s], [x + 4.5 * s, y - 9 * s], [x + 6.5 * s, y - 5 * s]], '#fff', 1.5)
  d.dot(x - 1.5 * s, y - 8 * s, 0.8 * s)
  d.dot(x + 2 * s, y - 7.5 * s, 0.7 * s)
}

function water(d: Ink, x0: number, x1: number, y0: number, y1: number) {
  for (let y = y0; y < y1; y += d.u(6, 10)) {
    for (let x = x0 + d.u(0, 14); x < x1; ) {
      const L = d.u(6, 26)
      d.stroke([[x, y + d.u(-1, 1)], [Math.min(x + L, x1), y + d.u(-1, 1)]], d.u(1, 1.8), 0.4, 6)
      x += L + d.u(6, 22)
    }
  }
  for (let k = 0; k < 3; k++) d.fill(d.ellipse(d.u(x0 + 20, x1 - 20), d.u(y0 + 6, y1 - 4), d.u(5, 9), 1.6, 10, 0.2))
}

function reeds(d: Ink, x: number, y: number) {
  const n = 4 + Math.floor(d.r() * 4)
  for (let k = 0; k < n; k++) {
    const bx = x + d.u(-5, 5)
    const h = d.u(28, 48)
    const lean = d.u(-4, 4)
    d.stroke([[bx, y], [bx + lean * 0.5, y - h * 0.5], [bx + lean, y - h]], 1.3, 0.3, 6)
  }
  const hx = x + d.u(-1, 1)
  d.fill([[hx - 1.8, y - 40], [hx + 1.8, y - 40], [hx + 2, y - 52], [hx - 1.5, y - 53]])
  d.stroke([[hx, y - 53], [hx, y - 60]], 1, 0)
}

function bird(d: Ink, x: number, y: number, s = 1) {
  d.stroke([[x - 6 * s, y - 2 * s], [x - 2.5 * s, y - 3 * s], [x, y]], 1.3, 0.1, 3)
  d.stroke([[x, y], [x + 2.5 * s, y - 3.2 * s], [x + 6 * s, y - 2.5 * s]], 1.3, 0.1, 3)
}

function dragonfly(d: Ink, x: number, y: number) {
  d.stroke([[x, y - 5], [x, y + 9]], 2.2, 0)
  for (const sx of [-1, 1]) {
    d.fill(d.ellipse(x + sx * 6, y - 1, 6, 1.8, 10, 0.1, sx * 0.2))
    d.fill(d.ellipse(x + sx * 5, y + 3, 5, 1.6, 10, 0.1, -sx * 0.2))
  }
}

/* ---------- panels (no hiker; he is drawn live) ---------- */

export const STONES: { x: number; y: number; rx: number }[] = [
  { x: 150, y: 214, rx: 11 },
  { x: 180, y: 208, rx: 12 },
  { x: 215, y: 206, rx: 13 },
  { x: 262, y: 210, rx: 12 },
  { x: 305, y: 214, rx: 10 },
]
export const LOG = { x: 212, y: 193, r: 13 }

const slopeY = (x: number) => 250 - x * 0.36

function panelSlope(d: Ink) {
  canopy(d, 20, 420, 34)
  tree(d, 38, slopeY(38) + 4, 22, 38, 3)
  tree(d, 330, slopeY(330) + 3, 16, 38, -2)
  tree(d, 388, slopeY(388) + 2, 12)
  const pts: Pt[] = []
  for (let x = 0; x <= 420; x += 30) pts.push([x, slopeY(x) + d.u(-2, 2)])
  ground(d, pts)
  d.stroke([[90, 238], [230, 214], [300, 196]], 1.3, 1, 10)
  d.stroke([[300, 196], [150, 192], [120, 186]], 1, 1, 12)
  stipple(d, 0, 420, 150, 260, 520, 0.9, (x, y) => y > slopeY(x) + 6)
  for (const x of [12, 70, 120, 160, 250, 285, 360, 405]) tuft(d, x, slopeY(x) + 1, d.u(0.8, 1.2), d.r() < 0.5)
  rock(d, 275, slopeY(275) + 3, 10, 5)
  rock(d, 140, slopeY(140) + 5, 7, 3.5)
  bird(d, 300, 70)
  bird(d, 318, 62, 0.7)
}

function panelWater(d: Ink) {
  canopy(d, 0, 140, 36)
  canopy(d, 300, 420, 40)
  tree(d, 40, 172, 18, 36, 2)
  tree(d, 360, 176, 15, 40, -3)
  ground(d, [[0, 172], [60, 170], [100, 176], [125, 190]])
  ground(d, [[330, 196], [360, 180], [420, 178]])
  stipple(d, 0, 125, 175, 260, 200, 0.9, (x, y) => y > 172 + Math.max(0, x - 100) * 0.6 + 4)
  stipple(d, 330, 420, 180, 260, 160, 0.9)
  for (const x of [10, 55, 85, 380, 405]) tuft(d, x, x < 200 ? 172 : 179, 1.1, true)
  water(d, 120, 345, 196, 250)
  for (const s of STONES) rock(d, s.x, s.y, s.rx, 5)
  reeds(d, 338, 200)
  reeds(d, 110, 186)
  dragonfly(d, 280, 120)
}

function panelLog(d: Ink) {
  canopy(d, 0, 420, 40)
  tree(d, 30, 206, 16)
  tree(d, 92, 204, 11, 38, -2)
  tree(d, 330, 206, 20, 38, 2)
  tree(d, 392, 204, 12)
  ground(d, [[0, 206], [100, 204], [200, 207], [300, 205], [420, 206]])
  stipple(d, 0, 420, 210, 260, 260, 0.9)
  const { x: cx, y: cy, r } = LOG
  d.stroke([[cx, cy - r], [cx + 22, cy - r + 3], [cx + 34, cy - r + 5]], 1.9, 0.6)
  d.stroke([[cx + 2, cy + r], [cx + 34, cy + r - 1]], 1.9, 0.6)
  for (let k = 0; k < 18; k++) {
    const x = d.u(cx + 8, cx + 30)
    const y = d.u(cy + 2, cy + r - 2)
    d.stroke([[x, y], [x + d.u(3, 7), y + d.u(-0.5, 0.5)]], 0.9, 0, 20)
  }
  d.stroke([[cx + 34, cy - r + 5], [cx + 37, cy], [cx + 34, cy + r - 1]], 1.6, 0.8, 4)
  d.fill(d.ellipse(cx, cy, r, r, 18, 0.05), '#fff', 2.2)
  for (const rr of [9, 6, 3]) {
    const ring = d.ellipse(cx + 0.5, cy + 0.5, rr, rr * 0.95, 14, 0.08)
    d.stroke([...ring, ring[0]], 1, 0.2, 4)
  }
  d.stroke([[cx - 3, cy + 2], [cx + 8, cy - 6]], 1, 0.3, 3)
  mushroom(d, cx + 24, cy - r + 4, 0.7)
  mushroom(d, 120, 206)
  mushroom(d, 134, 207, 0.7)
  mushroom(d, 290, 206, 0.8)
  for (const x of [60, 150, 260, 320, 370, 410]) tuft(d, x, 206, 1, d.r() < 0.6)
}

export const CLIFF: Pt[] = [[244, 214], [236, 170], [240, 140], [236, 112], [252, 92], [300, 86], [360, 92], [420, 84]]

function panelRope(d: Ink) {
  canopy(d, 0, 200, 36)
  tree(d, 40, 212, 18, 36)
  tree(d, 120, 210, 10, 36, 2)
  d.fill([...CLIFF, [420, 214]], '#fff')
  d.stroke(CLIFF, 2.3, 0.8)
  for (const [x, y, L] of [[270, 120, 40], [330, 110, 70], [380, 130, 50], [300, 160, 40]]) {
    d.stroke([[x, y], [x + d.u(-6, 6), y + L * 0.5], [x + d.u(-4, 4), y + L]], 1.8, 1.2, 6)
  }
  for (let k = 0; k < 200; k++) {
    const x = d.u(250, 420)
    const y = d.u(100, 212)
    if (d.r() < (x - 240) / 220) d.stroke([[x, y], [x - 2, y + d.u(3, 8)]], 0.9, 0, 20)
  }
  d.fill([[236, 170], [250, 168], [252, 172], [238, 174]])
  tuft(d, 280, 88, 1, true)
  tuft(d, 350, 91, 1.2, true)
  canopy(d, 300, 420, 70)
  ground(d, [[0, 212], [120, 210], [244, 214], [420, 214]])
  stipple(d, 0, 244, 216, 260, 200, 0.9)
  for (const x of [12, 80, 160, 205]) tuft(d, x, 212, 1.1, true)
  rock(d, 180, 210, 9, 4)
  d.stroke([[254, 92], [246, 106], [242, 130], [244, 150], [240, 175], [234, 196], [228, 212]], 1.6, 0.5, 5)
  d.dot(254, 92, 2.4)
  bird(d, 110, 80)
  bird(d, 92, 90, 0.7)
}

function panelSummit(d: Ink) {
  const sun = d.ellipse(340, 62, 16, 16, 18, 0.04)
  d.stroke([...sun, sun[0]], 1.8, 0.3, 4)
  for (let k = 0; k < 12; k++) {
    const a = (2 * Math.PI * k) / 12
    d.stroke([[340 + Math.cos(a) * 22, 62 + Math.sin(a) * 22], [340 + Math.cos(a) * 29, 62 + Math.sin(a) * 29]], 1.4, 0, 20)
  }
  d.stroke([[40, 70], [52, 62], [64, 66], [74, 58], [90, 64], [102, 70]], 1.4, 0.6, 4)
  d.stroke([[200, 190], [240, 150], [265, 162], [300, 128], [330, 150], [360, 136], [420, 168]], 1.6, 1)
  d.stroke([[220, 200], [270, 178], [310, 186], [350, 170], [420, 190]], 1.4, 1)
  stipple(d, 230, 420, 150, 200, 160, 0.7)
  for (let x = 250; x < 410; x += 14) {
    const y = 184 + d.u(-6, 6)
    d.fill([[x - 2.5, y], [x + 2.5, y], [x, y - 8]])
  }
  const peak: Pt[] = [[0, 236], [60, 214], [110, 188], [150, 176], [210, 180], [250, 214], [300, 260]]
  d.fill([...peak, [0, 260]], '#fff')
  ground(d, peak)
  stipple(d, 0, 300, 180, 260, 420, 0.9, (x, y) => y > 200 + Math.abs(x - 170) * 0.2)
  tuft(d, 30, 218, 1, true)
  tuft(d, 90, 196, 1, true)
  tuft(d, 230, 200, 1, true)
  rock(d, 182, 170, 24, 9)
  for (const [cy, rx] of [[176, 9], [167, 7], [160, 5], [154, 3.4]]) d.fill(d.ellipse(118, cy, rx, rx * 0.5, 12, 0.1), '#fff', 1.6)
  d.fill(d.ellipse(121, 177, 6, 2, 10, 0.1))
  bird(d, 250, 92)
  bird(d, 268, 102, 0.8)
  bird(d, 236, 106, 0.6)
}

const PANELS = [panelSlope, panelWater, panelLog, panelRope, panelSummit]

/** One panel on its own canvas at `k` pixels per world unit. */
export function renderPanel(i: number, k: number): HTMLCanvasElement {
  const cv = document.createElement('canvas')
  cv.width = Math.ceil(PW * k)
  cv.height = Math.ceil(PH * k)
  const c = cv.getContext('2d')!
  c.fillStyle = '#fff'
  c.fillRect(0, 0, cv.width, cv.height)
  c.scale(k, k)
  PANELS[i](new Ink(c, mulberry(7 + i * 101)))
  return cv
}

/* ---------- the hiker ---------- */

export interface Pose {
  neck: Pt
  head: Pt
  leg1: [Pt, Pt]
  leg2: [Pt, Pt]
  arm1: [Pt, Pt]
  arm2: [Pt, Pt]
  stick?: [Pt, Pt]
}

const lp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const lp2 = (a: [Pt, Pt], b: [Pt, Pt], t: number): [Pt, Pt] => [lp(a[0], b[0], t), lp(a[1], b[1], t)]

export function mixPose(a: Pose, b: Pose, t: number): Pose {
  if (t <= 0) return a
  if (t >= 1) return b
  const stick = a.stick && b.stick ? lp2(a.stick, b.stick, t) : t < 0.5 ? a.stick : b.stick
  return {
    neck: lp(a.neck, b.neck, t),
    head: lp(a.head, b.head, t),
    leg1: lp2(a.leg1, b.leg1, t),
    leg2: lp2(a.leg2, b.leg2, t),
    arm1: lp2(a.arm1, b.arm1, t),
    arm2: lp2(a.arm2, b.arm2, t),
    stick,
  }
}

/** Walk cycle; `slope` is ground dy/dx in the facing direction, `lean` tips the torso forward. */
export function walkPose(ph: number, lean: number, slope: number, stick: boolean): Pose {
  const foot = (p: number): Pt => {
    const fx = 8 * Math.sin(p)
    return [fx, 22 - 4 * Math.max(0, Math.cos(p)) + slope * fx]
  }
  const knee = (f: Pt): Pt => [f[0] * 0.5 + 3.5, f[1] * 0.5]
  const f1 = foot(ph)
  const f2 = foot(ph + Math.PI)
  const neck: Pt = [3 + lean, -23]
  const sw = Math.sin(ph)
  const h1: Pt = [4 - 7 * sw + lean * 0.8, -5]
  const h2: Pt = [7 * sw + lean * 0.8, -5]
  const pose: Pose = {
    neck,
    head: [neck[0] + 2 + lean * 0.3, -32],
    leg1: [knee(f1), f1],
    leg2: [knee(f2), f2],
    arm1: [[(neck[0] + h1[0]) / 2 + 3, -13], h1],
    arm2: [[(neck[0] + h2[0]) / 2 + 1, -13], h2],
  }
  if (stick) {
    const bx = h1[0] + 6
    pose.stick = [[h1[0] + 2, h1[1] - 9], [bx, 22 + slope * bx]]
  }
  return pose
}

export function balancePose(ph: number): Pose {
  const w = walkPose(ph, 0, 0, false)
  const a = Math.sin(ph * 0.5) * 4
  return { ...w, neck: [2, -24], head: [4, -33], arm1: [[14, -20], [25, -23 + a]], arm2: [[-12, -18], [-22, -13 - a]] }
}

export const STEP_POSE: Pose = {
  neck: [4, -24],
  head: [7, -33],
  leg1: [[12, -9], [19, -2]],
  leg2: [[-2, 10], [-5, 21]],
  arm1: [[12, -13], [13, -6]],
  arm2: [[-5, -12], [-11, -5]],
  stick: [[-12, -16], [-16, 22]],
}

export function climbPose(ph: number): Pose {
  const a = Math.sin(ph)
  return {
    neck: [8, -22],
    head: [12, -31],
    leg1: [[12, -3 - 3 * a], [17, 7 - 4 * a]],
    leg2: [[5, 12 + 2 * a], [11, 22 + 2 * a]],
    arm1: [[16, -31 + 3 * a], [21, -41 + 4 * a]],
    arm2: [[15, -15 - 3 * a], [23, -11 - 4 * a]],
  }
}

export const SIT_POSE: Pose = {
  neck: [-2, -23],
  head: [1, -32],
  leg1: [[13, -5], [17, 11]],
  leg2: [[11, -3], [12, 13]],
  arm1: [[5, -10], [12, -5]],
  arm2: [[-8, -9], [-12, 1]],
  stick: [[-22, -20], [-14, 2]],
}

/** Hands on knees, catching breath. */
export const REST_POSE: Pose = {
  neck: [11, -17],
  head: [16, -24],
  leg1: [[5, 10], [6, 22]],
  leg2: [[-2, 11], [-5, 22]],
  arm1: [[11, -8], [7, 3]],
  arm2: [[6, -8], [2, 4]],
  stick: [[14, -6], [16, 22]],
}

/** Draws the hiker with his hip at (ox, oy) in world units. */
export function drawHiker(d: Ink, ox: number, oy: number, P: Pose, dirn: 1 | -1, s = 1.15) {
  const T = (p: Pt): Pt => [ox + p[0] * s * dirn, oy + p[1] * s]
  const hip = T([0, 0])
  const neck = T(P.neck)
  const vx = neck[0] - hip[0]
  const vy = neck[1] - hip[1]
  const L = Math.hypot(vx, vy)
  const ux = vx / L
  const uy = vy / L
  let nx = -uy
  let ny = ux
  if (nx * dirn > 0) {
    nx = -nx
    ny = -ny
  }
  const boot = (p: Pt) => d.fill(d.ellipse(p[0] + dirn * 2.2 * s, p[1] - 0.6 * s, 4.2 * s, 2.4 * s, 10, 0.1))
  if (P.stick) d.stroke([T(P.stick[0]), T(P.stick[1])], 1.9 * s, 0.3, 8)
  d.stroke([neck, T(P.arm2[0]), T(P.arm2[1])], 3.4 * s, 0.2, 5)
  d.stroke([hip, T(P.leg2[0]), T(P.leg2[1])], 4.4 * s, 0.2, 5)
  boot(T(P.leg2[1]))
  const at = (t: number, o: number): Pt => [hip[0] + vx * t + nx * o * s, hip[1] + vy * t + ny * o * s]
  d.fill([at(0.95, 3), at(0.98, 12), at(0.55, 14), at(0.12, 12), at(0.1, 3)])
  const roll = at(1.04, 8)
  d.fill(d.ellipse(roll[0], roll[1], 7 * s, 3.4 * s, 12, 0.08, Math.atan2(ny, nx) + Math.PI / 2), '#fff', 1.6 * s)
  d.fill(
    [
      [neck[0] + nx * 5 * s + ux * 2 * s, neck[1] + ny * 5 * s + uy * 2 * s],
      [neck[0] - nx * 5.5 * s + ux * s, neck[1] - ny * 5.5 * s + uy * s],
      [hip[0] - nx * 5 * s, hip[1] - ny * 5 * s],
      [hip[0] + nx * 5 * s, hip[1] + ny * 5 * s],
    ],
    '#fff',
    2.1 * s,
    0.4,
  )
  d.stroke([hip, T(P.leg1[0]), T(P.leg1[1])], 4.6 * s, 0.2, 5)
  boot(T(P.leg1[1]))
  d.stroke([[neck[0] - ux * 2 * s, neck[1] - uy * 2 * s], T(P.arm1[0]), T(P.arm1[1])], 3.6 * s, 0.2, 5)
  const hc = T(P.head)
  const r = 7 * s
  d.fill(d.ellipse(hc[0], hc[1], r, r, 16, 0.04), '#fff', 2 * s)
  const hair: Pt[] = []
  const ang = (deg: number) => {
    const a = (deg * Math.PI) / 180
    return dirn < 0 ? Math.PI - a : a
  }
  for (let k = 0; k < 13; k++) {
    const a = ang(150 + (k * 205) / 12)
    hair.push([hc[0] + Math.cos(a) * r * 1.06, hc[1] + Math.sin(a) * r * 1.06])
  }
  for (let k = 0; k < 6; k++) {
    const a = ang(345 - (k * 195) / 5)
    const rr = r * (k === 1 || k === 2 ? 0.35 : 0.55)
    hair.push([hc[0] + Math.cos(a) * rr - dirn * 0.6 * s, hc[1] + Math.sin(a) * rr - 1.5 * s])
  }
  d.fill(hair, '#000', 0, 0.3)
  d.dot(hc[0] + dirn * 3.6 * s, hc[1] + s, 1.1 * s)
}
