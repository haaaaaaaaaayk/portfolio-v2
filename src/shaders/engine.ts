import { PaintMap, SourceField } from './maps'
import { FRAG, VERT } from './program'

export interface Mix {
  fog: number
  tone: number
  over: number
}

export interface AtmosphereParams {
  mix: Mix
  fog: number
  freeze: boolean
  resolve: number
  grid: number
  tone: number
  effect: number
  color: number
  gain: number
  trail: number
  warp: number
  scrollVel: number
  strip: number
  feedback: number
  dprCap: number
  /** 0 = cursor heat only; 1 = drag-to-draw wipe */
  drawOnDrag: boolean
  /** Finger size 0–1 (Fogged Glass dock). */
  finger: number
  /** Wetness 0–1 — slower refog, stronger drips. */
  wet: number
  sourceLines: string[]
}

const DEFAULTS: AtmosphereParams = {
  mix: { fog: 1, tone: 0, over: 0 },
  fog: 1,
  freeze: false,
  resolve: 0,
  grid: 28,
  tone: 0.85,
  effect: 0,
  color: 1,
  gain: 0.2,
  trail: 0,
  warp: 0,
  scrollVel: 0,
  strip: 0,
  feedback: 0,
  dprCap: 1.5,
  drawOnDrag: false,
  finger: 0.2,
  wet: 0.55,
  sourceLines: [],
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)
  if (!s) throw new Error('shader alloc failed')
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s) || 'compile failed'
    gl.deleteShader(s)
    throw new Error(log)
  }
  return s
}

function loc(gl: WebGLRenderingContext, prog: WebGLProgram, name: string) {
  return gl.getUniformLocation(prog, name)
}

function makeTex(gl: WebGLRenderingContext): WebGLTexture {
  const t = gl.createTexture()
  if (!t) throw new Error('texture alloc failed')
  gl.bindTexture(gl.TEXTURE_2D, t)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return t
}

export class AtmosphereEngine {
  readonly canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private prog: WebGLProgram
  private buf: WebGLBuffer
  private heat: PaintMap
  private clearMap: PaintMap
  private trailMap: PaintMap
  readonly source: SourceField
  private texHeat: WebGLTexture
  private texClear: WebGLTexture
  private texSrc: WebGLTexture
  private texTrail: WebGLTexture
  private u: Record<string, WebGLUniformLocation | null>
  private raf = 0
  private running = false
  private reduced = false
  private hidden = false
  private pointer = { x: 0.5, y: 0.5, down: false }
  private lastMove = performance.now()
  private sourceDirty = true
  params: AtmosphereParams
  private onFrame: ((heatMean: number) => void) | null = null
  private meanAcc = 0
  private meanN = 0

