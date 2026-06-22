import { describe, expect, it } from 'vitest'
import { HASH_ALGORITHMS, hashAll, matchAlgorithm, normalizeHash } from './hash'

const ABC = new TextEncoder().encode('abc').buffer

describe('hashAll', () => {
  it('matches published hex vectors for the empty string', async () => {
    const out = await hashAll('', 'hex')
    expect(out.MD5).toBe('d41d8cd98f00b204e9800998ecf8427e')
    expect(out['SHA-256']).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })

  it('matches published hex vectors for "abc" across all five algorithms', async () => {
    const out = await hashAll('abc', 'hex')
    expect(out.MD5).toBe('900150983cd24fb0d6963f7d28e17f72')
    expect(out['SHA-1']).toBe('a9993e364706816aba3e25717850c26c9cd0d89d')
    expect(out['SHA-256']).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
    expect(out['SHA-384']).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    )
    expect(out['SHA-512']).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    )
  })

  it('returns one digest per registered algorithm', async () => {
    const out = await hashAll('abc', 'hex')
    expect(Object.keys(out).sort()).toEqual([...HASH_ALGORITHMS].sort())
  })

  it('produces base64 that decodes to the same bytes as hex', async () => {
    const hex = await hashAll('', 'hex')
    const b64 = await hashAll('', 'base64')
    expect(b64['SHA-256']).toBe('47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=')
    expect(Buffer.from(b64.MD5, 'base64').toString('hex')).toBe(hex.MD5)
    expect(Buffer.from(b64['SHA-512'], 'base64').toString('hex')).toBe(
      hex['SHA-512'],
    )
  })

  it('hashes an ArrayBuffer identically to the equivalent string (file path == text path)', async () => {
    const fromBuffer = await hashAll(ABC, 'hex')
    const fromString = await hashAll('abc', 'hex')
    expect(fromBuffer).toEqual(fromString)
  })
})

describe('normalizeHash', () => {
  it('strips whitespace and lowercases hex so pasted checksums compare', () => {
    expect(normalizeHash('  A9993E36 4706816A ', 'hex')).toBe(
      'a9993e364706816a',
    )
  })

  it('strips whitespace but preserves case for base64 (case-significant)', () => {
    expect(normalizeHash(' 47DEQ pj8 ', 'base64')).toBe('47DEQpj8')
  })
})

describe('matchAlgorithm', () => {
  it('identifies which algorithm a pasted hash belongs to, ignoring hex case', async () => {
    const digests = await hashAll('abc', 'hex')
    expect(
      matchAlgorithm(
        digests,
        'BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD',
        'hex',
      ),
    ).toBe('SHA-256')
  })

  it('returns null when no algorithm matches', async () => {
    const digests = await hashAll('abc', 'hex')
    expect(matchAlgorithm(digests, 'deadbeef', 'hex')).toBeNull()
  })

  it('returns null for empty/whitespace input', async () => {
    const digests = await hashAll('abc', 'hex')
    expect(matchAlgorithm(digests, '   ', 'hex')).toBeNull()
  })
})
