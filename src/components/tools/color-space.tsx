import { Card } from '@/components/tools/card'
import { Input } from '@/components/ui/input'
import type { Hsv, Rgb } from '@/lib/tools/colors'
import {
  clamp,
  clampRgb,
  cmykToRgb,
  formatCmyk,
  formatHsl,
  formatHsv,
  formatHwb,
  formatLab,
  formatLch,
  formatOklch,
  formatRgb,
  hslToHsv,
  hsvToHsl,
  hsvToHwb,
  hsvToRgb,
  hwbToHsv,
  labToRgb,
  lchToRgb,
  oklchToRgb,
  rgbToCmyk,
  rgbToHsv,
  rgbToHsvKeepHue,
  rgbToLab,
  rgbToLch,
  rgbToOklch,
  roundCmyk,
  roundHsl,
  roundHsv,
  roundHwb,
  roundLab,
  roundLch,
  roundOklch,
  roundRgb,
} from '@/lib/tools/colors'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  Blend,
  Contrast,
  FlaskConical,
  Orbit,
  Palette,
  Printer,
  Sparkles,
  Sun,
} from 'lucide-react'
import * as React from 'react'

export type SpaceId =
  | 'rgb'
  | 'hsl'
  | 'hsv'
  | 'cmyk'
  | 'hwb'
  | 'oklch'
  | 'lab'
  | 'lch'

export const SPACES: Array<{ id: SpaceId; label: string; icon: LucideIcon }> = [
  { id: 'rgb', label: 'RGB', icon: Blend },
  { id: 'hsl', label: 'HSL', icon: Palette },
  { id: 'hsv', label: 'HSV', icon: Sun },
  { id: 'cmyk', label: 'CMYK', icon: Printer },
  { id: 'hwb', label: 'HWB', icon: Contrast },
  { id: 'oklch', label: 'OKLCH', icon: Sparkles },
  { id: 'lab', label: 'CIE LAB', icon: FlaskConical },
  { id: 'lch', label: 'CIE LCH', icon: Orbit },
]

export const HUE_GRADIENT =
  'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'

export const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #8884 25%, transparent 25%), linear-gradient(-45deg, #8884 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #8884 75%), linear-gradient(-45deg, transparent 75%, #8884 75%)',
  backgroundSize: '12px 12px',
  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
}

export function rgbCss({ r, g, b }: Rgb): string {
  const v = roundRgb({ r, g, b })
  return `rgb(${v.r} ${v.g} ${v.b})`
}

export function rampGradient(toRgb: (t: number) => Rgb, steps = 8): string {
  const stops: Array<string> = []
  for (let i = 0; i <= steps; i++) {
    stops.push(rgbCss(clampRgb(toRgb(i / steps))))
  }
  return `linear-gradient(to right, ${stops.join(', ')})`
}

export function parseNumbers(raw: string): Array<number> {
  return (raw.match(/-?\d*\.?\d+/g) ?? []).map(Number)
}

export function formatSpace(space: SpaceId, rgb: Rgb, alpha = 1): string {
  switch (space) {
    case 'rgb':
      return formatRgb(rgb, alpha)
    case 'hsl':
      return formatHsl(hsvToHsl(rgbToHsv(rgb)), alpha)
    case 'hsv':
      return formatHsv(rgbToHsv(rgb))
    case 'cmyk':
      return formatCmyk(rgbToCmyk(rgb))
    case 'hwb':
      return formatHwb(hsvToHwb(rgbToHsv(rgb)), alpha)
    case 'oklch':
      return formatOklch(rgbToOklch(rgb), alpha)
    case 'lab':
      return formatLab(rgbToLab(rgb), alpha)
    case 'lch':
      return formatLch(rgbToLch(rgb), alpha)
  }
}

export interface Channel {
  label: string
  value: number
  min?: number
  max: number
  step?: number
  suffix?: string
  gradient: string
  onChange: (value: number) => void
}

export type ApplyColor = (hsv: Hsv, alpha?: number) => void

