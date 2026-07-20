import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { ColorPicker } from '@/components/ui/color-picker'
import { Input } from '@/components/ui/input'
import { formatRgb, rgbToHex } from '@/lib/tools/colors'
import {
  assess,
  composite,
  contrastRatio,
  parseColor,
  suggestPassing,
} from '@/lib/tools/contrast'
import { requireTool } from '@/lib/tools/registry'
import { usePersistedState } from '@/lib/use-persisted-state'
import { buildSeo, ogUrl } from '@/lib/seo'
import { createFileRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Ban,
  Check,
  PaintBucket,
  ShieldAlert,
  ShieldCheck,
  Type,
  Wand2,
  X,
} from 'lucide-react'

const tool = requireTool('contrast')

type GradeKey = 'pass' | 'large' | 'fail'

const GRADES: Record<
  GradeKey,
  { label: string; icon: LucideIcon; ratio: string; pill: string }
> = {
  pass: {
    label: 'Passes AA',
    icon: ShieldCheck,
    ratio: 'text-success',
    pill: 'border-success/30 bg-success/10 text-success',
  },
  large: {
    label: 'Large text only',
    icon: ShieldAlert,
    ratio: 'text-warning',
    pill: 'border-warning/30 bg-warning/10 text-warning',
  },
  fail: {
    label: 'Fails contrast',
    icon: Ban,
    ratio: 'text-destructive',
    pill: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
}

function gradeOf(badges: ReturnType<typeof assess>): GradeKey {
  if (badges.aaNormal) return 'pass'
  if (badges.aaLarge) return 'large'
  return 'fail'
}

export const Route = createFileRoute('/tools/contrast')({
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
  const [fg, setFg] = usePersistedState('contrast-fg', '#777777')
  const [bg, setBg] = usePersistedState('contrast-bg', '#ffffff')

  const fgColor = parseColor(fg)
  const bgColor = parseColor(bg)

  const result =
    fgColor && bgColor
      ? (() => {
          const effectiveFg =
            fgColor.a < 1 ? composite(fgColor, bgColor.rgb) : fgColor.rgb
          const ratio = contrastRatio(effectiveFg, bgColor.rgb)
          return { ratio, badges: assess(ratio), composited: fgColor.a < 1 }
        })()
      : null

  const swap = () => {
    setFg(bg)
    setBg(fg)
  }

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <ColorField
                label="Foreground (text)"
                icon={Type}
                value={fg}
                color={fgColor}
                onChange={setFg}
              />
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <button
                  type="button"
                  onClick={swap}
                  aria-label="Swap foreground and background"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-medium transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
                >
                  <ArrowLeftRight className="size-3.5" />
                  Swap
                </button>
                <span className="h-px flex-1 bg-border" />
              </div>
              <ColorField
                label="Background"
                icon={PaintBucket}
                value={bg}
                color={bgColor}
                onChange={setBg}
              />
            </div>

            <Preview fgColor={fgColor} bgColor={bgColor} result={result} />
          </div>

          {result && !result.badges.aaNormal ? (
            <Suggest fgColor={fgColor!} bgColor={bgColor!} onApply={setFg} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ColorField({
  label,
  icon,
  value,
  color,
  onChange,
}: {
  label: string
  icon: LucideIcon
  value: string
  color: ReturnType<typeof parseColor>
  onChange: (value: string) => void
}) {
  const invalid = value.trim() !== '' && color === null
  const swatchHex = color ? rgbToHex(color.rgb) : '#000000'

  return (
    <div className="flex flex-col gap-2">
      <Card label={label} icon={icon} copyValue={value} bodyClassName="p-3">
        <div className="flex items-center gap-2">
          <ColorPicker
            value={swatchHex}
            onChange={onChange}
            aria-label={`${label} color picker`}
            className="h-9 w-9 shrink-0"
          />
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            placeholder="#777777, rgb(...), hsl(...)"
            className="font-mono"
          />
        </div>
      </Card>
      {invalid ? <ErrorText>Not a valid color.</ErrorText> : null}
    </div>
  )
}

const BADGES: Array<{ key: keyof ReturnType<typeof assess>; label: string }> = [
  { key: 'aaNormal', label: 'AA · Normal text' },
  { key: 'aaaNormal', label: 'AAA · Normal text' },
  { key: 'aaLarge', label: 'AA · Large text' },
  { key: 'aaaLarge', label: 'AAA · Large text' },
  { key: 'uiComponent', label: 'UI · Components' },
]

function Preview({
  fgColor,
  bgColor,
  result,
}: {
  fgColor: ReturnType<typeof parseColor>
  bgColor: ReturnType<typeof parseColor>
  result: {
    ratio: number
    badges: ReturnType<typeof assess>
    composited: boolean
  } | null
}) {
  const fgCss = fgColor ? formatRgb(fgColor.rgb, fgColor.a) : '#000'
  const bgCss = bgColor ? formatRgb(bgColor.rgb) : '#fff'

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-lg border border-border">
        <div
          className="flex flex-col gap-2 p-6"
          style={{ backgroundColor: bgCss }}
        >
          <span className="text-2xl font-bold" style={{ color: fgCss }}>
            Large sample text
          </span>
          <span className="text-sm" style={{ color: fgCss }}>
            Normal sample text — the quick brown fox jumps over the lazy dog.
          </span>
        </div>
      </div>

      {result ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-4xl font-bold tabular-nums ${GRADES[gradeOf(result.badges)].ratio}`}
              >
                {result.ratio.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground">:1</span>
            </div>
            <Verdict grade={GRADES[gradeOf(result.badges)]} />
          </div>
          {result.composited ? (
            <p className="text-xs text-muted-foreground">
              Foreground alpha composited over background before scoring.
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {BADGES.map((badge) => (
              <Badge
                key={badge.key}
                label={badge.label}
                pass={result.badges[badge.key]}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Large text = ≥ 18.66px bold or ≥ 24px. UI threshold per WCAG 1.4.11.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter two valid colors to see the contrast ratio.
        </p>
      )}
    </div>
  )
}

function Verdict({ grade }: { grade: (typeof GRADES)[GradeKey] }) {
  const Icon = grade.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${grade.pill}`}
    >
      <Icon className="size-3.5" />
      {grade.label}
    </span>
  )
}

function Badge({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
        pass
          ? 'border-success/30 bg-success/10 text-success'
          : 'border-destructive/25 bg-destructive/5 text-muted-foreground'
      }`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
          pass
            ? 'bg-success/15 text-success'
            : 'bg-destructive/15 text-destructive'
        }`}
      >
        {pass ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      </span>
      <span>{label}</span>
      <span
        className={`ml-auto text-xs font-semibold uppercase tracking-wide ${
          pass ? 'text-success' : 'text-destructive'
        }`}
      >
        {pass ? 'Pass' : 'Fail'}
      </span>
    </div>
  )
}

function Suggest({
  fgColor,
  bgColor,
  onApply,
}: {
  fgColor: NonNullable<ReturnType<typeof parseColor>>
  bgColor: NonNullable<ReturnType<typeof parseColor>>
  onApply: (value: string) => void
}) {
  const suggestion = suggestPassing(fgColor.rgb, bgColor.rgb)

  return (
    <Card label="Suggest passing foreground" icon={Wand2} bodyClassName="p-4">
      {suggestion ? (
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="size-9 shrink-0 rounded-md border border-success/40 ring-2 ring-success/20"
            style={{ backgroundColor: suggestion.hex }}
          />
          <span className="font-mono text-sm font-medium uppercase">
            {suggestion.hex}
          </span>
          <span className="text-xs text-muted-foreground">
            nearest foreground reaching AA (4.5:1)
          </span>
          <button
            type="button"
            onClick={() => onApply(suggestion.hex)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Check className="size-4" />
            Apply
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Ban className="size-4 shrink-0 text-destructive" />
          <span>
            Can&apos;t reach AA by adjusting lightness alone on this hue. Try a
            different foreground color.
          </span>
        </div>
      )}
    </Card>
  )
}
