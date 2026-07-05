import { renderSVG } from 'uqr'

export type EccLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrOptions {
  ecc: EccLevel
  border: number
}

export interface QrSvgOptions extends QrOptions {
  size: number
  foreground: string
  background: string
}

export function qrToSvg(data: string, options: QrSvgOptions): string {
  if (!data) throw new Error('Nothing to encode')
  const svg = renderSVG(data, {
    ecc: options.ecc,
    border: options.border,
    blackColor: options.foreground,
    whiteColor: options.background,
  })
  return svg.replace(
    /^<svg /,
    `<svg width="${options.size}" height="${options.size}" `,
  )
}

export interface WifiPayload {
  ssid: string
  password: string
  security: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

export function wifiToPayload(payload: WifiPayload): string {
  if (!payload.ssid) throw new Error('SSID is required')
  const esc = (value: string) => value.replace(/([\\;,":])/g, '\\$1')
  let fields = `T:${payload.security};S:${esc(payload.ssid)};`
  if (payload.security !== 'nopass') fields += `P:${esc(payload.password)};`
  if (payload.hidden) fields += 'H:true;'
  return `WIFI:${fields};`
}

/** Parse a WIFI: payload back into its fields, or null if it is not one.
 *  Inverse of wifiToPayload; unescapes \ ; , " : sequences. */
export function parseWifiPayload(payload: string): WifiPayload | null {
  if (!payload.startsWith('WIFI:')) return null
  const body = payload.slice('WIFI:'.length)

  const segments: Array<string> = []
  let current = ''
  for (let i = 0; i < body.length; i += 1) {
    const char = body[i]
    if (char === '\\') {
      current += char + body.slice(i + 1, i + 2)
      i += 1
    } else if (char === ';') {
      segments.push(current)
      current = ''
    } else {
      current += char
    }
  }

  const fields: Record<string, string | undefined> = {}
  for (const segment of segments) {
    const separator = segment.indexOf(':')
    if (separator !== -1) {
      const key = segment.slice(0, separator)
      fields[key] = segment.slice(separator + 1).replace(/\\(.)/g, '$1')
    }
  }

  const ssid = fields.S
  if (ssid === undefined) return null
  const security =
    fields.T === 'WEP' ? 'WEP' : fields.T === 'nopass' ? 'nopass' : 'WPA'
  return {
    ssid,
    password: fields.P ?? '',
    security,
    hidden: fields.H === 'true',
  }
}
