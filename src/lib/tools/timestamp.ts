import { describeClaim, decodeJwt, TIMESTAMP_CLAIMS } from './jwt'
import { extractTimestampMs } from './uuid'

export type EpochUnit = 's' | 'ms' | 'us' | 'ns'

export interface ParsedEpoch {
  ms: number
  unit: EpochUnit
}

function detectUnit(abs: number): EpochUnit {
  if (abs < 1e11) return 's'
  if (abs < 1e14) return 'ms'
  if (abs < 1e17) return 'us'
  return 'ns'
}

function toMs(n: number, unit: EpochUnit, trimmed: string): number {
  switch (unit) {
    case 's':
      return n * 1000
    case 'ms':
      return n
    // us/ns can exceed Number.MAX_SAFE_INTEGER; divide as BigInt to keep the ms bucket exact.
    case 'us':
      return Number(BigInt(trimmed) / 1000n)
    case 'ns':
      return Number(BigInt(trimmed) / 1_000_000n)
  }
}

export function parseEpoch(
  raw: string,
  unit: EpochUnit | 'auto' = 'auto',
): ParsedEpoch | null {
  const trimmed = raw.trim()
  if (!/^-?\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return null
  const resolved = unit === 'auto' ? detectUnit(Math.abs(n)) : unit
  return { ms: toMs(n, resolved, trimmed), unit: resolved }
}

export interface Wall {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = partsFormatterCache.get(timeZone)
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
    partsFormatterCache.set(timeZone, fmt)
  }
  return fmt
}

export function utcToWall(ms: number, timeZone: string): Wall {
  const parts = getPartsFormatter(timeZone).formatToParts(new Date(ms))
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

export function offsetAt(ms: number, timeZone: string): number {
  return wallToSerial(utcToWall(ms, timeZone)) - ms
}

function wallToUtcCandidates(w: Wall, timeZone: string): Array<number> {
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

function resolveWallToUtc(w: Wall, timeZone: string): number {
  const candidates = wallToUtcCandidates(w, timeZone)
  if (candidates.length > 0) return candidates[0]
  const target = wallToSerial(w)
  const offBefore = offsetAt(target - 86_400_000, timeZone)
  return target - offBefore
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
const EXPLICIT_OFFSET_RE = /(?:[zZ]|[+-]\d{2}:?\d{2})$/

export function parseDate(raw: string, timeZone: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (EXPLICIT_OFFSET_RE.test(trimmed)) {
    const t = Date.parse(trimmed)
    return Number.isNaN(t) ? null : t
  }

  const m = DATE_RE.exec(trimmed)
  if (!m) return null
  const [, y, mo, d, h, mi, s] = m
  const wall: Wall = {
    year: Number(y),
    month: Number(mo),
    day: Number(d),
    hour: h ? Number(h) : 0,
    minute: mi ? Number(mi) : 0,
    second: s ? Number(s) : 0,
  }
  if (
    wall.month < 1 ||
    wall.month > 12 ||
    wall.day < 1 ||
    wall.day > 31 ||
    wall.hour > 23 ||
    wall.minute > 59 ||
    wall.second > 59
  ) {
    return null
  }
  return resolveWallToUtc(wall, timeZone)
}

export interface FormattedInstant {
  iso: string
  isoLocal: string
  rfc2822: string
  locale: string
  dateOnly: string
  timeOnly: string
  unixS: number
  unixMs: number
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatOffset(offsetMs: number): string {
  const rounded = Math.round(offsetMs / 60_000) * 60_000
  const sign = rounded < 0 ? '-' : '+'
  const abs = Math.abs(rounded)
  const hours = Math.floor(abs / 3_600_000)
  const minutes = Math.floor((abs % 3_600_000) / 60_000)
  return `${sign}${pad(hours)}:${pad(minutes)}`
}

const localeFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getLocaleFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = localeFormatterCache.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      dateStyle: 'medium',
      timeStyle: 'long',
    })
    localeFormatterCache.set(timeZone, fmt)
  }
  return fmt
}

