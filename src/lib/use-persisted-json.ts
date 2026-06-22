import * as React from 'react'

export function usePersistedJson<T>(key: string, initial: T) {
  const storageKey = `comfy-toolkit:${key}`
  const [value, setValue] = React.useState<T>(initial)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) setValue(JSON.parse(stored) as T)
    } catch {
      /* ignore */
    }
  }, [storageKey])

  const set = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        try {
          localStorage.setItem(storageKey, JSON.stringify(resolved))
        } catch {
          /* ignore */
        }
        return resolved
      })
    },
    [storageKey],
  )

  return [value, set] as const
}
