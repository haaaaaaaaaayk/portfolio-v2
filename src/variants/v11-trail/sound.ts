/**
 * Trail sounds, synthesized with Web Audio; no files. Each sound is a few layers (a sine or
 * triangle tone, or filtered noise) with a short exponential envelope, optionally fed through a
 * small delay loop for a tail. Everything meets one compressor so stacked sounds never clip.
 */
type Tone = {
  kind: 'tone'
  wave: OscillatorType
  freq: number
  glideTo?: number
  glideTime?: number
}
type Noise = {
  kind: 'noise'
  filter: BiquadFilterType
  freq: number
  /** sweep the filter here over the envelope, for whooshes */
  filterTo?: number
  q?: number
}
type Layer = (Tone | Noise) & { offset?: number; attack: number; decay: number; peak: number }
type Preset = { gain: number; layers: Layer[]; tail?: { delay: number; feedback: number; wet: number; lowpass: number } }

const PRESETS = {
  /* boot on gravel: a dull thud under a little crunch */
  step: {
    gain: 0.4,
    layers: [
      { kind: 'noise', filter: 'lowpass', freq: 520, q: 0.7, attack: 0.003, decay: 0.06, peak: 0.12 },
      { kind: 'noise', filter: 'bandpass', freq: 2600, q: 1.4, offset: 0.004, attack: 0.001, decay: 0.035, peak: 0.05 },
    ],
  },
  /* he sits: a breathy sigh that falls */
  sit: {
    gain: 0.45,
    layers: [
      { kind: 'noise', filter: 'lowpass', freq: 900, q: 0.6, attack: 0.06, decay: 0.42, peak: 0.05 },
      { kind: 'tone', wave: 'sine', freq: 392, glideTo: 262, glideTime: 0.4, attack: 0.03, decay: 0.42, peak: 0.035 },
    ],
  },
  /* poked back onto his feet */
  poke: {
    gain: 0.42,
    layers: [
      { kind: 'noise', filter: 'bandpass', freq: 2600, q: 2.4, attack: 0.001, decay: 0.022, peak: 0.08 },
      { kind: 'tone', wave: 'triangle', freq: 620, glideTo: 1240, glideTime: 0.07, attack: 0.002, decay: 0.085, peak: 0.055 },
    ],
  },
  /* a tap on the meadow, matching the ripple */
  tap: {
    gain: 0.5,
    layers: [{ kind: 'tone', wave: 'sine', freq: 1200, glideTo: 550, glideTime: 0.14, attack: 0.004, decay: 0.2, peak: 0.07 }],
    tail: { delay: 0.09, feedback: 0.2, wet: 0.15, lowpass: 3000 },
  },
  /* someone overtakes him */
  pass: {
    gain: 0.4,
    layers: [{ kind: 'noise', filter: 'bandpass', freq: 1800, filterTo: 700, q: 0.9, attack: 0.08, decay: 0.24, peak: 0.07 }],
  },
  /* someone coming down says hi */
  meet: {
    gain: 0.4,
    layers: [
      { kind: 'tone', wave: 'sine', freq: 660, attack: 0.004, decay: 0.12, peak: 0.045 },
      { kind: 'tone', wave: 'sine', freq: 880, offset: 0.08, attack: 0.004, decay: 0.16, peak: 0.04 },
    ],
    tail: { delay: 0.1, feedback: 0.18, wet: 0.12, lowpass: 4000 },
  },
  water: {
    gain: 0.45,
    layers: [
      { kind: 'noise', filter: 'lowpass', freq: 1600, q: 0.7, attack: 0.04, decay: 0.3, peak: 0.04 },
      { kind: 'tone', wave: 'sine', freq: 980, glideTo: 520, glideTime: 0.16, offset: 0.05, attack: 0.004, decay: 0.2, peak: 0.05 },
    ],
    tail: { delay: 0.11, feedback: 0.24, wet: 0.16, lowpass: 2800 },
  },
  chime: {
    gain: 0.45,
    layers: [
      { kind: 'tone', wave: 'sine', freq: 1046.5, attack: 0.006, decay: 0.22, peak: 0.07 },
      { kind: 'tone', wave: 'sine', freq: 1568, offset: 0.09, attack: 0.006, decay: 0.26, peak: 0.06 },
    ],
    tail: { delay: 0.12, feedback: 0.25, wet: 0.18, lowpass: 4000 },
  },
  sparkle: {
    gain: 0.42,
    layers: [
      { kind: 'tone', wave: 'sine', freq: 1760, attack: 0.003, decay: 0.09, peak: 0.04 },
      { kind: 'tone', wave: 'sine', freq: 2217, offset: 0.045, attack: 0.003, decay: 0.09, peak: 0.035 },
      { kind: 'tone', wave: 'sine', freq: 2637, offset: 0.09, attack: 0.003, decay: 0.1, peak: 0.032 },
    ],
    tail: { delay: 0.07, feedback: 0.35, wet: 0.22, lowpass: 6000 },
  },
  rustle: {
    gain: 0.4,
    layers: [
      { kind: 'noise', filter: 'bandpass', freq: 3200, q: 1.2, attack: 0.01, decay: 0.08, peak: 0.05 },
      { kind: 'noise', filter: 'bandpass', freq: 2400, q: 1.2, offset: 0.07, attack: 0.01, decay: 0.09, peak: 0.045 },
    ],
  },
  /* the summit: a slow rising arrival */
  peak: {
    gain: 0.44,
    layers: [
      { kind: 'noise', filter: 'lowpass', freq: 900, q: 0.8, attack: 0.05, decay: 0.24, peak: 0.035 },
      { kind: 'tone', wave: 'sine', freq: 220, glideTo: 440, glideTime: 0.32, attack: 0.04, decay: 0.34, peak: 0.055 },
      { kind: 'tone', wave: 'sine', freq: 659.25, offset: 0.12, attack: 0.045, decay: 0.32, peak: 0.04 },
      { kind: 'tone', wave: 'sine', freq: 987.77, offset: 0.19, attack: 0.045, decay: 0.34, peak: 0.032 },
    ],
    tail: { delay: 0.16, feedback: 0.28, wet: 0.18, lowpass: 3200 },
  },
  /* sent home: a happy slide downhill */
  home: {
    gain: 0.42,
    layers: [{ kind: 'tone', wave: 'triangle', freq: 880, glideTo: 330, glideTime: 0.5, attack: 0.01, decay: 0.5, peak: 0.05 }],
    tail: { delay: 0.12, feedback: 0.2, wet: 0.12, lowpass: 3000 },
  },
  /* back at the start, the send-off to the projects */
  finale: {
    gain: 0.5,
    layers: [
      { kind: 'tone', wave: 'sine', freq: 880, attack: 0.004, decay: 0.09, peak: 0.06 },
      { kind: 'tone', wave: 'sine', freq: 1108.73, offset: 0.06, attack: 0.004, decay: 0.1, peak: 0.06 },
      { kind: 'tone', wave: 'sine', freq: 1318.51, offset: 0.12, attack: 0.004, decay: 0.18, peak: 0.07 },
    ],
    tail: { delay: 0.1, feedback: 0.22, wet: 0.16, lowpass: 4500 },
  },
} satisfies Record<string, Preset>

