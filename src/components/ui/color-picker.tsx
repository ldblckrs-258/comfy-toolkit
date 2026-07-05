import { Input } from '@/components/ui/input'
import type { Hsv } from '@/lib/tools/colors'
import {
  clamp,
  hexToRgba,
  hsvToRgb,
  rgbToHex,
  rgbToHsv,
  rgbToHsvKeepHue,
} from '@/lib/tools/colors'
import { cn } from '@/lib/utils'
import * as Popover from '@radix-ui/react-popover'
import { Pipette } from 'lucide-react'
import * as React from 'react'

const HUE_GRADIENT =
  'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'

const CHECKER_IMAGE =
  'linear-gradient(45deg, #8884 25%, transparent 25%), linear-gradient(-45deg, #8884 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #8884 75%), linear-gradient(-45deg, transparent 75%, #8884 75%)'
const CHECKER_POSITION = '0 0, 0 6px, 6px -6px, -6px 0'

const CHECKER_STYLE: React.CSSProperties = {
  backgroundImage: CHECKER_IMAGE,
  backgroundSize: '12px 12px',
  backgroundPosition: CHECKER_POSITION,
}

const THUMB_CLASS = cn(
  'h-3 flex-1 cursor-pointer appearance-none rounded-full border border-border-strong/60',
  '[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.45)]',
  '[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-transparent',
)

function deriveHsv(value: string): Hsv {
  const parsed = hexToRgba(value)
  return parsed ? rgbToHsv(parsed.rgb) : { h: 0, s: 0, v: 0 }
}

function deriveAlpha(value: string): number {
  return hexToRgba(value)?.a ?? 1
}

export interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
  alpha?: boolean
  disabled?: boolean
  className?: string
  presets?: Array<string>
  'aria-label'?: string
}

