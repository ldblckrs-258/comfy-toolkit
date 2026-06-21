import * as React from 'react'

export function usePersistedState(key: string, initial: string) {
  const storageKey = `comfy-toolkit:${key}`
  const [value, setValue] = React.useState(initial)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) setValue(stored)
    } catch {
      /* ignore */
    }
  }, [storageKey])

  const set = React.useCallback(
    (next: string) => {
      setValue(next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  )

  return [value, set] as const
}
