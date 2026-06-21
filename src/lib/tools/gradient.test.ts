import { describe, expect, it } from 'vitest'
import type { Rgb } from './colors'
import { hsvToRgb, rgbToHsv, roundRgb } from './colors'
import type { GradientState, GradientStop, OutputFormat } from './gradient'
import {
  DEFAULT_STATE,
  buildExport,
  formatStopColor,
  gradientCss,
  makeStopId,
  parseGradient,
  sortStops,
} from './gradient'

function stop(rgb: Rgb, pos: number, a = 1): GradientStop {
  return { id: makeStopId(), hsv: rgbToHsv(rgb), a, pos }
}

function state(over: Partial<GradientState> = {}): GradientState {
  return {
    type: 'linear',
    angle: 90,
    radialShape: 'circle',
    center: { x: 50, y: 50 },
    stops: [
      stop({ r: 255, g: 0, b: 0 }, 0),
      stop({ r: 0, g: 0, b: 255 }, 100),
    ],
    format: 'hex',
    ...over,
  }
}

function expectStopRgbClose(
  s: GradientState,
  index: number,
  expected: Rgb,
  tol = 2,
) {
  const rgb = roundRgb(hsvToRgb(s.stops[index].hsv))
  expect(Math.abs(rgb.r - expected.r)).toBeLessThanOrEqual(tol)
  expect(Math.abs(rgb.g - expected.g)).toBeLessThanOrEqual(tol)
  expect(Math.abs(rgb.b - expected.b)).toBeLessThanOrEqual(tol)
}

describe('gradientCss', () => {
  it('renders a linear gradient with angle and ordered stops', () => {
    expect(gradientCss(DEFAULT_STATE)).toBe(
      'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)',
    )
  })

  it('renders a radial gradient with shape and center', () => {
    expect(gradientCss(state({ type: 'radial', radialShape: 'circle' }))).toBe(
      'radial-gradient(circle at 50% 50%, #ff0000 0%, #0000ff 100%)',
    )
  })

  it('renders a conic gradient with from-angle and center', () => {
    expect(gradientCss(state({ type: 'conic', angle: 45 }))).toBe(
      'conic-gradient(from 45deg at 50% 50%, #ff0000 0%, #0000ff 100%)',
    )
  })

  it('emits stops in ascending position order without mutating input', () => {
    const stops = [
      stop({ r: 0, g: 0, b: 255 }, 100),
      stop({ r: 255, g: 0, b: 0 }, 0),
    ]
    const css = gradientCss(state({ stops }))
    expect(css).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)')
    expect(stops[0].pos).toBe(100)
  })
})

