import { describe, expect, it } from 'vitest'
import type { WifiPayload } from './qr-code'
import { parseWifiPayload, qrToSvg, wifiToPayload } from './qr-code'

const viewBoxSize = (svg: string) => {
  const match = svg.match(/viewBox="0 0 (\d+) \d+"/)
  if (!match) throw new Error('no viewBox')
  return Number(match[1])
}

describe('qrToSvg', () => {
  it('returns an svg carrying the requested colors and size', () => {
    const svg = qrToSvg('hello', {
      ecc: 'M',
      border: 2,
      size: 512,
      foreground: '#ff0000',
      background: '#00ff00',
    })
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('#ff0000')
    expect(svg).toContain('#00ff00')
    expect(svg).toContain('width="512"')
    expect(svg).toContain('height="512"')
  })

  it('supports a transparent background', () => {
    const svg = qrToSvg('hello', {
      ecc: 'M',
      border: 2,
      size: 256,
      foreground: '#000000',
      background: 'transparent',
    })
    expect(svg).toContain('transparent')
  })

  it('throws on empty data', () => {
    expect(() =>
      qrToSvg('', {
        ecc: 'M',
        border: 2,
        size: 256,
        foreground: '#000000',
        background: '#ffffff',
      }),
    ).toThrow('Nothing to encode')
  })

  it('produces more modules at higher ecc for the same data', () => {
    const base = {
      border: 2,
      size: 256,
      foreground: '#000000',
      background: '#ffffff',
    } as const
    const low = qrToSvg('hello world test data', { ...base, ecc: 'L' })
    const high = qrToSvg('hello world test data', { ...base, ecc: 'H' })
    expect(high).not.toBe(low)
    expect(viewBoxSize(high)).toBeGreaterThan(viewBoxSize(low))
  })
})

describe('wifiToPayload', () => {
  it('builds a plain WPA payload', () => {
    expect(
      wifiToPayload({
        ssid: 'MyNet',
        password: 'secret',
        security: 'WPA',
        hidden: false,
      }),
    ).toBe('WIFI:T:WPA;S:MyNet;P:secret;;')
  })

  it('escapes the de-facto special chars in ssid', () => {
    const payload = wifiToPayload({
      ssid: 'a;b,c:d"e\\f',
      password: 'pw',
      security: 'WPA',
      hidden: false,
    })
    expect(payload).toContain('S:a\\;b\\,c\\:d\\"e\\\\f;')
  })

  it('omits the password field for nopass', () => {
    const payload = wifiToPayload({
      ssid: 'Open',
      password: 'ignored',
      security: 'nopass',
      hidden: false,
    })
    expect(payload).toBe('WIFI:T:nopass;S:Open;;')
    expect(payload).not.toContain('P:')
  })

  it('adds H:true for a hidden network', () => {
    const payload = wifiToPayload({
      ssid: 'Ghost',
      password: 'pw',
      security: 'WPA',
      hidden: true,
    })
    expect(payload).toContain('H:true;')
  })

  it('throws on empty ssid', () => {
    expect(() =>
      wifiToPayload({
        ssid: '',
        password: 'pw',
        security: 'WPA',
        hidden: false,
      }),
    ).toThrow('SSID is required')
  })
})

describe('parseWifiPayload', () => {
  it('returns null for a non-wifi string', () => {
    expect(parseWifiPayload('https://comfytk.com')).toBeNull()
  })

  it('parses a plain payload', () => {
    expect(parseWifiPayload('WIFI:T:WPA;S:MyNet;P:secret;;')).toEqual({
      ssid: 'MyNet',
      password: 'secret',
      security: 'WPA',
      hidden: false,
    })
  })

  it('round-trips every wifiToPayload shape', () => {
    const cases: Array<WifiPayload> = [
      { ssid: 'MyNet', password: 'secret', security: 'WPA', hidden: false },
      {
        ssid: 'a;b,c:d"e\\f',
        password: 'p\\;:"',
        security: 'WPA',
        hidden: true,
      },
      { ssid: 'Guest', password: 'x', security: 'WEP', hidden: false },
      { ssid: 'Open', password: '', security: 'nopass', hidden: false },
    ]
    for (const item of cases) {
      expect(parseWifiPayload(wifiToPayload(item))).toEqual(item)
    }
  })
})
