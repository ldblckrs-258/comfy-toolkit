import { ToolHeader } from '@/components/layout/tool-header'
import {
  ChannelSlider,
  SPACES,
  SpaceCard,
  buildSpaceChannels,
  formatSpace,
  parseSpaceInput,
} from '@/components/tools/color-space'
import type { ApplyColor, SpaceId } from '@/components/tools/color-space'
import { Card } from '@/components/tools/card'
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
import { requireTool } from '@/lib/tools/registry'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Check, Copy, Hash } from 'lucide-react'
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

export const Route = createFileRoute('/tools/palette')({
  head: () => ({ meta: [{ title: `${tool.name} — ComfyToolkit` }] }),
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
                  <label
                    className="relative block h-11 w-full cursor-pointer overflow-hidden rounded-md border border-border"
                    style={{ backgroundColor: rgbToHex(rgb) }}
                  >
                    <input
                      type="color"
                      value={rgbToHex(rgb)}
                      onChange={(event) => {
                        const parsed = hexToRgba(event.target.value)
                        if (parsed) apply(rgbToHsvKeepHue(parsed.rgb, hsv))
                      }}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label="Color picker"
                    />
                  </label>
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

          <ExportCard format={format} palette={palette} />
        </div>
      </div>
    </div>
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
