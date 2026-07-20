import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import type { ApplyColor, SpaceId } from '@/components/tools/color-space'
import {
  ChannelSlider,
  SPACES,
  SpaceCard,
  buildSpaceChannels,
  formatSpace,
  parseSpaceInput,
} from '@/components/tools/color-space'
import { ColorPicker } from '@/components/ui/color-picker'
import { buildSeo, ogUrl } from '@/lib/seo'
import { apcaContrast } from '@/lib/tools/apca'
import type { Hsv, Rgb, Shade } from '@/lib/tools/colors'
import {
  generatePalette,
  hexToRgba,
  hsvToRgb,
  rgbToHex,
  rgbToHsv,
  rgbToHsvKeepHue,
  rgbToOklch,
  roundRgb,
} from '@/lib/tools/colors'
import { contrastRatio } from '@/lib/tools/contrast'
import { requireTool } from '@/lib/tools/registry'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Check, Copy, Grid3x3, Hash } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('palette')

const STORAGE_KEY = 'comfy-toolkit:palette'
const DEFAULT_HSV: Hsv = rgbToHsv({ r: 59, g: 130, b: 246 })

type FormatId = SpaceId | 'hex'

const FORMATS: Array<{ id: FormatId; label: string; icon: LucideIcon }> = [
  { id: 'hex', label: 'HEX', icon: Hash },
  ...SPACES,
]

function formatColor(format: FormatId, rgb: Rgb): string {
  return format === 'hex' ? rgbToHex(rgb) : formatSpace(format, rgb)
}

type TargetId = 'tw3' | 'tw4' | 'css' | 'scss' | 'figma' | 'w3c'

const TARGETS: Array<{ id: TargetId; label: string; lang: string }> = [
  { id: 'tw3', label: 'Tailwind v3', lang: 'jsx' },
  { id: 'tw4', label: 'Tailwind v4', lang: 'css' },
  { id: 'css', label: 'CSS', lang: 'css' },
  { id: 'scss', label: 'SCSS', lang: 'scss' },
  { id: 'figma', label: 'Figma Tokens', lang: 'json' },
  { id: 'w3c', label: 'W3C Tokens', lang: 'json' },
]

const EXPORT_NAME = 'primary'

function exportValue(target: TargetId, format: FormatId, rgb: Rgb): string {
  // JSON token targets, hex, and non-CSS spaces fall back to hex for portability.
  if (target === 'figma' || target === 'w3c') return rgbToHex(rgb)
  if (format === 'hex' || format === 'cmyk' || format === 'hsv')
    return rgbToHex(rgb)
  return formatSpace(format, rgb)
}

function buildExport(
  target: TargetId,
  format: FormatId,
  palette: Array<Shade>,
): string {
  const value = (rgb: Rgb) => exportValue(target, format, rgb)
  switch (target) {
    case 'tw3':
      return [
        `${EXPORT_NAME}: {`,
        ...palette.map((s) => `  ${s.step}: '${value(s.rgb)}',`),
        '},',
      ].join('\n')
    case 'tw4':
      return [
        '@theme {',
        ...palette.map(
          (s) => `  --color-${EXPORT_NAME}-${s.step}: ${value(s.rgb)};`,
        ),
        '}',
      ].join('\n')
    case 'css':
      return [
        ':root {',
        ...palette.map((s) => `  --${EXPORT_NAME}-${s.step}: ${value(s.rgb)};`),
        '}',
      ].join('\n')
    case 'scss':
      return [
        `$${EXPORT_NAME}: (`,
        ...palette.map((s) => `  '${s.step}': ${value(s.rgb)},`),
        ');',
      ].join('\n')
    case 'figma':
      return JSON.stringify(
        {
          [EXPORT_NAME]: Object.fromEntries(
            palette.map((s) => [
              String(s.step),
              { value: value(s.rgb), type: 'color' },
            ]),
          ),
        },
        null,
        2,
      )
    case 'w3c':
      return JSON.stringify(
        {
          [EXPORT_NAME]: Object.fromEntries(
            palette.map((s) => [
              String(s.step),
              { $value: value(s.rgb), $type: 'color' },
            ]),
          ),
        },
        null,
        2,
      )
  }
}

type Guideline = 'wcag2' | 'apca'

interface ThresholdOption {
  id: string
  value: number | null
  label: string
  note: string
}

const GUIDELINES: Array<{ id: Guideline; label: string }> = [
  { id: 'wcag2', label: 'WCAG 2' },
  { id: 'apca', label: 'WCAG 3 · APCA' },
]

