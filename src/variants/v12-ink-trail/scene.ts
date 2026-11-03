/**
 * Ink Trail engine. The five panels are drawn once per size on 2D canvases;
 * every frame composes the visible strip, the live hiker and his thought
 * bubble onto one ink canvas, and a WebGL pass boils, bleeds and grains it
 * like a photocopied pen drawing.
 */
import {
  balancePose,
  climbPose,
  drawHiker,
  Ink,
  mixPose,
  mulberry,
  PH,
  PW,
  renderPanel,
  REST_POSE,
  SIT_POSE,
  STEP_POSE,
  STONES,
  walkPose,
  type Pose,
  type Pt,
} from './ink'

export interface InkTrailOptions {
  /** line boil 0–1 */
  boil: number
  /** ink spread 0–1 */
  bleed: number
  /** photocopy grain 0–1 */
  grain: number
  onThought?: (text: string | null) => void
  /** he reached the top */
  onDone?: () => void
  /** clicked after the finale */
  onFinale?: () => void
}

const GUT = 90
const WORLD_W = 5 * PW + 6 * GUT
const panelX = (i: number) => GUT + i * (PW + GUT)
const S = 1.15
const HIP = 22 * S
const SIT_HIP: Pt = [178, 161]

export const TITLES = [
  ['Face the', 'Slope'],
  ['Cross the', 'Water'],
  ['Step Over', 'What Falls'],
  ['Hold the', 'Rope'],
  ['Rest at', 'the Top'],
] as const

/* Same voice as Trail: a designer who did not sign up for this. */
const SCENE_LINES = [
  ['Nobody mentioned a slope in the brief.', 'Wait, is it uphill the whole way?', 'This trail has terrible onboarding.', 'Oh, my smoker lungs.'],
  ['Wet socks are a breaking change.', 'This bridge is still in Figma.', 'Stepping stones. Very skeuomorphic.', 'If I fall in, it was a design decision.'],
  ['Who left this component lying here?', 'Deprecated tree. Nobody cleaned it up.', 'My legs just filed a bug report.', 'Zero affordances. Not one handrail.'],
  ['One rope. That’s the whole UI?', 'Somebody rate-limit this mountain.', 'Is this rope accessible? Asking for me.', 'I’d trade a kidney for a chairlift.'],
  ['Almost there. Probably. Hopefully.', 'If I don’t make it, use an 8pt grid.'],
]
const LINES = {
  open: 'Point ahead of me. I start strong.',
  back: ['Wait, downhill is so much nicer.', 'Strategic retreat.', 'Going back for my dignity.'],
  rest: ['I’m not resting, I’m iterating.', 'Buffering. Please hold.', 'My knees just unsubscribed.', 'Sitting is cardio, right?', 'Respawning…'],
  idle: ['Are we done? Can we go home?', 'Great, now the cursor quit too.', 'I live here now.'],
  poke: ['Okay, okay, I’m going.', 'Five more minutes. Please.', 'Don’t poke the designer.', 'Fine. Up. Ugh.'],
  peak: 'Ugh, Hayk hates hiking.',
  finale: 'Enough torture, now look at my projects.',
}

/* ---------- route ---------- */

