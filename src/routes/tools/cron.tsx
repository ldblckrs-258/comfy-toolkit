import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { CopyButton } from '@/components/tools/copy-button'
import { ErrorText } from '@/components/tools/tool-panel'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { buildSeo, ogUrl } from '@/lib/seo'
import type { BuilderState, CronDialect, CronSchedule } from '@/lib/tools/cron'
import {
  buildExpression,
  describeCron,
  detectPreset,
  nextRuns,
  parseCron,
  serializeSchedule,
  summarizeFields,
} from '@/lib/tools/cron'
import { requireTool } from '@/lib/tools/registry'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarClock,
  ChevronRight,
  Clock3,
  Globe,
  Power,
  SlidersHorizontal,
  SquareTerminal,
  Table2,
  WandSparkles,
} from 'lucide-react'
import * as React from 'react'

const tool = requireTool('cron')
const ACCENT = 'var(--tool-generators)'

export const Route = createFileRoute('/tools/cron')({
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

const DIALECT_OPTIONS: Array<{ value: CronDialect; label: string }> = [
  { value: 'unix', label: 'Unix' },
  { value: 'node-cron', label: 'node-cron' },
  { value: 'quartz', label: 'Quartz' },
]

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

type Mode = BuilderState['mode']

const COMMON_MODES: Array<{ value: Mode; label: string }> = [
  { value: 'everyMinute', label: 'Every minute' },
  { value: 'everyNMinutes', label: 'Every N minutes' },
  { value: 'everyHour', label: 'Every hour' },
  { value: 'dailyAt', label: 'Daily at' },
  { value: 'weeklyAt', label: 'Weekly on' },
  { value: 'monthlyAt', label: 'Monthly on day' },
  { value: 'custom', label: 'Custom fields' },
]

const QUARTZ_MODES: Array<{ value: Mode; label: string }> = [
  { value: 'lastDayAt', label: 'Last day of month' },
  { value: 'lastWeekdayAt', label: 'Last weekday of month' },
  { value: 'nearestWeekdayAt', label: 'Nearest weekday to day' },
  { value: 'lastDowAt', label: 'Last weekday-name of month' },
  { value: 'nthDowAt', label: 'Nth weekday-name of month' },
]

function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

function formatRelative(ms: number, now: number): string {
  const diff = Math.round((ms - now) / 1000)
  const abs = Math.abs(diff)
  const units: Array<[number, string]> = [
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
    [1, 'second'],
  ]
  for (const [size, name] of units) {
    if (abs >= size) {
      const n = Math.round(diff / size)
      const plural = Math.abs(n) === 1 ? name : `${name}s`
      return n >= 0 ? `in ${n} ${plural}` : `${-n} ${plural} ago`
    }
  }
  return 'now'
}

function selectClass(): string {
  return cn(
    'h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground',
    'transition-colors hover:border-border-strong focus-visible:border-accent focus-visible:outline-none',
  )
}

function CardTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5" style={{ color: ACCENT }} />
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </span>
    </span>
  )
}

function customFrom(
  schedule: CronSchedule,
): Extract<BuilderState, { mode: 'custom' }> {
  const state: Extract<BuilderState, { mode: 'custom' }> = {
    mode: 'custom',
    minute: schedule.minute.raw || '*',
    hour: schedule.hour.raw || '*',
    dom: schedule.dom.raw || '*',
    month: schedule.month.raw || '*',
    dow: schedule.dow.raw || '*',
  }
  if (schedule.dialect !== 'unix') state.second = schedule.second.raw || '0'
  return state
}

function seedForMode(
  mode: Mode,
  detected: BuilderState,
  schedule: CronSchedule,
): BuilderState {
  const d = detected as unknown as {
    hour?: number
    minute?: number
    day?: number
    weekday?: number
    nth?: number
    n?: number
  }
  const hour = d.hour ?? 9
  const minute = d.minute ?? 0
  const day = d.day ?? 1
  const weekday = d.weekday ?? 1
  const nth = d.nth ?? 1
  const n = d.n ?? 5
  switch (mode) {
    case 'everyMinute':
    case 'everyHour':
      return { mode }
    case 'everyNMinutes':
      return { mode, n }
    case 'dailyAt':
    case 'lastDayAt':
    case 'lastWeekdayAt':
      return { mode, hour, minute }
    case 'weeklyAt':
    case 'lastDowAt':
      return { mode, weekday, hour, minute }
    case 'monthlyAt':
    case 'nearestWeekdayAt':
      return { mode, day, hour, minute }
    case 'nthDowAt':
      return { mode, weekday, nth, hour, minute }
    case 'custom':
      return customFrom(schedule)
  }
}

