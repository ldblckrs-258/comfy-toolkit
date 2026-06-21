import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import type { ApplyColor, SpaceId } from '@/components/tools/color-space'
import {
  CHECKERBOARD,
  ChannelSlider,
  HUE_GRADIENT,
  SPACES,
  SpaceCard,
  buildSpaceChannels,
  parseSpaceInput,
} from '@/components/tools/color-space'
import { ErrorText } from '@/components/tools/tool-panel'
import { Input } from '@/components/ui/input'
import { buildSeo, ogUrl } from '@/lib/seo'
import type { Hsv } from '@/lib/tools/colors'
import {
  clamp,
  hexToRgba,
  hsvToRgb,
  rgbToHex,
  rgbToHsv,
  rgbToHsvKeepHue,
  roundRgb,
} from '@/lib/tools/colors'
import type {
  ExportTarget,
  GradientState,
  GradientStop,
  GradientType,
  OutputFormat,
} from '@/lib/tools/gradient'
import {
  DEFAULT_STATE,
  TARGETS,
  buildExport,
  formatStopColor,
  gradientCss,
  makeStopId,
  parseGradient,
  sortStops,
} from '@/lib/tools/gradient'
import { requireTool } from '@/lib/tools/registry'
import { cn } from '@/lib/utils'
import * as Dialog from '@radix-ui/react-dialog'
import { createFileRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Hash, Plus, Trash2, Upload, X } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('gradient')

const STORAGE_KEY = 'comfy-toolkit:gradient'

const FORMATS: Array<{ id: OutputFormat; label: string; icon: LucideIcon }> = [
  { id: 'hex', label: 'HEX', icon: Hash },
  ...SPACES.filter((s) =>
    (['rgb', 'hsl', 'oklch', 'lab', 'lch'] as Array<SpaceId>).includes(s.id),
  ).map((s) => ({ id: s.id as OutputFormat, label: s.label, icon: s.icon })),
]

const TYPES: Array<{ id: GradientType; label: string }> = [
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
  { id: 'conic', label: 'Conic' },
]

interface PresetDef {
  name: string
  type: GradientType
  angle: number
  radialShape?: 'circle' | 'ellipse'
  center?: { x: number; y: number }
  stops: Array<{ hex: string; pos: number }>
}

const PRESETS: Array<PresetDef> = [
  {
    name: 'Sunset',
    type: 'linear',
    angle: 45,
    stops: [
      { hex: '#f6d365', pos: 0 },
      { hex: '#fda085', pos: 100 },
    ],
  },
  {
    name: 'Ocean',
    type: 'linear',
    angle: 135,
    stops: [
      { hex: '#2193b0', pos: 0 },
      { hex: '#6dd5ed', pos: 100 },
    ],
  },
  {
    name: 'Grape',
    type: 'linear',
    angle: 90,
    stops: [
      { hex: '#667eea', pos: 0 },
      { hex: '#764ba2', pos: 100 },
    ],
  },
  {
    name: 'Mint',
    type: 'linear',
    angle: 120,
    stops: [
      { hex: '#43e97b', pos: 0 },
      { hex: '#38f9d7', pos: 100 },
    ],
  },
  {
    name: 'Flare',
    type: 'radial',
    angle: 0,
    radialShape: 'circle',
    center: { x: 50, y: 45 },
    stops: [
      { hex: '#ffd194', pos: 0 },
      { hex: '#ff5e62', pos: 100 },
    ],
  },
  {
    name: 'Aurora',
    type: 'conic',
    angle: 0,
    center: { x: 50, y: 50 },
    stops: [
      { hex: '#0091ff', pos: 0 },
      { hex: '#6c30f8', pos: 25 },
      { hex: '#0091ff', pos: 50 },
      { hex: '#6c30f8', pos: 75 },
      { hex: '#0091ff', pos: 100 },
    ],
  },
]

function buildPreset(def: PresetDef): GradientState {
  return {
    type: def.type,
    angle: def.angle,
    radialShape: def.radialShape ?? 'circle',
    center: def.center ?? { x: 50, y: 50 },
    format: 'hex',
    stops: def.stops.map((s) => {
      const parsed = hexToRgba(s.hex)!
      return {
        id: makeStopId(),
        hsv: rgbToHsv(parsed.rgb),
        a: parsed.a,
        pos: s.pos,
      }
    }),
  }
}