export function formatInstant(ms: number, timeZone: string): FormattedInstant {
  const date = new Date(ms)
  const wall = utcToWall(ms, timeZone)
  const dateOnly = `${String(wall.year).padStart(4, '0')}-${pad(wall.month)}-${pad(wall.day)}`
  const timeOnly = `${pad(wall.hour)}:${pad(wall.minute)}:${pad(wall.second)}`
  const offset = formatOffset(offsetAt(ms, timeZone))
  return {
    iso: date.toISOString(),
    isoLocal: `${dateOnly}T${timeOnly}${offset}`,
    rfc2822: date.toUTCString(),
    locale: getLocaleFormatter(timeZone).format(date),
    dateOnly,
    timeOnly,
    unixS: Math.floor(ms / 1000),
    unixMs: ms,
  }
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
]

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function relativeTime(ms: number, nowMs: number): string {
  const diffSec = (ms - nowMs) / 1000
  const abs = Math.abs(diffSec)
  for (const [unit, threshold] of RELATIVE_UNITS) {
    if (abs >= threshold || unit === 'second') {
      return relativeFormatter.format(Math.round(diffSec / threshold), unit)
    }
  }
  return relativeFormatter.format(0, 'second')
}

const FALLBACK_TIME_ZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
]

export function listTimeZones(): Array<string> {
  const intl = Intl as unknown as {
    supportedValuesOf?: (key: string) => Array<string>
  }
  let zones: Array<string>
  try {
    zones = intl.supportedValuesOf?.('timeZone') ?? FALLBACK_TIME_ZONES
  } catch {
    zones = FALLBACK_TIME_ZONES
  }
  return Array.from(new Set<string>(['UTC', ...zones])).sort()
}

export type IdFormat = 'uuidv7' | 'ulid' | 'objectid' | 'snowflake' | 'jwt'

export interface ExtractedTimestamp {
  format: IdFormat
  label: string
  timestampMs: number
  note?: string
}

const UUIDV7_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/i
const OBJECTID_RE = /^[0-9a-f]{24}$/i
const SNOWFLAKE_RE = /^\d{15,20}$/
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

const SNOWFLAKE_EPOCHS: Array<{ label: string; epoch: number }> = [
  { label: 'Snowflake (Discord)', epoch: 1420070400000 },
  { label: 'Snowflake (Twitter/X)', epoch: 1288834974657 },
  { label: 'Snowflake (raw / no epoch)', epoch: 0 },
]

function ulidTimestampMs(ulid: string): number {
  let ms = 0
  for (const ch of ulid.slice(0, 10).toUpperCase()) {
    ms = ms * 32 + CROCKFORD.indexOf(ch)
  }
  return ms
}

function extractJwt(token: string): Array<ExtractedTimestamp> {
  let payload: unknown
  try {
    payload = decodeJwt(token).payload
  } catch {
    return []
  }
  if (!payload || typeof payload !== 'object') return []
  const record = payload as Record<string, unknown>
  const out: Array<ExtractedTimestamp> = []
  for (const claim of TIMESTAMP_CLAIMS) {
    const value = record[claim]
    if (typeof value === 'number' && Number.isFinite(value)) {
      out.push({
        format: 'jwt',
        label: `JWT (${claim})`,
        timestampMs: value * 1000,
        note: describeClaim(claim),
      })
    }
  }
  return out
}

export function extractFromId(raw: string): Array<ExtractedTimestamp> {
  const input = raw.trim()
  if (!input) return []

  if (JWT_RE.test(input)) return extractJwt(input)

  if (UUIDV7_RE.test(input)) {
    const ms = extractTimestampMs(input)
    return ms === null
      ? []
      : [{ format: 'uuidv7', label: 'UUIDv7', timestampMs: ms }]
  }

  if (ULID_RE.test(input)) {
    return [
      { format: 'ulid', label: 'ULID', timestampMs: ulidTimestampMs(input) },
    ]
  }

  if (OBJECTID_RE.test(input)) {
    return [
      {
        format: 'objectid',
        label: 'MongoDB ObjectId',
        timestampMs: parseInt(input.slice(0, 8), 16) * 1000,
      },
    ]
  }

  if (SNOWFLAKE_RE.test(input)) {
    const ms = Number(BigInt(input) >> 22n)
    return SNOWFLAKE_EPOCHS.map(({ label, epoch }) => ({
      format: 'snowflake' as const,
      label,
      timestampMs: ms + epoch,
    }))
  }

  return []
}

