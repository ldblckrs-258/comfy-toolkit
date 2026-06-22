export interface StopwatchState {
  startedAt: number | null
  accumulatedMs: number
  laps: Array<number>
}

export interface TimerState {
  deadline: number | null
  pausedRemaining: number | null
  durationMs: number
}

export interface Drift {
  diffMs: number
  level: 'ok' | 'warn'
}

export function formatDuration(
  ms: number,
  opts: { showMs?: boolean } = {},
): string {
  const total = Math.max(0, Math.floor(ms))
  const hours = Math.floor(total / 3_600_000)
  const minutes = Math.floor((total % 3_600_000) / 60_000)
  const seconds = Math.floor((total % 60_000) / 1000)
  const base = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
  if (!opts.showMs) return base
  return `${base}.${pad3(total % 1000)}`
}

export function parseDuration(p: {
  h?: number
  m?: number
  s?: number
}): number {
  const h = Math.max(0, Math.floor(p.h ?? 0))
  const m = Math.max(0, Math.floor(p.m ?? 0))
  const s = Math.max(0, Math.floor(p.s ?? 0))
  return (h * 3600 + m * 60 + s) * 1000
}

export function stopwatchElapsed(s: StopwatchState, now: number): number {
  const running = s.startedAt === null ? 0 : Math.max(0, now - s.startedAt)
  return s.accumulatedMs + running
}

export function timerRemaining(deadline: number, now: number): number {
  return Math.max(0, deadline - now)
}

export function timerExpired(deadline: number, now: number): boolean {
  return now >= deadline
}

export function computeDrift(
  serverMs: number,
  localMs: number,
  warnMs = 2000,
): Drift {
  const diffMs = localMs - serverMs
  return { diffMs, level: Math.abs(diffMs) > warnMs ? 'warn' : 'ok' }
}

export function parseServerTime(json: unknown): number | null {
  if (typeof json !== 'object' || json === null) return null
  const dateTime = (json as { dateTime?: unknown }).dateTime
  if (typeof dateTime !== 'string') return null
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(dateTime)
    ? dateTime
    : `${dateTime}Z`
  const ms = Date.parse(normalized)
  return Number.isFinite(ms) ? ms : null
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function pad3(n: number): string {
  return String(n).padStart(3, '0')
}
