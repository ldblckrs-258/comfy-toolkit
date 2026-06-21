import { describe, expect, it } from 'vitest'
import { decodeBase64, encodeBase64 } from './base64'

describe('base64', () => {
  it('encodes ASCII to the expected value', () => {
    expect(encodeBase64('Hello')).toBe('SGVsbG8=')
  })

  it('decodes back to the original ASCII', () => {
    expect(decodeBase64('SGVsbG8=')).toBe('Hello')
  })

  it('round-trips multibyte UTF-8 without corruption', () => {
    const text = 'héllo — 世界 🌍'
    expect(decodeBase64(encodeBase64(text))).toBe(text)
  })
})
