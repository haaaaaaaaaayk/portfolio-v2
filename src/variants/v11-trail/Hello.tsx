/**
 * The ending: lessons are in the about, so this is the invitation. A soft card, one line about the
 * page, and a "Say hello" button that copies the email address. Copying is invisible, so the button says it worked:
 * its label rolls up to "Email copied" with a check that pops in (the one celebratory moment on the page), then
 * rolls back after a few seconds. If the clipboard is unavailable it opens the mail app instead.
 */
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { reveal } from '../../lib/motion'
import { RollingLabel } from './RollingLabel'
import './hello.css'

/* TODO before publishing: Hayk's real contact address. Placeholder so the interaction can be seen. */
const EMAIL = 'hello@example.com'
/* Profiles as round icon buttons, in this order. A profile shows only once its address is filled in. */
const SOCIAL: { name: string; href: string; icon: React.ReactNode }[] = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/haykhateshiking/',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.25" />
        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com/haaaaaaaaayk',
    icon: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sargsyan-hayk--/',
    icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/haaaaaaaaaayk',
    icon: <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />,
  },
]

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
    <section id="hello" className="mx-auto w-full max-w-[912px] px-6 pb-section sm:px-8 sm:pb-32">
      <motion.div
        {...inView}
        className="flex flex-col gap-6 rounded-card bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <p className="text-body text-ink">This page is a snapshot of how I work.</p>
          <p className="mt-1 text-body text-ink-muted">The case studies are on their way.</p>
        </div>
        <div className="flex items-center gap-2">
          {SOCIAL.filter((p) => p.href).map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.name}
              title={p.name}
              className="grid size-11 place-items-center rounded-full bg-control text-ink outline-offset-2 transition-[background-color,transform] duration-300 ease-fast hover:bg-control-hover focus-visible:outline-2 focus-visible:outline-ink active:scale-[0.97]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-5">
                {p.icon}
              </svg>
            </a>
          ))}
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-11 cursor-pointer items-center rounded-full bg-accent px-5 text-compact text-ink outline-offset-2 transition-[filter,transform] duration-300 ease-fast hover:brightness-95 focus-visible:outline-2 focus-visible:outline-ink active:scale-[0.97]"
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
