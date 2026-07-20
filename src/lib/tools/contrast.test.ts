import { describe, expect, it } from 'vitest'
import {
  assess,
  composite,
  contrastRatio,
  parseColor,
  relativeLuminance,
  suggestPassing,
} from './contrast'

const BLACK = { r: 0, g: 0, b: 0 }
const WHITE = { r: 255, g: 255, b: 255 }
const GRAY777 = { r: 0x77, g: 0x77, b: 0x77 }

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance(BLACK)).toBeCloseTo(0, 10)
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 10)
  })
})

describe('contrastRatio', () => {
  it('black on white is 21:1', () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 6)
  })

  it('is symmetric (lighter over darker regardless of order)', () => {
    expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 6)
  })

  it('identical colors is 1:1', () => {
    expect(contrastRatio(GRAY777, GRAY777)).toBeCloseTo(1, 10)
  })

  it('#777 on #fff is ~4.48', () => {
    expect(contrastRatio(GRAY777, WHITE)).toBeCloseTo(4.48, 2)
  })
})

describe('assess', () => {
  it('21:1 passes everything', () => {
    expect(assess(21)).toEqual({
      aaNormal: true,
      aaaNormal: true,
      aaLarge: true,
      aaaLarge: true,
      uiComponent: true,
    })
  })

  it('resolves at the 4.5 boundary (AA normal, AAA large)', () => {
    expect(assess(4.49).aaNormal).toBe(false)
    expect(assess(4.5).aaNormal).toBe(true)
    expect(assess(4.5).aaaLarge).toBe(true)
  })

  it('resolves at the 7 boundary (AAA normal)', () => {
    expect(assess(6.99).aaaNormal).toBe(false)
    expect(assess(7).aaaNormal).toBe(true)
  })

  it('resolves at the 3 boundary (AA large, UI)', () => {
    expect(assess(2.99).aaLarge).toBe(false)
    expect(assess(3).aaLarge).toBe(true)
    expect(assess(3).uiComponent).toBe(true)
  })
})

describe('parseColor', () => {
  it('parses shorthand and full hex', () => {
    expect(parseColor('#abc')).toEqual({
      rgb: { r: 0xaa, g: 0xbb, b: 0xcc },
      a: 1,
    })
    expect(parseColor('#aabbcc')).toEqual({
      rgb: { r: 0xaa, g: 0xbb, b: 0xcc },
      a: 1,
    })
  })

  it('parses hex with alpha', () => {
    const parsed = parseColor('#00000080')
    expect(parsed?.rgb).toEqual(BLACK)
    expect(parsed?.a).toBeCloseTo(0.5, 2)
  })

  it('parses rgb() and rgba()', () => {
    expect(parseColor('rgb(0, 0, 0)')).toEqual({ rgb: BLACK, a: 1 })
    const rgba = parseColor('rgba(0,0,0,.5)')
    expect(rgba?.rgb).toEqual(BLACK)
    expect(rgba?.a).toBeCloseTo(0.5, 2)
  })

  it('parses hsl() and hsla()', () => {
    const white = parseColor('hsl(0, 0%, 100%)')
    expect(white?.rgb.r).toBeCloseTo(255, 0)
    expect(white?.rgb.g).toBeCloseTo(255, 0)
    expect(white?.rgb.b).toBeCloseTo(255, 0)
    expect(white?.a).toBe(1)
  })

  it('reads percentage alpha as a 0-1 fraction', () => {
    expect(parseColor('rgba(0,0,0,50%)')?.a).toBeCloseTo(0.5, 2)
    expect(parseColor('hsla(0,0%,0%,80%)')?.a).toBeCloseTo(0.8, 2)
  })

  it('returns null for garbage', () => {
    expect(parseColor('nope')).toBeNull()
    expect(parseColor('')).toBeNull()
    expect(parseColor('rgb(1,2)')).toBeNull()
  })
})

describe('composite', () => {
  it('blends 50% black over white to mid gray', () => {
    const out = composite({ rgb: BLACK, a: 0.5 }, WHITE)
    expect(Math.round(out.r)).toBe(128)
    expect(Math.round(out.g)).toBe(128)
    expect(Math.round(out.b)).toBe(128)
  })

  it('opaque foreground is unchanged', () => {
    expect(composite({ rgb: BLACK, a: 1 }, WHITE)).toEqual(BLACK)
  })
})

describe('suggestPassing', () => {
  it('finds a foreground reaching the target against white', () => {
    const s = suggestPassing({ r: 0x99, g: 0x99, b: 0x99 }, WHITE)
    expect(s).not.toBeNull()
    expect(contrastRatio(s!.rgb, WHITE)).toBeGreaterThanOrEqual(4.5)
  })

  it('returns null when the target is unreachable by lightness (AAA on mid gray)', () => {
    const midGray = { r: 128, g: 128, b: 128 }
    expect(suggestPassing(midGray, midGray, 7)).toBeNull()
  })
})
