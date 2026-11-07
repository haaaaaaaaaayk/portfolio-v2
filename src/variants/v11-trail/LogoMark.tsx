/** The mark in the corner: Halftone cushion Հ in live SVG metal. It leans toward the pointer with the light rolling
 *  across its dots, and a click lifts it out to the middle of the screen to be turned over properly. */
import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { MARK_SVG, MARK_VIEWBOX } from './markSvg'

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'
const NS = 'http://www.w3.org/2000/svg'

/* the playground settings it was tuned with (play.html?set=ho&m=5): each scales the mark's own designed value */
const MATERIAL = { z: 1, spec: 1.4, exp: 0.95, ss: 0.7, tilt: 0.95 }
function applyMaterial(svg: SVGSVGElement) {
  for (const el of svg.querySelectorAll('feDiffuseLighting, feSpecularLighting')) el.setAttribute('surfaceScale', String(+el.getAttribute('surfaceScale')! * MATERIAL.ss))
  for (const el of svg.querySelectorAll('feSpecularLighting')) {
    el.setAttribute('specularConstant', String(+el.getAttribute('specularConstant')! * MATERIAL.spec))
    el.setAttribute('specularExponent', String(Math.min(128, Math.max(1, +el.getAttribute('specularExponent')! * MATERIAL.exp))))
  }
  for (const el of svg.querySelectorAll('fePointLight')) el.setAttribute('z', String(+el.getAttribute('z')! * MATERIAL.z))
}

/* target and current tilt, -1…1 on each axis; the mark eases toward the pointer like a spring and settles flat.
   Meanwhile the light orbits in a slow circle, so the dots keep catching it even when nobody is touching it. */
function tilter(el: HTMLElement, svg: SVGSVGElement, reduced: boolean, deg: [number, number]) {
  const lights = [...svg.querySelectorAll<SVGElement>('fePointLight')]
  const t = { x: 0, y: 0 }, c = { x: 0, y: 0 }
  const orbit = !reduced
  let raf = 0, paused = false
  const frame = (now: number) => {
    c.x += (t.x - c.x) * 0.14
    c.y += (t.y - c.y) * 0.14
    if (!reduced) el.style.transform = `rotateY(${c.x * deg[0] * MATERIAL.tilt}deg) rotateX(${-c.y * deg[1] * MATERIAL.tilt}deg)`
    /* a fixed light seen from a turning plate rolls the opposite way, so the highlight crosses the metal */
    const a = now / 1000 * 0.8, ox = orbit ? Math.cos(a) * 312 : 0, oy = orbit ? Math.sin(a) * 240 : 0
    for (const l of lights) {
      l.setAttribute('x', String(+l.dataset.x! - c.x * 572 * MATERIAL.tilt + ox))
      l.setAttribute('y', String(+l.dataset.y! - c.y * 440 * MATERIAL.tilt + oy))
    }
    raf = !paused && (orbit || Math.abs(t.x - c.x) + Math.abs(t.y - c.y) > 0.001) ? requestAnimationFrame(frame) : 0
  }
  const kick = () => { if (!raf && !paused) raf = requestAnimationFrame(frame) }
  kick()
  return {
    move(e: PointerEvent) {
      const r = el.getBoundingClientRect()
      t.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1))
      t.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))
      kick()
    },
    rest() { t.x = 0; t.y = 0; kick() },
    /* off screen, nothing to light */
    pause(on: boolean) { paused = on; if (on) { cancelAnimationFrame(raf); raf = 0 } else kick() },
    stop() {
      paused = true; cancelAnimationFrame(raf); raf = 0; t.x = t.y = c.x = c.y = 0
      el.style.transform = ''
      for (const l of lights) { l.setAttribute('x', l.dataset.x!); l.setAttribute('y', l.dataset.y!) }
    },
  }
}

