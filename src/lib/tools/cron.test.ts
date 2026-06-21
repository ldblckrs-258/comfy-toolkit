import { describe, expect, it } from 'vitest'
import {
  buildExpression,
  describeCron,
  detectPreset,
  nextRuns,
  parseCron,
  serializeSchedule,
  summarizeFields,
} from './cron'

function parsed(expr: string, dialect: Parameters<typeof parseCron>[1]) {
  const result = parseCron(expr, dialect)
  if (!result.ok) throw new Error(`parse failed: ${result.error.message}`)
  return result.schedule
}

function nyParts(ms: number) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  const p = dtf.formatToParts(new Date(ms))
  const g = (t: string) => Number(p.find((x) => x.type === t)?.value)
  return { d: g('day'), h: g('hour'), mi: g('minute') }
}

describe('parseCron - dialects & numbering', () => {
  it('parses a standard unix 5-field expression', () => {
    const s = parsed('*/5 * * * *', 'unix')
    expect(s.minute.values).toEqual([
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
    ])
    expect(s.hour.wildcard).toBe(true)
    expect(s.dom.kind).toBe('any')
    expect(s.dow.kind).toBe('any')
  })

  it('normalizes unix dow 7 to 0 (both Sunday)', () => {
    const a = parsed('0 0 * * 7', 'unix')
    const b = parsed('0 0 * * 0', 'unix')
    expect(a.dow.kind === 'values' && a.dow.values).toEqual([0])
    expect(b.dow.kind === 'values' && b.dow.values).toEqual([0])
  })

  it('maps month and dow names', () => {
    const s = parsed('0 0 1 JAN MON', 'unix')
    expect(s.month.values).toEqual([1])
    expect(s.dow.kind === 'values' && s.dow.values).toEqual([1])
  })

  it('parses quartz dow with 1=SUN numbering', () => {
    const s = parsed('0 0 12 ? * 1', 'quartz')
    expect(s.dow.kind === 'values' && s.dow.values).toEqual([0])
  })

  it('parses node-cron 6-field with seconds', () => {
    const s = parsed('*/30 * * * * *', 'node-cron')
    expect(s.second.values).toEqual([0, 30])
  })

  it('parses quartz optional year field', () => {
    const s = parsed('0 0 12 1 1 ? 2027', 'quartz')
    expect(s.year?.values).toEqual([2027])
    expect(s.dom.kind === 'values' && s.dom.values).toEqual([1])
  })
})

describe('parseCron - macros', () => {
  it('expands @daily to midnight (unix)', () => {
    const s = parsed('@daily', 'unix')
    expect(s.minute.values).toEqual([0])
    expect(s.hour.values).toEqual([0])
    expect(s.dom.kind).toBe('any')
    expect(s.dow.kind).toBe('any')
    expect(s.reboot).toBe(false)
  })

  it('expands node-cron macro with a zero seconds field', () => {
    const s = parsed('@hourly', 'node-cron')
    expect(s.second.values).toEqual([0])
    expect(s.minute.values).toEqual([0])
    expect(s.hour.wildcard).toBe(true)
  })

  it('flags @reboot', () => {
    const s = parsed('@reboot', 'unix')
    expect(s.reboot).toBe(true)
  })

  it('rejects macros under quartz', () => {
    const r = parseCron('@daily', 'quartz')
    expect(r.ok).toBe(false)
  })
})