export function buildSpaceChannels(
  space: SpaceId,
  hsv: Hsv,
  apply: ApplyColor,
): Array<Channel> {
  const rgb = roundRgb(hsvToRgb(hsv))
  const hsl = roundHsl(hsvToHsl(hsv))
  const hsvD = roundHsv(hsv)
  const cmyk = roundCmyk(rgbToCmyk(rgb))
  const hwb = roundHwb(hsvToHwb(hsv))
  const oklch = roundOklch(rgbToOklch(rgb))
  const lab = roundLab(rgbToLab(rgb))
  const lch = roundLch(rgbToLch(rgb))

  const setRgb = (next: Rgb) => apply(rgbToHsvKeepHue(next, hsv))
  const setHsl = (h: number, s: number, l: number) =>
    apply(hslToHsv({ h, s, l }))
  const setCmyk = (c: number, m: number, y: number, k: number) =>
    setRgb(cmykToRgb({ c, m, y, k }))
  const setHwb = (h: number, w: number, b: number) =>
    apply(hwbToHsv({ h, w, b }))
  const setOklch = (l: number, c: number, h: number) =>
    setRgb(clampRgb(oklchToRgb({ l, c, h })))
  const setLab = (l: number, av: number, bv: number) =>
    setRgb(clampRgb(labToRgb({ l, a: av, b: bv })))
  const setLch = (l: number, c: number, h: number) =>
    setRgb(clampRgb(lchToRgb({ l, c, h })))

  switch (space) {
    case 'rgb':
      return (['r', 'g', 'b'] as const).map((key) => ({
        label: key.toUpperCase(),
        value: rgb[key],
        max: 255,
        gradient: `linear-gradient(to right, ${rgbCss({ ...rgb, [key]: 0 })}, ${rgbCss({ ...rgb, [key]: 255 })})`,
        onChange: (v: number) => setRgb({ ...rgb, [key]: v }),
      }))
    case 'hsl':
      return [
        {
          label: 'H',
          value: hsl.h,
          max: 360,
          suffix: '°',
          gradient: HUE_GRADIENT,
          onChange: (h: number) => setHsl(h, hsl.s, hsl.l),
        },
        {
          label: 'S',
          value: hsl.s,
          max: 100,
          suffix: '%',
          gradient: `linear-gradient(to right, hsl(${hsl.h} 0% ${hsl.l}%), hsl(${hsl.h} 100% ${hsl.l}%))`,
          onChange: (s: number) => setHsl(hsl.h, s, hsl.l),
        },
        {
          label: 'L',
          value: hsl.l,
          max: 100,
          suffix: '%',
          gradient: `linear-gradient(to right, hsl(${hsl.h} ${hsl.s}% 0%), hsl(${hsl.h} ${hsl.s}% 50%), hsl(${hsl.h} ${hsl.s}% 100%))`,
          onChange: (l: number) => setHsl(hsl.h, hsl.s, l),
        },
      ]
    case 'hsv':
      return [
        {
          label: 'H',
          value: hsvD.h,
          max: 360,
          suffix: '°',
          gradient: HUE_GRADIENT,
          onChange: (h: number) => apply({ ...hsv, h }),
        },
        {
          label: 'S',
          value: hsvD.s,
          max: 100,
          suffix: '%',
          gradient: `linear-gradient(to right, ${rgbCss(hsvToRgb({ ...hsv, s: 0 }))}, ${rgbCss(hsvToRgb({ ...hsv, s: 100 }))})`,
          onChange: (s: number) => apply({ ...hsv, s }),
        },
        {
          label: 'V',
          value: hsvD.v,
          max: 100,
          suffix: '%',
          gradient: `linear-gradient(to right, #000, ${rgbCss(hsvToRgb({ ...hsv, v: 100 }))})`,
          onChange: (v: number) => apply({ ...hsv, v }),
        },
      ]
    case 'cmyk':
      return (['c', 'm', 'y', 'k'] as const).map((key) => ({
        label: key.toUpperCase(),
        value: cmyk[key],
        max: 100,
        suffix: '%',
        gradient: rampGradient((t) => cmykToRgb({ ...cmyk, [key]: t * 100 })),
        onChange: (v: number) =>
          setCmyk(
            key === 'c' ? v : cmyk.c,
            key === 'm' ? v : cmyk.m,
            key === 'y' ? v : cmyk.y,
            key === 'k' ? v : cmyk.k,
          ),
      }))
    case 'hwb':
      return [
        {
          label: 'H',
          value: hwb.h,
          max: 360,
          suffix: '°',
          gradient: HUE_GRADIENT,
          onChange: (h: number) => setHwb(h, hwb.w, hwb.b),
        },
        {
          label: 'W',
          value: hwb.w,
          max: 100,
          suffix: '%',
          gradient: rampGradient((t) =>
            hsvToRgb(hwbToHsv({ ...hwb, w: t * 100 })),
          ),
          onChange: (w: number) => setHwb(hwb.h, w, hwb.b),
        },
        {
          label: 'B',
          value: hwb.b,
          max: 100,
          suffix: '%',
          gradient: rampGradient((t) =>
            hsvToRgb(hwbToHsv({ ...hwb, b: t * 100 })),
          ),
          onChange: (b: number) => setHwb(hwb.h, hwb.w, b),
        },
      ]
    case 'oklch':
      return [
        {
          label: 'L',
          value: oklch.l,
          max: 100,
          suffix: '%',
          gradient: rampGradient((t) => oklchToRgb({ ...oklch, l: t * 100 })),
          onChange: (l: number) => setOklch(l, oklch.c, oklch.h),
        },
        {
          label: 'C',
          value: oklch.c,
          max: 0.4,
          step: 0.005,
          gradient: rampGradient((t) => oklchToRgb({ ...oklch, c: t * 0.4 })),
          onChange: (c: number) => setOklch(oklch.l, c, oklch.h),
        },
        {
          label: 'H',
          value: oklch.h,
          max: 360,
          suffix: '°',
          gradient: rampGradient((t) => oklchToRgb({ ...oklch, h: t * 360 })),
          onChange: (h: number) => setOklch(oklch.l, oklch.c, h),
        },
      ]
    case 'lab':
      return [
        {
          label: 'L',
          value: lab.l,
          max: 100,
          suffix: '%',
          gradient: rampGradient((t) => labToRgb({ ...lab, l: t * 100 })),
          onChange: (l: number) => setLab(l, lab.a, lab.b),
        },
        {
          label: 'a',
          value: lab.a,
          min: -128,
          max: 127,
          gradient: rampGradient((t) =>
            labToRgb({ ...lab, a: -128 + t * 255 }),
          ),
          onChange: (av: number) => setLab(lab.l, av, lab.b),
        },
        {
          label: 'b',
          value: lab.b,
          min: -128,
          max: 127,
          gradient: rampGradient((t) =>
            labToRgb({ ...lab, b: -128 + t * 255 }),
          ),
          onChange: (bv: number) => setLab(lab.l, lab.a, bv),
        },
      ]
    case 'lch':
      return [
        {
          label: 'L',
          value: lch.l,
          max: 100,
          suffix: '%',
          gradient: rampGradient((t) => lchToRgb({ ...lch, l: t * 100 })),
          onChange: (l: number) => setLch(l, lch.c, lch.h),
        },
        {
          label: 'C',
          value: lch.c,
          max: 150,
          gradient: rampGradient((t) => lchToRgb({ ...lch, c: t * 150 })),
          onChange: (c: number) => setLch(lch.l, c, lch.h),
        },
        {
          label: 'H',
          value: lch.h,
          max: 360,
          suffix: '°',
          gradient: rampGradient((t) => lchToRgb({ ...lch, h: t * 360 })),
          onChange: (h: number) => setLch(lch.l, lch.c, h),
        },
      ]
  }
}

