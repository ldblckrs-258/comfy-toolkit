import { describe, expect, it } from 'vitest'
import { generateHmac, verifyHmac } from './hmac'

const MESSAGE = 'The quick brown fox jumps over the lazy dog'
const KEY = 'key'
const SHA256_HEX =
  'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8'

describe('generateHmac', () => {
  it('matches the published HMAC-SHA256 test vector', async () => {
    expect(await generateHmac(MESSAGE, KEY, 'SHA-256', 'hex')).toBe(SHA256_HEX)
  })

  it('produces base64 that decodes to the same bytes as hex', async () => {
    const b64 = await generateHmac(MESSAGE, KEY, 'SHA-256', 'base64')
    const fromB64 = Buffer.from(b64, 'base64').toString('hex')
    expect(fromB64).toBe(SHA256_HEX)
  })
})

describe('verifyHmac', () => {
  it('returns true for a matching signature regardless of hex case', async () => {
    expect(
      await verifyHmac(
        MESSAGE,
        KEY,
        'SHA-256',
        'hex',
        SHA256_HEX.toUpperCase(),
      ),
    ).toBe(true)
  })

  it('returns false when the message is tampered', async () => {
    expect(
      await verifyHmac(MESSAGE + '!', KEY, 'SHA-256', 'hex', SHA256_HEX),
    ).toBe(false)
  })

  it('returns false when the secret is wrong', async () => {
    expect(
      await verifyHmac(MESSAGE, 'wrong', 'SHA-256', 'hex', SHA256_HEX),
    ).toBe(false)
  })
})
