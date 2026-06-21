import type { Hsv } from './colors'
import {
  formatHsl,
  formatLab,
  formatLch,
  formatOklch,
  formatRgb,
  hexToRgba,
  hslToHsv,
  hsvToHsl,
  hsvToRgb,
  labToRgb,
  lchToRgb,
  oklchToRgb,
  parseNumbers,
  rgbToHex,
  rgbToHsv,
  rgbToLab,
  rgbToLch,
  rgbToOklch,
  roundRgb,
} from './colors'

export type GradientType = 'linear' | 'radial' | 'conic'

export type OutputFormat = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'lab' | 'lch'

export interface GradientStop {
  id: string
  hsv: Hsv
  a: number
  pos: number
}

export interface GradientState {
  type: GradientType
  angle: number
  radialShape: 'circle' | 'ellipse'
  center: { x: number; y: number }
  stops: Array<GradientStop>
  format: OutputFormat
}

export function makeStopId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export const DEFAULT_STATE: GradientState = {
  type: 'linear',
  angle: 90,
  radialShape: 'circle',
  center: { x: 50, y: 50 },
  stops: [
    { id: makeStopId(), hsv: rgbToHsv({ r: 59, g: 130, b: 246 }), a: 1, pos: 0 },
    {
      id: makeStopId(),
      hsv: rgbToHsv({ r: 168, g: 85, b: 247 }),
      a: 1,
      pos: 100,
    },
  ],
  format: 'hex',
}

function round(value: number): number {
  return Math.round(value)
}

export function formatStopColor(
  format: OutputFormat,
  hsv: Hsv,
  a = 1,
): string {
  const rgb = roundRgb(hsvToRgb(hsv))
  switch (format) {
    case 'hex':
      return rgbToHex(rgb, a)
    case 'rgb':
      return formatRgb(rgb, a)
    case 'hsl':
      return formatHsl(hsvToHsl(hsv), a)
    case 'oklch':
      return formatOklch(rgbToOklch(rgb), a)
    case 'lab':
      return formatLab(rgbToLab(rgb), a)
    case 'lch':
      return formatLch(rgbToLch(rgb), a)
  }
}

export function sortStops(stops: Array<GradientStop>): Array<GradientStop> {
  return [...stops].sort((a, b) => a.pos - b.pos)
}

function stopList(state: GradientState): string {
  return sortStops(state.stops)
    .map((s) => `${formatStopColor(state.format, s.hsv, s.a)} ${round(s.pos)}%`)
    .join(', ')
}

export function gradientCss(state: GradientState): string {
  const stops = stopList(state)
  const cx = round(state.center.x)
  const cy = round(state.center.y)
  switch (state.type) {
    case 'linear':
      return `linear-gradient(${round(state.angle)}deg, ${stops})`
    case 'radial':
      return `radial-gradient(${state.radialShape} at ${cx}% ${cy}%, ${stops})`
    case 'conic':
      return `conic-gradient(from ${round(state.angle)}deg at ${cx}% ${cy}%, ${stops})`
  }
}

export type ExportTarget = 'css' | 'scss' | 'tw4' | 'twutil' | 'svg'

export const TARGETS: Array<{ id: ExportTarget; label: string; lang: string }> =
  [
    { id: 'css', label: 'CSS', lang: 'css' },
    { id: 'scss', label: 'SCSS', lang: 'scss' },
    { id: 'tw4', label: 'Tailwind v4', lang: 'html' },
    { id: 'twutil', label: 'Tailwind util', lang: 'html' },
    { id: 'svg', label: 'SVG', lang: 'html' },
  ]

export interface ExportResult {
  code: string
  approximate: boolean
  note?: string
}

const DIRECTIONS: Array<{ deg: number; util: string }> = [
  { deg: 0, util: 'bg-linear-to-t' },
  { deg: 45, util: 'bg-linear-to-tr' },
  { deg: 90, util: 'bg-linear-to-r' },
  { deg: 135, util: 'bg-linear-to-br' },
  { deg: 180, util: 'bg-linear-to-b' },
  { deg: 225, util: 'bg-linear-to-bl' },
  { deg: 270, util: 'bg-linear-to-l' },
  { deg: 315, util: 'bg-linear-to-tl' },
]

function normAngle(a: number): number {
  return ((a % 360) + 360) % 360
}

