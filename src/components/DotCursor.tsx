/**
 * The cursor is the signature mark: the accent dot from the tab icon. As it moves it leaves a trace of
 * smaller dots in the valley's hill colours. They wait a moment, then let go.
 * Every number lives in cursorConfig.ts; tune them live in tools/cursor-tuner.html.
 *
 * Choices behind it:
 * - The dot follows the pointer 1:1. A cursor that lags feels broken, so the trace is where the motion lives.
 * - Trace dots go onto the page, not the screen, so they scroll with the content like ink would.
 * - Their spacing is left uneven on purpose. A dot drops once you've moved `step` px, so slow moves leave a
 *   dense line and fast flicks leave a scatter, and the trace shows how you moved.
 * - The trace is painted in the hill colours, so the cursor carries the valley down the page. The dot itself
 *   stays the accent: it's the signature, and the trace is the landscape it walked through.
 * - With the hand cursor gone, the dot takes over its job and grows a little over anything you can click.
 * - Text fields keep the system I-beam, because placing a caret needs it, and the dot steps aside there.
 *   The hiking scene has its own ring cursor, so the dot steps aside there too.
 * - The cursor only appears with a mouse or trackpad (fine pointer + hover); touch screens get nothing.
 *   Under reduced motion the dot stays, since it's the cursor, but the trace is off.
 */
import { useEffect, useRef } from 'react'
import { CURSOR } from './cursorConfig'
import { createCursor } from './cursorEngine'

export function DotCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const trace = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (!dot.current || !trace.current) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    const root = document.documentElement
    root.classList.add('dot-cursor')
    const cursor = createCursor(CURSOR, {
      scope: document,
      dot: dot.current,
      canvas: trace.current,
      still: () => still.matches,
    })
    return () => {
      cursor.destroy()
      root.classList.remove('dot-cursor')
    }
  }, [])

  return (
    <>
      <canvas ref={trace} aria-hidden className="pointer-events-none fixed inset-0 z-[9998] h-full w-full" />
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[9999]">
        <span />
      </div>
    </>
  )
}
