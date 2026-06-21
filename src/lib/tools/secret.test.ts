import { describe, expect, it } from 'vitest'
import type { CharClass } from './secret'
import {
  buildCharPool,
  byteEntropyBits,
  charsetEntropyBits,
  entropyStrength,
  generateBytesSecrets,
  generateSecrets,
  randomInt,
} from './secret'

const ALL_CLASSES: Record<CharClass, boolean> = {
  lowercase: true,
  uppercase: true,
  digits: true,
  dash: true,
  special: true,
}

function classes(
  overrides: Partial<Record<CharClass, boolean>>,
): Record<CharClass, boolean> {
  return {
    lowercase: false,
    uppercase: false,
    digits: false,
    dash: false,
    special: false,
    ...overrides,
  }
}

function charsetOptions(over: Partial<Parameters<typeof generateSecrets>[0]>) {
  return {
    length: 16,
    classes: classes({ lowercase: true }),
    special: '!@#$%^&*_=+?',
    excludeAmbiguous: false,
    guaranteeEachClass: false,
    prefix: '',
    suffix: '',
    count: 1,
    ...over,
  }
}

describe('randomInt', () => {
  it('stays within [0, max) across many draws', () => {
    for (let i = 0; i < 5000; i++) {
      const r = randomInt(10)
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThan(10)
    }
  })

  it('returns 0 when max is 1', () => {
    expect(randomInt(1)).toBe(0)
  })

  it('throws when max is not positive', () => {
    expect(() => randomInt(0)).toThrow()
  })

  it('covers the whole range (no obviously truncated ceiling)', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 2000; i++) seen.add(randomInt(6))
    expect(seen).toEqual(new Set([0, 1, 2, 3, 4, 5]))
  })
})

describe('buildCharPool', () => {
  it('dedupes characters across overlapping classes and special set', () => {
    const { pool } = buildCharPool(
      charsetOptions({
        classes: classes({ lowercase: true, dash: true, special: true }),
        special: '-abc',
      }),
    )
    expect(new Set(pool).size).toBe(pool.length)
    expect(pool).toContain('-')
  })

  it('strips ambiguous characters only when excludeAmbiguous is on', () => {
    const on = buildCharPool(
      charsetOptions({ classes: ALL_CLASSES, excludeAmbiguous: true }),
    ).pool
    for (const ch of 'O0oIl1') expect(on).not.toContain(ch)

    const off = buildCharPool(
      charsetOptions({ classes: ALL_CLASSES, excludeAmbiguous: false }),
    ).pool
    expect(off).toContain('0')
    expect(off).toContain('O')
  })
})

describe('generateSecrets (charset)', () => {
  it('counts prefix and suffix toward the total length', () => {
    const [secret] = generateSecrets(
      charsetOptions({ length: 20, prefix: 'sk_', suffix: '_v1' }),
    )
    expect(secret).toHaveLength(20)
    expect(secret.startsWith('sk_')).toBe(true)
    expect(secret.endsWith('_v1')).toBe(true)
    expect(secret.slice(3, secret.length - 3)).toHaveLength(14)
  })

  it('throws when prefix and suffix exceed the total length', () => {
    expect(() =>
      generateSecrets(
        charsetOptions({ length: 4, prefix: 'sk_', suffix: '_end' }),
      ),
    ).toThrow(/longer than the total length/i)
  })

  it('returns the requested count', () => {
    expect(generateSecrets(charsetOptions({ count: 5 }))).toHaveLength(5)
  })

  it('clamps length and count to safe bounds', () => {
    expect(generateSecrets(charsetOptions({ length: 0 }))[0]).toHaveLength(1)
    expect(generateSecrets(charsetOptions({ length: 5000 }))[0]).toHaveLength(
      256,
    )
    expect(generateSecrets(charsetOptions({ count: 0 }))).toHaveLength(1)
    expect(generateSecrets(charsetOptions({ count: 999 }))).toHaveLength(100)
  })

  it('guarantees at least one char from each selected class', () => {
    const opts = charsetOptions({
      length: 12,
      classes: classes({ lowercase: true, uppercase: true, digits: true }),
      guaranteeEachClass: true,
      count: 50,
    })
    for (const secret of generateSecrets(opts)) {
      expect(secret).toMatch(/[a-z]/)
      expect(secret).toMatch(/[A-Z]/)
      expect(secret).toMatch(/[0-9]/)
    }
  })

  it('throws when the core length is below the number of selected classes', () => {
    expect(() =>
      generateSecrets(
        charsetOptions({
          length: 2,
          classes: classes({ lowercase: true, uppercase: true, digits: true }),
          guaranteeEachClass: true,
        }),
      ),
    ).toThrow(/too short for one of each/i)
  })

  it('throws when no character set is selected', () => {
    expect(() => generateSecrets(charsetOptions({ classes: classes({}) }))).toThrow(
      /at least one/i,
    )
  })
})

describe('generateBytesSecrets', () => {
  it('encodes hex with two chars per byte', () => {
    const [hex] = generateBytesSecrets({
      bytes: 16,
      format: 'hex',
      prefix: '',
      suffix: '',
      count: 1,
    })
    expect(hex).toMatch(/^[0-9a-f]{32}$/)
  })

  it('produces url-safe base64 without padding or +/', () => {
    const [url] = generateBytesSecrets({
      bytes: 24,
      format: 'base64url',
      prefix: '',
      suffix: '',
      count: 1,
    })
    expect(url).not.toMatch(/[+/=]/)
  })

  it('round-trips base64 back to the requested byte length', () => {
    const [b64] = generateBytesSecrets({
      bytes: 16,
      format: 'base64',
      prefix: '',
      suffix: '',
      count: 1,
    })
    expect(atob(b64)).toHaveLength(16)
  })

  it('clamps count to safe bounds', () => {
    const base = { bytes: 8, format: 'hex' as const, prefix: '', suffix: '' }
    expect(generateBytesSecrets({ ...base, count: 0 })).toHaveLength(1)
    expect(generateBytesSecrets({ ...base, count: 999 })).toHaveLength(100)
  })
})

describe('entropy', () => {
  it('computes charset entropy as length * log2(poolSize)', () => {
    expect(charsetEntropyBits(62, 16)).toBeCloseTo(95.27, 1)
  })

  it('computes byte entropy as bytes * 8', () => {
    expect(byteEntropyBits(16)).toBe(128)
  })

  it('returns 0 for non-finite or non-positive charset length', () => {
    expect(charsetEntropyBits(62, NaN)).toBe(0)
    expect(charsetEntropyBits(62, 0)).toBe(0)
    expect(charsetEntropyBits(1, 16)).toBe(0)
  })

  it('labels strength by bit thresholds', () => {
    expect(entropyStrength(63).label).toBe('Weak')
    expect(entropyStrength(64).label).toBe('Fine')
    expect(entropyStrength(96).label).toBe('Strong')
    expect(entropyStrength(128).label).toBe('Excellent')
  })
})
