export type CronDialect = 'unix' | 'node-cron' | 'quartz'

export type CronFieldName =
  | 'second'
  | 'minute'
  | 'hour'
  | 'dom'
  | 'month'
  | 'dow'
  | 'year'

export interface NumField {
  values: Array<number>
  raw: string
  wildcard: boolean
}

export type DomMatch =
  | { kind: 'any'; raw: string }
  | { kind: 'values'; values: Array<number>; raw: string }
  | { kind: 'lastDay'; raw: string }
  | { kind: 'lastOffset'; offset: number; raw: string }
  | { kind: 'lastWeekday'; raw: string }
  | { kind: 'nearestWeekday'; day: number; raw: string }

export type DowMatch =
  | { kind: 'any'; raw: string }
  | { kind: 'values'; values: Array<number>; raw: string }
  | { kind: 'lastDow'; weekday: number; raw: string }
  | { kind: 'nthDow'; weekday: number; nth: number; raw: string }

export interface CronSchedule {
  dialect: CronDialect
  second: NumField
  minute: NumField
  hour: NumField
  dom: DomMatch
  month: NumField
  dow: DowMatch
  year: NumField | null
  reboot: boolean
}

export interface CronParseError {
  field: CronFieldName | 'expression'
  message: string
}

export type ParseResult =
  | { ok: true; schedule: CronSchedule }
  | { ok: false; error: CronParseError }

const MONTH_NAMES = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]
const DOW_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DOW_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth']

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
}

class FieldError extends Error {
  field: CronFieldName | 'expression'
  constructor(field: CronFieldName | 'expression', message: string) {
    super(message)
    this.field = field
  }
}

function range(min: number, max: number): Array<number> {
  const out: Array<number> = []
  for (let i = min; i <= max; i++) out.push(i)
  return out
}

function sortUnique(values: Array<number>): Array<number> {
  return Array.from(new Set(values)).sort((a, b) => a - b)
}

function parseStep(raw: string, field: CronFieldName): number {
  const step = Number(raw)
  if (!Number.isInteger(step) || step < 1)
    throw new FieldError(field, `Invalid step "${raw}"`)
  return step
}

function parsePlainField(
  token: string,
  field: CronFieldName,
  min: number,
  max: number,
  names?: Array<string>,
): NumField {
  if (token === '*')
    return { values: range(min, max), raw: token, wildcard: true }

  const mapAtom = (atom: string): number => {
    const upper = atom.toUpperCase()
    if (names) {
      const idx = names.indexOf(upper)
      if (idx !== -1) return idx + min
    }
    const n = Number(atom)
    if (!Number.isInteger(n))
      throw new FieldError(field, `Invalid value "${atom}"`)
    return n
  }

  const values: Array<number> = []
  for (const part of token.split(',')) {
    if (part === '') throw new FieldError(field, 'Empty list item')
    let body = part
    let step = 1
    const slash = part.indexOf('/')
    if (slash !== -1) {
      body = part.slice(0, slash)
      step = parseStep(part.slice(slash + 1), field)
    }

    let lo: number
    let hi: number
    if (body === '*') {
      lo = min
      hi = max
    } else if (body.includes('-')) {
      const ends = body.split('-')
      if (ends.length !== 2)
        throw new FieldError(field, `Invalid range "${body}"`)
      lo = mapAtom(ends[0])
      hi = mapAtom(ends[1])
    } else {
      lo = mapAtom(body)
      hi = slash !== -1 ? max : lo
    }

    if (lo < min || hi > max || lo > hi)
      throw new FieldError(field, `Value out of range ${min}-${max}: "${part}"`)
    for (let v = lo; v <= hi; v += step) values.push(v)
  }

  return { values: sortUnique(values), raw: token, wildcard: false }
}

function normalizeDowNum(
  v: number,
  dialect: CronDialect,
  field: CronFieldName,
): number {
  if (dialect === 'quartz') {
    if (v < 1 || v > 7)
      throw new FieldError(field, `Day-of-week out of range 1-7: "${v}"`)
    return v - 1
  }
  if (v < 0 || v > 7)
    throw new FieldError(field, `Day-of-week out of range 0-7: "${v}"`)
  return v === 7 ? 0 : v
}

