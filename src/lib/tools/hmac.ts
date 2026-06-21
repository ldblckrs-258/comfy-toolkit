export type HmacAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512'
export type HmacEncoding = 'hex' | 'base64'

export const HMAC_ALGORITHMS: Array<HmacAlgorithm> = [
  'SHA-256',
  'SHA-384',
  'SHA-512',
]

function toHex(bytes: Uint8Array): string {
  let hex = ''
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0')
  return hex
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export async function generateHmac(
  message: string,
  secret: string,
  algorithm: HmacAlgorithm,
  encoding: HmacEncoding,
): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message),
  )
  const bytes = new Uint8Array(signature)
  return encoding === 'hex' ? toHex(bytes) : toBase64(bytes)
}

function normalize(value: string, encoding: HmacEncoding): string {
  const trimmed = value.replace(/\s+/g, '')
  return encoding === 'hex' ? trimmed.toLowerCase() : trimmed
}

export async function verifyHmac(
  message: string,
  secret: string,
  algorithm: HmacAlgorithm,
  encoding: HmacEncoding,
  expected: string,
): Promise<boolean> {
  const actual = await generateHmac(message, secret, algorithm, encoding)
  return normalize(actual, encoding) === normalize(expected, encoding)
}
