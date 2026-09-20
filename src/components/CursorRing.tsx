import { useEffect, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion'

/** Minimal custom cursor — a small ring trailing the pointer (desktop only). */
export function CursorRing() {
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 900, damping: 60, mass: 0.3 })
  const sy = useSpring(y, { stiffness: 900, damping: 60, mass: 0.3 })

  useEffect(() => {
    // only on fine pointers (mouse/trackpad)
    if (!window.matchMedia('(pointer: fine)').matches) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [x, y])

  if (reduced) return null

  return (
    <motion.div
      aria-hidden
      className="cursor-ring hidden md:block"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    />
  )
}
