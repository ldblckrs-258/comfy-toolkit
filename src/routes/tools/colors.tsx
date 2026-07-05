import { ToolHeader } from '@/components/layout/tool-header'
import {
  CHECKERBOARD,
  ChannelSlider,
  SPACES,
  SpaceCard,
  buildSpaceChannels,
  formatSpace,
  parseNumbers,
  parseSpaceInput,
} from '@/components/tools/color-space'
import type { ApplyColor } from '@/components/tools/color-space'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { ColorPicker } from '@/components/ui/color-picker'
import { Input } from '@/components/ui/input'
import type { Hsv, Rgb } from '@/lib/tools/colors'
import {
  clamp,
  formatRgb,
  hexToRgba,
  hsvToRgb,
  rgbToHex,
  rgbToHsvKeepHue,
  roundRgb,
} from '@/lib/tools/colors'
import { requireTool } from '@/lib/tools/registry'
import { buildSeo, ogUrl } from '@/lib/seo'
import { createFileRoute } from '@tanstack/react-router'
import { Droplets } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('colors')

const STORAGE_KEY = 'comfy-toolkit:colors'
const DEFAULT: State = { hsv: { h: 180, s: 90, v: 69 }, a: 1 }

interface State {
  hsv: Hsv
  a: number
}

export const Route = createFileRoute('/tools/colors')({
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
  const [state, setStateRaw] = React.useState<State>(DEFAULT)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setStateRaw(JSON.parse(stored) as State)
    } catch {
      /* ignore */
    }
  }, [])

  const setState = React.useCallback((next: State) => {
    setStateRaw(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const { hsv, a } = state
  const rgb = roundRgb(hsvToRgb(hsv))
  const hex = rgbToHex(rgb, a)

  const apply: ApplyColor = (next, alpha) =>
    setState({ hsv: next, a: alpha ?? a })
  const setAlpha = (next: number) =>
    setState({ hsv, a: clamp(next, 0, 100) / 100 })

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Preview rgb={rgb} alpha={a} />
            <div className="flex flex-col gap-4">
              <HexPicker
                hex={hex}
                rgb={rgb}
                onHex={(value) => {
                  const parsed = hexToRgba(value)
                  if (parsed)
                    setState({
                      hsv: rgbToHsvKeepHue(parsed.rgb, hsv),
                      a: parsed.a,
                    })
                }}
                onPick={(value) => {
                  const parsed = hexToRgba(value)
                  if (parsed)
                    setState({ hsv: rgbToHsvKeepHue(parsed.rgb, hsv), a })
                }}
              />

              <SpaceCard
                icon={Droplets}
                label="Alpha"
                value={`${Math.round(a * 100)}%`}
                onInput={(value) => {
                  const n = parseNumbers(value)
                  if (!n.length) return false
                  setAlpha(n[0])
                  return true
                }}
              >
                <ChannelSlider
                  label="A"
                  value={Math.round(a * 100)}
                  max={100}
                  suffix="%"
                  gradient={`linear-gradient(to right, ${rgbToHex(rgb)}00, ${rgbToHex(rgb)})`}
                  onChange={setAlpha}
                />
              </SpaceCard>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {SPACES.map((s) => (
              <SpaceCard
                key={s.id}
                icon={s.icon}
                label={s.label}
                value={formatSpace(s.id, rgb, a)}
                onInput={(value) => parseSpaceInput(s.id, value, hsv, apply)}
              >
                {buildSpaceChannels(s.id, hsv, apply).map((channel) => (
                  <ChannelSlider key={channel.label} {...channel} />
                ))}
              </SpaceCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Preview({ rgb, alpha }: { rgb: Rgb; alpha: number }) {
  return (
    <div
      className="relative h-full min-h-[10rem] overflow-hidden rounded-lg border border-border"
      style={CHECKERBOARD}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: formatRgb(rgb, alpha) }}
      />
    </div>
  )
}

function HexPicker({
  hex,
  rgb,
  onHex,
  onPick,
}: {
  hex: string
  rgb: Rgb
  onHex: (value: string) => void
  onPick: (value: string) => void
}) {
  const [draft, setDraft] = React.useState(hex)
  React.useEffect(() => setDraft(hex), [hex])

  const invalid = draft.trim() !== '' && hexToRgba(draft) === null

  return (
    <div className="flex flex-col gap-2">
      <Card label="Hex" copyValue={hex} bodyClassName="p-3">
        <div className="flex items-center gap-2">
          <ColorPicker
            value={rgbToHex(rgb)}
            onChange={onPick}
            aria-label="Color picker"
            className="h-9 w-9 shrink-0"
          />
          <Input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              onHex(event.target.value)
            }}
            spellCheck={false}
            placeholder="#10b1b1"
            className="font-mono uppercase"
          />
        </div>
      </Card>
      {invalid ? <ErrorText>Not a valid hex color.</ErrorText> : null}
    </div>
  )
}
