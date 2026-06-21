import { describe, expect, it } from 'vitest'
import {
  cmykToRgb,
  generatePalette,
  hexToRgba,
  hslToHsv,
  hsvToHsl,
  hsvToHwb,
  hsvToRgb,
  hwbToHsv,
  labToRgb,
  lchToRgb,
  oklchToRgb,
  rgbToCmyk,
  rgbToHex,
  rgbToHsv,
  rgbToHsvKeepHue,
  rgbToLab,
  rgbToLch,
  rgbToOklch,
  roundHsl,
  roundRgb,
} from './colors'
import type { Rgb } from './colors'

const ANCHORS: Array<Rgb> = [
  { r: 18, g: 177, b: 177 },
  { r: 0, g: 0, b: 0 },
  { r: 255, g: 255, b: 255 },
  { r: 123, g: 45, b: 200 },
  { r: 240, g: 12, b: 96 },
]

function expectRgbClose(actual: Rgb, expected: Rgb, tol = 1) {
  expect(Math.abs(actual.r - expected.r)).toBeLessThanOrEqual(tol)
  expect(Math.abs(actual.g - expected.g)).toBeLessThanOrEqual(tol)
  expect(Math.abs(actual.b - expected.b)).toBeLessThanOrEqual(tol)
}

describe('rgb/hsv conversion', () => {
  it('maps primary red across spaces', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toMatchObject({
      h: 0,
      s: 100,
      v: 100,
    })
    expect(roundRgb(hsvToRgb({ h: 0, s: 100, v: 100 }))).toEqual({
      r: 255,
      g: 0,
      b: 0,
    })
  })

  it('round-trips every rgb channel byte through hsv', () => {
    for (const sample of [
      { r: 18, g: 177, b: 177 },
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
      { r: 123, g: 45, b: 200 },
    ]) {
      expect(roundRgb(hsvToRgb(rgbToHsv(sample)))).toEqual(sample)
    }
  })
})

describe('hsv/hsl conversion', () => {
  it('matches the canonical hsl of pure red', () => {
    expect(roundHsl(hsvToHsl({ h: 0, s: 100, v: 100 }))).toEqual({
      h: 0,
      s: 100,
      l: 50,
    })
  })

  it('round-trips hsl through hsv without drift', () => {
    const hsl = { h: 210, s: 64, l: 42 }
    expect(roundHsl(hsvToHsl(hslToHsv(hsl)))).toEqual(hsl)
  })
})

describe('hex parsing and formatting', () => {
  it('expands 3 and 4 digit shorthand', () => {
    expect(hexToRgba('#abc')).toEqual({ rgb: { r: 170, g: 187, b: 204 }, a: 1 })
    expect(hexToRgba('#abcf')).toMatchObject({
      rgb: { r: 170, g: 187, b: 204 },
    })
  })

  it('reads the alpha byte from 8-digit hex', () => {
    const parsed = hexToRgba('#10b1b180')
    expect(parsed?.rgb).toEqual({ r: 16, g: 177, b: 177 })
    expect(parsed?.a).toBeCloseTo(128 / 255, 5)
  })

  it('appends the alpha byte only when translucent', () => {
    expect(rgbToHex({ r: 16, g: 177, b: 177 })).toBe('#10b1b1')
    expect(rgbToHex({ r: 16, g: 177, b: 177 }, 0.5)).toBe('#10b1b180')
  })

  it('rejects malformed input', () => {
    expect(hexToRgba('#xyz')).toBeNull()
    expect(hexToRgba('#12345')).toBeNull()
  })
})

describe('rgbToHsvKeepHue', () => {
  it('keeps the prior hue when the color turns gray', () => {
    const prev = { h: 200, s: 50, v: 80 }
    const next = rgbToHsvKeepHue({ r: 128, g: 128, b: 128 }, prev)
    expect(next.s).toBe(0)
    expect(next.h).toBe(200)
  })

  it('keeps prior hue and saturation when the color turns black', () => {
    const prev = { h: 130, s: 70, v: 90 }
    const next = rgbToHsvKeepHue({ r: 0, g: 0, b: 0 }, prev)
    expect(next).toMatchObject({ h: 130, s: 70, v: 0 })
  })
})

describe('cmyk conversion', () => {
  it('maps pure red to its print components', () => {
    expect(rgbToCmyk({ r: 255, g: 0, b: 0 })).toMatchObject({
      c: 0,
      m: 100,
      y: 100,
      k: 0,
    })
  })

  it('round-trips every anchor', () => {
    for (const rgb of ANCHORS) {
      expectRgbClose(cmykToRgb(rgbToCmyk(rgb)), rgb)
    }
  })
})

describe('hwb conversion', () => {
  it('round-trips through hsv', () => {
    for (const hsv of [
      { h: 210, s: 64, v: 80 },
      { h: 0, s: 0, v: 50 },
      { h: 120, s: 100, v: 100 },
    ]) {
      const back = hwbToHsv(hsvToHwb(hsv))
      expect(back.h).toBeCloseTo(hsv.h, 4)
      expect(back.s).toBeCloseTo(hsv.s, 4)
      expect(back.v).toBeCloseTo(hsv.v, 4)
    }
  })

  it('normalizes whiteness and blackness that sum above 100', () => {
    const { h, s, v } = hwbToHsv({ h: 90, w: 80, b: 80 })
    expect(s).toBe(0)
    expect(v).toBeCloseTo(50, 4)
    expect(h).toBe(90)
  })
})

describe('oklch conversion', () => {
  it('places white near lightness 100 with no chroma', () => {
    const { l, c } = rgbToOklch({ r: 255, g: 255, b: 255 })
    expect(l).toBeCloseTo(100, 1)
    expect(c).toBeLessThan(0.001)
  })

  it('round-trips in-gamut anchors', () => {
    for (const rgb of ANCHORS) {
      expectRgbClose(oklchToRgb(rgbToOklch(rgb)), rgb)
    }
  })
})

describe('cie lab and lch conversion', () => {
  it('places white at L 100 and neutral a/b', () => {
    const lab = rgbToLab({ r: 255, g: 255, b: 255 })
    expect(lab.l).toBeCloseTo(100, 2)
    expect(lab.a).toBeCloseTo(0, 2)
    expect(lab.b).toBeCloseTo(0, 2)
  })

  it('round-trips anchors through lab and lch', () => {
    for (const rgb of ANCHORS) {
      expectRgbClose(labToRgb(rgbToLab(rgb)), rgb)
      expectRgbClose(lchToRgb(rgbToLch(rgb)), rgb)
    }
  })
})

describe('generatePalette', () => {
  it('returns the 11 tailwind steps in order', () => {
    const steps = generatePalette({ r: 18, g: 177, b: 177 }).map((s) => s.step)
    expect(steps).toEqual([
      50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
    ])
  })

  it('darkens monotonically as the step grows', () => {
    const shades = generatePalette({ r: 240, g: 12, b: 96 })
    const lums = shades.map((s) => rgbToOklch(s.rgb).l)
    for (let i = 1; i < lums.length; i++) {
      expect(lums[i]).toBeLessThan(lums[i - 1])
    }
  })

  it('keeps a gray base neutral across the scale', () => {
    for (const shade of generatePalette({ r: 128, g: 128, b: 128 })) {
      expect(shade.rgb.r).toBeCloseTo(shade.rgb.g, 0)
      expect(shade.rgb.g).toBeCloseTo(shade.rgb.b, 0)
    }
  })
})
