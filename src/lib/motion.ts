/**
 * 24th motion presets, ported from the system's motion-presets.ts and
 * expressed as framer-motion transitions.
 */
export const EASE_OPEN = [0.22, 0.61, 0.36, 1] as const
export const EASE_CLOSE = [0.4, 0, 0.2, 1] as const
export const EASE_READING = [0.22, 1, 0.36, 1] as const
export const EASE_FORWARD = [0.2, 0.7, 0.25, 1] as const

export const open = { duration: 0.36, ease: EASE_OPEN }
export const close = { duration: 0.26, ease: EASE_CLOSE }
export const focusOpen = { duration: 0.42, ease: EASE_READING }
export const focusClose = { duration: 0.36, ease: EASE_READING }
export const forward = { duration: 0.24, ease: EASE_FORWARD }
export const reveal = { duration: 0.72, ease: EASE_OPEN }

/** Spring used for drags, docks and camera moves. */
export const spring = { type: 'spring', stiffness: 380, damping: 36, mass: 0.9 } as const
export const softSpring = { type: 'spring', stiffness: 160, damping: 26, mass: 1 } as const

/** Fade-up entrance; pass `reduced` from useReducedMotion. */
export const fadeUp = (delay = 0, reduced: boolean | null = false) =>
  reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { ...reveal, delay },
      }
