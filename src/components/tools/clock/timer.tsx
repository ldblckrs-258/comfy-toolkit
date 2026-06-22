import {
  formatDuration,
  parseDuration,
  timerRemaining,
} from '@/lib/tools/clock'
import type { TimerState } from '@/lib/tools/clock'
import type { useAlert } from '@/lib/use-alert'
import {
  cancelTrigger,
  scheduleTrigger,
  triggerSupported,
} from '@/lib/clock-trigger'
import { useNow } from '@/lib/use-now'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PRESETS: Array<{ label: string; ms: number }> = [
  { label: '1m', ms: 60_000 },
  { label: '5m', ms: 300_000 },
  { label: '10m', ms: 600_000 },
  { label: '25m', ms: 1_500_000 },
]

function fieldsFromMs(ms: number) {
  const total = Math.floor(ms / 1000)
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  }
}

export function Timer({
  state,
  setState,
  alert,
}: {
  state: TimerState
  setState: (next: TimerState | ((prev: TimerState) => TimerState)) => void
  alert: ReturnType<typeof useAlert>
}) {
  const now = useNow(250)
  const running = state.deadline !== null
  const ringing = alert.ringingIds.includes('timer')

  const display = running
    ? now === null
      ? 0
      : timerRemaining(state.deadline as number, now)
    : (state.pausedRemaining ?? state.durationMs)

  const fields = fieldsFromMs(state.pausedRemaining ?? state.durationMs)

  const setField = (key: 'h' | 'm' | 's', value: number) => {
    const next = { ...fields, [key]: Math.max(0, value) }
    setState((p) => ({
      ...p,
      durationMs: parseDuration(next),
      pausedRemaining: null,
      deadline: null,
    }))
  }

  const applyPreset = (ms: number) =>
    setState((p) => ({
      ...p,
      durationMs: ms,
      pausedRemaining: null,
      deadline: null,
    }))

  const start = () => {
    const remaining = state.pausedRemaining ?? state.durationMs
    if (remaining <= 0) return
    alert.unlockAudio()
    void alert.requestPermission()
    alert.stopRing('timer')
    const deadline = Date.now() + remaining
    setState((p) => ({ ...p, deadline, pausedRemaining: null }))
    void scheduleTrigger('timer', deadline, 'Timer finished')
  }

  const pause = () => {
    alert.stopRing('timer')
    setState((p) =>
      p.deadline === null
        ? p
        : {
            ...p,
            pausedRemaining: timerRemaining(p.deadline, Date.now()),
            deadline: null,
          },
    )
    void cancelTrigger('timer')
  }

  const reset = () => {
    alert.stopRing('timer')
    setState((p) => ({ ...p, deadline: null, pausedRemaining: null }))
    void cancelTrigger('timer')
  }

  const canStart = (state.pausedRemaining ?? state.durationMs) > 0

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 pt-6">
      <div className="font-mono text-6xl font-semibold tabular-nums">
        {formatDuration(display)}
      </div>

      {!running ? (
        <>
          <div className="flex items-end gap-2">
            {(['h', 'm', 's'] as const).map((key) => (
              <label key={key} className="flex flex-col items-center gap-1">
                <span className="text-xs uppercase text-muted-foreground">
                  {key}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={fields[key]}
                  onChange={(e) => setField(key, Number(e.target.value) || 0)}
                  className="w-20 text-center font-mono"
                />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="subtle"
                size="sm"
                onClick={() => applyPreset(p.ms)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </>
      ) : null}

      <div className="flex gap-2">
        {ringing ? (
          <Button onClick={() => alert.stopRing('timer')}>Stop</Button>
        ) : running ? (
          <Button onClick={pause}>Pause</Button>
        ) : (
          <Button onClick={start} disabled={!canStart}>
            {state.pausedRemaining != null ? 'Resume' : 'Start'}
          </Button>
        )}
        <Button onClick={reset} variant="outline">
          Reset
        </Button>
      </div>

      {!triggerSupported() ? (
        <p className="text-center text-xs text-muted-foreground">
          This browser only fires the timer while the tab is open.
        </p>
      ) : null}
    </div>
  )
}
