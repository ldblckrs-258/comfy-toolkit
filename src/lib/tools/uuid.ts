export type UuidVersion = 'v4' | 'v7'

export function uuidV4(): string {
  return crypto.randomUUID()
}

export function uuidV7At(timestampMs: number): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  let timestamp = Math.floor(timestampMs)
  for (let i = 5; i >= 0; i--) {
    bytes[i] = timestamp % 256
    timestamp = Math.floor(timestamp / 256)
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x70
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function uuidV7(): string {
  return uuidV7At(Date.now())
}

export function generateUuids(
  version: UuidVersion,
  count: number,
): Array<string> {
  const safeCount = Math.max(1, Math.min(Math.floor(count) || 1, 1000))
  return Array.from({ length: safeCount }, () =>
    version === 'v4' ? uuidV4() : uuidV7(),
  )
}

export function generateUuidsV7(
  count: number,
  timestampMs?: number,
): Array<string> {
  const safeCount = Math.max(1, Math.min(Math.floor(count) || 1, 1000))
  return Array.from({ length: safeCount }, () =>
    timestampMs === undefined ? uuidV7() : uuidV7At(timestampMs),
  )
}

export type UuidFieldKey =
  | 'timestamp'
  | 'version'
  | 'randA'
  | 'variant'
  | 'randB'

export interface UuidField {
  key: UuidFieldKey
  label: string
  bits: number
  hex: string
  binary: string
}

export interface UuidV7Parts {
  timestampMs: number
  fields: Array<UuidField>
}

function hexToBin(hex: string): string {
  let binary = ''
  for (const char of hex) {
    binary += parseInt(char, 16).toString(2).padStart(4, '0')
  }
  return binary
}

export function decomposeUuidV7(uuid: string): UuidV7Parts | null {
  const hex = uuid.replace(/-/g, '').toLowerCase()
  if (!/^[0-9a-f]{32}$/.test(hex)) return null

  const tsHex = hex.slice(0, 12)
  const versionHex = hex.slice(12, 13)
  const randAHex = hex.slice(13, 16)
  const variantNibble = parseInt(hex.slice(16, 17), 16)
  const variantValue = (variantNibble >> 2) & 0b11
  const randBLow = variantNibble & 0b11
  const randBHex = hex.slice(17)

  return {
    timestampMs: parseInt(tsHex, 16),
    fields: [
      {
        key: 'timestamp',
        label: 'Unix timestamp (ms)',
        bits: 48,
        hex: tsHex,
        binary: hexToBin(tsHex),
      },
      {
        key: 'version',
        label: 'Version',
        bits: 4,
        hex: versionHex,
        binary: hexToBin(versionHex),
      },
      {
        key: 'randA',
        label: 'Random / sequence',
        bits: 12,
        hex: randAHex,
        binary: hexToBin(randAHex),
      },
      {
        key: 'variant',
        label: 'Variant (RFC 4122)',
        bits: 2,
        hex: variantValue.toString(16),
        binary: variantValue.toString(2).padStart(2, '0'),
      },
      {
        key: 'randB',
        label: 'Random',
        bits: 62,
        hex: randBHex,
        binary: randBLow.toString(2).padStart(2, '0') + hexToBin(randBHex),
      },
    ],
  }
}

export function extractTimestampMs(uuid: string): number | null {
  const hex = uuid.replace(/-/g, '').toLowerCase()
  if (!/^[0-9a-f]{32}$/.test(hex)) return null
  return parseInt(hex.slice(0, 12), 16)
}
