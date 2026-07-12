import { describe, expect, it } from 'vitest'
import {
  buildUrl,
  decodeComponent,
  encodeComponent,
  parseUrl,
  tokenizeUrl,
} from './url-parser'

describe('parseUrl', () => {
  it('parses a full URL with port, auth, hash and duplicate params', () => {
    const parts = parseUrl(
      'https://user:pass@example.com:8443/a/b?x=1&y=two&x=3#frag',
    )
    expect(parts).toEqual({
      protocol: 'https:',
      hostname: 'example.com',
      port: '8443',
      pathname: '/a/b',
      hash: '#frag',
      username: 'user',
      password: 'pass',
      params: [
        { key: 'x', value: '1' },
        { key: 'y', value: 'two' },
        { key: 'x', value: '3' },
      ],
    })
  })

  it('omits port and hash when absent', () => {
    const parts = parseUrl('https://example.com/')
    expect(parts.port).toBe('')
    expect(parts.hash).toBe('')
    expect(parts.params).toEqual([])
  })

  it('throws on an invalid URL', () => {
    expect(() => parseUrl('not a url')).toThrow()
  })
})

describe('buildUrl', () => {
  it('round-trips an equivalent URL', () => {
    const source = 'https://user:pass@example.com:8443/a/b?x=1&y=two&x=3#frag'
    expect(parseUrl(buildUrl(parseUrl(source)))).toEqual(parseUrl(source))
  })

  it('reflects edited, added and removed params', () => {
    const parts = parseUrl('https://example.com/p?a=1&b=2')
    parts.params[0].value = '9'
    parts.params.push({ key: 'c', value: '3' })
    parts.params.splice(1, 1)
    expect(buildUrl(parts)).toBe('https://example.com/p?a=9&c=3')
  })

  it('preserves a password when the username is empty', () => {
    const source = 'https://:pass@example.com/path'
    expect(parseUrl(buildUrl(parseUrl(source)))).toEqual(parseUrl(source))
  })

  it('keeps an empty-value param', () => {
    const parts = parseUrl('https://example.com/')
    parts.params.push({ key: 'k', value: '' })
    expect(buildUrl(parts)).toBe('https://example.com/?k=')
  })

  it('drops the ? when params is empty', () => {
    const parts = parseUrl('https://example.com/path?a=1')
    parts.params = []
    expect(buildUrl(parts)).toBe('https://example.com/path')
  })
})

describe('tokenizeUrl', () => {
  const cases = [
    'https://user:pass@example.com:8443/a/b?x=1&y=two&x=3#frag',
    'example.com/path?a=1',
    'https://[::1]:9000/x',
    'https://example.com/?k=',
    'not a url',
    '',
  ]

  it('is lossless — joined tokens equal the input', () => {
    for (const input of cases) {
      expect(
        tokenizeUrl(input)
          .map((token) => token.text)
          .join(''),
      ).toBe(input)
    }
  })

  it('labels the structural segments', () => {
    const tokens = tokenizeUrl('https://example.com:8443/a?x=1#f')
    const pick = (type: string) =>
      tokens.filter((token) => token.type === type).map((token) => token.text)
    expect(pick('protocol')).toEqual(['https:'])
    expect(pick('host')).toEqual(['example.com'])
    expect(pick('port')).toEqual(['8443'])
    expect(pick('path')).toEqual(['/a'])
    expect(pick('query-key')).toEqual(['x'])
    expect(pick('query-value')).toEqual(['1'])
    expect(pick('hash')).toEqual(['#f'])
  })
})

describe('encode / decode component', () => {
  it('encodes unicode and reserved characters', () => {
    expect(encodeComponent('é 🌍')).toBe('%C3%A9%20%F0%9F%8C%8D')
    expect(encodeComponent('a&b=c/d')).toBe('a%26b%3Dc%2Fd')
  })

  it('round-trips through decode', () => {
    const text = 'a&b=c/d é 🌍'
    expect(decodeComponent(encodeComponent(text))).toBe(text)
  })

  it('throws on malformed percent-encoding', () => {
    expect(() => decodeComponent('%E0%A4%A')).toThrow()
  })
})