export function ColorPicker({
  value,
  onChange,
  alpha = false,
  disabled = false,
  className,
  presets,
  'aria-label': ariaLabel = 'Pick color',
}: ColorPickerProps) {
  const [hsv, setHsv] = React.useState<Hsv>(() => deriveHsv(value))
  const [alphaValue, setAlphaValue] = React.useState<number>(() =>
    deriveAlpha(value),
  )
  const [hexDraft, setHexDraft] = React.useState<string | null>(null)
  const [hasEyeDropper, setHasEyeDropper] = React.useState(false)

  const padRef = React.useRef<HTMLDivElement>(null)
  const lastHex = React.useRef(value)

  React.useEffect(() => {
    setHasEyeDropper(typeof window !== 'undefined' && 'EyeDropper' in window)
  }, [])

  React.useEffect(() => {
    if (value === lastHex.current) return
    const parsed = hexToRgba(value)
    if (!parsed) return
    lastHex.current = value
    setHsv((prev) => rgbToHsvKeepHue(parsed.rgb, prev))
    setAlphaValue(parsed.a)
  }, [value])

  const rgb = hsvToRgb(hsv)
  const currentHex = rgbToHex(rgb, alpha ? alphaValue : 1)
  const solidHex = rgbToHex(rgb)

  const emit = (nextHsv: Hsv, nextAlpha: number) => {
    const hex = rgbToHex(hsvToRgb(nextHsv), alpha ? nextAlpha : 1)
    lastHex.current = hex
    onChange(hex)
  }

  const commitHsv = (next: Hsv) => {
    setHsv(next)
    setHexDraft(null)
    emit(next, alphaValue)
  }

  const commitAlpha = (next: number) => {
    setAlphaValue(next)
    emit(hsv, next)
  }

  const handlePad = (clientX: number, clientY: number) => {
    const el = padRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const s = clamp((clientX - rect.left) / rect.width, 0, 1) * 100
    const v = (1 - clamp((clientY - rect.top) / rect.height, 0, 1)) * 100
    commitHsv({ h: hsv.h, s, v })
  }

  const nudgePad = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1
    let { s, v } = hsv
    if (event.key === 'ArrowLeft') s -= step
    else if (event.key === 'ArrowRight') s += step
    else if (event.key === 'ArrowUp') v += step
    else if (event.key === 'ArrowDown') v -= step
    else return
    event.preventDefault()
    commitHsv({ h: hsv.h, s: clamp(s, 0, 100), v: clamp(v, 0, 100) })
  }

  const applyHex = (raw: string) => {
    setHexDraft(raw)
    const parsed = hexToRgba(raw)
    if (!parsed) return
    setHsv((prev) => rgbToHsvKeepHue(parsed.rgb, prev))
    if (alpha) setAlphaValue(parsed.a)
    const next = rgbToHsvKeepHue(parsed.rgb, hsv)
    emit(next, alpha ? parsed.a : alphaValue)
  }

  const pickEyeDropper = async () => {
    try {
      const EyeDropperCtor = (
        window as unknown as {
          EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> }
        }
      ).EyeDropper
      const result = await new EyeDropperCtor().open()
      const parsed = hexToRgba(result.sRGBHex)
      if (parsed) commitHsv(rgbToHsvKeepHue(parsed.rgb, hsv))
    } catch {
      // user cancelled the eyedropper
    }
  }

  const alphaTrackStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, transparent, ${solidHex}), ${CHECKER_IMAGE}`,
    backgroundSize: '100% 100%, 12px 12px, 12px 12px, 12px 12px, 12px 12px',
    backgroundPosition: `0 0, ${CHECKER_POSITION}`,
  }

  return (
    <Popover.Root>
      <Popover.Trigger
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        style={CHECKER_STYLE}
        className={cn(
          'relative overflow-hidden rounded-md border border-border transition-colors hover:border-border-strong focus-visible:border-accent focus-visible:outline-none data-[state=open]:border-accent disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <span
          className="absolute inset-0"
          style={{ backgroundColor: currentHex }}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="z-50 w-57 rounded-lg border border-border-strong bg-card p-3 shadow-xl shadow-black/40 focus-visible:outline-none"
        >
          <div
            ref={padRef}
            role="slider"
            tabIndex={0}
            aria-label="Saturation and brightness"
            aria-valuetext={`S ${Math.round(hsv.s)}% B ${Math.round(hsv.v)}%`}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              handlePad(event.clientX, event.clientY)
            }}
            onPointerMove={(event) => {
              if (event.buttons === 0) return
              handlePad(event.clientX, event.clientY)
            }}
            onKeyDown={nudgePad}
            className="relative h-36 w-full cursor-crosshair touch-none overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            style={{
              backgroundColor: `hsl(${hsv.h} 100% 50%)`,
              backgroundImage:
                'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
            }}
          >
            <span
              className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
              style={{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
                backgroundColor: solidHex,
              }}
            />
          </div>

          <div className="mt-3 flex items-center gap-2.5">
            <span
              className="h-5 w-5 shrink-0 overflow-hidden rounded-md border border-border-strong/70"
              style={CHECKER_STYLE}
            >
              <span
                className="block h-full w-full"
                style={{ backgroundColor: currentHex }}
              />
            </span>
            <div className="flex flex-1 flex-col gap-2">
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={Math.round(hsv.h)}
                aria-label="Hue"
                onChange={(event) =>
                  commitHsv({ ...hsv, h: Number(event.target.value) })
                }
                style={{ background: HUE_GRADIENT }}
                className={THUMB_CLASS}
              />
              {alpha ? (
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(alphaValue * 100)}
                  aria-label="Alpha"
                  onChange={(event) =>
                    commitAlpha(Number(event.target.value) / 100)
                  }
                  style={alphaTrackStyle}
                  className={THUMB_CLASS}
                />
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Input
              value={hexDraft ?? currentHex.toUpperCase()}
              onChange={(event) => applyHex(event.target.value)}
              onBlur={() => setHexDraft(null)}
              spellCheck={false}
              aria-label="Hex value"
              className="h-8 flex-1 font-mono text-xs! uppercase"
            />
            {hasEyeDropper ? (
              <button
                type="button"
                onClick={pickEyeDropper}
                aria-label="Pick from screen"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground focus-visible:border-accent focus-visible:outline-none"
              >
                <Pipette className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {presets && presets.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={preset}
                  onClick={() => {
                    const parsed = hexToRgba(preset)
                    if (!parsed) return
                    commitHsv(rgbToHsvKeepHue(parsed.rgb, hsv))
                    if (alpha) commitAlpha(parsed.a)
                  }}
                  style={{ backgroundColor: preset }}
                  className="h-5 w-5 rounded border border-border-strong/60 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              ))}
            </div>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