function parseDowAtomToCanonical(
  atom: string,
  dialect: CronDialect,
): { value: number; isName: boolean } {
  const idx = DOW_NAMES.indexOf(atom.toUpperCase())
  if (idx !== -1) return { value: idx, isName: true }
  const n = Number(atom)
  if (!Number.isInteger(n))
    throw new FieldError('dow', `Invalid day-of-week "${atom}"`)
  return { value: normalizeDowNum(n, dialect, 'dow'), isName: false }
}

function parseDowValues(token: string, dialect: CronDialect): Array<number> {
  const dialectMin = dialect === 'quartz' ? 1 : 0
  const dialectMax = 7
  const values: Array<number> = []

  for (const part of token.split(',')) {
    if (part === '') throw new FieldError('dow', 'Empty list item')
    let body = part
    let step = 1
    const slash = part.indexOf('/')
    if (slash !== -1) {
      body = part.slice(0, slash)
      step = parseStep(part.slice(slash + 1), 'dow')
    }

    if (body === '*') {
      for (let v = dialectMin; v <= dialectMax; v += step)
        values.push(normalizeDowNum(v, dialect, 'dow'))
      continue
    }

    if (body.includes('-')) {
      const ends = body.split('-')
      if (ends.length !== 2)
        throw new FieldError('dow', `Invalid range "${body}"`)
      const [a, b] = ends
      const lo = parseDowAtomToCanonical(a, dialect)
      const hi = parseDowAtomToCanonical(b, dialect)
      if (lo.isName || hi.isName) {
        if (lo.value > hi.value)
          throw new FieldError('dow', `Invalid range "${body}"`)
        for (let v = lo.value; v <= hi.value; v += step) values.push(v)
      } else {
        const rawA = Number(a)
        const rawB = Number(b)
        if (rawA > rawB) throw new FieldError('dow', `Invalid range "${body}"`)
        for (let v = rawA; v <= rawB; v += step)
          values.push(normalizeDowNum(v, dialect, 'dow'))
      }
      continue
    }

    const single = parseDowAtomToCanonical(body, dialect)
    if (slash !== -1) {
      if (single.isName)
        throw new FieldError('dow', 'Step is not supported with a day name')
      const rawStart = Number(body)
      for (let v = rawStart; v <= dialectMax; v += step)
        values.push(normalizeDowNum(v, dialect, 'dow'))
    } else {
      values.push(single.value)
    }
  }

  return sortUnique(values)
}

function parseDom(token: string, dialect: CronDialect): DomMatch {
  if (token === '*') return { kind: 'any', raw: token }
  if (token === '?') {
    if (dialect !== 'quartz')
      throw new FieldError('dom', '"?" is only valid in Quartz')
    return { kind: 'any', raw: token }
  }

  const hasSpecial = /[LW]/i.test(token)
  if (hasSpecial && dialect !== 'quartz')
    throw new FieldError('dom', '"L"/"W" are only valid in Quartz')

  if (dialect === 'quartz') {
    if (/^L$/i.test(token)) return { kind: 'lastDay', raw: token }
    if (/^LW$/i.test(token)) return { kind: 'lastWeekday', raw: token }
    const off = /^L-(\d+)$/i.exec(token)
    if (off) {
      const offset = Number(off[1])
      if (offset < 1 || offset > 30)
        throw new FieldError('dom', `Invalid offset "${token}"`)
      return { kind: 'lastOffset', offset, raw: token }
    }
    const near = /^(\d+)W$/i.exec(token)
    if (near) {
      const day = Number(near[1])
      if (day < 1 || day > 31)
        throw new FieldError('dom', `Day out of range 1-31: "${token}"`)
      return { kind: 'nearestWeekday', day, raw: token }
    }
  }

  const field = parsePlainField(token, 'dom', 1, 31)
  return { kind: 'values', values: field.values, raw: token }
}

