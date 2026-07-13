import { describe, expect, it } from 'vitest'
import {
  analyzeText,
  cleanText,
  findSuspicious,
  isNormalized,
  listCodePoints,
  normalizeText,
} from './string-inspector'

const ZWSP = '​'
const BOM = '﻿'
const RLO = '‮'
const NBSP = ' '
const CYR_A = 'а' // Cyrillic 'а', looks like Latin 'a'
const E_ACUTE = 'é' // composed 'é' (NFC)
const E_DECOMPOSED = 'é' // 'e' + combining acute (NFD)
const FAMILY = '\u{1F468}‍\u{1F469}‍\u{1F467}'

describe('analyzeText', () => {
  it('counts a string with a multi-byte char and a zero-width space', () => {
    const stats = analyzeText(`h${E_ACUTE}llo${ZWSP}world`)
    expect(stats.codePoints).toBe(11)
    expect(stats.utf16Units).toBe(11)
    expect(stats.graphemes).toBe(11)
    expect(stats.utf8Bytes).toBe(14)
  })

  it('treats a ZWJ family emoji as one grapheme over many code points', () => {
    const stats = analyzeText(FAMILY)
    expect(stats.graphemes).toBe(1)
    expect(stats.codePoints).toBe(5)
    expect(stats.utf16Units).toBe(8)
  })

  it('returns all zeros for the empty string', () => {
    expect(analyzeText('')).toEqual({
      graphemes: 0,
      codePoints: 0,
      utf16Units: 0,
      utf8Bytes: 0,
      words: 0,
      lines: 0,
    })
  })

  it('counts words and lines across newlines', () => {
    const stats = analyzeText('a b\nc d')
    expect(stats.words).toBe(4)
    expect(stats.lines).toBe(2)
  })
})

describe('listCodePoints', () => {
  it('reports hex, decimal and utf8 bytes per code point', () => {
    expect(listCodePoints(`a${E_ACUTE}\u{1F600}`)).toEqual([
      { char: 'a', hex: 'U+0061', decimal: 97, utf8: [0x61] },
      { char: E_ACUTE, hex: 'U+00E9', decimal: 233, utf8: [0xc3, 0xa9] },
      {
        char: '\u{1F600}',
        hex: 'U+1F600',
        decimal: 128512,
        utf8: [0xf0, 0x9f, 0x98, 0x80],
      },
    ])
  })
})

describe('findSuspicious', () => {
  it('flags a zero-width space with its kind and position', () => {
    const hits = findSuspicious(`ab${ZWSP}cd`)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({
      codePointIndex: 2,
      kind: 'zero-width',
      hex: 'U+200B',
    })
  })

  it('flags a BOM as zero-width', () => {
    const hits = findSuspicious(`${BOM}hi`)
    expect(hits).toHaveLength(1)
    expect(hits[0].kind).toBe('zero-width')
    expect(hits[0].hex).toBe('U+FEFF')
  })

  it('flags a right-to-left override as bidi-control', () => {
    const hits = findSuspicious(`a${RLO}b`)
    expect(hits[0].kind).toBe('bidi-control')
    expect(hits[0].hex).toBe('U+202E')
  })

  it('flags a DEL control character', () => {
    const hits = findSuspicious('a\x7fb')
    expect(hits[0].kind).toBe('control')
    expect(hits[0].hex).toBe('U+007F')
  })

  it('flags a no-break space as nbsp', () => {
    const hits = findSuspicious(`a${NBSP}b`)
    expect(hits[0].kind).toBe('nbsp')
    expect(hits[0].hex).toBe('U+00A0')
  })

  it('flags a Cyrillic homoglyph inside Latin text', () => {
    const hits = findSuspicious(`p${CYR_A}ypal`)
    const homoglyphs = hits.filter((hit) => hit.kind === 'homoglyph')
    expect(homoglyphs).toHaveLength(1)
    expect(homoglyphs[0].codePointIndex).toBe(1)
    expect(homoglyphs[0].note).toContain('Cyrillic')
    expect(homoglyphs[0].note).toContain('a')
  })

  it('does not flag homoglyphs in pure Cyrillic text', () => {
    const hits = findSuspicious('раз')
    expect(hits.filter((hit) => hit.kind === 'homoglyph')).toHaveLength(0)
  })

  it('does not flag the ZWJ inside a compound emoji', () => {
    expect(findSuspicious(FAMILY)).toHaveLength(0)
  })
})

describe('cleanText', () => {
  it('fixes a homoglyph and strips a zero-width space', () => {
    expect(cleanText(`p${CYR_A}${ZWSP}ypal`)).toBe('paypal')
  })

  it('preserves tabs and newlines', () => {
    expect(cleanText('a\tb\nc')).toBe('a\tb\nc')
  })

  it('replaces a no-break space with a regular space', () => {
    expect(cleanText(`a${NBSP}b`)).toBe('a b')
  })

  it('leaves pure Cyrillic text untouched (homoglyphs gated on Latin)', () => {
    const pureCyrillic = 'раз'
    expect(cleanText(pureCyrillic)).toBe(pureCyrillic)
  })

  it('preserves the ZWJ that holds a compound emoji together', () => {
    expect(cleanText(FAMILY)).toBe(FAMILY)
  })
})

describe('normalizeText', () => {
  it('decomposes and recomposes an accented char', () => {
    expect(normalizeText(E_ACUTE, 'NFD')).toBe(E_DECOMPOSED)
    expect(normalizeText(E_DECOMPOSED, 'NFC')).toBe(E_ACUTE)
  })

  it('folds compatibility characters under NFKC', () => {
    expect(normalizeText('ﬁ', 'NFKC')).toBe('fi')
    expect(normalizeText('Ａ', 'NFKC')).toBe('A')
  })
})

describe('isNormalized', () => {
  it('is true for composed NFC input and false for decomposed input', () => {
    expect(isNormalized(E_ACUTE)).toBe(true)
    expect(isNormalized(E_DECOMPOSED)).toBe(false)
  })
})