function snapDirection(angle: number): { util: string; exact: boolean } {
  const a = normAngle(angle)
  let best = DIRECTIONS[0]
  let bestDist = 360
  for (const d of DIRECTIONS) {
    const diff = Math.abs(((a - d.deg + 540) % 360) - 180)
    if (diff < bestDist) {
      bestDist = diff
      best = d
    }
  }
  return { util: best.util, exact: bestDist < 0.5 }
}

function twColorClass(
  prefix: string,
  format: OutputFormat,
  stop: GradientStop,
): string {
  return `${prefix}-[${formatStopColor(format, stop.hsv, stop.a).replace(/ /g, '_')}]`
}

function buildTwUtil(state: GradientState): ExportResult {
  const sorted = sortStops(state.stops)
  const reasons: Array<string> = []
  if (state.type !== 'linear')
    reasons.push(`${state.type} not supported (linear only)`)
  if (sorted.length > 3) reasons.push(`${sorted.length} stops collapsed to 3`)
  const dir = snapDirection(state.angle)
  if (state.type === 'linear' && !dir.exact)
    reasons.push(`angle ${round(state.angle)}° snapped to nearest direction`)
  const customPos = sorted.some((s, i) => {
    const expected = (i / (sorted.length - 1)) * 100
    return Math.abs(s.pos - expected) > 0.5
  })
  if (customPos) reasons.push('custom stop positions dropped')

  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const mid = sorted[Math.floor(sorted.length / 2)]
  const parts = [dir.util, twColorClass('from', state.format, first)]
  if (sorted.length >= 3) parts.push(twColorClass('via', state.format, mid))
  parts.push(twColorClass('to', state.format, last))
  const className = parts.join(' ')

  if (reasons.length === 0) return { code: className, approximate: false }
  const note = `approximate: ${reasons.join('; ')}`
  return { code: `<!-- ${note} -->\n${className}`, approximate: true, note }
}

function svgStops(state: GradientState): string {
  return sortStops(state.stops)
    .map((s) => {
      const hex = rgbToHex(roundRgb(hsvToRgb(s.hsv)))
      const op = Number(s.a.toFixed(2))
      return `      <stop offset="${round(s.pos)}%" stop-color="${hex}" stop-opacity="${op}" />`
    })
    .join('\n')
}

