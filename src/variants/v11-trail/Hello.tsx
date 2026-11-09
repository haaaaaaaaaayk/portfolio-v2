/**
 * The ending, after Caleb's: lessons are in the about, so this is the invitation. A soft card, one line about the
 * page, and a "Say hello" button that copies the email address. Copying is invisible, so the button says it worked:
 * its label rolls up to "Email copied" with a check that pops in (the one celebratory moment on the page), then
 * rolls back after a few seconds. If the clipboard is unavailable it opens the mail app instead.
 */
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { reveal } from '../../lib/motion'
import { RollingLabel } from './RollingLabel'
import './playground.css'

/* TODO before publishing: Hayk's real contact address. Placeholder so the interaction can be seen. */
const EMAIL = 'hello@example.com'
const GITHUB = 'https://github.com/haaaaaaaaaayk'

export function Hello() {
  const reduced = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const inView = reduced
    ? {}
    : { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: reveal }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2400)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <section id="hello" className="mx-auto w-full max-w-4xl px-6 pb-section sm:px-8 sm:pb-32">
      <motion.div
        {...inView}
        className="flex flex-col gap-6 rounded-card bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <p className="text-body text-ink">This page is a snapshot of how I work.</p>
          <p className="mt-1 text-body text-ink-muted">Everything in the playground is open on GitHub.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-full bg-control px-5 text-compact text-ink outline-offset-2 transition-[background-color,transform] duration-300 ease-fast hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-ink active:scale-[0.97]"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-11 cursor-pointer items-center rounded-full bg-ink px-5 text-compact text-white outline-offset-2 transition-[background-color,transform] duration-300 ease-fast hover:bg-pressed focus-visible:outline-2 focus-visible:outline-ink active:scale-[0.97]"
          >
            <RollingLabel id={copied ? 'copied' : 'hello'} className="h-5">
              {copied ? (
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="hello-check">
                    <circle cx="8" cy="8" r="8" fill="currentColor" opacity=".2" />
                    <path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Email copied
                </span>
              ) : (
                'Say hello'
              )}
            </RollingLabel>
          </button>
          <span aria-live="polite" className="sr-only">
            {copied ? `Email address copied: ${EMAIL}` : ''}
          </span>
        </div>
      </motion.div>
    </section>
  )
}
