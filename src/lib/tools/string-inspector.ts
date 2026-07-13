export interface TextStats {
  graphemes: number
  codePoints: number
  utf16Units: number
  utf8Bytes: number
  words: number
  lines: number
}

export interface CodePointInfo {
  char: string
  hex: string
  decimal: number
  utf8: Array<number>
}

export type SuspiciousKind =
  | 'zero-width'
  | 'bidi-control'
  | 'control'
  | 'nbsp'
  | 'homoglyph'

export interface SuspiciousChar {
  codePointIndex: number
  char: string
  hex: string
  kind: SuspiciousKind
  note: string
}

export type NormalizationForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD'

const encoder = new TextEncoder()
const graphemeSegmenter = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
})
const wordSegmenter = new Intl.Segmenter(undefined, { granularity: 'word' })

function toHex(codePoint: number): string {
  return 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0')
}

export function analyzeText(input: string): TextStats {
  if (input === '') {
    return {
      graphemes: 0,
      codePoints: 0,
      utf16Units: 0,
      utf8Bytes: 0,
      words: 0,
      lines: 0,
    }
  }

  let words = 0
  for (const segment of wordSegmenter.segment(input)) {
    if (segment.isWordLike) words++
  }

  return {
    graphemes: [...graphemeSegmenter.segment(input)].length,
    codePoints: [...input].length,
    utf16Units: input.length,
    utf8Bytes: encoder.encode(input).length,
    words,
    lines: input.split(/\r\n|\r|\n/).length,
  }
}

export function listCodePoints(input: string): Array<CodePointInfo> {
  const result: Array<CodePointInfo> = []
  for (const char of input) {
    const decimal = char.codePointAt(0)!
    result.push({
      char,
      hex: toHex(decimal),
      decimal,
      utf8: Array.from(encoder.encode(char)),
    })
  }
  return result
}

// Small fixed map of common confusables → Latin equivalent.
// This is NOT a full UTS #39 implementation, only the most frequent lookalikes.
const HOMOGLYPHS: Record<string, string> = {
  а: 'a',
  е: 'e',
  о: 'o',
  р: 'p',
  с: 'c',
  у: 'y',
  х: 'x',
  А: 'A',
  В: 'B',
  Е: 'E',
  К: 'K',
  М: 'M',
  Н: 'H',
  О: 'O',
  Р: 'P',
  С: 'C',
  Т: 'T',
  Х: 'X',
  ο: 'o',
  Α: 'A',
  Β: 'B',
  Ε: 'E',
  Ζ: 'Z',
  Η: 'H',
  Ι: 'I',
  Κ: 'K',
  Μ: 'M',
  Ν: 'N',
  Ο: 'O',
  Ρ: 'P',
  Τ: 'T',
  Υ: 'Y',
  Χ: 'X',
}

const CHAR_NOTES: Record<number, string | undefined> = {
  0x200b: 'ZERO WIDTH SPACE',
  0x200c: 'ZERO WIDTH NON-JOINER',
  0x2060: 'WORD JOINER',
  0xfeff: 'ZERO WIDTH NO-BREAK SPACE (BOM)',
  0x200e: 'LEFT-TO-RIGHT MARK',
  0x200f: 'RIGHT-TO-LEFT MARK',
  0x202a: 'LEFT-TO-RIGHT EMBEDDING',
  0x202b: 'RIGHT-TO-LEFT EMBEDDING',
  0x202c: 'POP DIRECTIONAL FORMATTING',
  0x202d: 'LEFT-TO-RIGHT OVERRIDE',
  0x202e: 'RIGHT-TO-LEFT OVERRIDE',
  0x2066: 'LEFT-TO-RIGHT ISOLATE',
  0x2067: 'RIGHT-TO-LEFT ISOLATE',
  0x2068: 'FIRST STRONG ISOLATE',
  0x2069: 'POP DIRECTIONAL ISOLATE',
  0x007f: 'DELETE',
  0x00a0: 'NO-BREAK SPACE',
  0x202f: 'NARROW NO-BREAK SPACE',
  0x2007: 'FIGURE SPACE',
  0x2000: 'EN QUAD',
  0x2001: 'EM QUAD',
  0x2002: 'EN SPACE',
  0x2003: 'EM SPACE',
  0x2004: 'THREE-PER-EM SPACE',
  0x2005: 'FOUR-PER-EM SPACE',
  0x2006: 'SIX-PER-EM SPACE',
  0x2008: 'PUNCTUATION SPACE',
  0x2009: 'THIN SPACE',
  0x200a: 'HAIR SPACE',
}