type Mode = 'walk' | 'slope' | 'stones' | 'step' | 'climb' | 'sit' | 'gap' | 'end'
const LOCAL: [number, number, Mode][][] = [
  [[20, 250 - 20 * 0.36, 'slope'], [420, 250 - 420 * 0.36, 'gap']],
  [[0, 172, 'walk'], [100, 172, 'walk'], [124, 188, 'walk'], [150, 209, 'stones'], [305, 209, 'walk'], [330, 196, 'walk'], [360, 180, 'walk'], [420, 178, 'gap']],
  [[0, 206, 'walk'], [188, 206, 'step'], [238, 206, 'walk'], [420, 206, 'gap']],
  [[0, 212, 'walk'], [222, 212, 'climb'], [222, 100, 'walk'], [256, 90, 'walk'], [300, 86, 'walk'], [360, 92, 'walk'], [420, 84, 'gap']],
  [[0, 236, 'walk'], [60, 214, 'walk'], [110, 188, 'walk'], [150, 176, 'sit'], [176, 180, 'end']],
]
interface Seg {
  x0: number
  y0: number
  x1: number
  y1: number
  mode: Mode
  panel: number
  s0: number
  len: number
}
const SEGS: Seg[] = (() => {
  const nodes = LOCAL.flatMap((list, panel) => list.map(([x, y, mode]) => ({ x: panelX(panel) + x, y, mode, panel })))
  const out: Seg[] = []
  let s = 0
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i]
    const b = nodes[i + 1]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    out.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, mode: a.mode, panel: a.panel, s0: s, len })
    s += len
  }
  return out
})()
const ROUTE_LEN = SEGS[SEGS.length - 1].s0 + SEGS[SEGS.length - 1].len
const SPEED: Record<Mode, number> = { walk: 1, slope: 0.8, stones: 0.7, step: 0.55, climb: 0.4, sit: 0.6, gap: 1.6, end: 0 }
const COST: Record<Mode, number> = { walk: 0.8, slope: 1.3, stones: 1.1, step: 1.5, climb: 2, sit: 0.3, gap: 0, end: 0 }

function segAt(s: number) {
  let i = SEGS.length - 1
  while (i > 0 && SEGS[i].s0 > s) i--
  const g = SEGS[i]
  const t = Math.max(0, Math.min(1, (s - g.s0) / g.len))
  return { g, t }
}

function stoneY(lx: number) {
  for (let j = 0; j < STONES.length - 1; j++) {
    const a = STONES[j]
    const b = STONES[j + 1]
    if (lx <= b.x) {
      const t = Math.max(0, (lx - a.x) / (b.x - a.x))
      return a.y - 5 + (b.y - a.y) * t - 7 * Math.sin(Math.PI * t)
    }
  }
  return STONES[STONES.length - 1].y - 5
}

/* ---------- shader ---------- */

const VERT = `attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`
const FRAG = `precision mediump float;
uniform sampler2D uTex;uniform vec2 uRes;uniform float uStep,uBoil,uBleed,uGrain;uniform vec3 uPaper,uInk;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float ink(vec2 uv){return 1.-texture2D(uTex,uv).r;}
void main(){
  vec2 px=1./uRes;vec2 q=gl_FragCoord.xy;float s=uStep;
  /* line boil: a displacement field that jumps a few times a second, like redrawn frames */
  vec2 o=vec2(noise(q*.03+s*17.3),noise(q*.03+41.7+s*9.1))-.5;
  vec2 uv=vUv+o*px*uBoil*7.;
  /* bleed: spread the ink, then re-threshold so it stays a hard pen line */
  float r=.8+uBleed*2.6;
  float c=ink(uv)*.4+(ink(uv+vec2(r,0.)*px)+ink(uv-vec2(r,0.)*px)+ink(uv+vec2(0.,r)*px)+ink(uv-vec2(0.,r)*px))*.15;
  float th=mix(.6,.16,uBleed);
  float rough=(noise(q*.22+s*3.)-.5)*.4*uGrain;
  float m=smoothstep(th-.07,th+.07,c+rough);
  /* photocopy: toner dropouts in the ink, specks on the paper */
  float drop=step(1.-uGrain*.07,noise(q*.55+s*5.));
  float speck=step(1.-uGrain*.0035,hash(floor(q/1.6)+s*.37));
  m=max(m*(1.-drop*.85),speck);
  float fib=(noise(q*vec2(.015,.35))-.5)*.035*uGrain+(hash(q+s)-.5)*.05*uGrain;
  gl_FragColor=vec4(mix(uPaper+fib,uInk,m),1.);
}`

