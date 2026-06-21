import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { CopyButton } from '@/components/tools/copy-button'
import { ErrorText } from '@/components/tools/tool-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { requireTool } from '@/lib/tools/registry'
import type { UuidField, UuidFieldKey } from '@/lib/tools/uuid'
import {
  decomposeUuidV7,
  extractTimestampMs,
  generateUuidsV7,
} from '@/lib/tools/uuid'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('uuid-generator')

type Mode = 'generate' | 'extract'
type TsMode = 'now' | 'set'

const FIELD_COLORS: Record<UuidFieldKey, string> = {
  timestamp: '#60a5fa',
  version: '#a78bfa',
  randA: '#fbbf24',
  variant: '#fb923c',
  randB: '#34d399',
}

export const Route = createFileRoute('/tools/uuid-generator')({
  head: () => ({ meta: [{ title: `${tool.name} — ComfyToolkit` }] }),
  component: Page,
})

function Page() {
  const [mode, setMode] = React.useState<Mode>('generate')

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <Tabs
          value={mode}
          onChange={setMode}
          className="mb-6"
          options={[
            { value: 'generate', label: 'Generator' },
            { value: 'extract', label: 'Timestamp extractor' },
          ]}
        />
        {mode === 'generate' ? <GeneratorView /> : <ExtractView />}
      </div>
    </div>
  )
}

function GeneratorView() {
  const [count, setCount] = React.useState(3)
  const [tsMode, setTsMode] = React.useState<TsMode>('now')
  const [setTime, setSetTime] = React.useState('')
  const [list, setList] = React.useState<Array<string>>([])
  const [selected, setSelected] = React.useState('')

  const generate = React.useCallback(() => {
    const parsed = setTime ? new Date(setTime).getTime() : NaN
    const ms = tsMode === 'set' && !Number.isNaN(parsed) ? parsed : undefined
    const next = generateUuidsV7(count, ms)
    setList(next)
    setSelected(next[0])
  }, [count, tsMode, setTime])

  React.useEffect(() => {
    const next = generateUuidsV7(3)
    setList(next)
    setSelected(next[0])
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold tracking-tight">
            Number of UUIDs to generate
          </label>
          <Input
            type="number"
            min={1}
            max={1000}
            value={Number.isNaN(count) ? '' : count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Generate between 1 and 1000 UUIDs at once.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold tracking-tight">
            Timestamp mode
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(['now', 'set'] as Array<TsMode>).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTsMode(option)}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors',
                  tsMode === option
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border',
                    tsMode === option
                      ? 'border-accent'
                      : 'border-border-strong',
                  )}
                >
                  {tsMode === option ? (
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  ) : null}
                </span>
                {option === 'now' ? 'Now' : 'Set a time'}
              </button>
            ))}
          </div>
          {tsMode === 'now' ? (
            <p className="text-xs text-muted-foreground">
              UUIDs will use the current timestamp.
            </p>
          ) : (
            <Input
              type="datetime-local"
              value={setTime}
              onChange={(event) => setSetTime(event.target.value)}
            />
          )}
        </div>

        <Button onClick={generate}>
          <RefreshCw className="h-4 w-4" />
          Generate UUIDs
        </Button>

        <Card
          label={`Generated UUIDs (${list.length})`}
          copyValue={list.join('\n')}
          bodyClassName="max-h-[calc(100svh-38rem)] min-h-32 gap-1.5 overflow-auto overscroll-contain p-2"
        >
          {list.map((id, index) => (
            <div
              key={`${id}-${index}`}
              onClick={() => setSelected(id)}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2.5 font-mono text-[13px] transition-colors',
                selected === id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-border-strong',
              )}
            >
              <span className="break-all">{id}</span>
              <CopyButton value={id} />
            </div>
          ))}
        </Card>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        {selected ? (
          <Breakdown uuid={selected} legend />
        ) : (
          <Empty>Generate a UUID to see its breakdown.</Empty>
        )}
      </div>
    </div>
  )
}

function ExtractView() {
  const [input, setInput] = usePersistedState('uuid:extract', '')
  const ms = extractTimestampMs(input)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold tracking-tight">
            UUID v7
          </label>
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="019ee6e6-ae66-71e5-8ca1-4dad13b72378"
            spellCheck={false}
            className="font-mono"
          />
          {input && ms === null ? (
            <ErrorText>Not a valid UUID.</ErrorText>
          ) : null}
        </div>
        {ms !== null ? (
          <div className="flex flex-col gap-2">
            <SummaryRow label="Unix (ms)" value={String(ms)} />
            <SummaryRow label="ISO 8601" value={new Date(ms).toISOString()} />
            <SummaryRow
              label="Local time"
              value={new Date(ms).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'long',
              })}
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        {ms !== null ? (
          <Breakdown uuid={input} legend />
        ) : (
          <Empty>Paste a UUID v7 to inspect its fields.</Empty>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="break-all font-mono text-[13px] text-foreground">
        {value}
      </span>
    </div>
  )
}

function Breakdown({ uuid, legend }: { uuid: string; legend?: boolean }) {
  const parts = decomposeUuidV7(uuid)
  if (!parts) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5">
        <ColoredUuid uuid={uuid} />
        <CopyButton value={uuid} />
      </div>
      {legend ? (
        <p className="text-xs text-muted-foreground">
          Field colors match the segments in the UUID above.
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        {parts.fields.map((field) => (
          <FieldCard key={field.key} field={field} />
        ))}
      </div>
    </div>
  )
}

function indexToKey(index: number): UuidFieldKey {
  if (index < 12) return 'timestamp'
  if (index === 12) return 'version'
  if (index < 16) return 'randA'
  if (index === 16) return 'variant'
  return 'randB'
}

function ColoredUuid({ uuid }: { uuid: string }) {
  type Run = { text: string; color: string | null }
  const runs: Array<Run> = []
  let hi = 0
  let last: Run | undefined
  for (const char of uuid) {
    if (char === '-') {
      last = { text: '-', color: null }
      runs.push(last)
      continue
    }
    const color = FIELD_COLORS[indexToKey(hi)]
    hi += 1
    if (last && last.color === color) last.text += char
    else {
      last = { text: char, color }
      runs.push(last)
    }
  }

  return (
    <div className="break-all font-mono text-base leading-relaxed sm:text-lg">
      {runs.map((run, index) =>
        run.color ? (
          <span
            key={index}
            className="rounded-[3px] px-[1px]"
            style={{
              backgroundColor: `color-mix(in oklab, ${run.color} 30%, transparent)`,
            }}
          >
            {run.text}
          </span>
        ) : (
          <span key={index} className="text-muted-foreground">
            {run.text}
          </span>
        ),
      )}
    </div>
  )
}

function FieldCard({ field }: { field: UuidField }) {
  const color = FIELD_COLORS[field.key]
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-[3px]"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-semibold tracking-tight">
          {field.label}
          {field.key === 'version' ? ` (v${field.hex})` : ''}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {field.bits} bits · hex: {field.hex}
      </p>
      <p className="break-all font-mono text-xs text-muted-foreground">
        binary: {field.binary}
      </p>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}
