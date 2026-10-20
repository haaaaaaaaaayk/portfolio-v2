import { lazy, Suspense, type ComponentType } from 'react'
import { Switcher } from './components/Switcher'
import { usePrefs, type VariantId } from './lib/prefs'

/* Five portfolio concepts, code-split so only the active one loads. */
const VARIANT_MODULES: Record<VariantId, () => Promise<{ default: ComponentType }>> = {
  1: () => import('./variants/v1-desktop-os'),
  2: () => import('./variants/v2-index'),
  3: () => import('./variants/v3-spatial-canvas'),
  4: () => import('./variants/v4-editorial'),
  5: () => import('./variants/v5-lab'),
}

const LAZY = {
  1: lazy(VARIANT_MODULES[1]),
  2: lazy(VARIANT_MODULES[2]),
  3: lazy(VARIANT_MODULES[3]),
  4: lazy(VARIANT_MODULES[4]),
  5: lazy(VARIANT_MODULES[5]),
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