function parseDow(token: string, dialect: CronDialect): DowMatch {
  if (token === '*') return { kind: 'any', raw: token }
  if (token === '?') {
    if (dialect !== 'quartz')
      throw new FieldError('dow', '"?" is only valid in Quartz')
    return { kind: 'any', raw: token }
  }

  const hasSpecial = /[L#]/i.test(token)
  if (hasSpecial && dialect !== 'quartz')
    throw new FieldError('dow', '"L"/"#" are only valid in Quartz')

  if (dialect === 'quartz') {
    if (/^L$/i.test(token)) return { kind: 'lastDow', weekday: 6, raw: token }
    const last = /^([0-7]|SUN|MON|TUE|WED|THU|FRI|SAT)L$/i.exec(token)
    if (last) {
      const weekday = parseDowAtomToCanonical(last[1], dialect).value
      return { kind: 'lastDow', weekday, raw: token }
    }
    const nth = /^([0-7]|SUN|MON|TUE|WED|THU|FRI|SAT)#(\d+)$/i.exec(token)
    if (nth) {
      const weekday = parseDowAtomToCanonical(nth[1], dialect).value
      const n = Number(nth[2])
      if (n < 1 || n > 5)
        throw new FieldError(
          'dow',
          `Nth occurrence out of range 1-5: "${token}"`,
        )
      return { kind: 'nthDow', weekday, nth: n, raw: token }
    }
  }

  return { kind: 'values', values: parseDowValues(token, dialect), raw: token }
}

const SYNTHETIC_SECOND: NumField = { values: [0], raw: '', wildcard: false }

export function parseCron(expr: string, dialect: CronDialect): ParseResult {
  try {
    const trimmed = expr.trim().replace(/\s+/g, ' ')
    if (!trimmed) throw new FieldError('expression', 'Empty expression')

    if (trimmed.startsWith('@')) {
      if (dialect === 'quartz')
        throw new FieldError('expression', 'Macros are not supported in Quartz')
      if (trimmed === '@reboot')
        return {
          ok: true,
          schedule: {
            dialect,
            second: SYNTHETIC_SECOND,
            minute: { values: [], raw: '@reboot', wildcard: false },
            hour: { values: [], raw: '', wildcard: false },
            dom: { kind: 'any', raw: '' },
            month: { values: [], raw: '', wildcard: false },
            dow: { kind: 'any', raw: '' },
            year: null,
            reboot: true,
          },
        }
      const macro = MACROS[trimmed.toLowerCase()]
      if (!macro)
        throw new FieldError('expression', `Unknown macro "${trimmed}"`)
      return parseCron(dialect === 'node-cron' ? `0 ${macro}` : macro, dialect)
    }

    const parts = trimmed.split(' ')
    let second: NumField
    let minute: string
    let hour: string
    let dom: string
    let month: string
    let dow: string
    let year: NumField | null = null

    if (dialect === 'unix') {
      if (parts.length !== 5)
        throw new FieldError(
          'expression',
          `Unix cron needs 5 fields, got ${parts.length}`,
        )
      second = SYNTHETIC_SECOND
      ;[minute, hour, dom, month, dow] = parts
    } else if (dialect === 'node-cron') {
      if (parts.length !== 6)
        throw new FieldError(
          'expression',
          `node-cron needs 6 fields, got ${parts.length}`,
        )
      second = parsePlainField(parts[0], 'second', 0, 59)
      ;[, minute, hour, dom, month, dow] = parts
    } else {
      if (parts.length !== 6 && parts.length !== 7)
        throw new FieldError(
          'expression',
          `Quartz cron needs 6 or 7 fields, got ${parts.length}`,
        )
      second = parsePlainField(parts[0], 'second', 0, 59)
      ;[, minute, hour, dom, month, dow] = parts
      if (parts.length === 7)
        year = parsePlainField(parts[6], 'year', 1970, 2099)
    }

    const schedule: CronSchedule = {
      dialect,
      second,
      minute: parsePlainField(minute, 'minute', 0, 59),
      hour: parsePlainField(hour, 'hour', 0, 23),
      dom: parseDom(dom, dialect),
      month: parsePlainField(month, 'month', 1, 12, MONTH_NAMES),
      dow: parseDow(dow, dialect),
      year,
      reboot: false,
    }
    return { ok: true, schedule }
  } catch (error) {
    if (error instanceof FieldError)
      return {
        ok: false,
        error: { field: error.field, message: error.message },
      }
    return {
      ok: false,
      error: { field: 'expression', message: 'Could not parse expression' },
    }
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function joinAnd(items: Array<string>): string {
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function isContiguous(values: Array<number>): boolean {
  for (let i = 1; i < values.length; i++)
    if (values[i] !== values[i - 1] + 1) return false
  return true
}

function stepOf(raw: string): number | null {
  const m = /^\*\/(\d+)$/.exec(raw)
  return m ? Number(m[1]) : null
}

function describeTime(s: CronSchedule): string {
  const { second, minute, hour } = s
  const hasSec = s.dialect !== 'unix'
  const secZero = second.values.length === 1 && second.values[0] === 0
  const single = (f: NumField) => !f.wildcard && f.values.length === 1

  if (minute.wildcard && hour.wildcard && second.wildcard) return 'every second'
  if (minute.wildcard && hour.wildcard && secZero) return 'every minute'

  const secStep = stepOf(second.raw)
  const minStep = stepOf(minute.raw)
  if (secStep && minute.wildcard && hour.wildcard)
    return `every ${secStep} seconds`
  if (minStep && hour.wildcard && secZero) return `every ${minStep} minutes`

  if (single(minute) && single(hour) && secZero)
    return `at ${pad2(hour.values[0])}:${pad2(minute.values[0])}`
  if (hasSec && single(second) && single(minute) && single(hour))
    return `at ${pad2(hour.values[0])}:${pad2(minute.values[0])}:${pad2(second.values[0])}`

  if (hour.wildcard && !minute.wildcard && secZero)
    return `at ${joinAnd(minute.values.map(String))} minutes past every hour`

  const minPhrase = minute.wildcard
    ? 'every minute'
    : `minute ${joinAnd(minute.values.map(String))}`
  const hourPhrase = hour.wildcard
    ? 'every hour'
    : `hour ${joinAnd(hour.values.map(String))}`
  return `at ${minPhrase} of ${hourPhrase}`
}

function describeDowValues(values: Array<number>): string {
  if (values.length >= 3 && isContiguous(values))
    return `${DOW_FULL[values[0]]} through ${DOW_FULL[values[values.length - 1]]}`
  return joinAnd(values.map((v) => DOW_FULL[v]))
}

function describeDomPhrase(dom: DomMatch): string | null {
  switch (dom.kind) {
    case 'any':
      return null
    case 'values':
      return `day ${joinAnd(dom.values.map(String))} of the month`
    case 'lastDay':
      return 'the last day of the month'
    case 'lastOffset':
      return `${dom.offset} day${dom.offset === 1 ? '' : 's'} before the end of the month`
    case 'lastWeekday':
      return 'the last weekday of the month'
    case 'nearestWeekday':
      return `the weekday nearest day ${dom.day}`
  }
}

function describeDowPhrase(dow: DowMatch): string | null {
  switch (dow.kind) {
    case 'any':
      return null
    case 'values':
      return describeDowValues(dow.values)
    case 'lastDow':
      return `the last ${DOW_FULL[dow.weekday]} of the month`
    case 'nthDow':
      return `the ${ORDINALS[dow.nth] ?? `${dow.nth}th`} ${DOW_FULL[dow.weekday]} of the month`
  }
}

function describeDays(s: CronSchedule): string | null {
  const domPhrase = describeDomPhrase(s.dom)
  const dowPhrase = describeDowPhrase(s.dow)
  if (!domPhrase && !dowPhrase) return null
  if (domPhrase && dowPhrase) return `on ${domPhrase} or ${dowPhrase}`
  return `on ${(domPhrase ?? dowPhrase) as string}`
}

function describeMonth(month: NumField): string | null {
  if (month.wildcard) return null
  return `in ${joinAnd(month.values.map((m) => MONTH_FULL[m - 1]))}`
}

function describeYear(year: NumField | null): string | null {
  if (!year || year.wildcard) return null
  return `in ${joinAnd(year.values.map(String))}`
}

export function describeCron(schedule: CronSchedule): string {
  if (schedule.reboot) return 'On startup (@reboot).'
  const clauses: Array<string> = []
  const days = describeDays(schedule)
  if (days) clauses.push(days)
  const month = describeMonth(schedule.month)
  if (month) clauses.push(month)
  const year = describeYear(schedule.year)
  if (year) clauses.push(year)

  const time = describeTime(schedule)
  const lead = time.charAt(0).toUpperCase() + time.slice(1)
  return `${lead}${clauses.length ? `, ${clauses.join(', ')}` : ''}.`
}

export interface CronFieldSummary {
  name: CronFieldName
  label: string
  raw: string
  text: string
  allowed: string
}

function summarizeNum(field: NumField, unit: string): string {
  if (field.wildcard) return `every ${unit}`
  const step = stepOf(field.raw)
  if (step) return `every ${step} ${unit}s`
  return `${unit} ${joinAnd(field.values.map(String))}`
}

export function summarizeFields(
  schedule: CronSchedule,
): Array<CronFieldSummary> {
  const rows: Array<CronFieldSummary> = []
  if (schedule.dialect !== 'unix')
    rows.push({
      name: 'second',
      label: 'Second',
      raw: schedule.second.raw,
      text: summarizeNum(schedule.second, 'second'),
      allowed: '0-59',
    })
  rows.push({
    name: 'minute',
    label: 'Minute',
    raw: schedule.minute.raw,
    text: summarizeNum(schedule.minute, 'minute'),
    allowed: '0-59',
  })
  rows.push({
    name: 'hour',
    label: 'Hour',
    raw: schedule.hour.raw,
    text: summarizeNum(schedule.hour, 'hour'),
    allowed: '0-23',
  })
  rows.push({
    name: 'dom',
    label: 'Day of month',
    raw: schedule.dom.raw || '*',
    text: describeDomPhrase(schedule.dom) ?? 'every day',
    allowed: '1-31',
  })
  rows.push({
    name: 'month',
    label: 'Month',
    raw: schedule.month.raw,
    text: schedule.month.wildcard
      ? 'every month'
      : (describeMonth(schedule.month) as string),
    allowed: '1-12',
  })
  rows.push({
    name: 'dow',
    label: 'Day of week',
    raw: schedule.dow.raw || '*',
    text: describeDowPhrase(schedule.dow) ?? 'every day',
    allowed: schedule.dialect === 'quartz' ? '1-7 (SUN-SAT)' : '0-6 (SUN-SAT)',
  })
  if (schedule.year)
    rows.push({
      name: 'year',
      label: 'Year',
      raw: schedule.year.raw,
      text: schedule.year.wildcard
        ? 'every year'
        : `year ${joinAnd(schedule.year.values.map(String))}`,
      allowed: '1970-2099',
    })
  return rows
}

export interface NextRunsResult {
  runs: Array<number>
  truncated: boolean
}

const HORIZON_YEARS = 5

interface Wall {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = formatterCache.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    formatterCache.set(timeZone, fmt)
  }
  return fmt
}

function utcToWall(ms: number, timeZone: string): Wall {
  const parts = getFormatter(timeZone).formatToParts(new Date(ms))
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

function wallToSerial(w: Wall): number {
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second)
}

function serialToWall(serial: number): Wall {
  const d = new Date(serial)
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
  }
}

function offsetAt(ms: number, timeZone: string): number {
  return wallToSerial(utcToWall(ms, timeZone)) - ms
}

function wallToUtcAll(w: Wall, timeZone: string): Array<number> {
  const target = wallToSerial(w)
  const offsets = new Set<number>([
    offsetAt(target - 86_400_000, timeZone),
    offsetAt(target, timeZone),
    offsetAt(target + 86_400_000, timeZone),
  ])
  const results = new Set<number>()
  for (const off of offsets) {
    const t = target - off
    if (wallToSerial(utcToWall(t, timeZone)) === target) results.add(t)
  }
  return Array.from(results).sort((a, b) => a - b)
}

function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function isWeekend(year: number, month: number, day: number): boolean {
  const wd = weekdayOf(year, month, day)
  return wd === 0 || wd === 6
}

function lastWeekdayOfMonth(year: number, month: number): number {
  let day = lastDayOfMonth(year, month)
  while (isWeekend(year, month, day)) day--
  return day
}

function nearestWeekday(year: number, month: number, target: number): number {
  const last = lastDayOfMonth(year, month)
  let day = Math.min(target, last)
  const wd = weekdayOf(year, month, day)
  if (wd === 6) day = day - 1 >= 1 ? day - 1 : day + 2
  else if (wd === 0) day = day + 1 <= last ? day + 1 : day - 2
  return day
}

function matchDom(dom: DomMatch, w: Wall): boolean {
  switch (dom.kind) {
    case 'any':
      return true
    case 'values':
      return dom.values.includes(w.day)
    case 'lastDay':
      return w.day === lastDayOfMonth(w.year, w.month)
    case 'lastOffset':
      return w.day === lastDayOfMonth(w.year, w.month) - dom.offset
    case 'lastWeekday':
      return w.day === lastWeekdayOfMonth(w.year, w.month)
    case 'nearestWeekday':
      return w.day === nearestWeekday(w.year, w.month, dom.day)
  }
}

function matchDow(dow: DowMatch, w: Wall): boolean {
  const wd = weekdayOf(w.year, w.month, w.day)
  switch (dow.kind) {
    case 'any':
      return true
    case 'values':
      return dow.values.includes(wd)
    case 'lastDow':
      return wd === dow.weekday && w.day > lastDayOfMonth(w.year, w.month) - 7
    case 'nthDow':
      return wd === dow.weekday && Math.ceil(w.day / 7) === dow.nth
  }
}

function dayMatches(s: CronSchedule, w: Wall): boolean {
  const domRestricted = s.dom.kind !== 'any'
  const dowRestricted = s.dow.kind !== 'any'
  if (!domRestricted && !dowRestricted) return true
  if (domRestricted && dowRestricted)
    return matchDom(s.dom, w) || matchDow(s.dow, w)
  return domRestricted ? matchDom(s.dom, w) : matchDow(s.dow, w)
}

function nextAllowed(values: Array<number>, current: number): number | null {
  for (const v of values) if (v > current) return v
  return null
}

export function nextRuns(
  schedule: CronSchedule,
  fromMs: number,
  count: number,
  timeZone: string,
): NextRunsResult {
  if (schedule.reboot || count < 1) return { runs: [], truncated: false }

  const startYear = utcToWall(fromMs, timeZone).year
  const runs: Array<number> = []
  let cursor = serialToWall(wallToSerial(utcToWall(fromMs, timeZone)) + 1000)
  let guard = 0

  while (runs.length < count) {
    if (cursor.year > startYear + HORIZON_YEARS) break
    if (++guard > 4_000_000) break

    if (schedule.year && !schedule.year.values.includes(cursor.year)) {
      const ny = nextAllowed(schedule.year.values, cursor.year)
      if (ny === null) break
      cursor = { year: ny, month: 1, day: 1, hour: 0, minute: 0, second: 0 }
      continue
    }

    if (!schedule.month.values.includes(cursor.month)) {
      const nm = nextAllowed(schedule.month.values, cursor.month)
      cursor = nm
        ? { ...cursor, month: nm, day: 1, hour: 0, minute: 0, second: 0 }
        : {
            year: cursor.year + 1,
            month: schedule.month.values[0],
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
          }
      continue
    }

    if (!dayMatches(schedule, cursor)) {
      cursor = serialToWall(
        wallToSerial({ ...cursor, hour: 0, minute: 0, second: 0 }) + 86_400_000,
      )
      continue
    }

    if (!schedule.hour.values.includes(cursor.hour)) {
      const nh = nextAllowed(schedule.hour.values, cursor.hour)
      if (nh === null) {
        cursor = serialToWall(
          wallToSerial({ ...cursor, hour: 0, minute: 0, second: 0 }) +
            86_400_000,
        )
      } else {
        cursor = { ...cursor, hour: nh, minute: 0, second: 0 }
      }
      continue
    }

    if (!schedule.minute.values.includes(cursor.minute)) {
      const nmin = nextAllowed(schedule.minute.values, cursor.minute)
      if (nmin === null) {
        cursor = { ...cursor, hour: cursor.hour + 1, minute: 0, second: 0 }
        if (cursor.hour > 23)
          cursor = serialToWall(
            wallToSerial({ ...cursor, hour: 0, minute: 0, second: 0 }) +
              86_400_000,
          )
      } else {
        cursor = { ...cursor, minute: nmin, second: 0 }
      }
      continue
    }

    if (!schedule.second.values.includes(cursor.second)) {
      const nsec = nextAllowed(schedule.second.values, cursor.second)
      if (nsec === null) {
        cursor = serialToWall(wallToSerial({ ...cursor, second: 0 }) + 60_000)
      } else {
        cursor = { ...cursor, second: nsec }
      }
      continue
    }

    for (const ms of wallToUtcAll(cursor, timeZone)) {
      if (ms > fromMs && !runs.includes(ms)) runs.push(ms)
      if (runs.length >= count) break
    }
    cursor = serialToWall(wallToSerial(cursor) + 1000)
  }

  runs.sort((a, b) => a - b)
  return { runs: runs.slice(0, count), truncated: runs.length < count }
}

export type BuilderState =
  | { mode: 'everyMinute' }
  | { mode: 'everyNMinutes'; n: number }
  | { mode: 'everyHour' }
  | { mode: 'dailyAt'; hour: number; minute: number }
  | { mode: 'weeklyAt'; weekday: number; hour: number; minute: number }
  | { mode: 'monthlyAt'; day: number; hour: number; minute: number }
  | { mode: 'lastDayAt'; hour: number; minute: number }
  | { mode: 'lastWeekdayAt'; hour: number; minute: number }
  | { mode: 'nearestWeekdayAt'; day: number; hour: number; minute: number }
  | { mode: 'lastDowAt'; weekday: number; hour: number; minute: number }
  | {
      mode: 'nthDowAt'
      weekday: number
      nth: number
      hour: number
      minute: number
    }
  | {
      mode: 'custom'
      second?: string
      minute: string
      hour: string
      dom: string
      month: string
      dow: string
    }

export function detectPreset(schedule: CronSchedule): BuilderState {
  const { second, minute, hour, dom, month, dow, dialect } = schedule
  const single = (f: NumField) => !f.wildcard && f.values.length === 1
  const secOk = dialect === 'unix' || (single(second) && second.values[0] === 0)
  const domAny = dom.kind === 'any'
  const dowAny = dow.kind === 'any'
  const base = secOk && month.wildcard && !schedule.year && !schedule.reboot

  if (base && minute.wildcard && hour.wildcard && domAny && dowAny)
    return { mode: 'everyMinute' }

  const minStep = stepOf(minute.raw)
  if (base && minStep && hour.wildcard && domAny && dowAny)
    return { mode: 'everyNMinutes', n: minStep }

  if (
    base &&
    single(minute) &&
    minute.values[0] === 0 &&
    hour.wildcard &&
    domAny &&
    dowAny
  )
    return { mode: 'everyHour' }

  const timed = base && single(minute) && single(hour)
  if (timed) {
    const h = hour.values[0]
    const m = minute.values[0]
    if (dom.kind === 'lastDay' && dowAny)
      return { mode: 'lastDayAt', hour: h, minute: m }
    if (dom.kind === 'lastWeekday' && dowAny)
      return { mode: 'lastWeekdayAt', hour: h, minute: m }
    if (dom.kind === 'nearestWeekday' && dowAny)
      return { mode: 'nearestWeekdayAt', day: dom.day, hour: h, minute: m }
    if (dow.kind === 'lastDow' && domAny)
      return { mode: 'lastDowAt', weekday: dow.weekday, hour: h, minute: m }
    if (dow.kind === 'nthDow' && domAny)
      return {
        mode: 'nthDowAt',
        weekday: dow.weekday,
        nth: dow.nth,
        hour: h,
        minute: m,
      }
    if (domAny && dow.kind === 'values' && dow.values.length === 1)
      return { mode: 'weeklyAt', weekday: dow.values[0], hour: h, minute: m }
    if (dom.kind === 'values' && dom.values.length === 1 && dowAny)
      return { mode: 'monthlyAt', day: dom.values[0], hour: h, minute: m }
    if (domAny && dowAny) return { mode: 'dailyAt', hour: h, minute: m }
  }

  const custom: BuilderState = {
    mode: 'custom',
    minute: minute.raw,
    hour: hour.raw,
    dom: dom.raw || '*',
    month: month.raw,
    dow: dow.raw || '*',
  }
  if (dialect !== 'unix') custom.second = second.raw || '0'
  return custom
}

function dowToken(weekday: number, dialect: CronDialect): string {
  return dialect === 'quartz' ? String(weekday + 1) : String(weekday)
}

function assemble(
  dialect: CronDialect,
  f: {
    second?: string
    minute: string
    hour: string
    dom: string
    month: string
    dow: string
  },
): string {
  const fields =
    dialect === 'unix'
      ? [f.minute, f.hour, f.dom, f.month, f.dow]
      : [f.second ?? '0', f.minute, f.hour, f.dom, f.month, f.dow]
  return fields.join(' ')
}

export function buildExpression(
  state: BuilderState,
  dialect: CronDialect,
): string {
  const anyDow = dialect === 'quartz' ? '?' : '*'
  const anyDom = '*'
  switch (state.mode) {
    case 'everyMinute':
      return assemble(dialect, {
        minute: '*',
        hour: '*',
        dom: anyDom,
        month: '*',
        dow: anyDow,
      })
    case 'everyNMinutes':
      return assemble(dialect, {
        minute: `*/${state.n}`,
        hour: '*',
        dom: anyDom,
        month: '*',
        dow: anyDow,
      })
    case 'everyHour':
      return assemble(dialect, {
        minute: '0',
        hour: '*',
        dom: anyDom,
        month: '*',
        dow: anyDow,
      })
    case 'dailyAt':
      return assemble(dialect, {
        minute: String(state.minute),
        hour: String(state.hour),
        dom: anyDom,
        month: '*',
        dow: anyDow,
      })
    case 'weeklyAt':
      return assemble(dialect, {
        minute: String(state.minute),
        hour: String(state.hour),
        dom: dialect === 'quartz' ? '?' : '*',
        month: '*',
        dow: dowToken(state.weekday, dialect),
      })
    case 'monthlyAt':
      return assemble(dialect, {
        minute: String(state.minute),
        hour: String(state.hour),
        dom: String(state.day),
        month: '*',
        dow: anyDow,
      })
    case 'lastDayAt':
      return assemble('quartz', {
        minute: String(state.minute),
        hour: String(state.hour),
        dom: 'L',
        month: '*',
        dow: '?',
      })
    case 'lastWeekdayAt':
      return assemble('quartz', {
        minute: String(state.minute),
        hour: String(state.hour),
        dom: 'LW',
        month: '*',
        dow: '?',
      })
    case 'nearestWeekdayAt':
      return assemble('quartz', {
        minute: String(state.minute),
        hour: String(state.hour),
        dom: `${state.day}W`,
        month: '*',
        dow: '?',
      })
    case 'lastDowAt':
      return assemble('quartz', {
        minute: String(state.minute),
        hour: String(state.hour),
        dom: '?',
        month: '*',
        dow: `${state.weekday + 1}L`,
      })
    case 'nthDowAt':
      return assemble('quartz', {
        minute: String(state.minute),
        hour: String(state.hour),
        dom: '?',
        month: '*',
        dow: `${state.weekday + 1}#${state.nth}`,
      })
    case 'custom':
      return assemble(dialect, {
        second: state.second,
        minute: state.minute,
        hour: state.hour,
        dom: state.dom,
        month: state.month,
        dow: state.dow,
      })
  }
}

function serializeDowValues(
  values: Array<number>,
  target: CronDialect,
): string {
  const mapped = values
    .map((v) => (target === 'quartz' ? v + 1 : v))
    .sort((a, b) => a - b)
  let contiguous = true
  for (let i = 1; i < mapped.length; i++)
    if (mapped[i] !== mapped[i - 1] + 1) {
      contiguous = false
      break
    }
  if (contiguous && mapped.length >= 3)
    return `${mapped[0]}-${mapped[mapped.length - 1]}`
  return mapped.join(',')
}

const DOM_QUARTZ_KINDS = [
  'lastDay',
  'lastOffset',
  'lastWeekday',
  'nearestWeekday',
]
const DOW_QUARTZ_KINDS = ['lastDow', 'nthDow']

// Re-emit a parsed schedule as a valid expression in `target` dialect.
// Returns null when the schedule uses constructs the target cannot express
// (Quartz L/W/# tokens or @reboot when leaving Quartz).
export function serializeSchedule(
  schedule: CronSchedule,
  target: CronDialect,
): string | null {
  if (schedule.reboot) return null
  if (
    target !== 'quartz' &&
    (DOM_QUARTZ_KINDS.includes(schedule.dom.kind) ||
      DOW_QUARTZ_KINDS.includes(schedule.dow.kind))
  )
    return null

  const domRestricted = schedule.dom.kind !== 'any'
  const dowRestricted = schedule.dow.kind !== 'any'

  let domStr = domRestricted ? schedule.dom.raw : '*'
  let dowStr =
    schedule.dow.kind === 'values'
      ? serializeDowValues(schedule.dow.values, target)
      : dowRestricted
        ? schedule.dow.raw
        : '*'

  if (target === 'quartz') {
    if (domRestricted && !dowRestricted) dowStr = '?'
    else if (!domRestricted && dowRestricted) domStr = '?'
    else if (!domRestricted && !dowRestricted) {
      domStr = '*'
      dowStr = '?'
    }
  }

  const minute = schedule.minute.raw
  const hour = schedule.hour.raw
  const month = schedule.month.raw
  if (target === 'unix') return `${minute} ${hour} ${domStr} ${month} ${dowStr}`

  const sec = schedule.second.raw !== '' ? schedule.second.raw : '0'
  const fields = [sec, minute, hour, domStr, month, dowStr]
  if (target === 'quartz' && schedule.year) fields.push(schedule.year.raw)
  return fields.join(' ')
}