const THRESHOLDS: Record<Guideline, Array<ThresholdOption>> = {
  wcag2: [
    {
      id: '3',
      value: 3,
      label: '3+',
      note: '3 · Minimum for large text, headings and UI',
    },
    {
      id: '4.5',
      value: 4.5,
      label: '4.5+',
      note: '4.5 · Minimum for normal body text',
    },
    {
      id: '7',
      value: 7,
      label: '7+',
      note: '7 · Enhanced (AAA) for normal text',
    },
    {
      id: 'all',
      value: null,
      label: 'All',
      note: 'Every shade pair, unfiltered',
    },
  ],
  apca: [
    {
      id: '45',
      value: 45,
      label: 'Lc 45+',
      note: 'Lc 45 · Large or bold headline text',
    },
    {
      id: '60',
      value: 60,
      label: 'Lc 60+',
      note: 'Lc 60 · Minimum for other content text',
    },
    {
      id: '75',
      value: 75,
      label: 'Lc 75+',
      note: 'Lc 75 · Minimum for body text columns',
    },
    {
      id: 'all',
      value: null,
      label: 'All',
      note: 'Every shade pair, unfiltered',
    },
  ],
}

function pairScore(guideline: Guideline, text: Rgb, bg: Rgb): number {
  return guideline === 'wcag2'
    ? contrastRatio(text, bg)
    : Math.abs(apcaContrast(text, bg))
}

function formatScore(guideline: Guideline, score: number): string {
  return guideline === 'wcag2' ? score.toFixed(1) : String(Math.round(score))
}

export const Route = createFileRoute('/tools/palette')({
  head: () => {
    const seo = buildSeo({
      title: `${tool.name} — ComfyToolkit`,
      description: tool.description,
      path: tool.to,
      image: ogUrl(tool.id),
    })
    return {
      meta: [{ title: `${tool.name} — ComfyToolkit` }, ...seo.meta],
      links: seo.links,
    }
  },
  component: Page,
})

