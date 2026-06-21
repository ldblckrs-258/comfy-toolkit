import { describe, expect, it } from 'vitest'
import { decodeJwt, timestampToIso } from './jwt'

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('decodeJwt', () => {
  it('decodes the header and payload of a valid token', () => {
    const { header, payload } = decodeJwt(SAMPLE)
    expect((header as Record<string, unknown>).alg).toBe('HS256')
    expect((payload as Record<string, unknown>).name).toBe('John Doe')
  })

  it('throws when the token does not have three parts', () => {
    expect(() => decodeJwt('a.b')).toThrow()
  })
})

describe('timestampToIso', () => {
  it('converts a numeric unix seconds value to ISO', () => {
    expect(timestampToIso(0)).toBe('1970-01-01T00:00:00.000Z')
    expect(timestampToIso(1516239022)).toMatch(/^2018-01/)
  })

  it('returns null for non-numeric input', () => {
    expect(timestampToIso('nope')).toBeNull()
    expect(timestampToIso(undefined)).toBeNull()
  })
})