function Chip({
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

function interpolateStop(
  stops: Array<GradientStop>,
  pos: number,
): { hsv: Hsv; a: number } {
  const sorted = sortStops(stops)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (pos <= first.pos) return { hsv: first.hsv, a: first.a }
  if (pos >= last.pos) return { hsv: last.hsv, a: last.a }
  let lo = first
  let hi = last
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].pos <= pos && pos <= sorted[i + 1].pos) {
      lo = sorted[i]
      hi = sorted[i + 1]
      break
    }
  }
  const t = hi.pos === lo.pos ? 0 : (pos - lo.pos) / (hi.pos - lo.pos)
  const ra = roundRgb(hsvToRgb(lo.hsv))
  const rb = roundRgb(hsvToRgb(hi.hsv))
  const rgb = {
    r: ra.r + (rb.r - ra.r) * t,
    g: ra.g + (rb.g - ra.g) * t,
    b: ra.b + (rb.b - ra.b) * t,
  }
  return { hsv: rgbToHsv(rgb), a: lo.a + (hi.a - lo.a) * t }
}

export const Route = createFileRoute('/tools/gradient')({
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
  const [state, setStateRaw] = React.useState<GradientState>(DEFAULT_STATE)
  const [selectedId, setSelectedId] = React.useState<string>(
    DEFAULT_STATE.stops[0].id,
  )

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as GradientState
        if (Array.isArray(parsed.stops) && parsed.stops.length >= 2) {
          setStateRaw(parsed)
          setSelectedId(parsed.stops[0].id)
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setState = React.useCallback((next: GradientState) => {
    setStateRaw(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const selected =
    state.stops.find((s) => s.id === selectedId) ?? state.stops[0]

  const updateSelected = (patch: Partial<GradientStop>) =>
    setState({
      ...state,
      stops: state.stops.map((s) =>
        s.id === selected.id ? { ...s, ...patch } : s,
      ),
    })

  const apply: ApplyColor = (hsv, alpha) =>
    updateSelected({ hsv, a: alpha ?? selected.a })

  const moveStop = (id: string, pos: number) =>
    setState({
      ...state,
      stops: state.stops.map((s) =>
        s.id === id ? { ...s, pos: clamp(pos, 0, 100) } : s,
      ),
    })

  const addStop = (pos: number) => {
    const { hsv, a } = interpolateStop(state.stops, pos)
    const id = makeStopId()
    setState({ ...state, stops: [...state.stops, { id, hsv, a, pos }] })
    setSelectedId(id)
  }

  const removeStop = (id: string) => {
    if (state.stops.length <= 2) return
    const next = state.stops.filter((s) => s.id !== id)
    setState({ ...state, stops: next })
    if (selectedId === id) setSelectedId(next[0].id)
  }

  const setAlpha = (next: number) =>
    updateSelected({ a: clamp(next, 0, 100) / 100 })

  const rgb = roundRgb(hsvToRgb(selected.hsv))
  const isHex = state.format === 'hex'
  const active = FORMATS.find((f) => f.id === state.format) ?? FORMATS[0]

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div
              className="relative h-44 overflow-hidden rounded-lg border border-border"
              style={CHECKERBOARD}
            >
              <div
                className="absolute inset-0"
                style={{ background: gradientCss(state) }}
              />
            </div>
            <StopBar
              stops={state.stops}
              format={state.format}
              selectedId={selected.id}
              onSelect={setSelectedId}
              onMove={moveStop}
              onAdd={addStop}
              onRemove={removeStop}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => addStop(50)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" /> Add stop
              </button>
              <button
                type="button"
                onClick={() => removeStop(selected.id)}
                disabled={state.stops.length <= 2}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Position
                </span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(selected.pos)}
                  onChange={(event) => {
                    if (event.target.value === '') return
                    const n = Number(event.target.value)
                    if (!Number.isNaN(n)) moveStop(selected.id, n)
                  }}
                  className="w-20 font-mono"
                />
              </div>
              <ImportDialog
                onLoad={(next) => {
                  setState(next)
                  setSelectedId(next.stops[0].id)
                }}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="flex flex-col gap-4">
              <Card label="Gradient" bodyClassName="gap-3 p-3">
                <div className="flex flex-wrap gap-1">
                  {TYPES.map((t) => (
                    <Chip
                      key={t.id}
                      active={state.type === t.id}
                      onClick={() => setState({ ...state, type: t.id })}
                    >
                      {t.label}
                    </Chip>
                  ))}
                </div>

                {state.type !== 'radial' ? (
                  <ChannelSlider
                    label="Angle"
                    value={Math.round(state.angle)}
                    max={360}
                    suffix="°"
                    gradient={HUE_GRADIENT}
                    onChange={(v) => setState({ ...state, angle: v })}
                  />
                ) : null}

                {state.type === 'radial' ? (
                  <div className="flex flex-wrap gap-1">
                    {(['circle', 'ellipse'] as const).map((shape) => (
                      <Chip
                        key={shape}
                        active={state.radialShape === shape}
                        onClick={() =>
                          setState({ ...state, radialShape: shape })
                        }
                      >
                        {shape}
                      </Chip>
                    ))}
                  </div>
                ) : null}

                {state.type !== 'linear' ? (
                  <>
                    <ChannelSlider
                      label="X"
                      value={Math.round(state.center.x)}
                      max={100}
                      suffix="%"
                      gradient="linear-gradient(to right, #000, #fff)"
                      onChange={(v) =>
                        setState({
                          ...state,
                          center: { ...state.center, x: v },
                        })
                      }
                    />
                    <ChannelSlider
                      label="Y"
                      value={Math.round(state.center.y)}
                      max={100}
                      suffix="%"
                      gradient="linear-gradient(to right, #000, #fff)"
                      onChange={(v) =>
                        setState({
                          ...state,
                          center: { ...state.center, y: v },
                        })
                      }
                    />
                  </>
                ) : null}
              </Card>

              <StopsPanel
                stops={state.stops}
                format={state.format}
                selectedId={selected.id}
                onSelect={setSelectedId}
                onRemove={removeStop}
              />
            </div>

            <div className="flex flex-col gap-3">
              <PresetBar
                onLoad={(next) => {
                  setState(next)
                  setSelectedId(next.stops[0].id)
                }}
              />

              <div className="flex flex-wrap gap-1">
                {FORMATS.map((option) => (
                  <Chip
                    key={option.id}
                    active={state.format === option.id}
                    onClick={() => setState({ ...state, format: option.id })}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>

              <SpaceCard
                icon={active.icon}
                label={`Stop · ${active.label}`}
                value={formatStopColor(state.format, selected.hsv, selected.a)}
                onInput={(value) => {
                  if (isHex) {
                    const parsed = hexToRgba(value)
                    if (!parsed) return false
                    apply(rgbToHsvKeepHue(parsed.rgb, selected.hsv), parsed.a)
                    return true
                  }
                  return parseSpaceInput(
                    state.format as SpaceId,
                    value,
                    selected.hsv,
                    apply,
                  )
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
                        if (parsed)
                          apply(rgbToHsvKeepHue(parsed.rgb, selected.hsv))
                      }}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label="Stop color picker"
                    />
                  </label>
                ) : (
                  buildSpaceChannels(
                    state.format as SpaceId,
                    selected.hsv,
                    apply,
                  ).map((channel) => (
                    <ChannelSlider key={channel.label} {...channel} />
                  ))
                )}
              </SpaceCard>

              <SpaceCard
                icon={Hash}
                label="Alpha"
                value={`${Math.round(selected.a * 100)}%`}
                onInput={(value) => {
                  const n = Number(value.replace(/[^\d.]/g, ''))
                  if (Number.isNaN(n)) return false
                  setAlpha(n)
                  return true
                }}
              >
                <ChannelSlider
                  label="A"
                  value={Math.round(selected.a * 100)}
                  max={100}
                  suffix="%"
                  gradient={`linear-gradient(to right, ${rgbToHex(rgb)}00, ${rgbToHex(rgb)})`}
                  onChange={setAlpha}
                />
              </SpaceCard>
            </div>
          </div>

          <ExportCard state={state} />
        </div>
      </div>
    </div>
  )
}

function StopBar({
  stops,
  format,
  selectedId,
  onSelect,
  onMove,
  onAdd,
  onRemove,
}: {
  stops: Array<GradientStop>
  format: OutputFormat
  selectedId: string
  onSelect: (id: string) => void
  onMove: (id: string, pos: number) => void
  onAdd: (pos: number) => void
  onRemove: (id: string) => void
}) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const draggingRef = React.useRef<string | null>(null)
  const onMoveRef = React.useRef(onMove)
  onMoveRef.current = onMove

  const posFromX = (clientX: number) => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
  }

  React.useEffect(() => {
    const move = (event: PointerEvent) => {
      const id = draggingRef.current
      if (id) onMoveRef.current(id, posFromX(event.clientX))
    }
    const up = () => {
      draggingRef.current = null
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  const barCss = `linear-gradient(to right, ${sortStops(stops)
    .map((s) => `${formatStopColor(format, s.hsv, s.a)} ${Math.round(s.pos)}%`)
    .join(', ')})`

  return (
    <div
      ref={trackRef}
      className="relative h-9 rounded-md border border-border"
      style={CHECKERBOARD}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onAdd(posFromX(event.clientX))
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-md"
        style={{ background: barCss }}
      />
      {stops.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-label={`Stop at ${Math.round(s.pos)}%`}
          onPointerDown={(event) => {
            event.preventDefault()
            onSelect(s.id)
            draggingRef.current = s.id
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              onMove(s.id, s.pos - 1)
            } else if (event.key === 'ArrowRight') {
              event.preventDefault()
              onMove(s.id, s.pos + 1)
            } else if (event.key === 'Delete' || event.key === 'Backspace') {
              event.preventDefault()
              onRemove(s.id)
            }
          }}
          className="absolute top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{
            left: `${s.pos}%`,
            backgroundColor: rgbToHex(roundRgb(hsvToRgb(s.hsv))),
          }}
        >
          {s.id === selectedId ? (
            <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]" />
          ) : null}
        </button>
      ))}
    </div>
  )
}