function cssColor(name: string, fallback: [number, number, number]): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const m = /^#([0-9a-f]{6})$/i.exec(v)
  if (!m) return fallback
  const n = parseInt(m[1], 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function makeGl(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false })
  if (!gl) return null
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link')
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  for (const [k, v] of [
    [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
    [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
  ]) gl.texParameteri(gl.TEXTURE_2D, k, v)
  const u = (n: string) => gl.getUniformLocation(prog, n)
  const U = { res: u('uRes'), step: u('uStep'), boil: u('uBoil'), bleed: u('uBleed'), grain: u('uGrain'), paper: u('uPaper'), ink: u('uInk') }
  gl.uniform3fv(U.paper, cssColor('--color-paper', [0.98, 0.98, 0.98]))
  gl.uniform3fv(U.ink, cssColor('--color-ink', [0.086, 0.086, 0.086]))
  return {
    draw(src: HTMLCanvasElement, step: number, o: InkTrailOptions) {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
      gl.uniform2f(U.res, canvas.width, canvas.height)
      gl.uniform1f(U.step, step)
      gl.uniform1f(U.boil, o.boil)
      gl.uniform1f(U.bleed, o.bleed)
      gl.uniform1f(U.grain, o.grain)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    /* free resources but keep the context: a remount (StrictMode, reduced-motion flip) reuses this canvas */
    destroy() {
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    },
  }
}

/* ---------- mount ---------- */

export function mountInkTrail(stage: HTMLElement, canvas: HTMLCanvasElement, reduced: boolean, opts: InkTrailOptions) {
  const DPR = Math.min(window.devicePixelRatio || 1, 2)
  const frame = document.createElement('canvas')
  const fc = frame.getContext('2d')!
  let gl: ReturnType<typeof makeGl> = null
  try {
    gl = makeGl(canvas)
  } catch (err) {
    console.error(err)
  }
  const flat = gl ? null : canvas.getContext('2d')
  const family = getComputedStyle(document.body).fontFamily || 'Helvetica, Arial, sans-serif'

  let k = 1
  let viewW = PW
  let panels: HTMLCanvasElement[] = []
  let panelK = 0
  let resizeTimer = 0
  const size = () => {
    const w = Math.max(1, Math.round(stage.clientWidth * DPR))
    const h = Math.max(1, Math.round(stage.clientHeight * DPR))
    canvas.width = frame.width = w
    canvas.height = frame.height = h
    k = h / PH
    viewW = w / k
    window.clearTimeout(resizeTimer)
    const build = () => {
      if (Math.abs(panelK - k) < 0.01 && panels.length) return
      panelK = k
      panels = [0, 1, 2, 3, 4].map((i) => renderPanel(i, k))
    }
    if (!panels.length) build()
    else resizeTimer = window.setTimeout(build, 160)
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(stage)

  /* hiker state */
  const st = {
    s: 0,
    dirn: 1 as 1 | -1,
    ph: 0,
    fatigue: 0,
    resting: false,
    restW: 0,
    hop: 0,
    done: false,
    camX: 0,
    hip: [0, 0] as Pt,
    head: [0, 0] as Pt,
    panel: 0,
    mode: 'slope' as Mode,
  }
  const talk = {
    text: null as string | null,
    until: 0,
    sticky: false,
    lastAt: -99,
    visited: new Set<number>(),
    sceneIdx: [0, 0, 0, 0, 0],
    backAt: -99,
    backHeld: 0,
    idleAt: -99,
    poke: 0,
    rest: 0,
    finaleAt: 0,
  }
  const input = { inside: false, down: false, touch: false, x: 0, y: 0, key: 0, lastAct: 0 }
  let now = 0

  const say = (text: string, sticky = false) => {
    talk.text = text
    talk.sticky = sticky
    talk.until = now + Math.max(2.4, Math.min(5, 1.2 + text.length * 0.055))
    talk.lastAt = now
    opts.onThought?.(text)
  }
  const cycle = (list: string[], key: 'poke' | 'rest') => {
    const line = list[talk[key] % list.length]
    talk[key]++
    return line
  }

  const local = (e: PointerEvent): Pt => {
    const r = canvas.getBoundingClientRect()
    return [(e.clientX - r.left) * DPR, (e.clientY - r.top) * DPR]
  }
  const onMove = (e: PointerEvent) => {
    ;[input.x, input.y] = local(e)
    input.touch = e.pointerType !== 'mouse'
    input.inside = true
    input.lastAct = now
  }
  const onLeave = () => {
    input.inside = false
    input.down = false
  }
  const onDown = (e: PointerEvent) => {
    onMove(e)
    input.down = true
    const wx = st.camX + input.x / k
    const wy = input.y / k
    if (st.mode !== 'gap' && Math.abs(wx - st.hip[0]) < 20 && wy > st.hip[1] - 48 && wy < st.hip[1] + 30) {
      input.down = false
      if (st.done) {
        if (now > talk.finaleAt) opts.onFinale?.()
        return
      }
      say(cycle(LINES.poke, 'poke'))
      st.fatigue = Math.max(0, st.fatigue - 0.3)
      st.resting = false
      st.hop = 1
    }
  }
  const onUp = () => {
    input.down = false
  }
  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' || e.key === 'd' ? 1 : e.key === 'ArrowLeft' || e.key === 'a' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    input.key = e.type === 'keydown' ? dir : input.key === dir ? 0 : input.key
    input.lastAct = now
  }
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  canvas.addEventListener('keydown', onKey)
  canvas.addEventListener('keyup', onKey)

  const update = (dt: number) => {
    let want = input.key
    if (!want && input.inside && (!input.touch || input.down)) {
      const hsx = (st.hip[0] - st.camX) * k
      const dx = (input.x - hsx) / (canvas.width * 0.25)
      want = Math.abs(dx) < 0.06 ? 0 : Math.max(-1, Math.min(1, dx))
    }
    const { g } = segAt(st.s)
    if (st.done || st.resting) want = 0
    if (want < 0 && (g.mode === 'sit' || g.mode === 'end')) want = 0
    const strength = 1.3 - 0.7 * st.fatigue
    const ds = want * 95 * SPEED[g.mode] * strength * dt
    st.s = Math.max(0, Math.min(ROUTE_LEN, st.s + ds))
    const moving = Math.abs(want) > 0.05
    if (moving) st.fatigue = Math.min(1, st.fatigue + dt * Math.abs(want) * SPEED[g.mode] * COST[g.mode] * 0.1)
    else st.fatigue = Math.max(0, st.fatigue - dt * 0.18)
    if (!st.resting && st.fatigue >= 1) {
      st.resting = true
      say(cycle(LINES.rest, 'rest'))
    }
    if (st.resting && st.fatigue <= 0.4) st.resting = false
    st.restW += ((st.resting ? 1 : 0) - st.restW) * Math.min(1, dt * 6)
    st.hop = Math.max(0, st.hop - dt * 3)
    if (g.mode !== 'climb' && g.mode !== 'sit' && g.mode !== 'end' && Math.abs(ds) > 0.01) st.dirn = ds > 0 ? 1 : -1
    if (g.mode === 'climb' || g.mode === 'sit' || g.mode === 'end') st.dirn = 1
    st.ph += Math.abs(ds) * 0.2

    /* thoughts */
    if (talk.text && !talk.sticky && now > talk.until) {
      talk.text = null
      opts.onThought?.(null)
    }
    const quiet = now - talk.lastAt
    const { g: g2 } = segAt(st.s)
    if (!st.done && st.s >= ROUTE_LEN - 0.5) {
      st.done = true
      say(LINES.peak)
      talk.finaleAt = now + 2.6
      opts.onDone?.()
    }
    if (st.done) {
      if (talk.finaleAt && now > talk.finaleAt && talk.text !== LINES.finale) say(LINES.finale, true)
      return
    }
    if (g2.mode !== 'gap' && !talk.visited.has(g2.panel) && want > 0) {
      talk.visited.add(g2.panel)
      say(SCENE_LINES[g2.panel][talk.sceneIdx[g2.panel]++])
    } else if (want > 0.2 && g2.mode !== 'gap' && quiet > 4.5 && !talk.text) {
      const list = SCENE_LINES[g2.panel]
      if (talk.sceneIdx[g2.panel] < list.length) say(list[talk.sceneIdx[g2.panel]++])
    }
    talk.backHeld = want < -0.2 ? talk.backHeld + dt : 0
    if (talk.backHeld > 0.5 && now - talk.backAt > 8) {
      talk.backAt = now
      say(LINES.back[Math.floor(Math.random() * LINES.back.length)])
    }
    if (now - input.lastAct > 7 && now - talk.idleAt > 10 && quiet > 5) {
      talk.idleAt = now
      say(LINES.idle[Math.floor(Math.random() * LINES.idle.length)])
    }
  }

  const pose = (): { hip: Pt; P: Pose } | null => {
    const { g, t } = segAt(st.s)
    st.panel = g.panel
    st.mode = g.mode
    if (g.mode === 'gap') return null
    let x = g.x0 + (g.x1 - g.x0) * t
    let y = g.y0 + (g.y1 - g.y0) * t
    const lx = x - panelX(g.panel)
    const slope = g.x1 !== g.x0 ? ((g.y1 - g.y0) / (g.x1 - g.x0)) * st.dirn : 0
    const walk = walkPose(st.ph, Math.max(-2, Math.min(6, -slope * 14)), slope, true)
    let P: Pose = walk
    let lift = 0
    switch (g.mode) {
      case 'stones':
        y = stoneY(lx)
        P = balancePose(st.ph)
        break
      case 'step': {
        const bump = Math.sin(Math.PI * t)
        P = mixPose(walk, STEP_POSE, bump)
        lift = 6 * bump
        break
      }
      case 'climb':
        P = climbPose(st.ph)
        break
      case 'sit':
      case 'end': {
        const w = g.mode === 'end' ? 1 : t
        const hip: Pt = [x + (panelX(g.panel) + SIT_HIP[0] - x) * w, y - HIP + (SIT_HIP[1] - (y - HIP)) * w]
        return { hip, P: mixPose(walk, SIT_POSE, w) }
      }
    }
    if (g.mode !== 'climb') P = mixPose(P, REST_POSE, st.restW)
    lift += 4 * Math.sin(Math.PI * st.hop)
    x = Math.round(x * 4) / 4
    return { hip: [x, y - HIP - lift], P }
  }

  const bubble = (d: Ink, text: string, head: Pt) => {
    const c = fc
    const fs = 14 * DPR
    c.font = `${fs}px ${family}`
    const maxW = 220 * DPR
    const words = text.split(' ')
    const lines: string[] = []
    let cur = ''
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w
      if (c.measureText(next).width > maxW && cur) {
        lines.push(cur)
        cur = w
      } else cur = next
    }
    lines.push(cur)
    const lh = fs * 1.35
    const tw = Math.max(...lines.map((l) => c.measureText(l).width))
    const bw = tw + 40 * DPR
    const bh = lines.length * lh + 26 * DPR
    const W = frame.width
    let cx = Math.max(bw / 2 + 8, Math.min(W - bw / 2 - 8, head[0] + 28 * DPR))
    let cy = head[1] - 44 * DPR - bh / 2
    if (cy - bh / 2 < 8) {
      cy = Math.max(bh / 2 + 8, head[1] - 10 * DPR)
      const side = head[0] < W / 2 ? 1 : -1
      cx = Math.max(bw / 2 + 8, Math.min(W - bw / 2 - 8, head[0] + side * (bw / 2 + 34 * DPR)))
    }
    const pts: Pt[] = []
    for (let i = 0; i < 30; i++) {
      const a = (2 * Math.PI * i) / 30
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      pts.push([cx + Math.sign(ca) * Math.abs(ca) ** 0.5 * (bw / 2), cy + Math.sign(sa) * Math.abs(sa) ** 0.5 * (bh / 2)])
    }
    d.fill(pts, '#fff', 2.2 * DPR, 0.8 * DPR)
    const tx = head[0] + (cx - head[0]) * 0.25
    const ty = head[1] + (cy + bh / 2 - head[1]) * 0.35
    const tx2 = head[0] + (cx - head[0]) * 0.55
    const ty2 = head[1] + (cy + bh / 2 - head[1]) * 0.7
    d.fill(d.ellipse(tx, ty, 3 * DPR, 3 * DPR, 10, 0.1), '#fff', 1.8 * DPR)
    d.fill(d.ellipse(tx2, ty2, 5 * DPR, 4.5 * DPR, 12, 0.1), '#fff', 1.8 * DPR)
    c.fillStyle = '#000'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    lines.forEach((l, i) => c.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * lh))
  }

  const render = (step: number) => {
    const c = fc
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.fillStyle = '#fff'
    c.fillRect(0, 0, frame.width, frame.height)
    const pz = pose()
    const { g, t } = segAt(st.s)
    const target = pz ? pz.hip[0] : g.x0 + (g.x1 - g.x0) * t
    const camT = WORLD_W <= viewW ? (WORLD_W - viewW) / 2 : Math.max(0, Math.min(WORLD_W - viewW, target - viewW * 0.4))
    st.camX = now < 0.05 ? camT : st.camX + (camT - st.camX) * 0.08
    c.setTransform(k, 0, 0, k, -st.camX * k, 0)
    const pk = panelK || k
    for (let i = 0; i < 5; i++) {
      const px = panelX(i)
      if (px + PW < st.camX || px > st.camX + viewW || !panels[i]) continue
      c.drawImage(panels[i], px, 0, panels[i].width / pk, panels[i].height / pk)
    }
    c.fillStyle = '#000'
    c.textAlign = 'left'
    c.textBaseline = 'alphabetic'
    c.font = `700 11px ${family}`
    TITLES.forEach(([a, b], i) => {
      const gx = panelX(i) - GUT + 8
      c.fillText(`${'ABCDE'[i]}. ${a}`, gx, 126)
      c.fillText(b, gx + 16, 141)
    })
    if (pz) {
      st.hip = pz.hip
      c.save()
      c.beginPath()
      c.rect(panelX(st.panel), 0, PW, PH)
      c.clip()
      drawHiker(new Ink(c, mulberry(1 + step)), pz.hip[0], pz.hip[1], pz.P, st.dirn, S)
      c.restore()
      st.head = [(pz.hip[0] + pz.P.head[0] * S * st.dirn - st.camX) * k, (pz.hip[1] + pz.P.head[1] * S) * k]
    }
    if (talk.text && pz) {
      c.setTransform(1, 0, 0, 1, 0, 0)
      bubble(new Ink(c, mulberry(9 + step)), talk.text, st.head)
    }
  }

  let raf = 0
  let last = performance.now()
  const t0 = last
  const tick = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000)
    last = t
    now = (t - t0) / 1000
    if (now > 0.6 && talk.lastAt < 0 && !talk.text) say(LINES.open)
    update(dt)
    const step = reduced || opts.boil <= 0 ? 0 : Math.floor(now * (4 + opts.boil * 6))
    render(step)
    if (gl) gl.draw(frame, step % 97, opts)
    else if (flat) flat.drawImage(frame, 0, 0)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return {
    reset() {
      Object.assign(st, { s: 0, dirn: 1, ph: 0, fatigue: 0, resting: false, restW: 0, hop: 0, done: false })
      talk.visited.clear()
      talk.sceneIdx = [0, 0, 0, 0, 0]
      talk.finaleAt = 0
      say(LINES.open)
    },
    destroy() {
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      ro.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('keydown', onKey)
      canvas.removeEventListener('keyup', onKey)
      gl?.destroy()
    },
  }
}