describe('parseCron - quartz tokens', () => {
  it('parses last-weekday-of-month (6L)', () => {
    const s = parsed('0 30 2 ? * 6L', 'quartz')
    expect(s.dow).toMatchObject({ kind: 'lastDow', weekday: 5 })
  })

  it('parses nth-weekday (2#3 = 3rd Monday)', () => {
    const s = parsed('0 0 12 ? * 2#3', 'quartz')
    expect(s.dow).toMatchObject({ kind: 'nthDow', weekday: 1, nth: 3 })
  })

  it('parses last day (L), last weekday (LW), nearest weekday (15W)', () => {
    expect(parsed('0 0 12 L * ?', 'quartz').dom.kind).toBe('lastDay')
    expect(parsed('0 0 12 LW * ?', 'quartz').dom.kind).toBe('lastWeekday')
    expect(parsed('0 0 12 15W * ?', 'quartz').dom).toMatchObject({
      kind: 'nearestWeekday',
      day: 15,
    })
  })

  it('tolerates both dom and dow restricted in quartz', () => {
    expect(parseCron('0 0 12 1 * 1', 'quartz').ok).toBe(true)
  })
})

describe('parseCron - errors', () => {
  const cases: Array<[string, Parameters<typeof parseCron>[1], string]> = [
    ['99 * * * *', 'unix', 'minute'],
    ['* * * * 9', 'unix', 'dow'],
    ['* * * *', 'unix', 'expression'],
    ['* * L * *', 'unix', 'dom'],
    ['* * ? * *', 'unix', 'dom'],
    ['0-5-9 * * * *', 'unix', 'minute'],
    ['* * * * MON/2', 'unix', 'dow'],
  ]
  it.each(cases)('rejects %s (%s) at field %s', (expr, dialect, field) => {
    const r = parseCron(expr, dialect)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.field).toBe(field)
  })
})

describe('describeCron', () => {
  const cases: Array<[string, Parameters<typeof parseCron>[1], string]> = [
    ['* * * * *', 'unix', 'Every minute.'],
    ['*/5 * * * *', 'unix', 'Every 5 minutes.'],
    ['0 9 * * 1-5', 'unix', 'At 09:00, on Monday through Friday.'],
    ['15,45 * * * *', 'unix', 'At 15 and 45 minutes past every hour.'],
    ['0 0 1 1 *', 'unix', 'At 00:00, on day 1 of the month, in January.'],
    ['0 0 * * MON', 'unix', 'At 00:00, on Monday.'],
    ['0 30 2 ? * 6L', 'quartz', 'At 02:30, on the last Friday of the month.'],
    ['0 0 12 ? * 2#3', 'quartz', 'At 12:00, on the third Monday of the month.'],
    ['0 0 12 L * ?', 'quartz', 'At 12:00, on the last day of the month.'],
    ['0 0 12 15W * ?', 'quartz', 'At 12:00, on the weekday nearest day 15.'],
    ['*/30 * * * * *', 'node-cron', 'Every 30 seconds.'],
  ]
  it.each(cases)('describes %s', (expr, dialect, text) => {
    expect(describeCron(parsed(expr, dialect))).toBe(text)
  })
})

describe('summarizeFields', () => {
  it('returns one row per active field with raw + allowed', () => {
    const rows = summarizeFields(parsed('*/5 9 * * 1-5', 'unix'))
    expect(rows.map((r) => r.name)).toEqual([
      'minute',
      'hour',
      'dom',
      'month',
      'dow',
    ])
    const minute = rows.find((r) => r.name === 'minute')!
    expect(minute.raw).toBe('*/5')
    expect(minute.text).toBe('every 5 minutes')
    expect(rows.find((r) => r.name === 'dow')!.allowed).toBe('0-6 (SUN-SAT)')
  })
})

describe('nextRuns - plain', () => {
  const base = Date.UTC(2026, 0, 1, 0, 0, 0)

  it('steps every 5 minutes in UTC', () => {
    const { runs, truncated } = nextRuns(
      parsed('*/5 * * * *', 'unix'),
      base,
      5,
      'UTC',
    )
    expect(truncated).toBe(false)
    expect(runs.map((r) => (r - base) / 60000)).toEqual([5, 10, 15, 20, 25])
  })

  it('steps every 30 seconds (node-cron)', () => {
    const { runs } = nextRuns(
      parsed('*/30 * * * * *', 'node-cron'),
      base,
      3,
      'UTC',
    )
    expect(runs.map((r) => (r - base) / 1000)).toEqual([30, 60, 90])
  })

  it('honors the dom OR dow union in unix', () => {
    const { runs } = nextRuns(parsed('0 0 1 * 1', 'unix'), base, 1, 'UTC')
    expect(runs[0]).toBe(Date.UTC(2026, 0, 5, 0, 0, 0))
  })
})

