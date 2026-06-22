import { ToolHeader } from '@/components/layout/tool-header'
import { Card, CopyIcon } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { requireTool } from '@/lib/tools/registry'
import {
  convertBatch,
  durationBetween,
  extractFromId,
  formatInstant,
  formatTokens,
  listTimeZones,
  parseDate,
  parseEpoch,
  relativeTime,
} from '@/lib/tools/timestamp'
import type { EpochUnit } from '@/lib/tools/timestamp'
import { buildSeo, ogUrl } from '@/lib/seo'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

const tool = requireTool('unix-timestamp')

type Mode = 'convert' | 'extract' | 'batch' | 'duration' | 'format'

export const Route = createFileRoute('/tools/unix-timestamp')({
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

function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

function inputToMs(
  raw: string,
  timeZone: string,
  unit: EpochUnit | 'auto' = 'auto',
): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const epoch = parseEpoch(trimmed, unit)
  if (epoch) return epoch.ms
  return parseDate(trimmed, timeZone)
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
      <span className="w-32 shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="flex-1 truncate font-mono text-[13px] text-foreground">
        {value}
      </span>
      <CopyIcon value={value} />
    </div>
  )
}

function CopyButton({
  value,
  label,
}: {
  value: string | (() => string)
  label: string
}) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      size="sm"
      variant="subtle"
      disabled={typeof value === 'string' && !value}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(
            typeof value === 'function' ? value() : value,
          )
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {copied ? 'Copied' : label}
    </Button>
  )
}

const UNIT_OPTIONS: Array<{ value: EpochUnit | 'auto'; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 's', label: 's' },
  { value: 'ms', label: 'ms' },
  { value: 'us', label: 'µs' },
  { value: 'ns', label: 'ns' },
]

function ConvertTab({
  timeZone,
  nowMs,
  now,
}: {
  timeZone: string
  nowMs: number
  now: number | null
}) {
  const [input, setInput] = usePersistedState('unix-timestamp:input', '')
  const [unit, setUnit] = React.useState<EpochUnit | 'auto'>('auto')

  const result = React.useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return null
    const epoch = parseEpoch(trimmed, unit)
    if (epoch) return { ms: epoch.ms, detected: epoch.unit }
    const ms = parseDate(trimmed, timeZone)
    if (ms !== null) return { ms, detected: null }
    return { ms: null, detected: null }
  }, [input, unit, timeZone])

  const formatted =
    result && result.ms !== null ? formatInstant(result.ms, timeZone) : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="1700000000 or 2023-11-14 22:13:20"
          className="min-w-56 flex-1 font-mono"
        />
        <Tabs
          size="sm"
          value={unit}
          onChange={setUnit}
          options={UNIT_OPTIONS}
        />
        <Button
          variant="subtle"
          size="sm"
          disabled={now === null}
          onClick={() => setInput(String(Math.floor((now ?? 0) / 1000)))}
        >
          Use now
        </Button>
      </div>

      {result?.detected ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Detected unit:{' '}
          <span className="text-accent">{result.detected}</span>
        </p>
      ) : null}

      {formatted ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <ResultRow label="Unix (s)" value={String(formatted.unixS)} />
          <ResultRow label="Unix (ms)" value={String(formatted.unixMs)} />
          <ResultRow label="ISO 8601" value={formatted.iso} />
          <ResultRow label="ISO (local)" value={formatted.isoLocal} />
          <ResultRow label="RFC 2822" value={formatted.rfc2822} />
          <ResultRow label="Locale" value={formatted.locale} />
          <ResultRow label="Date" value={formatted.dateOnly} />
          <ResultRow label="Time" value={formatted.timeOnly} />
          <ResultRow
            label="Relative"
            value={relativeTime(formatted.unixMs, nowMs)}
          />
        </div>
      ) : input.trim() ? (
        <ErrorText>Unrecognized timestamp or date.</ErrorText>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter a Unix timestamp or a date to convert.
        </p>
      )}
    </div>
  )
}

function ExtractTab({
  timeZone,
  nowMs,
}: {
  timeZone: string
  nowMs: number
}) {
  const [input, setInput] = usePersistedState('unix-timestamp:extract', '')
  const results = React.useMemo(() => extractFromId(input.trim()), [input])

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste a UUIDv7, ULID, ObjectId, Snowflake or JWT"
        className="font-mono"
      />
      {results.length > 0 ? (
        <div className="flex flex-col gap-2">
          {results.map((entry, index) => {
            const f = formatInstant(entry.timestampMs, timeZone)
            const expired =
              entry.format === 'jwt' &&
              entry.label.includes('exp') &&
              entry.timestampMs < nowMs
            return (
              <div
                key={`${entry.label}-${index}`}
                className="flex flex-col gap-1 rounded-md border border-border bg-card px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                    {entry.label}
                  </span>
                  {entry.note ? (
                    <span className="text-[11px] text-muted-foreground">
                      {entry.note}
                    </span>
                  ) : null}
                  {expired ? (
                    <span className="text-[11px] text-destructive">expired</span>
                  ) : null}
                  <span className="ml-auto" />
                  <CopyIcon value={f.iso} />
                </div>
                <span className="font-mono text-[13px] text-foreground">
                  {f.iso}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {f.isoLocal} · {relativeTime(entry.timestampMs, nowMs)}
                </span>
              </div>
            )
          })}
        </div>
      ) : input.trim() ? (
        <ErrorText>No timestamp found in input.</ErrorText>
      ) : (
        <p className="text-sm text-muted-foreground">
          Paste an ID to extract its embedded timestamp.
        </p>
      )}
    </div>
  )
}

