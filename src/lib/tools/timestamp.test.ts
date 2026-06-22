import { describe, expect, it } from 'vitest'
import {
  convertBatch,
  durationBetween,
  extractFromId,
  formatInstant,
  formatTokens,
  listTimeZones,
  parseDate,
  parseEpoch,
  relativeTime,
} from './timestamp'
import { uuidV7At } from './uuid'

function makeJwt(payload: Record<string, unknown>): string {
  const enc = (o: unknown) =>
    btoa(JSON.stringify(o))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc(payload)}.signature`
}

describe('parseEpoch', () => {
  it('detects seconds by magnitude', () => {
    expect(parseEpoch('1700000000')).toEqual({
      ms: 1700000000000,
      unit: 's',
    })
  })

  it('detects milliseconds by magnitude', () => {
    expect(parseEpoch('1700000000000')).toEqual({
      ms: 1700000000000,
      unit: 'ms',
    })
  })

  it('detects microseconds by magnitude', () => {
    expect(parseEpoch('1700000000000000')).toEqual({
      ms: 1700000000000,
      unit: 'us',
    })
  })

  it('detects nanoseconds by magnitude', () => {
    expect(parseEpoch('1700000000000000000')).toEqual({
      ms: 1700000000000,
      unit: 'ns',
    })
  })

  it('honors an explicit unit override', () => {
    expect(parseEpoch('1700000000', 'ms')).toEqual({
      ms: 1700000000,
      unit: 'ms',
    })
  })

  it('keeps nanosecond precision exact via BigInt', () => {
    expect(parseEpoch('1700000000999999999')).toEqual({
      ms: 1700000000999,
      unit: 'ns',
    })
  })

  it('supports negative (pre-1970) epochs', () => {
    expect(parseEpoch('-86400')).toEqual({ ms: -86400000, unit: 's' })
  })

  it('rejects non-numeric input', () => {
    expect(parseEpoch('abc')).toBeNull()
    expect(parseEpoch('')).toBeNull()
    expect(parseEpoch('12.5')).toBeNull()
  })
})

describe('parseDate', () => {
  it('parses a wall-clock date as UTC', () => {
    expect(parseDate('2023-11-14 22:13:20', 'UTC')).toBe(1700000000000)
  })

  it('parses a wall-clock date in a zone (EST, +5h to UTC)', () => {
    expect(parseDate('2023-11-14 22:13:20', 'America/New_York')).toBe(
      1700018000000,
    )
  })

  it('accepts the T separator and a date-only form', () => {
    expect(parseDate('2023-11-14T22:13:20', 'UTC')).toBe(1700000000000)
    expect(parseDate('1960-01-01', 'UTC')).toBeLessThan(0)
  })

  it('honors an explicit Z offset and ignores the passed zone', () => {
    expect(parseDate('2023-11-14T22:13:20Z', 'America/New_York')).toBe(
      1700000000000,
    )
  })

  it('returns null for unparseable input', () => {
    expect(parseDate('nonsense', 'UTC')).toBeNull()
    expect(parseDate('2023-13-01', 'UTC')).toBeNull()
  })

  it('rolls a spring-forward gap forward by the gap (03:30 local)', () => {
    const ms = parseDate('2026-03-08 02:30:00', 'America/New_York')
    expect(ms).not.toBeNull()
    const f = formatInstant(ms!, 'America/New_York')
    expect(f.timeOnly).toBe('03:30:00')
    expect(f.dateOnly).toBe('2026-03-08')
  })

  it('resolves a fall-back overlap to the earlier offset (-04:00)', () => {
    const ms = parseDate('2026-11-01 01:30:00', 'America/New_York')
    expect(ms).not.toBeNull()
    const f = formatInstant(ms!, 'America/New_York')
    expect(f.timeOnly).toBe('01:30:00')
    expect(f.isoLocal.endsWith('-04:00')).toBe(true)
  })
})

describe('formatInstant', () => {
  it('formats UTC representations exactly', () => {
    const f = formatInstant(1700000000000, 'UTC')
    expect(f.iso).toBe('2023-11-14T22:13:20.000Z')
    expect(f.unixS).toBe(1700000000)
    expect(f.unixMs).toBe(1700000000000)
    expect(f.dateOnly).toBe('2023-11-14')
    expect(f.timeOnly).toBe('22:13:20')
    expect(f.rfc2822).toBe('Tue, 14 Nov 2023 22:13:20 GMT')
    expect(f.isoLocal).toBe('2023-11-14T22:13:20+00:00')
  })

  it('reflects the target zone offset', () => {
    const f = formatInstant(1700000000000, 'America/New_York')
    expect(f.dateOnly).toBe('2023-11-14')
    expect(f.timeOnly).toBe('17:13:20')
    expect(f.isoLocal).toBe('2023-11-14T17:13:20-05:00')
  })
})

describe('relativeTime', () => {
  const now = 1700000000000

  it('formats past times', () => {
    expect(relativeTime(now - 3 * 3600000, now)).toBe('3 hours ago')
  })

  it('formats future times', () => {
    expect(relativeTime(now + 5 * 60000, now)).toBe('in 5 minutes')
  })

  it('handles sub-minute spans', () => {
    expect(relativeTime(now - 10000, now)).toBe('10 seconds ago')
  })
})

describe('listTimeZones', () => {
  it('returns a sorted, deduped, non-empty list including UTC', () => {
    const zones = listTimeZones()
    expect(zones.length).toBeGreaterThan(0)
    expect(zones).toContain('UTC')
    expect(new Set(zones).size).toBe(zones.length)
    expect([...zones].sort()).toEqual(zones)
  })
})

describe('extractFromId', () => {
  it('extracts a UUIDv7 timestamp (cross-checked against uuid.ts)', () => {
    const ms = 1700000000000
    const uuid = uuidV7At(ms)
    const out = extractFromId(uuid)
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ format: 'uuidv7', timestampMs: ms })
  })

  it('extracts a ULID timestamp (spec example)', () => {
    const out = extractFromId('01ARZ3NDEKTSV4RRFFQ69G5FAV')
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ format: 'ulid', timestampMs: 1469922850259 })
  })

  it('normalizes lowercase ULID input', () => {
    const out = extractFromId('01arz3ndektsv4rrffq69g5fav')
    expect(out[0]).toMatchObject({ format: 'ulid', timestampMs: 1469922850259 })
  })

  it('rejects malformed ULID (wrong length or excluded chars)', () => {
    expect(extractFromId('01ARZ3NDEKTSV4RRFFQ69G5FA')).toHaveLength(0)
    expect(extractFromId('01ARZ3NDEKTSV4RRFFQ69G5FAVI')).toHaveLength(0)
  })

  it('extracts a MongoDB ObjectId timestamp (seconds -> ms)', () => {
    const out = extractFromId('507f1f77bcf86cd799439011')
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({
      format: 'objectid',
      timestampMs: 1350508407000,
    })
  })

  it('extracts Snowflake candidates for each known epoch', () => {
    const out = extractFromId('175928847299117063')
    expect(out.every((e) => e.format === 'snowflake')).toBe(true)
    const labels = out.map((e) => e.label).join('|')
    expect(labels).toMatch(/Discord/)
    expect(labels).toMatch(/Twitter/)
    const discord = out.find((e) => /Discord/.test(e.label))!
    expect(discord.timestampMs).toBeGreaterThanOrEqual(Date.UTC(2016, 0, 1))
    expect(discord.timestampMs).toBeLessThan(Date.UTC(2017, 0, 1))
  })

  it('does not treat a 21-digit number as a Snowflake', () => {
    expect(extractFromId('123456789012345678901')).toHaveLength(0)
  })

  it('extracts JWT time claims (seconds -> ms)', () => {
    const token = makeJwt({ iat: 1700000000, nbf: 1700000000, exp: 1700003600 })
    const out = extractFromId(token)
    expect(out.every((e) => e.format === 'jwt')).toBe(true)
    const byClaim = Object.fromEntries(
      out.map((e) => [e.label, e.timestampMs]),
    )
    expect(byClaim['JWT (iat)']).toBe(1700000000000)
    expect(byClaim['JWT (nbf)']).toBe(1700000000000)
    expect(byClaim['JWT (exp)']).toBe(1700003600000)
  })

  it('returns only the present JWT claims', () => {
    const out = extractFromId(makeJwt({ iat: 1700000000 }))
    expect(out).toHaveLength(1)
    expect(out[0].label).toBe('JWT (iat)')
  })

  it('returns empty for a malformed JWT without throwing', () => {
    expect(extractFromId('a.b.c')).toHaveLength(0)
  })

  it('returns empty for unrecognized input', () => {
    expect(extractFromId('hello world')).toHaveLength(0)
    expect(extractFromId('')).toHaveLength(0)
  })
})

describe('convertBatch', () => {
  const now = 1700000000000

  it('converts mixed epoch/date lines and isolates errors', () => {
    const rows = convertBatch(
      '1700000000\n2023-11-14 22:13:20\ngarbage\n\n',
      'UTC',
      now,
    )
    expect(rows).toHaveLength(3)
    expect(rows[0].ms).toBe(1700000000000)
    expect(rows[1].ms).toBe(1700000000000)
    expect(rows[0].iso).toBe('2023-11-14T22:13:20.000Z')
    expect(rows[0].relative).toBeTypeOf('string')
    expect(rows[2].ms).toBeNull()
    expect(rows[2].error).toBeTruthy()
  })

  it('caps at 1000 rows and appends a truncation notice', () => {
    const text = Array.from({ length: 1500 }, () => '1700000000').join('\n')
    const rows = convertBatch(text, 'UTC', now)
    expect(rows).toHaveLength(1001)
    expect(rows[1000].error).toMatch(/truncat/i)
    expect(rows[999].ms).toBe(1700000000000)
  })
})

describe('durationBetween', () => {
  const base = 1700000000000

  it('breaks a span into d/h/m/s', () => {
    const d = durationBetween(base, base + 93784000)
    expect(d).toMatchObject({ days: 1, hours: 2, minutes: 3, seconds: 4 })
    expect(d.ms).toBe(93784000)
    expect(d.human).toContain('1 day')
  })

  it('is order-independent for the breakdown but signs ms', () => {
    const d = durationBetween(base + 93784000, base)
    expect(d).toMatchObject({ days: 1, hours: 2, minutes: 3, seconds: 4 })
    expect(d.ms).toBe(-93784000)
  })
})

describe('formatTokens', () => {
  it('formats a pattern in UTC', () => {
    expect(formatTokens(1700000000000, 'YYYY-MM-DD HH:mm:ss', 'UTC')).toBe(
      '2023-11-14 22:13:20',
    )
  })

  it('formats a pattern in a zone', () => {
    expect(
      formatTokens(1700000000000, 'YYYY-MM-DD HH:mm:ss', 'America/New_York'),
    ).toBe('2023-11-14 17:13:20')
  })

  it('resolves Z, bracket literals, and SSS', () => {
    expect(formatTokens(1700000000000, 'Z', 'America/New_York')).toBe('-05:00')
    expect(formatTokens(1700000000000, '[at] HH:mm', 'UTC')).toBe('at 22:13')
    expect(formatTokens(1700000000500, 'ss.SSS', 'UTC')).toBe('20.500')
  })
})