function Page() {
  const [expr, setExpr] = usePersistedState('cron:expr', '*/5 * * * *')
  const [dialectRaw, setDialect] = usePersistedState('cron:dialect', 'unix')
  const [countRaw, setCount] = usePersistedState('cron:count', '10')

  const dialect = dialectRaw as CronDialect
  const count = Number(countRaw) || 10

  const [now, setNow] = React.useState<number | null>(null)
  const [tz, setTz] = React.useState<string | null>(null)
  React.useEffect(() => {
    setNow(Date.now())
    setTz(localTimeZone())
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const parse = React.useMemo(() => parseCron(expr, dialect), [expr, dialect])
  const schedule = parse.ok ? parse.schedule : null
  const reboot = schedule?.reboot ?? false

  const changeDialect = React.useCallback(
    (next: string) => {
      const nd = next as CronDialect
      if (nd !== dialect && parse.ok) {
        const converted = serializeSchedule(parse.schedule, nd)
        if (converted) setExpr(converted)
      }
      setDialect(nd)
    },
    [dialect, parse, setExpr, setDialect],
  )
  const detected = React.useMemo(
    () => (schedule && !schedule.reboot ? detectPreset(schedule) : null),
    [schedule],
  )

  const runsResult = React.useMemo(() => {
    if (!schedule || now === null || tz === null) return null
    return nextRuns(schedule, now, count, tz)
  }, [schedule, now, count, tz])

  const rows = React.useMemo(() => {
    if (!runsResult || now === null) return null
    const fmt = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    })
    return runsResult.runs.map((ms) => ({
      ms,
      abs: fmt.format(new Date(ms)),
      rel: formatRelative(ms, now),
    }))
  }, [runsResult, now])

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="grid min-h-0 flex-1 gap-4 overflow-auto p-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card
            headerLeft={<CardTitle icon={SquareTerminal}>Expression</CardTitle>}
            headerRight={<CopyButton value={expr} />}
          >
            <div className="flex flex-col gap-3 p-4">
              <div className="relative">
                <ChevronRight
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: ACCENT }}
                />
                <Input
                  value={expr}
                  onChange={(e) => setExpr(e.target.value)}
                  placeholder="*/5 * * * *"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="h-11 pl-9 font-mono text-base tracking-wide md:text-base"
                />
              </div>
              <Tabs
                value={dialect}
                onChange={changeDialect}
                size="sm"
                className="self-start"
                options={DIALECT_OPTIONS}
              />
            </div>
          </Card>

          <Builder
            dialect={dialect}
            detected={detected}
            schedule={schedule}
            reboot={reboot}
            onChange={setExpr}
          />

          {schedule ? (
            <Card headerLeft={<CardTitle icon={Table2}>Fields</CardTitle>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Field</th>
                      <th className="px-3 py-2 font-medium">Value</th>
                      <th className="px-3 py-2 font-medium">Meaning</th>
                      <th className="px-3 py-2 font-medium">Allowed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summarizeFields(schedule).map((f) => (
                      <tr
                        key={f.name}
                        className="border-t border-border transition-colors hover:bg-muted/40"
                      >
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: ACCENT }}
                            />
                            {f.label}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
                            {f.raw}
                          </code>
                        </td>
                        <td className="px-3 py-2 text-foreground">{f.text}</td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {f.allowed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <Card
            headerLeft={<CardTitle icon={Clock3}>In plain English</CardTitle>}
          >
            <div className="flex items-start gap-3 p-4">
              <span
                className="h-8 w-0.5 shrink-0 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
              {parse.ok ? (
                <p className="text-lg leading-relaxed text-foreground">
                  {describeCron(parse.schedule)}
                </p>
              ) : (
                <ErrorText>
                  {parse.error.field === 'expression'
                    ? parse.error.message
                    : `${parse.error.field}: ${parse.error.message}`}
                </ErrorText>
              )}
            </div>
          </Card>
          <Card
            className="w-full"
            headerLeft={<CardTitle icon={CalendarClock}>Next runs</CardTitle>}
            headerRight={
              <div className="flex flex-wrap items-center justify-end gap-2">
                {tz ? (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    {tz}
                  </span>
                ) : null}
                <Tabs
                  value={countRaw}
                  onChange={setCount}
                  size="sm"
                  options={[
                    { value: '5', label: '5' },
                    { value: '10', label: '10' },
                    { value: '20', label: '20' },
                  ]}
                />
              </div>
            }
          >
            <div className="p-3">
              {now === null ? (
                <p className="px-1 py-2 text-sm text-muted-foreground">…</p>
              ) : reboot ? (
                <p className="flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
                  <Power className="h-4 w-4" style={{ color: ACCENT }} />
                  Runs on startup — no scheduled times.
                </p>
              ) : !parse.ok ? (
                <p className="px-1 py-2 text-sm text-muted-foreground">
                  Fix the expression to see upcoming runs.
                </p>
              ) : rows && rows.length > 0 ? (
                <ol className="flex flex-col gap-1.5">
                  {rows.map((r, i) => {
                    const first = i === 0
                    return (
                      <li
                        key={r.ms + ':' + i}
                        className={cn(
                          'flex items-center gap-3 rounded-md border border-transparent px-2 py-2 transition-colors',
                          !first && 'hover:bg-muted/40',
                        )}
                        style={
                          first
                            ? {
                                borderColor: `color-mix(in oklab, ${ACCENT} 35%, var(--border))`,
                                backgroundColor: `color-mix(in oklab, ${ACCENT} 8%, transparent)`,
                              }
                            : undefined
                        }
                      >
                        <span
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-md font-mono text-[11px]"
                          style={
                            first
                              ? {
                                  color: ACCENT,
                                  backgroundColor: `color-mix(in oklab, ${ACCENT} 16%, transparent)`,
                                }
                              : {
                                  color: 'var(--muted-foreground)',
                                  backgroundColor: 'var(--muted)',
                                }
                          }
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                          {r.abs}
                        </span>
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          <Clock3 className="h-3 w-3" />
                          {r.rel}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <p className="px-1 py-2 text-sm text-muted-foreground">
                  No runs within the next 5 years.
                </p>
              )}
              {runsResult?.truncated && runsResult.runs.length > 0 ? (
                <p className="mt-2 px-1 text-xs text-muted-foreground">
                  No further runs within 5 years.
                </p>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function NumField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  return (
    <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
      {label}
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 font-mono text-base md:text-sm"
      />
    </label>
  )
}

function WeekdayField({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
      Weekday
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={selectClass()}
      >
        {WEEKDAYS.map((d, i) => (
          <option key={d} value={i}>
            {d}
          </option>
        ))}
      </select>
    </label>
  )
}

function Builder({
  dialect,
  detected,
  schedule,
  reboot,
  onChange,
}: {
  dialect: CronDialect
  detected: BuilderState | null
  schedule: CronSchedule | null
  reboot: boolean
  onChange: (expr: string) => void
}) {
  const modes =
    dialect === 'quartz' ? [...COMMON_MODES, ...QUARTZ_MODES] : COMMON_MODES

  let body: React.ReactNode
  if (reboot) {
    body = (
      <p className="text-sm text-muted-foreground">
        @reboot has no builder controls.
      </p>
    )
  } else if (!detected || !schedule) {
    body = (
      <p className="text-sm text-muted-foreground">
        Fix the expression to use the builder.
      </p>
    )
  } else {
    const emit = (next: BuilderState) =>
      onChange(buildExpression(next, dialect))
    const patch = (p: Record<string, number>) => emit({ ...detected, ...p })
    const d = detected as unknown as {
      hour?: number
      minute?: number
      day?: number
      weekday?: number
      nth?: number
      n?: number
    }
    const hourMin =
      detected.mode === 'everyMinute' ||
      detected.mode === 'everyNMinutes' ||
      detected.mode === 'everyHour' ||
      detected.mode === 'custom' ? null : (
        <>
          <NumField
            label="Hour"
            value={d.hour ?? 0}
            min={0}
            max={23}
            onChange={(hour) => patch({ hour })}
          />
          <NumField
            label="Minute"
            value={d.minute ?? 0}
            min={0}
            max={59}
            onChange={(minute) => patch({ minute })}
          />
        </>
      )

    body = (
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Pattern
          <div className="relative">
            <WandSparkles
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: ACCENT }}
            />
            <select
              value={detected.mode}
              onChange={(e) =>
                emit(seedForMode(e.target.value as Mode, detected, schedule))
              }
              className={cn(selectClass(), 'w-full pl-9')}
            >
              {modes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </label>

        <div className="flex flex-wrap items-end gap-3">
          {detected.mode === 'everyNMinutes' ? (
            <NumField
              label="Minutes"
              value={d.n ?? 5}
              min={1}
              max={59}
              onChange={(n) => patch({ n })}
            />
          ) : null}
          {detected.mode === 'monthlyAt' ||
          detected.mode === 'nearestWeekdayAt' ? (
            <NumField
              label="Day"
              value={d.day ?? 1}
              min={1}
              max={31}
              onChange={(day) => patch({ day })}
            />
          ) : null}
          {detected.mode === 'weeklyAt' || detected.mode === 'lastDowAt' ? (
            <WeekdayField
              value={d.weekday ?? 1}
              onChange={(weekday) => patch({ weekday })}
            />
          ) : null}
          {detected.mode === 'nthDowAt' ? (
            <>
              <WeekdayField
                value={d.weekday ?? 1}
                onChange={(weekday) => patch({ weekday })}
              />
              <NumField
                label="Occurrence"
                value={d.nth ?? 1}
                min={1}
                max={5}
                onChange={(nth) => patch({ nth })}
              />
            </>
          ) : null}
          {hourMin}
        </div>

        {detected.mode === 'custom' ? (
          <div className="flex flex-wrap gap-3">
            {(dialect === 'unix'
              ? (['minute', 'hour', 'dom', 'month', 'dow'] as const)
              : (['second', 'minute', 'hour', 'dom', 'month', 'dow'] as const)
            ).map((key) => (
              <label
                key={key}
                className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
              >
                {key}
                <Input
                  value={detected[key] ?? '*'}
                  onChange={(e) => emit({ ...detected, [key]: e.target.value })}
                  className="w-20 font-mono text-base md:text-sm"
                />
              </label>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <Card headerLeft={<CardTitle icon={SlidersHorizontal}>Build</CardTitle>}>
      <div className="p-4">{body}</div>
    </Card>
  )
}