function hasLatin(input: string): boolean {
  return /[A-Za-z]/.test(input)
}

function scriptName(codePoint: number): string {
  if (codePoint >= 0x0400 && codePoint <= 0x04ff) return 'Cyrillic'
  if (codePoint >= 0x0370 && codePoint <= 0x03ff) return 'Greek'
  return 'Non-Latin'
}

interface Classification {
  kind: SuspiciousKind
  note: string
}

function classify(
  char: string,
  codePoint: number,
  latinPresent: boolean,
): Classification | null {
  if (
    codePoint === 0x200b ||
    codePoint === 0x200c ||
    codePoint === 0x2060 ||
    codePoint === 0xfeff
  ) {
    return {
      kind: 'zero-width',
      note: CHAR_NOTES[codePoint] ?? 'ZERO-WIDTH CHARACTER',
    }
  }
  if (
    codePoint === 0x200e ||
    codePoint === 0x200f ||
    (codePoint >= 0x202a && codePoint <= 0x202e) ||
    (codePoint >= 0x2066 && codePoint <= 0x2069)
  ) {
    return {
      kind: 'bidi-control',
      note: CHAR_NOTES[codePoint] ?? 'BIDIRECTIONAL CONTROL',
    }
  }
  if (
    (codePoint <= 0x1f ||
      codePoint === 0x7f ||
      (codePoint >= 0x80 && codePoint <= 0x9f)) &&
    codePoint !== 0x09 &&
    codePoint !== 0x0a &&
    codePoint !== 0x0d
  ) {
    return {
      kind: 'control',
      note: CHAR_NOTES[codePoint] ?? 'CONTROL CHARACTER',
    }
  }
  if (
    codePoint === 0x00a0 ||
    codePoint === 0x202f ||
    codePoint === 0x2007 ||
    (codePoint >= 0x2000 && codePoint <= 0x200a)
  ) {
    return {
      kind: 'nbsp',
      note: CHAR_NOTES[codePoint] ?? 'NON-STANDARD SPACE',
    }
  }
  if (latinPresent && char in HOMOGLYPHS) {
    return {
      kind: 'homoglyph',
      note: `${scriptName(codePoint)} ${char} (looks like Latin ${HOMOGLYPHS[char]})`,
    }
  }
  return null
}

export function findSuspicious(input: string): Array<SuspiciousChar> {
  const latinPresent = hasLatin(input)
  const result: Array<SuspiciousChar> = []
  let index = 0
  for (const char of input) {
    const codePoint = char.codePointAt(0)!
    const classification = classify(char, codePoint, latinPresent)
    if (classification) {
      result.push({
        codePointIndex: index,
        char,
        hex: toHex(codePoint),
        kind: classification.kind,
        note: classification.note,
      })
    }
    index++
  }
  return result
}

export function cleanText(input: string): string {
  const latinPresent = hasLatin(input)
  let output = ''
  for (const char of input) {
    const codePoint = char.codePointAt(0)!
    const classification = classify(char, codePoint, latinPresent)
    if (!classification) {
      output += char
      continue
    }
    switch (classification.kind) {
      case 'zero-width':
      case 'bidi-control':
      case 'control':
        break
      case 'nbsp':
        output += ' '
        break
      case 'homoglyph':
        output += HOMOGLYPHS[char]
        break
    }
  }
  return output
}

export function normalizeText(input: string, form: NormalizationForm): string {
  return input.normalize(form)
}

export function isNormalized(
  input: string,
  form: NormalizationForm = 'NFC',
): boolean {
  return input === input.normalize(form)
}
