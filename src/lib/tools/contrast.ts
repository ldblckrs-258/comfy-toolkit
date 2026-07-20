import type { Rgb, Rgba } from './colors'
import {
  clamp,
  clampRgb,
  hexToRgba,
  hslToHsv,
  hsvToRgb,
  oklchToRgb,
  parseNumbers,
  rgbToHex,
  rgbToOklch,
  roundRgb,
  srgbToLinear,
} from './colors'

export function relativeLuminance({ r, g, b }: Rgb): number {
  const lr = srgbToLinear(r / 255)
  const lg = srgbToLinear(g / 255)
  const lb = srgbToLinear(b / 255)
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const light = Math.max(la, lb)
  const dark = Math.min(la, lb)
  return (light + 0.05) / (dark + 0.05)
}

export interface ContrastAssessment {
  aaNormal: boolean
  aaaNormal: boolean
  aaLarge: boolean
  aaaLarge: boolean
  uiComponent: boolean
}

export function assess(ratio: number): ContrastAssessment {
  return {
    aaNormal: ratio >= 4.5,
    aaaNormal: ratio >= 7,
    aaLarge: ratio >= 3,
    aaaLarge: ratio >= 4.5,
    uiComponent: ratio >= 3,
  }
}

export function parseColor(input: string): Rgba | null {
  const s = input.trim()
  if (!s) return null
  const lower = s.toLowerCase()
  if (lower.startsWith('rgb')) {
    const n = parseNumbers(s)
    if (n.length < 3) return null
    return {
      rgb: clampRgb({ r: n[0], g: n[1], b: n[2] }),
      a: alphaAt(n, 3),
    }
  }
  if (lower.startsWith('hsl')) {
    const n = parseNumbers(s)
    if (n.length < 3) return null
    return {
      rgb: clampRgb(hsvToRgb(hslToHsv({ h: n[0], s: n[1], l: n[2] }))),
      a: alphaAt(n, 3),
    }
  }
  return hexToRgba(s)
}

function alphaAt(numbers: Array<number>, index: number): number {
  if (numbers.length <= index) return 1
  const raw = numbers[index]
  return clamp(raw > 1 ? raw / 100 : raw, 0, 1)
}

export function composite(fg: Rgba, bg: Rgb): Rgb {
  const a = fg.a
  return {
    r: fg.rgb.r * a + bg.r * (1 - a),
    g: fg.rgb.g * a + bg.g * (1 - a),
    b: fg.rgb.b * a + bg.b * (1 - a),
  }
}

export interface Suggestion {
  rgb: Rgb
  hex: string
}

export function suggestPassing(
  fg: Rgb,
  bg: Rgb,
  target = 4.5,
): Suggestion | null {
  const { c, h, l: origL } = rgbToOklch(fg)
  let best: { rgb: Rgb; dist: number } | null = null
  for (let l = 0; l <= 100; l += 0.5) {
    const rgb = clampRgb(oklchToRgb({ l, c, h }))
    if (contrastRatio(rgb, bg) >= target) {
      const dist = Math.abs(l - origL)
      if (!best || dist < best.dist) best = { rgb, dist }
    }
  }
  if (!best) return null
  return { rgb: roundRgb(best.rgb), hex: rgbToHex(best.rgb) }
}
