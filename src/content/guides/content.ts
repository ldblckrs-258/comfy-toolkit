import { guide as apcaVsWcagContrast } from './apca-vs-wcag-contrast.ts'
import { guide as base64IsNotEncryption } from './base64-is-not-encryption.ts'
import { guide as choosingAConfigFormat } from './choosing-a-config-format.ts'
import { guide as cronExpressionsExplained } from './cron-expressions-explained.ts'
import { guide as decodingJwtSafely } from './decoding-jwt-safely.ts'
import { guide as epochSecondsVsMilliseconds } from './epoch-seconds-vs-milliseconds.ts'
import { guide as invisibleUnicodeInCode } from './invisible-unicode-in-code.ts'
import { guide as md5Sha1Sha256StillSafe } from './md5-sha1-sha256-still-safe.ts'
import { guide as oklchForPalettes } from './oklch-for-palettes.ts'
import { guide as uuidV7VsV4 } from './uuid-v7-vs-v4.ts'

import type { GuideContent } from '../types.ts'

export const GUIDE_CONTENT: Record<string, GuideContent | undefined> = {
  'uuid-v7-vs-v4': uuidV7VsV4,
  'apca-vs-wcag-contrast': apcaVsWcagContrast,
  'invisible-unicode-in-code': invisibleUnicodeInCode,
  'epoch-seconds-vs-milliseconds': epochSecondsVsMilliseconds,
  'oklch-for-palettes': oklchForPalettes,
  'decoding-jwt-safely': decodingJwtSafely,
  'md5-sha1-sha256-still-safe': md5Sha1Sha256StillSafe,
  'cron-expressions-explained': cronExpressionsExplained,
  'base64-is-not-encryption': base64IsNotEncryption,
  'choosing-a-config-format': choosingAConfigFormat,
}
