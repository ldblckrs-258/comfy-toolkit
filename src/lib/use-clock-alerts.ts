import * as React from 'react'
import type { TimerState } from '@/lib/tools/clock'
import { useNow } from '@/lib/use-now'

const FRESH_MS = 2500

export function useClockAlerts(args: {
  timer: TimerState
  setTimer: (next: TimerState | ((prev: TimerState) => TimerState)) => void
  startRing: (
    id: string,
    opts?: {
      pulses?: number
      everyMs?: number
      timeoutMs?: number
      title?: string
      body?: string
    },
  ) => void
}) {
  const { timer, setTimer, startRing } = args
  const now = useNow(1000)

  React.useEffect(() => {
    if (now === null || timer.deadline === null) return
    if (now < timer.deadline) return
    if (now - timer.deadline <= FRESH_MS)
      startRing('timer', {
        pulses: 3,
        everyMs: 2000,
        timeoutMs: 60_000,
        title: 'Timer finished',
      })
    setTimer((prev) =>
      prev.deadline !== null && now >= prev.deadline
        ? { ...prev, deadline: null, pausedRemaining: 0 }
        : prev,
    )
  }, [now, timer.deadline, startRing, setTimer])
}