export function LogoMark() {
  const button = useRef<HTMLButtonElement>(null)
  const slot = useRef<HTMLSpanElement>(null)
  const reduced = !!useReducedMotion()

  useEffect(() => {
    const btn = button.current, home = slot.current
    if (!btn || !home) return
    /* the svg is built once and owned here, not by React, so it can be lifted out and put back */
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('viewBox', MARK_VIEWBOX)
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('class', 'block size-full overflow-visible')
    svg.innerHTML = MARK_SVG
    applyMaterial(svg)
    home.appendChild(svg)

    /* in the corner it only leans a little, and only for a real pointer: touch would fire it on every tap */
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
    let small = tilter(home, svg, reduced, [20, 16])
    const seen = new IntersectionObserver(([e]) => small.pause(!e.isIntersecting || !!closeOpen))
    seen.observe(btn)
    const onMove = (e: PointerEvent) => fine && small.move(e)
    const onLeave = () => small.rest()
    btn.addEventListener('pointermove', onMove)
    btn.addEventListener('pointerleave', onLeave)

    let closeOpen: (() => void) | null = null
    const openMark = () => {
      if (closeOpen) return
      small.stop()
      const from = svg.getBoundingClientRect()
      const viewer = document.createElement('div')
      viewer.setAttribute('role', 'dialog')
      viewer.setAttribute('aria-modal', 'true')
      viewer.setAttribute('aria-label', 'The Հ mark, in metal')
      viewer.tabIndex = -1
      viewer.className = 'fixed inset-0 z-50 grid cursor-zoom-out place-items-center p-4 outline-none'
      viewer.style.cssText = `perspective: 1200px; background: rgb(250 250 250 / 0); transition: background-color 240ms ${EASE}`
      viewer.innerHTML = `<div data-stage class="w-[min(480px,80vmin)]"><div data-tilt class="cursor-grab touch-none" style="transform-style: preserve-3d; will-change: transform"></div><p class="mt-4 text-center text-compact text-ink-muted" style="opacity: 0; transition: opacity 240ms ${EASE}">Move over it to tilt it. Click anywhere or press Esc to close.</p></div>`
      document.body.appendChild(viewer)
      const stage = viewer.querySelector<HTMLElement>('[data-stage]')!, tiltEl = viewer.querySelector<HTMLElement>('[data-tilt]')!, hint = viewer.querySelector('p')!
      /* the same svg moves up, so there is one filter and its light is the one we steer */
      tiltEl.appendChild(svg)
      const to = svg.getBoundingClientRect()
      stage.style.transformOrigin = '0 0'
      stage.animate(
        [{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` }, { transform: 'none' }],
        { duration: reduced ? 0 : 360, easing: EASE },
      )
      requestAnimationFrame(() => { viewer.style.background = 'rgb(250 250 250 / 0.96)'; hint.style.opacity = '1' })
      viewer.focus()

      const big = tilter(tiltEl, svg, reduced, [16, 12])
      const move = (e: PointerEvent) => big.move(e)
      const rest = () => big.rest()
      viewer.addEventListener('pointermove', move)
      tiltEl.addEventListener('pointerleave', rest)
      tiltEl.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && rest())
      tiltEl.addEventListener('click', (e) => e.stopPropagation())
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeOpen?.()
      document.addEventListener('keydown', onKey)

      closeOpen = () => {
        document.removeEventListener('keydown', onKey)
        viewer.removeEventListener('pointermove', move)
        big.stop()
        viewer.style.background = 'rgb(250 250 250 / 0)'
        hint.style.opacity = '0'
        const back = home.getBoundingClientRect(), now = svg.getBoundingClientRect()
        stage.animate(
          [{ transform: 'none' }, { transform: `translate(${back.left - now.left}px, ${back.top - now.top}px) scale(${back.width / now.width})` }],
          { duration: reduced ? 0 : 280, easing: EASE },
        ).onfinish = () => {
          home.appendChild(svg)
          viewer.remove()
          small = tilter(home, svg, reduced, [20, 16])
          closeOpen = null
          btn.focus({ preventScroll: true })
        }
      }
      viewer.addEventListener('click', () => closeOpen?.())
    }
    btn.addEventListener('click', openMark)

    return () => {
      btn.removeEventListener('pointermove', onMove)
      btn.removeEventListener('pointerleave', onLeave)
      btn.removeEventListener('click', openMark)
      seen.disconnect()
      small.stop()
      document.querySelector('[aria-label="The Հ mark, in metal"]')?.remove()
      svg.remove()
    }
  }, [reduced])

  return (
    <button
      ref={button}
      type="button"
      aria-label="Open the Հ mark and tilt it"
      className="absolute left-4 top-4 z-10 block size-12 cursor-zoom-in rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink sm:left-8 sm:top-8"
      style={{ perspective: '240px' }}
    >
      <span ref={slot} className="block size-full" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }} />
    </button>
  )
}
