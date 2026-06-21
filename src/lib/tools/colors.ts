export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsl {
  h: number
  s: number
  l: number
}

export interface Hsv {
  h: number
  s: number
  v: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function parseNumbers(raw: string): Array<number> {
  return (raw.match(/-?\d*\.?\d+/g) ?? []).map(Number)
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const S = s / 100
  const V = v / 100
  const c = V * S
  const hh = ((((h % 360) + 360) % 360) / 60) % 6
  const x = c * (1 - Math.abs((hh % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hh < 1) [r, g] = [c, x]
  else if (hh < 2) [r, g] = [x, c]
  else if (hh < 3) [g, b] = [c, x]
  else if (hh < 4) [g, b] = [x, c]
  else if (hh < 5) [r, b] = [x, c]
  else [r, b] = [c, x]
  const m = V - c
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6
    else if (max === G) h = (B - R) / d + 2
    else h = (R - G) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  return { h, s: s * 100, v: max * 100 }
}

export function hsvToHsl({ h, s, v }: Hsv): Hsl {
  const S = s / 100
  const V = v / 100
  const l = V * (1 - S / 2)
  const denom = Math.min(l, 1 - l)
  const sl = denom === 0 ? 0 : (V - l) / denom
  return { h, s: sl * 100, l: l * 100 }
}

export function hslToHsv({ h, s, l }: Hsl): Hsv {
  const S = s / 100
  const L = l / 100
  const v = L + S * Math.min(L, 1 - L)
  const sv = v === 0 ? 0 : 2 * (1 - L / v)
  return { h, s: sv * 100, v: v * 100 }
}

export function rgbToHsvKeepHue(rgb: Rgb, prev: Hsv): Hsv {
  const next = rgbToHsv(rgb)
  if (next.v === 0) {
    next.h = prev.h
    next.s = prev.s
  } else if (next.s === 0) {
    next.h = prev.h
  }
  return next
}

function channelHex(value: number): string {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, '0')
}

export function rgbToHex(rgb: Rgb, alpha = 1): string {
  const base = `#${channelHex(rgb.r)}${channelHex(rgb.g)}${channelHex(rgb.b)}`
  return alpha < 1 ? `${base}${channelHex(alpha * 255)}` : base
}

export interface Rgba {
  rgb: Rgb
  a: number
}

export function hexToRgba(input: string): Rgba | null {
  const hex = input.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]+$/.test(hex)) return null

  let r: number
  let g: number
  let b: number
  let a = 1
  if (hex.length === 3 || hex.length === 4) {
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
    if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255
  } else if (hex.length === 6 || hex.length === 8) {
    r = parseInt(hex.slice(0, 2), 16)
    g = parseInt(hex.slice(2, 4), 16)
    b = parseInt(hex.slice(4, 6), 16)
    if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255
  } else {
    return null
  }
  return { rgb: { r, g, b }, a }
}

export function roundRgb({ r, g, b }: Rgb): Rgb {
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
}

export function roundHsl({ h, s, l }: Hsl): Hsl {
  return { h: Math.round(h), s: Math.round(s), l: Math.round(l) }
}

export function roundHsv({ h, s, v }: Hsv): Hsv {
  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) }
}

export function formatRgb(rgb: Rgb, alpha = 1): string {
  const { r, g, b } = roundRgb(rgb)
  return alpha < 1
    ? `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(2))})`
    : `rgb(${r}, ${g}, ${b})`
}

export function formatHsl(hsl: Hsl, alpha = 1): string {
  const { h, s, l } = roundHsl(hsl)
  return alpha < 1
    ? `hsla(${h}, ${s}%, ${l}%, ${Number(alpha.toFixed(2))})`
    : `hsl(${h}, ${s}%, ${l}%)`
}

export function formatHsv(hsv: Hsv): string {
  const { h, s, v } = roundHsv(hsv)
  return `hsv(${h}, ${s}%, ${v}%)`
}

export function clampRgb({ r, g, b }: Rgb): Rgb {
  return {
    r: clamp(r, 0, 255),
    g: clamp(g, 0, 255),
    b: clamp(b, 0, 255),
  }
}

export interface Cmyk {
  c: number
  m: number
  y: number
  k: number
}

export function rgbToCmyk({ r, g, b }: Rgb): Cmyk {
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const k = 1 - Math.max(R, G, B)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  return {
    c: ((1 - R - k) / (1 - k)) * 100,
    m: ((1 - G - k) / (1 - k)) * 100,
    y: ((1 - B - k) / (1 - k)) * 100,
    k: k * 100,
  }
}

export function cmykToRgb({ c, m, y, k }: Cmyk): Rgb {
  const K = k / 100
  return {
    r: 255 * (1 - c / 100) * (1 - K),
    g: 255 * (1 - m / 100) * (1 - K),
    b: 255 * (1 - y / 100) * (1 - K),
  }
}

export interface Hwb {
  h: number
  w: number
  b: number
}

export function hsvToHwb({ h, s, v }: Hsv): Hwb {
  return { h, w: ((1 - s / 100) * v), b: 100 - v }
}