describe('nextRuns - timezone & DST', () => {
  it('computes midnight in America/New_York (winter offset)', () => {
    const from = Date.UTC(2026, 0, 1, 12, 0, 0)
    const { runs } = nextRuns(
      parsed('0 0 * * *', 'unix'),
      from,
      1,
      'America/New_York',
    )
    expect(runs[0]).toBe(Date.UTC(2026, 0, 2, 5, 0, 0))
  })

  it('skips the non-existent spring-forward wall time', () => {
    const from = Date.UTC(2026, 2, 7, 12, 0, 0)
    const { runs } = nextRuns(
      parsed('30 2 * * *', 'unix'),
      from,
      2,
      'America/New_York',
    )
    expect(runs.every((r) => nyParts(r).d !== 8)).toBe(true)
    expect(nyParts(runs[0])).toMatchObject({ d: 9, h: 2, mi: 30 })
    expect(nyParts(runs[1])).toMatchObject({ d: 10, h: 2, mi: 30 })
  })

  it('fires twice on the fall-back overlap', () => {
    const from = Date.UTC(2026, 9, 31, 12, 0, 0)
    const { runs } = nextRuns(
      parsed('30 1 * * *', 'unix'),
      from,
      3,
      'America/New_York',
    )
    expect(runs[0]).toBe(Date.UTC(2026, 10, 1, 5, 30, 0))
    expect(runs[1]).toBe(Date.UTC(2026, 10, 1, 6, 30, 0))
    expect(runs[1] - runs[0]).toBe(3_600_000)
    expect(nyParts(runs[0])).toMatchObject({ d: 1, h: 1, mi: 30 })
    expect(nyParts(runs[1])).toMatchObject({ d: 1, h: 1, mi: 30 })
  })
})

describe('nextRuns - quartz tokens', () => {
  const base = Date.UTC(2026, 0, 1, 0, 0, 0)

  it('finds the last Friday each month', () => {
    const { runs } = nextRuns(parsed('0 0 12 ? * 6L', 'quartz'), base, 2, 'UTC')
    expect(runs[0]).toBe(Date.UTC(2026, 0, 30, 12, 0, 0))
    expect(runs[1]).toBe(Date.UTC(2026, 1, 27, 12, 0, 0))
  })

  it('finds the 3rd Monday', () => {
    const { runs } = nextRuns(
      parsed('0 0 12 ? * 2#3', 'quartz'),
      base,
      1,
      'UTC',
    )
    expect(runs[0]).toBe(Date.UTC(2026, 0, 19, 12, 0, 0))
  })
})

describe('nextRuns - horizon', () => {
  const base = Date.UTC(2026, 0, 1, 0, 0, 0)

  it('finds the next Feb 29 within the horizon', () => {
    const { runs, truncated } = nextRuns(
      parsed('0 0 29 2 *', 'unix'),
      base,
      1,
      'UTC',
    )
    expect(truncated).toBe(false)
    expect(runs[0]).toBe(Date.UTC(2028, 1, 29, 0, 0, 0))
  })

  it('reports truncation for an impossible expression', () => {
    const { runs, truncated } = nextRuns(
      parsed('0 0 30 2 *', 'unix'),
      base,
      1,
      'UTC',
    )
    expect(runs).toEqual([])
    expect(truncated).toBe(true)
  })
})

