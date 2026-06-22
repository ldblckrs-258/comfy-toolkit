import SparkMD5 from 'spark-md5'

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
export type HashEncoding = 'hex' | 'base64'

export const HASH_ALGORITHMS: Array<HashAlgorithm> = [
  'MD5',
  'SHA-1',
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

function toBuffer(input: string | ArrayBuffer): ArrayBuffer {
  if (typeof input !== 'string') return input
  const bytes = new TextEncoder().encode(input)
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  )
}

function md5Bytes(buffer: ArrayBuffer): Uint8Array {
  const spark = new SparkMD5.ArrayBuffer()
  spark.append(buffer)
  const raw = spark.end(true)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

async function digest(
  buffer: ArrayBuffer,
  algorithm: HashAlgorithm,
): Promise<Uint8Array> {
  if (algorithm === 'MD5') return md5Bytes(buffer)
  const result = await crypto.subtle.digest(algorithm, buffer)
  return new Uint8Array(result)
}

export async function hashAll(
  input: string | ArrayBuffer,
  encoding: HashEncoding,
): Promise<Record<HashAlgorithm, string>> {
  const buffer = toBuffer(input)
  const entries = await Promise.all(
    HASH_ALGORITHMS.map(async (algorithm) => {
      const bytes = await digest(buffer, algorithm)
      const value = encoding === 'hex' ? toHex(bytes) : toBase64(bytes)
      return [algorithm, value] as const
    }),
  )
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>
}

export function normalizeHash(value: string, encoding: HashEncoding): string {
  const trimmed = value.replace(/\s+/g, '')
  return encoding === 'hex' ? trimmed.toLowerCase() : trimmed
}

export function matchAlgorithm(
  digests: Record<HashAlgorithm, string>,
  expected: string,
  encoding: HashEncoding,
): HashAlgorithm | null {
  const target = normalizeHash(expected, encoding)
  if (!target) return null
  for (const algorithm of HASH_ALGORITHMS) {
    if (normalizeHash(digests[algorithm], encoding) === target) return algorithm
  }
  return null
}
