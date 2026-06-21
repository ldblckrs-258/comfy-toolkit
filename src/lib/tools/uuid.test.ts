import { describe, expect, it } from 'vitest'
import {
  decomposeUuidV7,
  extractTimestampMs,
  generateUuids,
  uuidV4,
  uuidV7,
  uuidV7At,
} from './uuid'

const V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('uuid', () => {
  it('generates a v4 UUID with the correct version and variant nibbles', () => {
    expect(uuidV4()).toMatch(V4)
  })

  it('generates a v7 UUID with the correct version and variant nibbles', () => {
    expect(uuidV7()).toMatch(V7)
  })

  it('orders v7 UUIDs by their embedded timestamp', () => {
    const first = uuidV7()
    const second = uuidV7()
    expect(first.slice(0, 13) <= second.slice(0, 13)).toBe(true)
  })
})

describe('generateUuids', () => {
  it('returns the requested count of unique values', () => {
    const list = generateUuids('v4', 10)
    expect(list).toHaveLength(10)
    expect(new Set(list).size).toBe(10)
  })

  it('clamps the count to the 1..1000 range', () => {
    expect(generateUuids('v4', 0)).toHaveLength(1)
    expect(generateUuids('v4', 5000)).toHaveLength(1000)
  })
})

describe('decomposeUuidV7', () => {
  const SAMPLE = '019ee6e6-ae66-71e5-8ca1-4dad13b72378'

  it('splits the v7 fields by their bit layout', () => {
    const parts = decomposeUuidV7(SAMPLE)
    expect(parts).not.toBeNull()
    const fields = parts!.fields
    expect(fields[0]).toMatchObject({ key: 'timestamp', hex: '019ee6e6ae66' })
    expect(fields[1]).toMatchObject({ key: 'version', hex: '7' })
    expect(fields[2]).toMatchObject({ key: 'randA', hex: '1e5' })
    expect(fields[3]).toMatchObject({ key: 'variant', hex: '2', binary: '10' })
    expect(fields[4]).toMatchObject({ key: 'randB', hex: 'ca14dad13b72378' })
  })

  it('returns null for malformed input', () => {
    expect(decomposeUuidV7('not-a-uuid')).toBeNull()
  })
})

describe('timestamp embedding', () => {
  it('round-trips an embedded millisecond timestamp', () => {
    const ms = 1_700_000_000_000
    expect(extractTimestampMs(uuidV7At(ms))).toBe(ms)
  })
})
