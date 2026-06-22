import { describe, expect, it } from 'vitest'
import {
  computeDrift,
  formatDuration,
  parseDuration,
  parseServerTime,
  stopwatchElapsed,
  timerExpired,
  timerRemaining,
} from './clock'

describe('formatDuration', () => {
  it('formats zero', () => {
    expect(formatDuration(0)).toBe('00:00:00')
  })

  it('clamps negative to zero', () => {
    expect(formatDuration(-5000)).toBe('00:00:00')
  })

  it('formats exactly one hour', () => {
    expect(formatDuration(3_600_000)).toBe('01:00:00')
  })

  it('formats the max two-digit clock', () => {
    expect(formatDuration(99 * 3_600_000 + 59 * 60_000 + 59_000)).toBe(
      '99:59:59',
    )
  })

  it('overflows hours past two digits', () => {
    expect(formatDuration(100 * 3_600_000)).toBe('100:00:00')
  })

  it('appends milliseconds when requested', () => {
    expect(formatDuration(1234, { showMs: true })).toBe('00:00:01.234')
  })
})

describe('parseDuration', () => {
  it('sums h/m/s to milliseconds', () => {
    expect(parseDuration({ h: 1, m: 2, s: 3 })).toBe(3_723_000)
  })

  it('treats missing fields as zero', () => {
    expect(parseDuration({})).toBe(0)
  })

  it('does not normalize overflowing minutes', () => {
    expect(parseDuration({ m: 90 })).toBe(5_400_000)
  })

  it('clamps negative fields', () => {
    expect(parseDuration({ h: -1, s: 5 })).toBe(5000)
  })
})

describe('stopwatchElapsed', () => {
  it('returns accumulated when paused', () => {
    expect(
      stopwatchElapsed(
        { startedAt: null, accumulatedMs: 4200, laps: [] },
        9_999,
      ),
    ).toBe(4200)
  })

  it('adds the running segment', () => {
    expect(
      stopwatchElapsed({ startedAt: 1000, accumulatedMs: 500, laps: [] }, 3000),
    ).toBe(2500)
  })
})

describe('timer', () => {
  it('clamps remaining to zero past the deadline', () => {
    expect(timerRemaining(1000, 5000)).toBe(0)
    expect(timerRemaining(5000, 1000)).toBe(4000)
  })

  it('reports expiry at and after the deadline', () => {
    expect(timerExpired(1000, 999)).toBe(false)
    expect(timerExpired(1000, 1000)).toBe(true)
    expect(timerExpired(1000, 2000)).toBe(true)
  })
})

describe('computeDrift', () => {
  it('marks ok just under the threshold', () => {
    expect(computeDrift(1000, 1000 + 1999).level).toBe('ok')
  })

  it('marks warn just over the threshold', () => {
    expect(computeDrift(1000, 1000 + 2001).level).toBe('warn')
  })

  it('reports signed difference (local ahead is positive)', () => {
    expect(computeDrift(1000, 4000).diffMs).toBe(3000)
    expect(computeDrift(4000, 1000).diffMs).toBe(-3000)
  })
})

describe('parseServerTime', () => {
  it('parses a UTC dateTime that lacks a Z suffix', () => {
    const ms = parseServerTime({
      dateTime: '2026-06-22T10:43:44.6554785',
      timeZone: 'Etc/UTC',
    })
    expect(ms).toBe(Date.parse('2026-06-22T10:43:44.6554785Z'))
  })

  it('parses a dateTime that already has Z', () => {
    expect(parseServerTime({ dateTime: '2026-06-22T10:43:44Z' })).toBe(
      Date.parse('2026-06-22T10:43:44Z'),
    )
  })

  it('returns null for a missing field', () => {
    expect(parseServerTime({ foo: 'bar' })).toBeNull()
  })

  it('returns null for garbage', () => {
    expect(parseServerTime({ dateTime: 'not-a-date' })).toBeNull()
    expect(parseServerTime(null)).toBeNull()
    expect(parseServerTime('2026')).toBeNull()
  })
})