export type TrailSound = keyof typeof PRESETS

const VOLUME = 0.4
let ctx: AudioContext | null = null
let bus: GainNode | null = null

function context() {
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  try {
    ctx = new AC()
  } catch {
    return null
  }
  bus = ctx.createGain()
  bus.gain.value = 4
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -8
  comp.knee.value = 6
  comp.ratio.value = 12
  comp.attack.value = 0.002
  comp.release.value = 0.08
  bus.connect(comp).connect(ctx.destination)
  return ctx
}

function envelope(g: GainNode, at: number, l: Layer) {
  g.gain.setValueAtTime(1e-4, at)
  g.gain.exponentialRampToValueAtTime(l.peak, at + l.attack)
  g.gain.exponentialRampToValueAtTime(1e-4, at + l.attack + l.decay)
}

function render(ac: AudioContext, p: Preset, volume: number, pitch: number) {
  const now = ac.currentTime
  const out = ac.createGain()
  out.gain.value = p.gain * volume
  out.connect(bus!)
  const nodes: AudioNode[] = [out]
  if (p.tail) {
    const d = ac.createDelay(1)
    const lp = ac.createBiquadFilter()
    const fb = ac.createGain()
    const wet = ac.createGain()
    d.delayTime.value = p.tail.delay
    lp.type = 'lowpass'
    lp.frequency.value = p.tail.lowpass
    fb.gain.value = p.tail.feedback
    wet.gain.value = p.tail.wet
    out.connect(d)
    d.connect(lp).connect(fb).connect(d)
    lp.connect(wet).connect(bus!)
    nodes.push(d, lp, fb, wet)
  }
  let end = 0
  for (const l of p.layers) {
    const at = now + (l.offset ?? 0)
    const stop = at + l.attack + l.decay + 0.05
    end = Math.max(end, stop - now)
    const g = ac.createGain()
    envelope(g, at, l)
    if (l.kind === 'tone') {
      const o = ac.createOscillator()
      o.type = l.wave
      o.frequency.setValueAtTime(l.freq * pitch, at)
      if (l.glideTo) o.frequency.exponentialRampToValueAtTime(l.glideTo * pitch, at + (l.glideTime ?? l.attack + l.decay))
      o.connect(g).connect(out)
      o.start(at)
      o.stop(stop)
    } else {
      const len = Math.max(1, Math.floor((stop - at) * ac.sampleRate))
      const buf = ac.createBuffer(1, len, ac.sampleRate)
      const ch = buf.getChannelData(0)
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1
      const src = ac.createBufferSource()
      src.buffer = buf
      const f = ac.createBiquadFilter()
      f.type = l.filter
      f.frequency.setValueAtTime(l.freq * pitch, at)
      if (l.filterTo) f.frequency.exponentialRampToValueAtTime(l.filterTo * pitch, at + l.attack + l.decay)
      if (l.q !== undefined) f.Q.value = l.q
      src.connect(f).connect(g).connect(out)
      src.start(at)
      src.stop(stop)
    }
  }
  /* let the tail ring out, then let go of the graph */
  const ring = p.tail ? p.tail.delay * (1 + Math.ceil(Math.log(0.001) / Math.log(p.tail.feedback))) : 0
  setTimeout(() => nodes.forEach((n) => n.disconnect()), (end + ring + 0.05) * 1000)
}

/**
 * Plays a sound. Silent until the visitor has interacted with the page, since browsers
 * won't start audio before that anyway. `pitch` scales every frequency, for variation.
 */
export function play(name: TrailSound, { volume = 1, pitch = 1 }: { volume?: number; pitch?: number } = {}) {
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return
  const ac = context()
  if (!ac) return
  const go = () => render(ac, PRESETS[name], VOLUME * Math.min(1, Math.max(0, volume)), pitch)
  if (ac.state === 'running') go()
  else ac.resume().then(() => ac.state === 'running' && go(), () => {})
}
