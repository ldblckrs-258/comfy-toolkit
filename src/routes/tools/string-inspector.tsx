import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { Tabs } from '@/components/ui/tabs'
import { buildSeo, ogUrl } from '@/lib/seo'
import { requireTool } from '@/lib/tools/registry'
import type {
  CodePointInfo,
  NormalizationForm,
  SuspiciousChar,
  SuspiciousKind,
  TextStats,
} from '@/lib/tools/string-inspector'
import {
  analyzeText,
  cleanText,
  findSuspicious,
  isNormalized,
  listCodePoints,
  normalizeText,
} from '@/lib/tools/string-inspector'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import { usePersistedState } from '@/lib/use-persisted-state'
import { createFileRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Ban,
  Binary,
  Braces,
  Copy,
  EyeOff,
  Hash,
  Info,
  LayoutList,
  ScanText,
  ShieldAlert,
  ShieldCheck,
  Space,
  Sparkles,
  Table2,
  Type,
  WandSparkles,
  WholeWord,
  WrapText,
} from 'lucide-react'
import * as React from 'react'

const tool = requireTool('string-inspector')

type Tab = 'overview' | 'codepoints'
type OutputForm = 'clean' | NormalizationForm

const CODE_POINT_LIMIT = 2000

export const Route = createFileRoute('/tools/string-inspector')({
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
  const [input, setInput] = usePersistedState('string-inspector:input', '')
  const [tab, setTab] = React.useState<Tab>('overview')
  const [form, setForm] = React.useState<OutputForm>('clean')

  const debouncedInput = useDebouncedValue(input)

  const stats = React.useMemo(
    () => analyzeText(debouncedInput),
    [debouncedInput],
  )
  const suspicious = React.useMemo(
    () => findSuspicious(debouncedInput),
    [debouncedInput],
  )
  const suspiciousIndices = React.useMemo(
    () => new Set(suspicious.map((hit) => hit.codePointIndex)),
    [suspicious],
  )
  const codePoints = React.useMemo(
    () =>
      listCodePoints([...debouncedInput].slice(0, CODE_POINT_LIMIT).join('')),
    [debouncedInput],
  )
  const output = React.useMemo(
    () =>
      form === 'clean'
        ? cleanText(debouncedInput)
        : normalizeText(debouncedInput, form),
    [debouncedInput, form],
  )
  const notNfc = React.useMemo(
    () => Boolean(debouncedInput) && !isNormalized(debouncedInput),
    [debouncedInput],
  )

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          <Card
            label="Text"
            className="h-40"
            icon={ScanText}
            value={input}
            onChange={setInput}
            onClear={() => setInput('')}
            placeholder="Paste or type text to inspect…"
            minRows={5}
          />

          <Tabs
            value={tab}
            onChange={setTab}
            className="self-start"
            options={[
              {
                value: 'overview',
                label: (
                  <span className="flex items-center gap-1.5">
                    <LayoutList className="h-3.5 w-3.5" />
                    Overview
                  </span>
                ),
              },
              {
                value: 'codepoints',
                label: (
                  <span className="flex items-center gap-1.5">
                    <Table2 className="h-3.5 w-3.5" />
                    Code points
                  </span>
                ),
              },
            ]}
          />

          {tab === 'overview' ? (
            <div className="flex flex-col gap-6">
              <StatChips stats={stats} />
              <SuspiciousPanel suspicious={suspicious} />
              <OutputPanel
                form={form}
                onFormChange={setForm}
                output={output}
                notNfc={notNfc}
              />
            </div>
          ) : (
            <CodePointsTable
              codePoints={codePoints}
              total={stats.codePoints}
              suspiciousIndices={suspiciousIndices}
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface StatConfig {
  key: keyof TextStats
  label: string
  icon: LucideIcon
  color: string
}

const STAT_CONFIG: Array<StatConfig> = [
  { key: 'graphemes', label: 'Graphemes', icon: Type, color: '#60a5fa' },
  { key: 'codePoints', label: 'Code points', icon: Hash, color: '#a78bfa' },
  { key: 'utf16Units', label: 'UTF-16 units', icon: Binary, color: '#22d3ee' },
  { key: 'utf8Bytes', label: 'UTF-8 bytes', icon: Braces, color: '#fbbf24' },
  { key: 'words', label: 'Words', icon: WholeWord, color: '#fb923c' },
  { key: 'lines', label: 'Lines', icon: WrapText, color: '#f472b6' },
]

function StatChips({ stats }: { stats: TextStats }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-3"
          style={{
            borderTop: `2px solid color-mix(in oklab, ${color} 55%, transparent)`,
          }}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{
              backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
              color,
            }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xl font-semibold leading-none tabular-nums text-foreground">
              {stats[key].toLocaleString()}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

interface KindConfig {
  label: string
  icon: LucideIcon
  color: string
}

const KIND_CONFIG: Record<SuspiciousKind, KindConfig> = {
  'zero-width': { label: 'Zero-width', icon: EyeOff, color: '#f472b6' },
  'bidi-control': {
    label: 'Bidi control',
    icon: ArrowLeftRight,
    color: '#a78bfa',
  },
  control: { label: 'Control', icon: Ban, color: '#fb7185' },
  nbsp: { label: 'Space', icon: Space, color: '#38bdf8' },
  homoglyph: { label: 'Homoglyph', icon: Copy, color: '#fbbf24' },
}

function SuspiciousPanel({
  suspicious,
}: {
  suspicious: Array<SuspiciousChar>
}) {
  if (suspicious.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3.5 py-2.5">
        <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
        <span className="text-sm text-muted-foreground">
          No hidden characters found.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0 text-warning" />
        <p className="text-sm font-semibold tracking-tight text-warning">
          {suspicious.length} suspicious character
          {suspicious.length === 1 ? '' : 's'} found
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {suspicious.map((hit, index) => {
          const { label, icon: Icon, color } = KIND_CONFIG[hit.kind]
          return (
            <div
              key={`${hit.codePointIndex}-${index}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border px-3 py-2.5"
              style={{
                borderColor: `color-mix(in oklab, ${color} 32%, transparent)`,
                backgroundColor: `color-mix(in oklab, ${color} 7%, transparent)`,
              }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{
                  backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
                  color,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span
                className="font-mono text-[13px] font-medium"
                style={{ color }}
              >
                {hit.hex}
              </span>
              <span className="min-w-0 flex-1 text-sm text-foreground">
                {hit.note}
              </span>
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                style={{
                  backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`,
                  color,
                }}
              >
                {label}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                at {hit.codePointIndex}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const OUTPUT_FORMS: Array<{ value: OutputForm; label: React.ReactNode }> = [
  {
    value: 'clean',
    label: (
      <span className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        Clean
      </span>
    ),
  },
  { value: 'NFC', label: 'NFC' },
  { value: 'NFD', label: 'NFD' },
  { value: 'NFKC', label: 'NFKC' },
  { value: 'NFKD', label: 'NFKD' },
]

function OutputPanel({
  form,
  onFormChange,
  output,
  notNfc,
}: {
  form: OutputForm
  onFormChange: (form: OutputForm) => void
  output: string
  notNfc: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs
          size="sm"
          value={form}
          onChange={onFormChange}
          options={OUTPUT_FORMS}
        />
        {notNfc ? (
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-warning">
            <Info className="h-3.5 w-3.5" />
            Input is not NFC-normalized.
          </span>
        ) : null}
      </div>
      <Card
        label="Output"
        className="h-40"
        icon={WandSparkles}
        readOnly
        value={output}
        copyValue={output}
      />
    </div>
  )
}

function displayChar(char: string, codePoint: number): string {
  const invisible =
    codePoint <= 0x20 ||
    (codePoint >= 0x7f && codePoint <= 0xa0) ||
    (codePoint >= 0x2000 && codePoint <= 0x200f) ||
    (codePoint >= 0x2028 && codePoint <= 0x202e) ||
    (codePoint >= 0x2060 && codePoint <= 0x2069) ||
    codePoint === 0xfeff
  return invisible ? '·' : char
}

function CodePointsTable({
  codePoints,
  total,
  suspiciousIndices,
}: {
  codePoints: Array<CodePointInfo>
  total: number
  suspiciousIndices: Set<number>
}) {
  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Enter text to break it down by code point.
      </p>
    )
  }

  return (
    <Card
      label={`Code points (${total.toLocaleString()})`}
      icon={Table2}
      bodyClassName="overflow-auto"
    >
      <table className="w-full border-collapse font-mono text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Char</th>
            <th className="px-3 py-2 font-medium">Hex</th>
            <th className="px-3 py-2 font-medium">Dec</th>
            <th className="px-3 py-2 font-medium">UTF-8</th>
          </tr>
        </thead>
        <tbody>
          {codePoints.map((info, index) => {
            const rendered = displayChar(info.char, info.decimal)
            const flagged = suspiciousIndices.has(index)
            return (
              <tr
                key={index}
                className={
                  flagged
                    ? 'border-t border-warning/25 bg-warning/6'
                    : 'border-t border-border'
                }
              >
                <td className="px-3 py-1.5 text-muted-foreground">{index}</td>
                <td className="px-3 py-1.5 text-xs">
                  <span
                    className={
                      rendered === '·'
                        ? 'text-muted-foreground/60'
                        : 'text-foreground'
                    }
                  >
                    {rendered}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-accent">{info.hex}</td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {info.decimal}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {info.utf8
                    .map((byte) =>
                      byte.toString(16).toUpperCase().padStart(2, '0'),
                    )
                    .join(' ')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {total > CODE_POINT_LIMIT ? (
        <p className="flex items-center gap-1.5 border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Showing first {CODE_POINT_LIMIT.toLocaleString()} of{' '}
          {total.toLocaleString()} code points.
        </p>
      ) : null}
    </Card>
  )
}