export function hwbToHsv({ h, w, b }: Hwb): Hsv {
  let W = w
  let B = b
  const sum = W + B
  if (sum > 100) {
    W = (W / sum) * 100
    B = (B / sum) * 100
  }
  const v = 100 - B
  const s = v === 0 ? 0 : (1 - W / v) * 100
  return { h, s, v }
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function rgbToLinear({ r, g, b }: Rgb): [number, number, number] {
  return [srgbToLinear(r / 255), srgbToLinear(g / 255), srgbToLinear(b / 255)]
}

function linearToRgb(lr: number, lg: number, lb: number): Rgb {
  return {
    r: linearToSrgb(lr) * 255,
    g: linearToSrgb(lg) * 255,
    b: linearToSrgb(lb) * 255,
  }
}

export interface Oklch {
  l: number
  c: number
  h: number
}

export function rgbToOklch(rgb: Rgb): Oklch {
  const [lr, lg, lb] = rgbToLinear(rgb)
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  const c = Math.sqrt(A * A + B * B)
  let h = (Math.atan2(B, A) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: L * 100, c, h }
}

export function oklchToRgb({ l, c, h }: Oklch): Rgb {
  const L = l / 100
  const hr = (h * Math.PI) / 180
  const A = c * Math.cos(hr)
  const B = c * Math.sin(hr)
  const l_ = L + 0.3963377774 * A + 0.2158037573 * B
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B
  const s_ = L - 0.0894841775 * A - 1.291485548 * B
  const lc = l_ * l_ * l_
  const mc = m_ * m_ * m_
  const sc = s_ * s_ * s_
  const lr = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc
  const lg = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc
  const lb = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc
  return linearToRgb(lr, lg, lb)
}

const D65 = { x: 0.95047, y: 1, z: 1.08883 }

export interface Lab {
  l: number
  a: number
  b: number
}

export interface Lch {
  l: number
  c: number
  h: number
}

function labF(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
}

function labFInv(t: number): number {
  const t3 = t * t * t
  return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787
}

export function rgbToLab(rgb: Rgb): Lab {
  const [lr, lg, lb] = rgbToLinear(rgb)
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / D65.x
  const y = (0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb) / D65.y
  const z = (0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb) / D65.z
  const fx = labF(x)
  const fy = labF(y)
  const fz = labF(z)
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

export function labToRgb({ l, a, b }: Lab): Rgb {
  const fy = (l + 16) / 116
  const fx = fy + a / 500
  const fz = fy - b / 200
  const x = labFInv(fx) * D65.x
  const y = labFInv(fy) * D65.y
  const z = labFInv(fz) * D65.z
  const lr = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z
  const lg = -0.969266 * x + 1.8760108 * y + 0.041556 * z
  const lb = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z
  return linearToRgb(lr, lg, lb)
}

export function rgbToLch(rgb: Rgb): Lch {
  const { l, a, b } = rgbToLab(rgb)
  const c = Math.sqrt(a * a + b * b)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) h += 360
  return { l, c, h }
}

export function lchToRgb({ l, c, h }: Lch): Rgb {
  const hr = (h * Math.PI) / 180
  return labToRgb({ l, a: c * Math.cos(hr), b: c * Math.sin(hr) })
}

function round(value: number, decimals = 0): number {
  return Number(value.toFixed(decimals))
}

export function roundCmyk({ c, m, y, k }: Cmyk): Cmyk {
  return { c: round(c), m: round(m), y: round(y), k: round(k) }
}

export function roundHwb({ h, w, b }: Hwb): Hwb {
  return { h: round(h), w: round(w), b: round(b) }
}

export function roundOklch({ l, c, h }: Oklch): Oklch {
  return { l: round(l, 1), c: round(c, 3), h: round(h) }
}

export function roundLab({ l, a, b }: Lab): Lab {
  return { l: round(l), a: round(a), b: round(b) }
}

export function roundLch({ l, c, h }: Lch): Lch {
  return { l: round(l), c: round(c), h: round(h) }
}

export function formatCmyk(cmyk: Cmyk): string {
  const { c, m, y, k } = roundCmyk(cmyk)
  return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`
}

export function formatHwb(hwb: Hwb, alpha = 1): string {
  const { h, w, b } = roundHwb(hwb)
  const suffix = alpha < 1 ? ` / ${Number(alpha.toFixed(2))}` : ''
  return `hwb(${h} ${w}% ${b}%${suffix})`
}

export function formatOklch(oklch: Oklch, alpha = 1): string {
  const { l, c, h } = roundOklch(oklch)
  const suffix = alpha < 1 ? ` / ${Number(alpha.toFixed(2))}` : ''
  return `oklch(${l}% ${c} ${h}${suffix})`
}

export function formatLab(lab: Lab, alpha = 1): string {
  const { l, a, b } = roundLab(lab)
  const suffix = alpha < 1 ? ` / ${Number(alpha.toFixed(2))}` : ''
  return `lab(${l}% ${a} ${b}${suffix})`
}

export function formatLch(lch: Lch, alpha = 1): string {
  const { l, c, h } = roundLch(lch)
  const suffix = alpha < 1 ? ` / ${Number(alpha.toFixed(2))}` : ''
  return `lch(${l}% ${c} ${h}${suffix})`
}

export interface Shade {
  step: number
  rgb: Rgb
}

const SHADE_LIGHTNESS: Array<[number, number]> = [
  [50, 97],
  [100, 93],
  [200, 86],
  [300, 77],
  [400, 68],
  [500, 59],
  [600, 51],
  [700, 43],
  [800, 36],
  [900, 30],
  [950, 22],
]

function paletteChromaFactor(lightness: number): number {
  if (lightness >= 90) return 0.5
  if (lightness >= 80) return 0.78
  if (lightness <= 25) return 0.82
  return 1
}

export function generatePalette(base: Rgb): Array<Shade> {
  const { c, h } = rgbToOklch(base)
  return SHADE_LIGHTNESS.map(([step, l]) => ({
    step,
    rgb: clampRgb(oklchToRgb({ l, c: c * paletteChromaFactor(l), h })),
  }))
}
