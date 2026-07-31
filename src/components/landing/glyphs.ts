import type { ToolGroup } from '@/lib/tools/registry'

export interface GlyphPath {
  d: string
  fill?: boolean
}

export interface Glyph {
  id: string
  label: string
  group: ToolGroup
  colorVar: string
  paths: Array<GlyphPath>
}

const VIEW = 24

function circle(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`
}

function roundRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  return [
    `M ${x + r} ${y}`,
    `H ${x + w - r}`,
    `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `V ${y + h - r}`,
    `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    'Z',
  ].join(' ')
}

export const GLYPHS: Array<Glyph> = [
  {
    id: 'formatters',
    label: 'Formatters',
    group: 'formatters',
    colorVar: '--tool-formatters',
    paths: [
      {
        d: 'M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1',
      },
      {
        d: 'M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1',
      },
    ],
  },
  {
    id: 'encoders',
    label: 'Encoders',
    group: 'encoders',
    colorVar: '--tool-encoders',
    paths: [
      {
        d: 'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z',
      },
      { d: circle(16.5, 7.5, 0.6), fill: true },
    ],
  },
  {
    id: 'generators',
    label: 'Generators',
    group: 'generators',
    colorVar: '--tool-generators',
    paths: [
      { d: roundRect(3, 3, 5, 5, 1) },
      { d: roundRect(16, 3, 5, 5, 1) },
      { d: roundRect(3, 16, 5, 5, 1) },
      { d: 'M21 16h-3a2 2 0 0 0-2 2v3' },
      { d: 'M12 7v3a2 2 0 0 1-2 2H7' },
      { d: circle(21, 21, 0.55), fill: true },
      { d: circle(3, 12, 0.55), fill: true },
      { d: circle(12, 3, 0.55), fill: true },
      { d: circle(12, 16, 0.55), fill: true },
      { d: circle(21, 12, 0.55), fill: true },
      { d: 'M16 12h1' },
      { d: 'M12 21v-1' },
    ],
  },
  {
    id: 'date',
    label: 'Date & Time',
    group: 'date',
    colorVar: '--tool-date',
    paths: [{ d: circle(12, 12, 10) }, { d: 'M12 6v6l4 2' }],
  },
  {
    id: 'text',
    label: 'Text',
    group: 'text',
    colorVar: '--tool-text',
    paths: [
      { d: 'M17 3v10' },
      { d: 'm12.67 5.5 8.66 5' },
      { d: 'm12.67 10.5 8.66-5' },
      {
        d: 'M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z',
      },
    ],
  },
  {
    id: 'color',
    label: 'Color',
    group: 'color',
    colorVar: '--tool-color',
    paths: [
      {
        d: 'M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z',
      },
      { d: circle(13.5, 6.5, 0.6), fill: true },
      { d: circle(17.5, 10.5, 0.6), fill: true },
      { d: circle(6.5, 12.5, 0.6), fill: true },
      { d: circle(8.5, 7.5, 0.6), fill: true },
    ],
  },
]

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rasterize(glyph: Glyph, size: number): Uint8ClampedArray | null {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const scale = size / VIEW
  ctx.scale(scale, scale)
  ctx.lineWidth = 1.9
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#fff'

  for (const path of glyph.paths) {
    const p = new Path2D(path.d)
    if (path.fill) ctx.fill(p)
    else ctx.stroke(p)
  }

  return ctx.getImageData(0, 0, size, size).data
}

/**
 * Turns a glyph into `count` normalised points in [-0.5, 0.5] on x/y.
 * Points are ordered by angle around the centre so that morphing between two
 * glyphs reads as a sweep rather than as noise.
 */
export function sampleGlyph(
  glyph: Glyph,
  count: number,
  size = 240,
): Array<[number, number]> {
  const rand = mulberry32(glyph.id.length * 9781 + count)
  const disc = () =>
    Array.from({ length: count }, () => {
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(rand()) * 0.42
      return [Math.cos(a) * r, Math.sin(a) * r] as [number, number]
    })

  const data = rasterize(glyph, size)
  if (!data) return disc()

  const hits: Array<[number, number]> = []
  const step = 2
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      if (data[(y * size + x) * 4 + 3] > 96) {
        hits.push([x / size - 0.5, 0.5 - y / size])
      }
    }
  }

  if (hits.length === 0) return disc()

  const jitter = 0.6 / size
  const out: Array<[number, number]> = []
  for (let i = 0; i < count; i++) {
    const [hx, hy] = hits[Math.floor(rand() * hits.length)]
    out.push([
      hx + (rand() - 0.5) * jitter * 6,
      hy + (rand() - 0.5) * jitter * 6,
    ])
  }

  out.sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]))
  return out
}
