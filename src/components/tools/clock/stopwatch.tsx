import * as React from 'react'
import { formatDuration, stopwatchElapsed } from '@/lib/tools/clock'
import type { StopwatchState } from '@/lib/tools/clock'
import { usePersistedJson } from '@/lib/use-persisted-json'
import { Button } from '@/components/ui/button'

const INITIAL: StopwatchState = { startedAt: null, accumulatedMs: 0, laps: [] }

export function Stopwatch() {
  const [state, setState] = usePersistedJson<StopwatchState>(
    'clock:stopwatch',
    INITIAL,
  )
  const [display, setDisplay] = React.useState(0)
  const running = state.startedAt !== null

  React.useEffect(() => {
    if (!running) {
      setDisplay(stopwatchElapsed(state, Date.now()))
      return
    }
    let raf = 0
    const tick = () => {
      setDisplay(stopwatchElapsed(state, Date.now()))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, state])

  const start = () =>
    setState((p) =>
      p.startedAt === null ? { ...p, startedAt: Date.now() } : p,
    )
  const stop = () =>
    setState((p) =>
      p.startedAt === null
        ? p
        : {
            ...p,
            accumulatedMs: stopwatchElapsed(p, Date.now()),
            startedAt: null,
          },
    )
  const reset = () => setState(INITIAL)
  const lap = () =>
    setState((p) => ({
      ...p,
      laps: [...p.laps, stopwatchElapsed(p, Date.now())],
    }))

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 pt-6">
      <div className="font-mono text-6xl font-semibold tabular-nums">
        {formatDuration(display, { showMs: true })}
      </div>

      <div className="flex gap-2">
        {running ? (
          <>
            <Button onClick={lap} variant="subtle">
              Lap
            </Button>
            <Button onClick={stop}>Stop</Button>
          </>
        ) : (
          <>
            <Button onClick={start}>
              {state.accumulatedMs > 0 ? 'Resume' : 'Start'}
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              disabled={state.accumulatedMs === 0 && state.laps.length === 0}
            >
              Reset
            </Button>
          </>
        )}
      </div>

      {state.laps.length > 0 ? (
        <ol className="w-full overflow-hidden rounded-lg border border-border">
          {state.laps
            .map((total, i) => ({
              n: i + 1,
              split: total - (state.laps[i - 1] ?? 0),
              total,
            }))
            .reverse()
            .map((row) => (
              <li
                key={row.n}
                className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 text-sm last:border-b-0"
              >
                <span className="text-muted-foreground">Lap {row.n}</span>
                <span className="font-mono tabular-nums">
                  {formatDuration(row.split, { showMs: true })}
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {formatDuration(row.total, { showMs: true })}
                </span>
              </li>
            ))}
        </ol>
      ) : null}
    </div>
  )
}
