import { motion, useReducedMotion } from 'framer-motion'

/* MASCOT: swap this SVG for final bear art */
/**
 * Bearik — the teddy-bear mascot. Marker-drawn, slightly wonky, friendly.
 * Modes:
 *  - "peek": rises into view (use near hero / edges)
 *  - "idle": gentle bob + periodic blink
 *  - "hop":  little jump every time `hopKey` changes (case-study open)
 */
export function Mascot({
  mode = 'idle',
  hopKey,
  className,
  size = 96,
}: {
  mode?: 'peek' | 'idle' | 'hop'
  hopKey?: string | number | null
  className?: string
  size?: number
}) {
  const reduced = useReducedMotion()

  const bob = reduced
    ? {}
    : {
        y: [0, -5, 0],
        rotate: [-1.5, 1.5, -1.5],
        transition: {
          duration: 3.4,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }

  const wrapperAnim =
    mode === 'peek'
      ? {
          initial: { y: size * 0.55, rotate: -6, opacity: 0 },
          whileInView: { y: 0, rotate: -3, opacity: 1 },
          viewport: { once: true, margin: '-40px' },
          transition: { type: 'spring' as const, stiffness: 120, damping: 14, delay: 0.5 },
        }
      : mode === 'hop'
        ? {
            // re-runs whenever hopKey changes
            animate: reduced
              ? { y: 0 }
              : { y: [0, -22, 0, -8, 0], rotate: [0, -6, 0, 3, 0] },
            transition: { duration: 0.7, ease: 'easeOut' as const },
          }
        : { animate: bob }

  return (
    <motion.div
      aria-hidden
      className={className}
      key={mode === 'hop' ? String(hopKey) : undefined}
      {...wrapperAnim}
      style={{ width: size, height: size * (130 / 120), willChange: 'transform' }}
    >
      <motion.svg
        viewBox="0 0 120 130"
        width="100%"
        height="100%"
        animate={mode === 'idle' && !reduced ? undefined : bob}
      >
        {/* ears */}
        <circle cx="34" cy="24" r="13" fill="#FF7BAC" stroke="#E23A6E" strokeWidth="2.5" transform="rotate(-8 34 24)" />
        <circle cx="86" cy="21" r="12" fill="#FF7BAC" stroke="#E23A6E" strokeWidth="2.5" transform="rotate(6 86 21)" />
        <circle cx="34" cy="24" r="5.5" fill="#E23A6E" opacity="0.55" />
        <circle cx="86" cy="21" r="5" fill="#E23A6E" opacity="0.55" />
        {/* head — hand-drawn wobble via path */}
        <path
          d="M60 14 C 82 13, 96 28, 95 47 C 94 66, 79 76, 59 77 C 40 78, 25 66, 25 47 C 25 29, 39 15, 60 14 Z"
          fill="#FF7BAC"
          stroke="#E23A6E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* muzzle */}
        <ellipse cx="60" cy="56" rx="15" ry="11" fill="#FFD3E3" opacity="0.9" />
        {/* eyes (blink by squashing) */}
        <motion.g
          animate={
            reduced
              ? undefined
              : { scaleY: [1, 1, 0.08, 1, 1] }
          }
          transition={{
            duration: 4.6,
            times: [0, 0.9, 0.94, 0.98, 1],
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ originY: '44px', originX: '60px', transformBox: 'fill-box' }}
        >
          <ellipse cx="47" cy="43" rx="3.4" ry="4.2" fill="#2A1420" />
          <ellipse cx="72" cy="42" rx="3.2" ry="4" fill="#2A1420" />
          <circle cx="48.2" cy="41.6" r="1.1" fill="#fff" />
          <circle cx="73.1" cy="40.7" r="1" fill="#fff" />
        </motion.g>
        {/* nose + smile */}
        <ellipse cx="60" cy="52" rx="4.5" ry="3.4" fill="#2A1420" />
        <path
          d="M53 60 Q 60 66, 67 60"
          fill="none"
          stroke="#2A1420"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* body */}
        <path
          d="M40 74 C 30 82, 28 100, 34 112 C 40 123, 80 124, 87 111 C 93 99, 90 82, 80 74 C 72 79, 48 80, 40 74 Z"
          fill="#FF7BAC"
          stroke="#E23A6E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* belly patch */}
        <ellipse cx="60" cy="99" rx="14" ry="12" fill="#FFD3E3" opacity="0.85" />
        {/* arms */}
        <path d="M36 82 C 26 86, 22 94, 26 99 C 30 103, 38 98, 41 91" fill="#FF7BAC" stroke="#E23A6E" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M84 81 C 94 85, 98 93, 94 98 C 90 102, 82 97, 79 90" fill="#FF7BAC" stroke="#E23A6E" strokeWidth="2.5" strokeLinejoin="round" />
        {/* feet */}
        <ellipse cx="45" cy="117" rx="9" ry="6.5" fill="#FF7BAC" stroke="#E23A6E" strokeWidth="2.5" transform="rotate(-6 45 117)" />
        <ellipse cx="75" cy="117" rx="9" ry="6.5" fill="#FF7BAC" stroke="#E23A6E" strokeWidth="2.5" transform="rotate(6 75 117)" />
      </motion.svg>
    </motion.div>
  )
}