function PresetBar({ onLoad }: { onLoad: (state: GradientState) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Examples
      </span>
      <div className="grid grid-cols-3 gap-1.5">
        {PRESETS.map((def) => (
          <button
            key={def.name}
            type="button"
            onClick={() => onLoad(buildPreset(def))}
            title={def.name}
            aria-label={`Load ${def.name} gradient`}
            className="h-9 rounded-md border border-border transition-transform hover:scale-[1.04]"
            style={{ background: gradientCss(buildPreset(def)) }}
          />
        ))}
      </div>
    </div>
  )
}

function StopsPanel({
  stops,
  format,
  selectedId,
  onSelect,
  onRemove,
}: {
  stops: Array<GradientStop>
  format: OutputFormat
  selectedId: string
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <Card label="Stops" bodyClassName="gap-1 p-2">
      {sortStops(stops).map((s) => (
        <div
          key={s.id}
          className={cn(
            'flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors',
            s.id === selectedId
              ? 'border-accent bg-accent/10'
              : 'border-transparent hover:bg-muted/50',
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(s.id)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span
              className="h-4 w-4 shrink-0 rounded border border-border"
              style={{
                backgroundColor: rgbToHex(roundRgb(hsvToRgb(s.hsv))),
              }}
            />
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground">
              {formatStopColor(format, s.hsv, s.a)}
            </span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {Math.round(s.pos)}%
            </span>
          </button>
          <button
            type="button"
            onClick={() => onRemove(s.id)}
            disabled={stops.length <= 2}
            aria-label="Remove stop"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </Card>
  )
}

function ImportDialog({ onLoad }: { onLoad: (state: GradientState) => void }) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const [error, setError] = React.useState(false)

  const load = () => {
    const parsed = parseGradient(draft)
    if (!parsed) {
      setError(true)
      return
    }
    onLoad(parsed)
    setDraft('')
    setError(false)
    setOpen(false)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError(false)
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Upload className="h-3.5 w-3.5" /> Import CSS
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[20vh] z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border-strong bg-card shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Dialog.Title className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Import gradient
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <Dialog.Description className="font-mono text-[11px] text-muted-foreground">
              Paste a CSS gradient to load it into the editor.
            </Dialog.Description>
            <textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                setError(false)
              }}
              autoFocus
              spellCheck={false}
              placeholder="linear-gradient(90deg, #f00 0%, #00f 100%)"
              className="min-h-28 w-full resize-none rounded-md border border-border bg-background p-3 font-mono text-[12px] leading-relaxed text-foreground outline-none focus:border-border-strong placeholder:text-muted-foreground"
            />
            {error ? (
              <ErrorText>Couldn't parse that gradient.</ErrorText>
            ) : null}
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={load}
                className="rounded-md border border-accent bg-accent/10 px-3 py-1.5 font-mono text-[11px] text-foreground transition-colors hover:bg-accent/20"
              >
                Load
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ExportCard({ state }: { state: GradientState }) {
  const [target, setTarget] = React.useState<ExportTarget>('css')
  const results = TARGETS.map((t) => ({
    ...t,
    result: buildExport(t.id, state),
  }))
  const active = results.find((t) => t.id === target) ?? results[0]

  return (
    <Card
      label="Export"
      headerClassName="flex-wrap"
      copyValue={active.result.code}
      value={active.result.code}
      readOnly
      language={active.lang}
      minRows={6}
      bodyClassName="max-h-96"
      headerLeft={
        <div className="flex flex-wrap items-center gap-1">
          {results.map((option) => (
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
              {option.result.approximate ? (
                <span
                  className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-warning align-middle"
                  aria-hidden
                />
              ) : null}
            </button>
          ))}
        </div>
      }
    />
  )
}