describe('detectPreset - reverse detection & round-trip', () => {
  const cases: Array<[string, Parameters<typeof parseCron>[1], string]> = [
    ['* * * * *', 'unix', 'everyMinute'],
    ['*/5 * * * *', 'unix', 'everyNMinutes'],
    ['0 * * * *', 'unix', 'everyHour'],
    ['30 9 * * *', 'unix', 'dailyAt'],
    ['0 9 * * 1', 'unix', 'weeklyAt'],
    ['0 0 1 * *', 'unix', 'monthlyAt'],
    ['0 30 2 ? * 6L', 'quartz', 'lastDowAt'],
    ['0 0 12 ? * 2#3', 'quartz', 'nthDowAt'],
    ['0 0 12 L * ?', 'quartz', 'lastDayAt'],
    ['0 0 12 15W * ?', 'quartz', 'nearestWeekdayAt'],
    ['0 9 * * 1-5', 'unix', 'custom'],
    ['*/30 * * * * *', 'node-cron', 'custom'],
  ]
  it.each(cases)('detects %s as %s and round-trips', (expr, dialect, mode) => {
    const state = detectPreset(parsed(expr, dialect))
    expect(state.mode).toBe(mode)
    expect(buildExpression(state, dialect)).toBe(expr)
  })
})

describe('serializeSchedule - dialect conversion', () => {
  type D = Parameters<typeof parseCron>[1]
  const cases: Array<[string, D, D, string]> = [
    ['*/5 * * * *', 'unix', 'quartz', '0 */5 * * * ?'],
    ['*/5 * * * *', 'unix', 'node-cron', '0 */5 * * * *'],
    ['0 9 * * 1-5', 'unix', 'quartz', '0 0 9 ? * 2-6'],
    ['0 30 9 * * ?', 'quartz', 'unix', '30 9 * * *'],
    ['0 0 1 * 1', 'unix', 'quartz', '0 0 0 1 * 2'],
  ]
  it.each(cases)('%s (%s -> %s)', (expr, from, to, expected) => {
    expect(serializeSchedule(parsed(expr, from), to)).toBe(expected)
    expect(parseCron(expected, to).ok).toBe(true)
  })

  it('returns null for quartz-only tokens leaving quartz', () => {
    expect(
      serializeSchedule(parsed('0 0 12 ? * 2#3', 'quartz'), 'unix'),
    ).toBeNull()
    expect(
      serializeSchedule(parsed('0 0 12 L * ?', 'quartz'), 'node-cron'),
    ).toBeNull()
  })
})

describe('buildExpression - round-trips', () => {
  it('every N minutes', () => {
    expect(buildExpression({ mode: 'everyNMinutes', n: 5 }, 'unix')).toBe(
      '*/5 * * * *',
    )
  })
  it('daily at', () => {
    expect(
      buildExpression({ mode: 'dailyAt', hour: 9, minute: 30 }, 'unix'),
    ).toBe('30 9 * * *')
  })
  it('weekly at', () => {
    expect(
      buildExpression(
        { mode: 'weeklyAt', weekday: 1, hour: 9, minute: 0 },
        'unix',
      ),
    ).toBe('0 9 * * 1')
  })
  it('quartz token modes round-trip through the parser', () => {
    const exprs = [
      buildExpression({ mode: 'lastDayAt', hour: 12, minute: 0 }, 'quartz'),
      buildExpression({ mode: 'lastWeekdayAt', hour: 12, minute: 0 }, 'quartz'),
      buildExpression(
        { mode: 'nearestWeekdayAt', day: 15, hour: 12, minute: 0 },
        'quartz',
      ),
      buildExpression(
        { mode: 'lastDowAt', weekday: 5, hour: 0, minute: 0 },
        'quartz',
      ),
      buildExpression(
        { mode: 'nthDowAt', weekday: 1, nth: 3, hour: 12, minute: 0 },
        'quartz',
      ),
    ]
    expect(exprs[3]).toBe('0 0 0 ? * 6L')
    expect(exprs[4]).toBe('0 0 12 ? * 2#3')
    for (const expr of exprs) expect(parseCron(expr, 'quartz').ok).toBe(true)
  })
})