export function parseSpaceInput(
  space: SpaceId,
  raw: string,
  hsv: Hsv,
  apply: ApplyColor,
): boolean {
  const n = parseNumbers(raw)
  const alphaAt = (index: number): number | undefined =>
    n.length > index ? clamp(n[index], 0, 1) : undefined

  const setRgb = (next: Rgb, alpha?: number) =>
    apply(rgbToHsvKeepHue(next, hsv), alpha)

  switch (space) {
    case 'rgb':
      if (n.length < 3) return false
      setRgb(
        {
          r: clamp(n[0], 0, 255),
          g: clamp(n[1], 0, 255),
          b: clamp(n[2], 0, 255),
        },
        alphaAt(3),
      )
      return true
    case 'hsl':
      if (n.length < 3) return false
      apply(
        hslToHsv({
          h: clamp(n[0], 0, 360),
          s: clamp(n[1], 0, 100),
          l: clamp(n[2], 0, 100),
        }),
        alphaAt(3),
      )
      return true
    case 'hsv':
      if (n.length < 3) return false
      apply({
        h: clamp(n[0], 0, 360),
        s: clamp(n[1], 0, 100),
        v: clamp(n[2], 0, 100),
      })
      return true
    case 'cmyk':
      if (n.length < 4) return false
      setRgb(
        cmykToRgb({
          c: clamp(n[0], 0, 100),
          m: clamp(n[1], 0, 100),
          y: clamp(n[2], 0, 100),
          k: clamp(n[3], 0, 100),
        }),
      )
      return true
    case 'hwb':
      if (n.length < 3) return false
      apply(
        hwbToHsv({
          h: clamp(n[0], 0, 360),
          w: clamp(n[1], 0, 100),
          b: clamp(n[2], 0, 100),
        }),
        alphaAt(3),
      )
      return true
    case 'oklch':
      if (n.length < 3) return false
      setRgb(
        clampRgb(
          oklchToRgb({
            l: clamp(n[0], 0, 100),
            c: clamp(n[1], 0, 0.4),
            h: clamp(n[2], 0, 360),
          }),
        ),
        alphaAt(3),
      )
      return true
    case 'lab':
      if (n.length < 3) return false
      setRgb(
        clampRgb(
          labToRgb({
            l: clamp(n[0], 0, 100),
            a: clamp(n[1], -128, 127),
            b: clamp(n[2], -128, 127),
          }),
        ),
        alphaAt(3),
      )
      return true
    case 'lch':
      if (n.length < 3) return false
      setRgb(
        clampRgb(
          lchToRgb({
            l: clamp(n[0], 0, 100),
            c: clamp(n[1], 0, 150),
            h: clamp(n[2], 0, 360),
          }),
        ),
        alphaAt(3),
      )
      return true
  }
}