export interface BatchRow {
  input: string
  ms: number | null
  iso: string | null
  relative: string | null
  error?: string
}

const MAX_BATCH_ROWS = 1000

export function convertBatch(
  text: string,
  timeZone: string,
  nowMs: number,
): Array<BatchRow> {
  const rows: Array<BatchRow> = []
  let processed = 0
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    if (processed >= MAX_BATCH_ROWS) {
      rows.push({
        input: '',
        ms: null,
        iso: null,
        relative: null,
        error: `Truncated — only the first ${MAX_BATCH_ROWS} entries are shown.`,
      })
      break
    }
    processed += 1
    const epoch = parseEpoch(line, 'auto')
    const ms = epoch ? epoch.ms : parseDate(line, timeZone)
    if (ms === null) {
      rows.push({
        input: line,
        ms: null,
        iso: null,
        relative: null,
        error: 'Unrecognized timestamp or date',
      })
      continue
    }
    rows.push({
      input: line,
      ms,
      iso: formatInstant(ms, timeZone).iso,
      relative: relativeTime(ms, nowMs),
    })
  }
  return rows
}

export interface Duration {
  ms: number
  abs: number
  days: number
  hours: number
  minutes: number
  seconds: number
  human: string
}

export function durationBetween(aMs: number, bMs: number): Duration {
  const ms = bMs - aMs
  const abs = Math.abs(ms)
  let rest = Math.floor(abs / 1000)
  const days = Math.floor(rest / 86_400)
  rest %= 86_400
  const hours = Math.floor(rest / 3_600)
  rest %= 3_600
  const minutes = Math.floor(rest / 60)
  const seconds = rest % 60
  const parts: Array<string> = []
  const push = (value: number, unit: string) => {
    if (value > 0) parts.push(`${value} ${unit}${value === 1 ? '' : 's'}`)
  }
  push(days, 'day')
  push(hours, 'hour')
  push(minutes, 'minute')
  push(seconds, 'second')
  return {
    ms,
    abs,
    days,
    hours,
    minutes,
    seconds,
    human: parts.length > 0 ? parts.join(', ') : '0 seconds',
  }
}

const weekdayFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getWeekdayFormatter(
  timeZone: string,
  long: boolean,
): Intl.DateTimeFormat {
  const key = `${timeZone}:${long ? 'long' : 'short'}`
  let fmt = weekdayFormatterCache.get(key)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: long ? 'long' : 'short',
    })
    weekdayFormatterCache.set(key, fmt)
  }
  return fmt
}

const TOKEN_RE =
  /\[([^\]]*)\]|YYYY|YY|MM|M|DD|D|HH|H|mm|m|SSS|ss|s|dddd|ddd|A|a|Z/g

export function formatTokens(
  ms: number,
  pattern: string,
  timeZone: string,
): string {
  const wall = utcToWall(ms, timeZone)
  const date = new Date(ms)
  const millis = ((ms % 1000) + 1000) % 1000
  return pattern.replace(TOKEN_RE, (match, literal) => {
    if (literal !== undefined) return literal
    switch (match) {
      case 'YYYY':
        return String(wall.year).padStart(4, '0')
      case 'YY':
        return pad(wall.year % 100)
      case 'MM':
        return pad(wall.month)
      case 'M':
        return String(wall.month)
      case 'DD':
        return pad(wall.day)
      case 'D':
        return String(wall.day)
      case 'HH':
        return pad(wall.hour)
      case 'H':
        return String(wall.hour)
      case 'mm':
        return pad(wall.minute)
      case 'm':
        return String(wall.minute)
      case 'ss':
        return pad(wall.second)
      case 's':
        return String(wall.second)
      case 'SSS':
        return String(millis).padStart(3, '0')
      case 'A':
        return wall.hour < 12 ? 'AM' : 'PM'
      case 'a':
        return wall.hour < 12 ? 'am' : 'pm'
      case 'Z':
        return formatOffset(offsetAt(ms, timeZone))
      case 'dddd':
        return getWeekdayFormatter(timeZone, true).format(date)
      case 'ddd':
        return getWeekdayFormatter(timeZone, false).format(date)
      default:
        return match
    }
  })
}
