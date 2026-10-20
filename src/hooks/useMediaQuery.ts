import { useSyncExternalStore } from 'react'

/** Subscribe to a CSS media query. `ssrValue` is used before the client snapshot exists. */
export function useMediaQuery(query: string, ssrValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => ssrValue,
  )
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