export function SpaceCard({
  icon: Icon,
  label,
  value,
  onInput,
  children,
}: {
  icon: LucideIcon
  label: string
  value: string
  onInput: (value: string) => boolean
  children: React.ReactNode
}) {
  const [draft, setDraft] = React.useState(value)
  const [focused, setFocused] = React.useState(false)
  const [invalid, setInvalid] = React.useState(false)

  React.useEffect(() => {
    if (!focused) {
      setDraft(value)
      setInvalid(false)
    }
  }, [value, focused])

  return (
    <Card
      icon={Icon}
      label={label}
      copyValue={value}
      bodyClassName="gap-3 p-3"
      headerLeft={
        <input
          value={draft}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            setDraft(value)
            setInvalid(false)
          }}
          onChange={(event) => {
            const next = event.target.value
            setDraft(next)
            setInvalid(!onInput(next))
          }}
          spellCheck={false}
          className={cn(
            'w-0 min-w-0 flex-1 bg-transparent text-right font-mono text-[12px] outline-none',
            invalid ? 'text-destructive' : 'text-foreground',
          )}
        />
      }
    >
      {children}
    </Card>
  )
}

export function ChannelSlider({
  label,
  value,
  min = 0,
  max,
  step = 1,
  suffix,
  gradient,
  onChange,
}: Channel) {
  const commit = (raw: string) => {
    if (raw.trim() === '') return
    const n = Number(raw)
    if (Number.isNaN(n)) return
    onChange(clamp(n, min, max))
  }

  return (
    <div className="flex items-center gap-3">
      <span className="w-7 shrink-0 font-mono text-[12px] font-medium text-muted-foreground">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ background: gradient }}
        className={cn(
          'h-3 flex-1 cursor-pointer appearance-none rounded-full border border-border-strong/60',
          '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.4)]',
          '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-transparent',
        )}
      />
      <div className="flex w-16 items-center gap-1">
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => commit(event.target.value)}
          className="hide-btn h-7 px-1.5 text-center text-xs!"
        />
        {suffix ? (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        ) : null}
      </div>
    </div>
  )
}
