export type CharClass =
  | 'lowercase'
  | 'uppercase'
  | 'digits'
  | 'dash'
  | 'special'

export type EncodeFormat = 'hex' | 'base64' | 'base64url'

export interface CharsetOptions {
  length: number
  classes: Record<CharClass, boolean>
  special: string
  excludeAmbiguous: boolean
  guaranteeEachClass: boolean
  prefix: string
  suffix: string
  count: number
}

export interface ByteOptions {
  bytes: number
  format: EncodeFormat
  prefix: string
  suffix: string
  count: number
}

export interface PoolResult {
  pool: string
  classPools: Partial<Record<CharClass, string>>
}

export interface StrengthInfo {
  label: 'Weak' | 'Fine' | 'Strong' | 'Excellent'
  bits: number
}

const BASE_POOLS: Record<CharClass, string> = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  dash: '-',
  special: '!@#$%^&*_=+?',
}

const CLASS_ORDER: Array<CharClass> = [
  'lowercase',
  'uppercase',
  'digits',
  'dash',
  'special',
]

const AMBIGUOUS = new Set('O0oIl1')

export const MAX_LENGTH = 256
export const MAX_BYTES = 256
export const MAX_COUNT = 100

export function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('randomInt requires a positive integer bound')
  }
  if (maxExclusive === 1) return 0
  const range = 0x1_0000_0000
  const limit = Math.floor(range / maxExclusive) * maxExclusive
  const buffer = new Uint32Array(1)
  for (;;) {
    crypto.getRandomValues(buffer)
    if (buffer[0] < limit) return buffer[0] % maxExclusive
  }
}

function pick(pool: string): string {
  return pool[randomInt(pool.length)]
}

function shuffle<T>(items: Array<T>): Array<T> {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    const tmp = items[i]
    items[i] = items[j]
    items[j] = tmp
  }
  return items
}

function dedupe(value: string): string {
  return Array.from(new Set(value)).join('')
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(Math.floor(value), max))
}

export function buildCharPool(options: CharsetOptions): PoolResult {
  const classPools: Partial<Record<CharClass, string>> = {}
  for (const cls of CLASS_ORDER) {
    if (!options.classes[cls]) continue
    const source =
      cls === 'special'
        ? options.special.trim() || BASE_POOLS.special
        : BASE_POOLS[cls]
    let chars = dedupe(source)
    if (options.excludeAmbiguous) {
      chars = Array.from(chars)
        .filter((char) => !AMBIGUOUS.has(char))
        .join('')
    }
    if (chars.length === 0) continue
    classPools[cls] = chars
  }
  const pool = dedupe(Object.values(classPools).join(''))
  return { pool, classPools }
}

export function generateSecrets(options: CharsetOptions): Array<string> {
  const totalLength = clamp(options.length, 1, MAX_LENGTH)
  const count = clamp(options.count, 1, MAX_COUNT)
  const { pool, classPools } = buildCharPool(options)
  if (pool === '') throw new Error('Select at least one character set.')

  const coreLength = totalLength - options.prefix.length - options.suffix.length
  if (coreLength < 1) {
    throw new Error('Prefix and suffix are longer than the total length.')
  }

  const active = CLASS_ORDER.map((cls) => classPools[cls]).filter(
    (cp): cp is string => Boolean(cp),
  )
  if (options.guaranteeEachClass && coreLength < active.length) {
    throw new Error(
      'Total length is too short for one of each selected character set.',
    )
  }

  const make = (): string => {
    let core: string
    if (options.guaranteeEachClass) {
      const chars = active.map((cp) => pick(cp))
      for (let i = chars.length; i < coreLength; i++) chars.push(pick(pool))
      core = shuffle(chars).join('')
    } else {
      let value = ''
      for (let i = 0; i < coreLength; i++) value += pick(pool)
      core = value
    }
    return options.prefix + core + options.suffix
  }

  return Array.from({ length: count }, make)
}

function encodeBytes(bytes: Uint8Array, format: EncodeFormat): string {
  if (format === 'hex') {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
      '',
    )
  }
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const base64 = btoa(binary)
  if (format === 'base64') return base64
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function generateBytesSecrets(options: ByteOptions): Array<string> {
  const bytes = clamp(options.bytes, 1, MAX_BYTES)
  const count = clamp(options.count, 1, MAX_COUNT)

  const make = (): string => {
    const buffer = new Uint8Array(bytes)
    crypto.getRandomValues(buffer)
    return options.prefix + encodeBytes(buffer, options.format) + options.suffix
  }

  return Array.from({ length: count }, make)
}

export function charsetEntropyBits(poolSize: number, length: number): number {
  if (poolSize < 2 || !Number.isFinite(length) || length <= 0) return 0
  return length * Math.log2(poolSize)
}

export function byteEntropyBits(bytes: number): number {
  return bytes * 8
}

export function entropyStrength(bits: number): StrengthInfo {
  let label: StrengthInfo['label']
  if (bits < 64) label = 'Weak'
  else if (bits < 96) label = 'Fine'
  else if (bits < 128) label = 'Strong'
  else label = 'Excellent'
  return { label, bits }
}