function BatchTab({
  timeZone,
  nowMs,
}: {
  timeZone: string
  nowMs: number
}) {
  const [input, setInput] = usePersistedState('unix-timestamp:batch', '')
  // Heavy parse/format is memoized on input+timeZone; relative is derived live against the ticker.
  const rows = React.useMemo(
    () => convertBatch(input, timeZone, 0),
    [input, timeZone],
  )

  const withRelative = (row: (typeof rows)[number]) =>
    row.ms !== null ? { ...row, relative: relativeTime(row.ms, nowMs) } : row

  const buildCsv = () => {
    const head = 'input,epoch_ms,iso,relative,error'
    const body = rows
      .map(withRelative)
      .map((row) =>
        [row.input, row.ms ?? '', row.iso ?? '', row.relative ?? '', row.error ?? '']
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n')
    return `${head}\n${body}`
  }

  const buildJson = () => JSON.stringify(rows.map(withRelative), null, 2)

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
      <Card
        label="Input — one per line"
        value={input}
        onChange={setInput}
        placeholder={'1700000000\n2023-11-14 22:13:20'}
        className="min-h-64"
      />
      <div className="flex min-h-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <CopyButton value={buildCsv} label="Copy CSV" />
          <CopyButton value={buildJson} label="Copy JSON" />
        </div>
        <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
          {rows.length > 0 ? (
            <table className="w-full border-collapse font-mono text-[12px]">
              <thead className="sticky top-0 bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium">Input</th>
                  <th className="px-2 py-1.5 text-left font-medium">Epoch ms</th>
                  <th className="px-2 py-1.5 text-left font-medium">ISO</th>
                  <th className="px-2 py-1.5 text-left font-medium">Relative</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="px-2 py-1.5 text-foreground">{row.input}</td>
                    {row.error ? (
                      <td
                        colSpan={3}
                        className="px-2 py-1.5 text-destructive"
                      >
                        {row.error}
                      </td>
                    ) : (
                      <>
                        <td className="px-2 py-1.5 text-foreground">
                          {row.ms}
                        </td>
                        <td className="px-2 py-1.5 text-muted-foreground">
                          {row.iso}
                        </td>
                        <td className="px-2 py-1.5 text-muted-foreground">
                          {row.ms !== null ? relativeTime(row.ms, nowMs) : ''}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-3 text-sm text-muted-foreground">
              Paste timestamps or dates to convert in bulk.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function DurationTab({ timeZone, now }: { timeZone: string; now: number | null }) {
  const [from, setFrom] = usePersistedState('unix-timestamp:dur-a', '')
  const [to, setTo] = usePersistedState('unix-timestamp:dur-b', '')

  const msFrom = inputToMs(from, timeZone)
  const msTo = inputToMs(to, timeZone)
  const duration =
    msFrom !== null && msTo !== null ? durationBetween(msFrom, msTo) : null

  const fillNow = (set: (value: string) => void) =>
    set(String(Math.floor((now ?? 0) / 1000)))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Input
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            placeholder="From (epoch or date)"
            className="font-mono"
          />
          <Button
            variant="subtle"
            size="sm"
            disabled={now === null}
            onClick={() => fillNow(setFrom)}
          >
            Now
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={to}
            onChange={(event) => setTo(event.target.value)}
            placeholder="To (epoch or date)"
            className="font-mono"
          />
          <Button
            variant="subtle"
            size="sm"
            disabled={now === null}
            onClick={() => fillNow(setTo)}
          >
            Now
          </Button>
        </div>
      </div>

      {duration ? (
        <div className="flex flex-col gap-2">
          <ResultRow label="Difference" value={duration.human} />
          <div className="grid grid-cols-4 gap-2">
            <ResultRow label="Days" value={String(duration.days)} />
            <ResultRow label="Hours" value={String(duration.hours)} />
            <ResultRow label="Minutes" value={String(duration.minutes)} />
            <ResultRow label="Seconds" value={String(duration.seconds)} />
          </div>
          <ResultRow label="Total ms" value={String(duration.ms)} />
          <p className="text-[11px] text-muted-foreground">
            {duration.ms === 0
              ? 'Both timestamps are equal.'
              : duration.ms > 0
                ? 'The second timestamp is later.'
                : 'The first timestamp is later.'}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter two timestamps or dates to measure the span.
        </p>
      )}
    </div>
  )
}

const FORMAT_TOKENS: Array<{ token: string; meaning: string }> = [
  { token: 'YYYY / YY', meaning: 'Year (4 / 2 digit)' },
  { token: 'MM / M', meaning: 'Month (padded / plain)' },
  { token: 'DD / D', meaning: 'Day of month' },
  { token: 'HH / H', meaning: 'Hour 24h (padded / plain)' },
  { token: 'mm / m', meaning: 'Minute' },
  { token: 'ss / s', meaning: 'Second' },
  { token: 'SSS', meaning: 'Milliseconds (3 digit)' },
  { token: 'A / a', meaning: 'AM·PM / am·pm' },
  { token: 'dddd / ddd', meaning: 'Weekday (long / short)' },
  { token: 'Z', meaning: 'UTC offset, e.g. -05:00' },
  { token: '[text]', meaning: 'Literal text (escaped)' },
]

function FormatTab({ timeZone, now }: { timeZone: string; now: number | null }) {
  const [input, setInput] = usePersistedState('unix-timestamp:fmt-input', '')
  const [pattern, setPattern] = usePersistedState(
    'unix-timestamp:fmt-pattern',
    'YYYY-MM-DD HH:mm:ss',
  )

  const ms = inputToMs(input, timeZone)
  const output = ms !== null ? formatTokens(ms, pattern, timeZone) : ''

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Epoch or date"
            className="font-mono"
          />
          <Button
            variant="subtle"
            size="sm"
            disabled={now === null}
            onClick={() => setInput(String(Math.floor((now ?? 0) / 1000)))}
          >
            Now
          </Button>
        </div>
        <Input
          value={pattern}
          onChange={(event) => setPattern(event.target.value)}
          placeholder="YYYY-MM-DD HH:mm:ss"
          className="font-mono"
        />
      </div>

      {ms !== null ? (
        <ResultRow label="Output" value={output} />
      ) : input.trim() ? (
        <ErrorText>Unrecognized timestamp or date.</ErrorText>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter a timestamp, then a token pattern.
        </p>
      )}

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-[12px]">
          <tbody>
            {FORMAT_TOKENS.map((row) => (
              <tr key={row.token} className="border-t border-border first:border-t-0">
                <td className="w-32 px-3 py-1.5 font-mono text-accent">
                  {row.token}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {row.meaning}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const MODE_OPTIONS: Array<{ value: Mode; label: string }> = [
  { value: 'convert', label: 'Convert' },
  { value: 'extract', label: 'Extract' },
  { value: 'batch', label: 'Batch' },
  { value: 'duration', label: 'Duration' },
  { value: 'format', label: 'Format' },
]

function Page() {
  const [mode, setMode] = usePersistedState('unix-timestamp:mode', 'convert')
  const [tz, setTz] = usePersistedState('unix-timestamp:tz', '')
  const [localTz, setLocalTz] = React.useState<string | null>(null)
  const [now, setNow] = React.useState<number | null>(null)

  React.useEffect(() => {
    setLocalTz(localTimeZone())
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeZone = tz || localTz || 'UTC'
  const nowMs = now ?? 0
  const tzOptions = React.useMemo(
    () => listTimeZones().map((zone) => ({ value: zone, label: zone })),
    [],
  )
  const safeMode: Mode = MODE_OPTIONS.some((option) => option.value === mode)
    ? (mode as Mode)
    : 'convert'

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={safeMode}
            onChange={(next) => setMode(next)}
            options={MODE_OPTIONS}
          />
          <Combobox
            value={timeZone}
            options={tzOptions}
            onChange={setTz}
            className="w-56"
            searchPlaceholder="Search time zone…"
          />
          <div
            className={cn(
              'ml-auto flex items-center gap-2 font-mono text-xs text-muted-foreground',
              now === null && 'invisible',
            )}
          >
            <span className="uppercase tracking-[0.12em]">now</span>
            <span className="text-foreground">
              {now !== null ? Math.floor(now / 1000) : '—'}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {safeMode === 'convert' ? (
            <ConvertTab timeZone={timeZone} nowMs={nowMs} now={now} />
          ) : null}
          {safeMode === 'extract' ? (
            <ExtractTab timeZone={timeZone} nowMs={nowMs} />
          ) : null}
          {safeMode === 'batch' ? (
            <BatchTab timeZone={timeZone} nowMs={nowMs} />
          ) : null}
          {safeMode === 'duration' ? (
            <DurationTab timeZone={timeZone} now={now} />
          ) : null}
          {safeMode === 'format' ? (
            <FormatTab timeZone={timeZone} now={now} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
