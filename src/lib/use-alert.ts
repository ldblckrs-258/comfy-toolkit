import * as React from 'react'

export type AlertPermission = 'default' | 'granted' | 'denied' | 'unsupported'

interface FlashHandle {
  original: string
  id: number
}

interface RingHandle {
  interval: number
  stop: number
}

export function useAlert() {
  const ctxRef = React.useRef<AudioContext | null>(null)
  const flashRef = React.useRef<FlashHandle | null>(null)
  const ringsRef = React.useRef<Map<string, RingHandle>>(new Map())
  const [permission, setPermission] = React.useState<AlertPermission>('default')
  const [ringingIds, setRingingIds] = React.useState<Array<string>>([])

  const stopFlash = React.useCallback(() => {
    const handle = flashRef.current
    if (!handle) return
    clearInterval(handle.id)
    document.title = handle.original
    flashRef.current = null
  }, [])

  React.useEffect(() => {
    setPermission(
      typeof Notification === 'undefined'
        ? 'unsupported'
        : Notification.permission,
    )

    const onVisible = () => {
      if (document.visibilityState === 'visible') stopFlash()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      stopFlash()
    }
  }, [stopFlash])

  const unlockAudio = React.useCallback(() => {
    if (!ctxRef.current) {
      const w = window as unknown as {
        AudioContext?: typeof AudioContext
        webkitAudioContext?: typeof AudioContext
      }
      const Ctor = w.AudioContext ?? w.webkitAudioContext
      if (Ctor) ctxRef.current = new Ctor()
    }
    if (ctxRef.current?.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const beep = React.useCallback(
    (pulses = 1) => {
      try {
        const ctx = unlockAudio()
        if (!ctx) return
        const start = ctx.currentTime
        const gap = 0.45
        const dur = 0.25
        for (let i = 0; i < pulses; i++) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.value = 880
          const t = start + i * gap
          gain.gain.setValueAtTime(0.0001, t)
          gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(t)
          osc.stop(t + dur)
        }
      } catch {
        /* ignore */
      }
    },
    [unlockAudio],
  )

  const requestPermission =
    React.useCallback(async (): Promise<AlertPermission> => {
      if (typeof Notification === 'undefined') return 'unsupported'
      const result = (await Notification.requestPermission()) as AlertPermission
      setPermission(result)
      return result
    }, [])

  const flashTitle = React.useCallback((text: string) => {
    if (flashRef.current) return
    const original = document.title
    let on = false
    const id = window.setInterval(() => {
      document.title = on ? original : `⏰ ${text}`
      on = !on
    }, 1000)
    flashRef.current = { original, id }
  }, [])

  const notify = React.useCallback((title: string, body?: string) => {
    try {
      if (
        typeof Notification === 'undefined' ||
        Notification.permission !== 'granted'
      )
        return
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker
          .getRegistration()
          .then((reg) => {
            if (reg) void reg.showNotification(title, { body })
            else new Notification(title, { body })
          })
          .catch(() => {})
      } else {
        new Notification(title, { body })
      }
    } catch {
      /* ignore */
    }
  }, [])

  const stopRing = React.useCallback((id: string) => {
    const ring = ringsRef.current.get(id)
    if (ring) {
      clearInterval(ring.interval)
      clearTimeout(ring.stop)
      ringsRef.current.delete(id)
    }
    setRingingIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const startRing = React.useCallback(
    (
      id: string,
      opts: {
        pulses?: number
        everyMs?: number
        timeoutMs?: number
        title?: string
        body?: string
      } = {},
    ) => {
      stopRing(id)
      const pulses = opts.pulses ?? 3
      const everyMs = opts.everyMs ?? 2000
      const timeoutMs = opts.timeoutMs ?? 60_000
      beep(pulses)
      if (opts.title) {
        notify(opts.title, opts.body)
        if (
          typeof document !== 'undefined' &&
          document.visibilityState !== 'visible'
        )
          flashTitle(opts.title)
      }
      const interval = window.setInterval(() => beep(pulses), everyMs)
      const stop = window.setTimeout(() => stopRing(id), timeoutMs)
      ringsRef.current.set(id, { interval, stop })
      setRingingIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    },
    [beep, notify, flashTitle, stopRing],
  )

  React.useEffect(() => {
    const rings = ringsRef.current
    return () => {
      rings.forEach((ring) => {
        clearInterval(ring.interval)
        clearTimeout(ring.stop)
      })
      rings.clear()
    }
  }, [])

  return {
    startRing,
    stopRing,
    ringingIds,
    requestPermission,
    unlockAudio,
    permission,
  }
}
