import { lazy, Suspense } from 'react'
import Trail from './variants/v11-trail'

/* The published site is Trail and nothing else: no switcher, no ?v=. `npm run dev` opens the playground instead,
   with all twelve concepts. The DEV check is a build-time constant, so the playground never reaches the bundle. */
const Playground = import.meta.env.DEV ? lazy(() => import('./Playground')) : null

export default function App() {
  if (!Playground) return <Trail />
  return (
    <Suspense
      fallback={<div className="flex min-h-svh items-center justify-center text-compact text-ink-muted">Loading…</div>}
    >
      <Playground />
    </Suspense>
  )
}
