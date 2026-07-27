import * as React from 'react'

export function usePersistedState<T = string>(
  key: string,
  initial: T,
  override?: T,
) {
  const storageKey = `comfy-toolkit:${key}`
  const hasOverride = override !== undefined
  const [value, setValue] = React.useState<T>(hasOverride ? override : initial)
  const isString = typeof initial === 'string'

  const write = React.useCallback(
    (next: T) => {
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

  React.useEffect(() => {
    if (hasOverride) {
      write(override)
      return
    }
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) {
        setValue(isString ? (stored as T) : (JSON.parse(stored) as T))
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, isString, hasOverride, override, write])

  const set = React.useCallback(
    (next: T) => {
      setValue(next)
      write(next)
    },
    [write],
  )

  return [value, set] as const
}
