export interface JwtParts {
  header: unknown
  payload: unknown
  signature: string
  raw: { header: string; payload: string; signature: string }
  signingInput: string
}

function base64UrlToBytes(part: string): Uint8Array<ArrayBuffer> {
  const normalized = part.replace(/-/g, '+').replace(/_/g, '/')
  const padded =
    normalized.length % 4 === 0
      ? normalized
      : normalized + '='.repeat(4 - (normalized.length % 4))
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function base64UrlDecode(part: string): string {
  return new TextDecoder().decode(base64UrlToBytes(part))
}

export function decodeJwt(token: string): JwtParts {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('A JWT must have three parts separated by dots.')
  }
  const [header, payload, signature] = parts
  return {
    header: JSON.parse(base64UrlDecode(header)),
    payload: JSON.parse(base64UrlDecode(payload)),
    signature,
    raw: { header, payload, signature },
    signingInput: `${header}.${payload}`,
  }
}

export function timestampToIso(value: unknown): string | null {
  if (typeof value !== 'number') return null
  const date = new Date(value * 1000)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function timestampToLocale(value: unknown): string | null {
  if (typeof value !== 'number') return null
  const date = new Date(value * 1000)
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'long' })
}

export const TIMESTAMP_CLAIMS = new Set(['exp', 'nbf', 'iat', 'auth_time'])

const CLAIM_INFO: Record<string, string> = {
  alg: 'The algorithm used to sign the JWT.',
  typ: 'The media type of this complete JWT.',
  cty: 'The content type of the payload.',
  kid: 'Key ID — hints which key was used to sign the JWT.',
  jku: 'URL of the JSON Web Key Set used to sign the JWT.',
  x5t: 'X.509 certificate thumbprint of the signing key.',
  iss: 'Issuer — the principal that issued the JWT.',
  sub: 'Subject — the principal the JWT is about.',
  aud: 'Audience — the recipients the JWT is intended for.',
  exp: 'Expiration time after which the JWT must not be accepted.',
  nbf: 'Not before — time before which the JWT must not be accepted.',
  iat: 'Issued at — time at which the JWT was issued.',
  jti: 'JWT ID — a unique identifier for this token.',
  auth_time: 'Time when the end-user authentication occurred.',
  scope: 'Space-separated list of granted scopes.',
  azp: 'Authorized party — the client the token was issued to.',
  name: 'Full name of the subject.',
  email: 'Email address of the subject.',
}

export function describeClaim(name: string): string | undefined {
  return CLAIM_INFO[name]
}

const HMAC_HASH: Record<string, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
}

export type JwtVerifyStatus = 'verified' | 'invalid' | 'unsupported' | 'error'

export interface JwtVerifyResult {
  status: JwtVerifyStatus
  message?: string
}

export async function verifyJwtSignature(
  parts: JwtParts,
  secret: string,
  base64urlSecret: boolean,
): Promise<JwtVerifyResult> {
  const alg =
    parts.header && typeof parts.header === 'object'
      ? (parts.header as Record<string, unknown>).alg
      : undefined

  if (typeof alg !== 'string') {
    return { status: 'error', message: 'Header is missing the "alg" claim.' }
  }

  const hash = HMAC_HASH[alg]
  if (!hash) {
    return {
      status: 'unsupported',
      message: `${alg} requires a public key. Only HMAC (HS256/384/512) is verified here.`,
    }
  }

  try {
    const keyBytes = base64urlSecret
      ? base64UrlToBytes(secret)
      : new TextEncoder().encode(secret)
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash },
      false,
      ['verify'],
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(parts.raw.signature),
      new TextEncoder().encode(parts.signingInput),
    )
    return { status: valid ? 'verified' : 'invalid' }
  } catch {
    return { status: 'error', message: 'Could not verify the signature.' }
  }
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function utf8ToBase64Url(value: string): string {
  return bytesToBase64Url(new TextEncoder().encode(value))
}

export interface JwtSignResult {
  token?: string
  error?: string
}

export async function signJwt(
  headerJson: string,
  payloadJson: string,
  secret: string,
  base64urlSecret: boolean,
): Promise<JwtSignResult> {
  let header: unknown
  let payload: unknown
  try {
    header = JSON.parse(headerJson)
  } catch {
    return { error: 'Header is not valid JSON.' }
  }
  try {
    payload = JSON.parse(payloadJson)
  } catch {
    return { error: 'Payload is not valid JSON.' }
  }

  const alg =
    header && typeof header === 'object'
      ? (header as Record<string, unknown>).alg
      : undefined
  if (typeof alg !== 'string') {
    return { error: 'Header is missing the "alg" claim.' }
  }
  const hash = HMAC_HASH[alg]
  if (!hash) {
    return {
      error: `${alg} requires a private key. Only HMAC (HS256/384/512) can be signed here.`,
    }
  }

  try {
    const signingInput = `${utf8ToBase64Url(JSON.stringify(header))}.${utf8ToBase64Url(
      JSON.stringify(payload),
    )}`
    const keyBytes = base64urlSecret
      ? base64UrlToBytes(secret)
      : new TextEncoder().encode(secret)
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash },
      false,
      ['sign'],
    )
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signingInput),
    )
    return {
      token: `${signingInput}.${bytesToBase64Url(new Uint8Array(signature))}`,
    }
  } catch {
    return { error: 'Could not sign the token.' }
  }
}