describe('formatStopColor', () => {
  const white = rgbToHsv({ r: 255, g: 255, b: 255 })
  const black = rgbToHsv({ r: 0, g: 0, b: 0 })

  it('formats each output format', () => {
    expect(formatStopColor('hex', black)).toBe('#000000')
    expect(formatStopColor('rgb', black)).toBe('rgb(0, 0, 0)')
    expect(formatStopColor('hsl', black)).toBe('hsl(0, 0%, 0%)')
    expect(formatStopColor('oklch', white)).toMatch(/^oklch\(/)
    expect(formatStopColor('lab', white)).toMatch(/^lab\(/)
    expect(formatStopColor('lch', white)).toMatch(/^lch\(/)
  })

  it('renders alpha per format', () => {
    expect(formatStopColor('hex', white, 0.5)).toBe('#ffffff80')
    expect(formatStopColor('rgb', black, 0.5)).toBe('rgba(0, 0, 0, 0.5)')
    expect(formatStopColor('oklch', white, 0.5)).toMatch(/\/ 0\.5\)$/)
  })
})

describe('sortStops', () => {
  it('returns a new ascending array', () => {
    const input = [stop({ r: 0, g: 0, b: 0 }, 80), stop({ r: 0, g: 0, b: 0 }, 20)]
    const out = sortStops(input)
    expect(out.map((s) => s.pos)).toEqual([20, 80])
    expect(input.map((s) => s.pos)).toEqual([80, 20])
  })
})

describe('buildExport', () => {
  it('builds CSS and SCSS', () => {
    expect(buildExport('css', state()).code).toBe(
      '.gradient {\n  background: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);\n}',
    )
    expect(buildExport('scss', state()).code).toBe(
      '$gradient: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);',
    )
  })

  it('builds Tailwind v4 arbitrary value with spaces escaped', () => {
    const { code, approximate } = buildExport('tw4', state())
    expect(code).toBe('bg-[linear-gradient(90deg,_#ff0000_0%,_#0000ff_100%)]')
    expect(code).not.toContain(' ')
    expect(approximate).toBe(false)
  })

  it('builds representable Tailwind utility (2 + 3 stops)', () => {
    const two = buildExport('twutil', state())
    expect(two.approximate).toBe(false)
    expect(two.code).toBe('bg-linear-to-r from-[#ff0000] to-[#0000ff]')

    const three = buildExport(
      'twutil',
      state({
        stops: [
          stop({ r: 255, g: 0, b: 0 }, 0),
          stop({ r: 0, g: 255, b: 0 }, 50),
          stop({ r: 0, g: 0, b: 255 }, 100),
        ],
      }),
    )
    expect(three.approximate).toBe(false)
    expect(three.code).toContain('via-[#00ff00]')
  })

  it('marks Tailwind utility approximate for radial / extra stops / odd angle', () => {
    expect(buildExport('twutil', state({ type: 'radial' })).note).toContain(
      'not supported',
    )
    const four = buildExport(
      'twutil',
      state({
        stops: [
          stop({ r: 0, g: 0, b: 0 }, 0),
          stop({ r: 0, g: 0, b: 0 }, 33),
          stop({ r: 0, g: 0, b: 0 }, 66),
          stop({ r: 0, g: 0, b: 0 }, 100),
        ],
      }),
    )
    expect(four.approximate).toBe(true)
    expect(four.note).toContain('collapsed')
    const odd = buildExport('twutil', state({ angle: 30 }))
    expect(odd.approximate).toBe(true)
    expect(odd.note).toContain('snapped')
  })

  it('builds SVG for linear and radial, approximates conic', () => {
    const lin = buildExport('svg', state())
    expect(lin.approximate).toBe(false)
    expect(lin.code).toContain('<linearGradient')
    expect(lin.code).toContain('<stop offset="0%" stop-color="#ff0000"')
    // SVG default direction matches CSS 90deg, so rotation = angle - 90.
    expect(lin.code).toContain('rotate(0 0.5 0.5)')
    expect(buildExport('svg', state({ angle: 0 })).code).toContain(
      'rotate(270 0.5 0.5)',
    )

    expect(buildExport('svg', state({ type: 'radial' })).code).toContain(
      '<radialGradient',
    )

    const conic = buildExport('svg', state({ type: 'conic' }))
    expect(conic.approximate).toBe(true)
    expect(conic.note).toContain('no conic')
  })
})

describe('parseGradient', () => {
  it('round-trips its own output for all 3 types', () => {
    for (const type of ['linear', 'radial', 'conic'] as const) {
      const original = state({ type, angle: 135 })
      const parsed = parseGradient(gradientCss(original))
      expect(parsed).not.toBeNull()
      expect(parsed!.type).toBe(type)
      expect(parsed!.stops).toHaveLength(2)
      expectStopRgbClose(parsed!, 0, { r: 255, g: 0, b: 0 })
      expectStopRgbClose(parsed!, 1, { r: 0, g: 0, b: 255 })
    }
  })

  it('round-trips every output color format', () => {
    // Muted mid-tones: gamut-corner primaries lose precision through
    // integer-rounded lab/lch display strings, which is expected, not a bug.
    const c0: Rgb = { r: 100, g: 150, b: 200 }
    const c1: Rgb = { r: 200, g: 120, b: 60 }
    const base = state({ stops: [stop(c0, 0), stop(c1, 100)] })
    for (const format of [
      'hex',
      'rgb',
      'hsl',
      'oklch',
      'lab',
      'lch',
    ] as OutputFormat[]) {
      const parsed = parseGradient(gradientCss({ ...base, format }))
      expect(parsed, format).not.toBeNull()
      expectStopRgbClose(parsed!, 0, c0, 5)
      expectStopRgbClose(parsed!, 1, c1, 5)
    }
  })

  it('parses angle keywords and rgb() stops', () => {
    const parsed = parseGradient(
      'linear-gradient(to right, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)',
    )
    expect(parsed).not.toBeNull()
    expect(parsed!.angle).toBe(90)
    expectStopRgbClose(parsed!, 0, { r: 255, g: 0, b: 0 })
  })

  it('tolerates a background: prefix and trailing semicolon', () => {
    const parsed = parseGradient(
      'background: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);',
    )
    expect(parsed).not.toBeNull()
    expect(parsed!.type).toBe('linear')
  })

  it('parses alpha in stop colors', () => {
    const parsed = parseGradient(
      'linear-gradient(90deg, rgba(255, 0, 0, 0.5) 0%, #0000ff 100%)',
    )
    expect(parsed).not.toBeNull()
    expect(parsed!.stops[0].a).toBeCloseTo(0.5, 2)
  })

  it('returns null on malformed input without throwing', () => {
    expect(parseGradient('')).toBeNull()
    expect(parseGradient('not a gradient')).toBeNull()
    expect(parseGradient('linear-gradient(#fff)')).toBeNull()
    expect(parseGradient('linear-gradient()')).toBeNull()
  })
})
