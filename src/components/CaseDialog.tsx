import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { close, open } from '../lib/motion'
import { projectById, type CaseId } from '../content/projects'
import { CaseArticle } from './CaseArticle'

/**
 * Full-viewport glass overlay for a case study. Used by variants that
 * are not themselves a reading surface (Desktop OS, Spatial, Lab).
 */
export function CaseDialog({
  id,
  onClose,
}: {
  id: CaseId | null
  onClose: () => void
}) {
  const project = id ? projectById(id) : null
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  /* the latest onClose, so callers can pass an inline function without re-running the effect */
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  /* modal: Tab stays inside, Esc closes, and focus goes back to whatever opened it */
  useEffect(() => {
    if (!id) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
      if (e.key !== 'Tab' || !dialogRef.current) return
      const items = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const inside = dialogRef.current.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    closeBtnRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      opener?.focus({ preventScroll: true })
    }
  }, [id])

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          key="case-overlay"
          className="fixed inset-0 z-[70] overflow-y-auto bg-paper/50 p-2 backdrop-blur-xl sm:p-4 lg:p-8"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1, transition: open }}
          exit={{ opacity: 0, transition: close }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Case study: ${project.title}`}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: open }}
            exit={{ opacity: 0, y: 8, transition: close }}
            className="glass glass-edge mx-auto min-h-full max-w-5xl rounded-card"
          >
            <div className="p-4 sm:p-8 lg:p-12">
              <div className="sticky top-2 z-10 flex justify-end sm:top-4">
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  className="glass-dark inline-flex h-11 items-center gap-2 rounded-full px-5 text-compact text-white hover:bg-pressed"
                >
                  Close <span className="text-white/50">Esc</span>
                </button>
              </div>
              <CaseArticle project={project} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