function Page() {
  const [hsv, setHsvRaw] = React.useState<Hsv>(DEFAULT_HSV)
  const [format, setFormat] = React.useState<FormatId>('hex')

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setHsvRaw(JSON.parse(stored) as Hsv)
    } catch {
      /* ignore */
    }
  }, [])

  const apply = React.useCallback<ApplyColor>((next) => {
    setHsvRaw(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const rgb = roundRgb(hsvToRgb(hsv))
  const palette = generatePalette(rgb)

  const isHex = format === 'hex'
  const active = FORMATS.find((f) => f.id === format) ?? FORMATS[0]

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1">
                {FORMATS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormat(option.id)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors',
                      format === option.id
                        ? 'border-accent bg-accent/10 text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <SpaceCard
                icon={active.icon}
                label={active.label}
                value={formatColor(format, rgb)}
                onInput={(value) => {
                  if (isHex) {
                    const parsed = hexToRgba(value)
                    if (!parsed) return false
                    apply(rgbToHsvKeepHue(parsed.rgb, hsv))
                    return true
                  }
                  return parseSpaceInput(format, value, hsv, apply)
                }}
              >
                {isHex ? (
                  <ColorPicker
                    value={rgbToHex(rgb)}
                    onChange={(hex) => {
                      const parsed = hexToRgba(hex)
                      if (parsed) apply(rgbToHsvKeepHue(parsed.rgb, hsv))
                    }}
                    aria-label="Color picker"
                    className="h-11 w-full"
                  />
                ) : (
                  buildSpaceChannels(format, hsv, apply).map((channel) => (
                    <ChannelSlider key={channel.label} {...channel} />
                  ))
                )}
              </SpaceCard>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Shades
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-11">
                {palette.map((shade) => (
                  <SwatchTile
                    key={shade.step}
                    step={shade.step}
                    rgb={shade.rgb}
                    value={formatColor(format, shade.rgb)}
                  />
                ))}
              </div>
            </div>
          </div>

          <ContrastMatrix palette={palette} />

          <ExportCard format={format} palette={palette} />
        </div>
      </div>
    </div>
  )
}

function ContrastMatrix({ palette }: { palette: Array<Shade> }) {
  const [guideline, setGuideline] = React.useState<Guideline>('wcag2')
  const [thresholdId, setThresholdId] = React.useState<string>('3')

  const options = THRESHOLDS[guideline]
  const active = options.find((o) => o.id === thresholdId) ?? options[0]
  const showAll = active.value === null

  const pickGuideline = (next: Guideline) => {
    setGuideline(next)
    setThresholdId(THRESHOLDS[next][0].id)
  }

  const cols = `2.25rem repeat(${palette.length}, minmax(36px, 1fr))`
  const gridMaxWidth = `calc(2.25rem + ${palette.length} * max(6.5vh, 36px) + ${palette.length} * 0.25rem)`

  return (
    <Card
      label="Contrast Matrix"
      icon={Grid3x3}
      collapsible
      collapseKey="palette-matrix"
      bodyClassName="flex flex-col gap-4 p-4"
    >
      <div className="flex flex-col gap-3">
        <PillRow label="Guidelines">
          {GUIDELINES.map((g) => (
            <Pill
              key={g.id}
              active={guideline === g.id}
              onClick={() => pickGuideline(g.id)}
            >
              {g.label}
            </Pill>
          ))}
        </PillRow>
        <PillRow label={guideline === 'wcag2' ? 'Contrast ratio' : 'APCA Lc'}>
          {options.map((o) => (
            <Pill
              key={o.id}
              active={o.id === active.id}
              onClick={() => setThresholdId(o.id)}
            >
              {o.label}
            </Pill>
          ))}
        </PillRow>
        <p className="text-xs text-muted-foreground">{active.note}</p>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid min-w-max gap-1 mx-auto"
          style={{ gridTemplateColumns: cols, maxWidth: gridMaxWidth }}
        >
          <span />
          {palette.map((col) => (
            <span
              key={`h-${col.step}`}
              className="flex items-center justify-center font-mono text-[10px] text-muted-foreground"
            >
              {col.step}
            </span>
          ))}
          {palette.map((row) => (
            <React.Fragment key={`r-${row.step}`}>
              <span className="flex items-center justify-end pr-1 font-mono text-[10px] text-muted-foreground">
                {row.step}
              </span>
              {palette.map((col) => {
                const score = pairScore(guideline, row.rgb, col.rgb)
                const pass =
                  row.step !== col.step &&
                  (showAll || (active.value !== null && score >= active.value))
                return (
                  <MatrixCell
                    key={col.step}
                    textRgb={row.rgb}
                    bgRgb={col.rgb}
                    label={formatScore(guideline, score)}
                    show={pass}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Card>
  )
}

function PillRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-32 shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  )
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors',
        active
          ? 'border-accent bg-accent/10 text-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function MatrixCell({
  textRgb,
  bgRgb,
  label,
  show,
}: {
  textRgb: Rgb
  bgRgb: Rgb
  label: string
  show: boolean
}) {
  if (!show) {
    return (
      <span className="aspect-square rounded-md border border-dashed border-border/40 bg-striped" />
    )
  }
  const bgHex = rgbToHex(bgRgb)
  const textHex = rgbToHex(textRgb)
  return (
    <span
      role="img"
      aria-label={`${label}, ${textHex} on ${bgHex}`}
      className="flex aspect-square items-center justify-center rounded-md border border-border/50 font-mono text-[10px] font-semibold tabular-nums"
      style={{ backgroundColor: bgHex, color: textHex }}
      title={`${label} — ${textHex} on ${bgHex}`}
    >
      {label}
    </span>
  )
}

function ExportCard({
  format,
  palette,
}: {
  format: FormatId
  palette: Array<Shade>
}) {
  const [target, setTarget] = React.useState<TargetId>('tw4')
  const active = TARGETS.find((t) => t.id === target) ?? TARGETS[0]
  const code = buildExport(target, format, palette)

  return (
    <Card
      label="Export"
      headerClassName="flex-wrap"
      copyValue={code}
      value={code}
      readOnly
      language={active.lang}
      minRows={6}
      bodyClassName="max-h-96"
      headerLeft={
        <div className="flex flex-wrap gap-1">
          {TARGETS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTarget(option.id)}
              className={cn(
                'rounded-sm border px-2 py-0.5 font-mono text-[11px] transition-colors',
                target === option.id
                  ? 'border-accent bg-accent/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    />
  )
}

function SwatchTile({
  step,
  rgb,
  value,
}: {
  step: number
  rgb: Rgb
  value: string
}) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    } catch {
      /* clipboard unavailable */
    }
  }

  const textColor = rgbToOklch(rgb).l > 62 ? '#0b0e14' : '#ffffff'

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex flex-col gap-1 text-left"
    >
      <span
        className="relative flex h-14 items-start justify-between overflow-hidden rounded-md border border-border px-2 py-1.5"
        style={{ backgroundColor: rgbToHex(rgb) }}
      >
        <span
          className="font-mono text-[11px] font-semibold"
          style={{ color: textColor }}
        >
          {step}
        </span>
        <span
          className="opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: textColor }}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </span>
      </span>
      <span className="truncate font-mono text-[11px] text-muted-foreground">
        {value}
      </span>
    </button>
  )
}
