import { base64Variants } from './base64.ts'
import { codeFormatterVariants } from './code-formatter.ts'
import { cronVariants } from './cron.ts'
import { dataConverterVariants } from './data-converter.ts'
import { diffVariants } from './diff.ts'
import { hashVariants } from './hash.ts'
import { hmacVariants } from './hmac.ts'
import { jwtVariants } from './jwt.ts'
import { qrCodeVariants } from './qr-code.ts'
import { timestampVariants } from './unix-timestamp.ts'
import { urlParserVariants } from './url-parser.ts'

import type { ToolVariant } from './types.ts'

const ALL: Array<ToolVariant> = [
  ...base64Variants,
  ...codeFormatterVariants,
  ...cronVariants,
  ...dataConverterVariants,
  ...diffVariants,
  ...hashVariants,
  ...hmacVariants,
  ...jwtVariants,
  ...qrCodeVariants,
  ...timestampVariants,
  ...urlParserVariants,
]

export const VARIANTS: Array<ToolVariant> = ALL

export function getVariant(
  toolId: string,
  slug: string,
): ToolVariant | undefined {
  return ALL.find((v) => v.toolId === toolId && v.slug === slug)
}

export function variantsForTool(toolId: string): Array<ToolVariant> {
  return ALL.filter((v) => v.toolId === toolId)
}
