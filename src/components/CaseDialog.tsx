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
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!id) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    closeBtnRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [id, onClose])

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