  constructor(canvas: HTMLCanvasElement, params: Partial<AtmosphereParams> = {}) {
    this.canvas = canvas
    this.params = { ...DEFAULTS, ...params, mix: { ...DEFAULTS.mix, ...params.mix } }
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    if (!gl) throw new Error('WebGL unavailable')
    this.gl = gl

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    if (!prog) throw new Error('program alloc failed')
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.bindAttribLocation(prog, 0, 'aPos')
    gl.linkProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || 'link failed')
    }
    this.prog = prog

    const buf = gl.createBuffer()
    if (!buf) throw new Error('buffer alloc failed')
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    this.buf = buf

    this.heat = new PaintMap(256)
    this.clearMap = new PaintMap(256)
    this.trailMap = new PaintMap(256)
    this.source = new SourceField(512, 512)
    this.texHeat = makeTex(gl)
    this.texClear = makeTex(gl)
    this.texSrc = makeTex(gl)
    this.texTrail = makeTex(gl)

    gl.useProgram(prog)
    this.u = {
      uRes: loc(gl, prog, 'uRes'),
      uTime: loc(gl, prog, 'uTime'),
      uPointer: loc(gl, prog, 'uPointer'),
      uMix: loc(gl, prog, 'uMix'),
      uFog: loc(gl, prog, 'uFog'),
      uFreeze: loc(gl, prog, 'uFreeze'),
      uResolve: loc(gl, prog, 'uResolve'),
      uGrid: loc(gl, prog, 'uGrid'),
      uTone: loc(gl, prog, 'uTone'),
      uEffect: loc(gl, prog, 'uEffect'),
      uColor: loc(gl, prog, 'uColor'),
      uGain: loc(gl, prog, 'uGain'),
      uTrail: loc(gl, prog, 'uTrail'),
      uWarp: loc(gl, prog, 'uWarp'),
      uScrollVel: loc(gl, prog, 'uScrollVel'),
      uStrip: loc(gl, prog, 'uStrip'),
      uFeedback: loc(gl, prog, 'uFeedback'),
      uHeat: loc(gl, prog, 'uHeat'),
      uClear: loc(gl, prog, 'uClear'),
      uSource: loc(gl, prog, 'uSource'),
      uTrailMap: loc(gl, prog, 'uTrailMap'),
    }
    gl.uniform1i(this.u.uHeat, 0)
    gl.uniform1i(this.u.uClear, 1)
    gl.uniform1i(this.u.uSource, 2)
    gl.uniform1i(this.u.uTrailMap, 3)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    this.resize()
  }

  setParams(partial: Partial<AtmosphereParams>) {
    if (partial.sourceLines && partial.sourceLines !== this.params.sourceLines) {
      this.sourceDirty = true
    }
    this.params = {
      ...this.params,
      ...partial,
      mix: { ...this.params.mix, ...partial.mix },
    }
  }

  setPhoto(img: HTMLImageElement | HTMLCanvasElement | null) {
    this.source.photo = img
    this.sourceDirty = true
  }

  setReduced(v: boolean) {
    this.reduced = v
  }

  setOnFrame(fn: ((heatMean: number) => void) | null) {
    this.onFrame = fn
  }

  punch(nx: number, ny: number, r = 0.18) {
    this.clearMap.stamp(nx, ny, r, 1)
  }

  heatMean(): number {
    return this.meanN ? this.meanAcc : this.heat.mean()
  }

  snapshot(): string {
    this.resize()
    this.draw(performance.now())
    return this.canvas.toDataURL('image/png')
  }

  private upload(unit: number, tex: WebGLTexture, img: TexImageSource) {
    const { gl } = this
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
  }

  resize() {
    const cap = this.params.dprCap
    const dpr = Math.min(window.devicePixelRatio || 1, cap)
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    const tw = Math.max(1, Math.round(w * dpr))
    const th = Math.max(1, Math.round(h * dpr))
    if (this.canvas.width !== tw || this.canvas.height !== th) {
      this.canvas.width = tw
      this.canvas.height = th
    }
    this.gl.viewport(0, 0, tw, th)
  }

  private draw(now: number) {
    const { gl, params } = this
    if (this.sourceDirty) {
      this.source.paint(params.sourceLines)
      this.sourceDirty = false
    }

    const freeze = params.freeze || this.reduced
    const wet = Math.max(0, Math.min(1, params.wet))
    if (!freeze) {
      this.heat.gravity(params.mix.fog > 0.01 ? 0.35 + wet * 0.9 : 0)
      this.heat.fade(params.drawOnDrag ? 0.003 + (1 - wet) * 0.014 : 0.02)
      this.trailMap.fade(0.06)
    }
    const finger = Math.max(0, Math.min(1, params.finger))
    const heatR = params.drawOnDrag ? (this.pointer.down ? 0.028 + finger * 0.16 : 0.014) : 0.045
    const heatS = params.drawOnDrag ? (this.pointer.down ? 0.62 + wet * 0.36 : 0.07) : 0.4
    if (!this.reduced) this.heat.stamp(this.pointer.x, this.pointer.y, heatR, heatS)
    if (params.feedback > 0 && !this.reduced) {
      this.trailMap.stamp(this.pointer.x, this.pointer.y, 0.04, 0.9)
    }

    this.upload(0, this.texHeat, this.heat.canvas)
    this.upload(1, this.texClear, this.clearMap.canvas)
    this.upload(2, this.texSrc, this.source.canvas)
    this.upload(3, this.texTrail, this.trailMap.canvas)

    gl.useProgram(this.prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height)
    gl.uniform1f(this.u.uTime, this.reduced ? 0 : now * 0.001)
    gl.uniform2f(this.u.uPointer, this.pointer.x, 1 - this.pointer.y)
    gl.uniform3f(this.u.uMix, params.mix.fog, params.mix.tone, params.mix.over)
    gl.uniform1f(this.u.uFog, params.fog)
    gl.uniform1f(this.u.uFreeze, freeze ? 1 : 0)
    gl.uniform1f(this.u.uResolve, params.resolve)
    gl.uniform1f(this.u.uGrid, params.grid)
    gl.uniform1f(this.u.uTone, params.tone)
    gl.uniform1f(this.u.uEffect, params.effect)
    gl.uniform1f(this.u.uColor, params.color)
    gl.uniform1f(this.u.uGain, params.gain)
    gl.uniform1f(this.u.uTrail, params.trail)
    gl.uniform1f(this.u.uWarp, params.warp)
    gl.uniform1f(this.u.uScrollVel, params.scrollVel)
    gl.uniform1f(this.u.uStrip, params.strip)
    gl.uniform1f(this.u.uFeedback, params.feedback)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    this.meanN += 1
    if (this.meanN % 12 === 0) {
      this.meanAcc = this.heat.mean()
      this.onFrame?.(this.meanAcc)
    }
  }

  private loop = (now: number) => {
    if (!this.running || this.hidden) {
      this.raf = 0
      return
    }
    this.resize()
    this.draw(now)
    if (!this.reduced) this.raf = requestAnimationFrame(this.loop)
  }

  start(reduced: boolean) {
    this.reduced = reduced
    this.running = true
    this.hidden = document.visibilityState === 'hidden'
    this.resize()
    this.draw(0)
    if (!reduced) this.raf = requestAnimationFrame(this.loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  setHidden(v: boolean) {
    this.hidden = v
    if (v) {
      cancelAnimationFrame(this.raf)
      this.raf = 0
      return
    }
    if (this.running && !this.reduced && !this.raf) {
      this.raf = requestAnimationFrame(this.loop)
    }
  }

  pointerMove(clientX: number, clientY: number, buttons: number) {
    const r = this.canvas.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return
    this.pointer.x = (clientX - r.left) / r.width
    this.pointer.y = (clientY - r.top) / r.height
    if (buttons) this.pointer.down = true
    this.lastMove = performance.now()
  }

  pointerDown() {
    this.pointer.down = true
    this.lastMove = performance.now()
  }

  pointerUp() {
    this.pointer.down = false
  }

  stillMs(): number {
    return performance.now() - this.lastMove
  }

  destroy() {
    this.stop()
    const { gl } = this
    gl.deleteTexture(this.texHeat)
    gl.deleteTexture(this.texClear)
    gl.deleteTexture(this.texSrc)
    gl.deleteTexture(this.texTrail)
    gl.deleteBuffer(this.buf)
    gl.deleteProgram(this.prog)
  }
}
