import { lazy, Suspense, type ComponentType } from 'react'
import { Switcher } from './components/Switcher'
import { usePrefs, type VariantId } from './lib/prefs'

/* The playground: twelve portfolio concepts behind the switcher, code-split so only the active one loads.
   Only the dev server shows it; the published site is Trail alone (see App.tsx). */
const VARIANT_MODULES: Record<VariantId, () => Promise<{ default: ComponentType }>> = {
  1: () => import('./variants/v1-desktop-os'),
  2: () => import('./variants/v2-index'),
  3: () => import('./variants/v3-spatial-canvas'),
  4: () => import('./variants/v4-editorial'),
  5: () => import('./variants/v5-lab'),
  6: () => import('./variants/v6-fogged-glass'),
  7: () => import('./variants/v7-halftone'),
  8: () => import('./variants/v8-overtaken'),
  9: () => import('./variants/v9-triptych'),
  10: () => import('./variants/v10-night-lab'),
  11: () => import('./variants/v11-trail'),
  12: () => import('./variants/v12-ink-trail'),
}

const LAZY = {
  1: lazy(VARIANT_MODULES[1]),
  2: lazy(VARIANT_MODULES[2]),
  3: lazy(VARIANT_MODULES[3]),
  4: lazy(VARIANT_MODULES[4]),
  5: lazy(VARIANT_MODULES[5]),
  6: lazy(VARIANT_MODULES[6]),
  7: lazy(VARIANT_MODULES[7]),
  8: lazy(VARIANT_MODULES[8]),
  9: lazy(VARIANT_MODULES[9]),
  10: lazy(VARIANT_MODULES[10]),
  11: lazy(VARIANT_MODULES[11]),
  12: lazy(VARIANT_MODULES[12]),
} satisfies Record<VariantId, ComponentType>

export default function Playground() {
  const { variant } = usePrefs()
  const Variant = LAZY[variant]
  return (
    <>
      <Suspense
        fallback={
          <div className="flex min-h-svh items-center justify-center text-compact text-ink-muted">
            Loading…
          </div>
        }
      >
        <Variant key={variant} />
      </Suspense>
      <Switcher />
    </>
  )
}
