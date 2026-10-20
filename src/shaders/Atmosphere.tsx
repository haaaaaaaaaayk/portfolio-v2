import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { AtmosphereEngine, type AtmosphereParams, type Mix } from './engine'
import { isChromeTarget } from './io'

export interface AtmosphereHandle {
  snapshot: () => string
  punch: (nx: number, ny: number, r?: number) => void
  heatMean: () => number
  setPhoto: (img: HTMLImageElement | null) => void
  setParams: (partial: Partial<AtmosphereParams>) => void
  canvas: () => HTMLCanvasElement | null
}

export type AtmosphereProps = {
  mix: Mix
  className?: string
  freezeOnStill?: boolean
  onHeatMean?: (n: number) => void
} & Partial<Omit<AtmosphereParams, 'mix' | 'freeze'>>

/**
 * One WebGL context. Pauses when the tab is hidden. Static frame when
 * prefers-reduced-motion is set. Pointer is tracked on window so HTML
 * chrome above the canvas still drives wipe / warp / trail.
 */
export const Atmosphere = forwardRef<AtmosphereHandle, AtmosphereProps>(
  function Atmosphere(props, ref) {
    const {
      className = '',
      freezeOnStill = false,
      onHeatMean,
      mix,
      ...rest
    } = props
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<AtmosphereEngine | null>(null)
    const reduced = useReducedMotion()
    const heatCb = useRef(onHeatMean)
    const restRef = useRef(rest)
    const mixRef = useRef(mix)
    const freezeRef = useRef(freezeOnStill)
    useEffect(() => {
      heatCb.current = onHeatMean
      restRef.current = rest
      mixRef.current = mix
      freezeRef.current = freezeOnStill
    })
    useImperativeHandle(ref, () => ({
      snapshot: () => engineRef.current?.snapshot() ?? '',
      punch: (nx, ny, r) => engineRef.current?.punch(nx, ny, r),
      heatMean: () => engineRef.current?.heatMean() ?? 0,
      setPhoto: (img) => engineRef.current?.setPhoto(img),
      setParams: (partial) => engineRef.current?.setParams(partial),
      canvas: () => canvasRef.current,
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      let engine: AtmosphereEngine
      try {
        engine = new AtmosphereEngine(canvas, { mix: mixRef.current, ...restRef.current })
      } catch (err) {
        console.error(err)
        return
      }
      engineRef.current = engine
      engine.setOnFrame((n) => heatCb.current?.(n))
      engine.start(!!reduced)

      const onMove = (e: PointerEvent) => {
        engine.pointerMove(e.clientX, e.clientY, e.buttons)
        if (freezeRef.current) {
          engine.setParams({ freeze: false })
        }
      }
      const onDown = (e: PointerEvent) => {
        if (isChromeTarget(e.target)) return
        engine.pointerDown()
        engine.pointerMove(e.clientX, e.clientY, e.buttons || 1)
      }
      const onUp = () => engine.pointerUp()
      const onVis = () => engine.setHidden(document.visibilityState === 'hidden')
      const onResize = () => {
        engine.resize()
        if (reduced) engine.start(true)
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onDown)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
      document.addEventListener('visibilitychange', onVis)
      window.addEventListener('resize', onResize)

      let freezeTick = 0
      const freezeLoop = () => {
        if (freezeRef.current && !reduced) {
          engine.setParams({ freeze: engine.stillMs() > 1800 })
        }
        freezeTick = window.setTimeout(freezeLoop, 200)
      }
      freezeLoop()

      return () => {
        window.clearTimeout(freezeTick)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        document.removeEventListener('visibilitychange', onVis)
        window.removeEventListener('resize', onResize)
        engine.destroy()
        engineRef.current = null
      }
      // engine is recreated if reduced-motion flips
    }, [reduced])

    useEffect(() => {
      engineRef.current?.setParams({ mix, ...rest })
    })

    return (
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`pointer-events-none fixed inset-0 h-full w-full ${className}`}
      />
    )
  },
)
