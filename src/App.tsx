import { lazy, Suspense, type ComponentType } from 'react'
import { Switcher } from './components/Switcher'
import { usePrefs, type VariantId } from './lib/prefs'

/* Ten portfolio concepts, code-split so only the active one loads. */
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
} satisfies Record<VariantId, ComponentType>

export default function App() {
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
