import { base64Content } from './base64'
import { clockContent } from './clock'
import { codeFormatterContent } from './code-formatter'
import { colorsContent } from './colors'
import { contrastContent } from './contrast'
import { cronContent } from './cron'
import { dataConverterContent } from './data-converter'
import { diffContent } from './diff'
import { gradientContent } from './gradient'
import { hashContent } from './hash'
import { hmacContent } from './hmac'
import { jsonFormatterContent } from './json-formatter'
import { jwtContent } from './jwt-decoder'
import { markdownContent } from './markdown'
import { paletteContent } from './palette'
import { qrCodeContent } from './qr-code'
import { regexContent } from './regex'
import { secretGeneratorContent } from './secret-generator'
import { stringInspectorContent } from './string-inspector'
import { timestampContent } from './unix-timestamp'
import { urlParserContent } from './url-parser'
import { uuidContent } from './uuid-generator'

import type { ToolContent } from '../types'

export const TOOL_CONTENT: Record<string, ToolContent | undefined> = {
  base64: base64Content,
  clock: clockContent,
  'code-formatter': codeFormatterContent,
  colors: colorsContent,
  contrast: contrastContent,
  cron: cronContent,
  'data-converter': dataConverterContent,
  diff: diffContent,
  gradient: gradientContent,
  hash: hashContent,
  hmac: hmacContent,
  'json-formatter': jsonFormatterContent,
  'jwt-decoder': jwtContent,
  markdown: markdownContent,
  palette: paletteContent,
  'qr-code': qrCodeContent,
  regex: regexContent,
  'secret-generator': secretGeneratorContent,
  'string-inspector': stringInspectorContent,
  'unix-timestamp': timestampContent,
  'url-parser': urlParserContent,
  'uuid-generator': uuidContent,
}