function buildSvg(state: GradientState): ExportResult {
  const stops = svgStops(state)
  const approximate = state.type === 'conic'
  const note = approximate
    ? 'approximate: SVG has no conic gradient; rendered as linear'
    : undefined

  let defs: string
  if (state.type === 'radial') {
    defs = `    <radialGradient id="grad" cx="${round(state.center.x)}%" cy="${round(state.center.y)}%" r="50%">\n${stops}\n    </radialGradient>`
  } else {
    // SVG's default linearGradient runs left→right, matching CSS 90deg, so the
    // rotation is the CSS angle minus 90.
    const svgAngle = normAngle(round(state.angle) - 90)
    defs = `    <linearGradient id="grad" gradientTransform="rotate(${svgAngle} 0.5 0.5)">\n${stops}\n    </linearGradient>`
  }

  const code =
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n` +
    `  <defs>\n${defs}\n  </defs>\n` +
    `  <rect width="100" height="100" fill="url(#grad)" />\n` +
    `</svg>`

  if (approximate) return { code: `<!-- ${note} -->\n${code}`, approximate, note }
  return { code, approximate }
}

export function buildExport(
  target: ExportTarget,
  state: GradientState,
): ExportResult {
  switch (target) {
    case 'css':
      return {
        code: `.gradient {\n  background: ${gradientCss(state)};\n}`,
        approximate: false,
      }
    case 'scss':
      return { code: `$gradient: ${gradientCss(state)};`, approximate: false }
    case 'tw4':
      return {
        code: `bg-[${gradientCss(state).replace(/ /g, '_')}]`,
        approximate: false,
      }
    case 'twutil':
      return buildTwUtil(state)
    case 'svg':
      return buildSvg(state)
  }
}

function splitTopLevel(input: string): Array<string> {
  const parts: Array<string> = []
  let depth = 0
  let current = ''
  for (const ch of input) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function parseAnyColor(input: string): { hsv: Hsv; a: number } | null {
  const str = input.trim()
  const fnMatch = str.match(/^([a-z]+)\s*\(([^)]*)\)$/i)
  if (!fnMatch) {
    const parsed = hexToRgba(str)
    return parsed ? { hsv: rgbToHsv(parsed.rgb), a: parsed.a } : null
  }
  const fn = fnMatch[1].toLowerCase()
  const nums = parseNumbers(fnMatch[2])
  if (nums.length < 3) return null
  const a = nums[3] ?? 1
  switch (fn) {
    case 'rgb':
    case 'rgba':
      return { hsv: rgbToHsv({ r: nums[0], g: nums[1], b: nums[2] }), a }
    case 'hsl':
    case 'hsla':
      return { hsv: hslToHsv({ h: nums[0], s: nums[1], l: nums[2] }), a }
    case 'oklch':
      return {
        hsv: rgbToHsv(oklchToRgb({ l: nums[0], c: nums[1], h: nums[2] })),
        a,
      }
    case 'lab':
      return {
        hsv: rgbToHsv(labToRgb({ l: nums[0], a: nums[1], b: nums[2] })),
        a,
      }
    case 'lch':
      return {
        hsv: rgbToHsv(lchToRgb({ l: nums[0], c: nums[1], h: nums[2] })),
        a,
      }
    default:
      return null
  }
}

function parseStopArg(
  arg: string,
): { hsv: Hsv; a: number; pos?: number } | null {
  const trimmed = arg.trim()
  const posMatch = trimmed.match(/\s+(-?\d*\.?\d+)%\s*$/)
  let colorPart = trimmed
  let pos: number | undefined
  if (posMatch?.index !== undefined) {
    pos = Number(posMatch[1])
    colorPart = trimmed.slice(0, posMatch.index).trim()
  }
  const color = parseAnyColor(colorPart)
  return color ? { hsv: color.hsv, a: color.a, pos } : null
}

function parseLinearAngle(token: string): number | null {
  const t = token.trim().toLowerCase()
  const degMatch = t.match(/(-?\d*\.?\d+)deg/)
  if (degMatch) return Number(degMatch[1])
  const toMap: Record<string, number> = {
    'to top': 0,
    'to top right': 45,
    'to right top': 45,
    'to right': 90,
    'to bottom right': 135,
    'to right bottom': 135,
    'to bottom': 180,
    'to bottom left': 225,
    'to left bottom': 225,
    'to left': 270,
    'to top left': 315,
    'to left top': 315,
  }
  return toMap[t] ?? null
}

function parseGeometry(token: string): {
  shape?: 'circle' | 'ellipse'
  center?: { x: number; y: number }
  angle?: number
} {
  const t = token.trim().toLowerCase()
  const result: {
    shape?: 'circle' | 'ellipse'
    center?: { x: number; y: number }
    angle?: number
  } = {}
  if (/\bcircle\b/.test(t)) result.shape = 'circle'
  else if (/\bellipse\b/.test(t)) result.shape = 'ellipse'
  const fromMatch = t.match(/from\s+(-?\d*\.?\d+)deg/)
  if (fromMatch) result.angle = Number(fromMatch[1])
  const atMatch = t.match(/at\s+(-?\d*\.?\d+)%\s+(-?\d*\.?\d+)%/)
  if (atMatch) result.center = { x: Number(atMatch[1]), y: Number(atMatch[2]) }
  return result
}

export function parseGradient(input: string): GradientState | null {
  const cleaned = input
    .trim()
    .replace(/^background(-image)?\s*:\s*/i, '')
    .replace(/;$/, '')
    .trim()
  const match = cleaned.match(/^(linear|radial|conic)-gradient\((.*)\)$/is)
  if (!match) return null
  const type = match[1].toLowerCase() as GradientType
  const args = splitTopLevel(match[2])
  if (args.length === 0) return null

  let angle = type === 'linear' ? 180 : 0
  let radialShape: 'circle' | 'ellipse' = 'ellipse'
  let center = { x: 50, y: 50 }
  let stopArgs = args

  if (parseStopArg(args[0]) === null) {
    stopArgs = args.slice(1)
    if (type === 'linear') {
      const deg = parseLinearAngle(args[0])
      if (deg !== null) angle = deg
    } else {
      const geo = parseGeometry(args[0])
      if (geo.shape) radialShape = geo.shape
      if (geo.center) center = geo.center
      if (geo.angle !== undefined) angle = geo.angle
    }
  }

  const stops: Array<GradientStop> = []
  for (let i = 0; i < stopArgs.length; i++) {
    const parsed = parseStopArg(stopArgs[i])
    if (!parsed) return null
    stops.push({
      id: makeStopId(),
      hsv: parsed.hsv,
      a: parsed.a,
      pos:
        parsed.pos ??
        (stopArgs.length === 1 ? 0 : (i / (stopArgs.length - 1)) * 100),
    })
  }
  if (stops.length < 2) return null

  return { type, angle, radialShape, center, stops, format: 'hex' }
}
