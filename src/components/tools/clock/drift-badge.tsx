import * as React from 'react'
import { Check, RefreshCw, TriangleAlert } from 'lucide-react'
import { computeDrift, parseServerTime } from '@/lib/tools/clock'
import type { Drift } from '@/lib/tools/clock'
import { cn } from '@/lib/utils'

const ENDPOINT = 'https://timeapi.io/api/time/current/zone?timeZone=Etc/UTC'

async function fetchServerNow(signal: AbortSignal): Promise<number | null> {
  try {
    const res = await fetch(ENDPOINT, { signal })
    if (!res.ok) return null
    const json: unknown = await res.json()
    return parseServerTime(json)
  } catch {
    return null
  }
}

export function DriftBadge() {
  const [drift, setDrift] = React.useState<Drift | null>(null)
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const ctrlRef = React.useRef<AbortController | null>(null)

  const check = React.useCallback(() => {
    ctrlRef.current?.abort()
    const ctrl = new AbortController()
    ctrlRef.current = ctrl
    const timeout = window.setTimeout(() => ctrl.abort(), 4000)
    setStatus('loading')
    const sentAt = Date.now()
    void fetchServerNow(ctrl.signal).then((serverMs) => {
      window.clearTimeout(timeout)
      if (ctrl.signal.aborted) return
      if (serverMs === null) {
        setDrift(null)
        setStatus('error')
        return
      }
      const receivedAt = Date.now()
      const halfRtt = (receivedAt - sentAt) / 2
      setDrift(computeDrift(serverMs + halfRtt, receivedAt))
      setStatus('ready')
    })
  }, [])

  React.useEffect(() => {
    check()
    return () => ctrlRef.current?.abort()
  }, [check])

  if (status === 'error') return null

  const seconds = drift ? (Math.abs(drift.diffMs) / 1000).toFixed(1) : null
  const warn = drift?.level === 'warn'
  const direction = drift && drift.diffMs > 0 ? 'ahead' : 'behind'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs',
        warn
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
          : 'border-border bg-card text-muted-foreground',
      )}
    >
      {status === 'loading' ? (
        <span>Checking time…</span>
      ) : warn ? (
        <>
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          <span>
            Your clock is off by ~{seconds}s ({direction})
          </span>
        </>
      ) : (
        <>
          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span>Clock accurate (±{seconds}s)</span>
        </>
      )}
      <button
        type="button"
        onClick={() => check()}
        aria-label="Recheck time accuracy"
        className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <RefreshCw className="h-3 w-3" />
      </button>
    </div>
  )
}
