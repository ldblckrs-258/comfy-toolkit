import * as React from 'react'

export function usePersistedState<T = string>(key: string, initial: T) {
  const storageKey = `comfy-toolkit:${key}`
  const [value, setValue] = React.useState<T>(initial)
  const isString = typeof initial === 'string'

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) {
        setValue(isString ? (stored as T) : (JSON.parse(stored) as T))
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, isString])

  const set = React.useCallback(
    (next: T) => {
      setValue(next)
      try {
        localStorage.setItem(
          storageKey,
          isString ? (next as string) : JSON.stringify(next),
        )
      } catch {
        /* ignore */
      }
    },
    [storageKey, isString],
  )

  return [value, set] as const
}
