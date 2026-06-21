import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { CopyButton } from '@/components/tools/copy-button'
import { ErrorText } from '@/components/tools/tool-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { buildSeo, ogUrl } from '@/lib/seo'
import { requireTool } from '@/lib/tools/registry'
import type {
  ByteOptions,
  CharClass,
  CharsetOptions,
  EncodeFormat,
  StrengthInfo,
} from '@/lib/tools/secret'
import {
  buildCharPool,
  byteEntropyBits,
  charsetEntropyBits,
  entropyStrength,
  generateBytesSecrets,
  generateSecrets,
} from '@/lib/tools/secret'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  Asterisk,
  BadgeCheck,
  Binary,
  CaseLower,
  CaseUpper,
  CheckCheck,
  ChevronFirst,
  ChevronLast,
  Code,
  Eye,
  EyeOff,
  Gauge,
  Hash,
  Key,
  KeyRound,
  Link,
  ListOrdered,
  Lock,
  Minus,
  RefreshCw,
  Ruler,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Type,
} from 'lucide-react'
import * as React from 'react'

const tool = requireTool('secret-generator')

type Mode = 'charset' | 'bytes'

const ACCENT = 'var(--accent)'
const GEN = 'var(--tool-generators)'

const CLASS_META: Record<
  CharClass,
  { label: string; icon: LucideIcon; color: string }
> = {
  lowercase: { label: 'a–z', icon: CaseLower, color: 'var(--code-key)' },
  uppercase: { label: 'A–Z', icon: CaseUpper, color: 'var(--code-function)' },
  digits: { label: '0–9', icon: Hash, color: 'var(--code-number)' },
  dash: { label: 'dash', icon: Minus, color: 'var(--accent)' },
  special: { label: '!@#', icon: Asterisk, color: 'var(--tool-color)' },
}

const CLASS_ORDER: Array<CharClass> = [
  'lowercase',
  'uppercase',
  'digits',
  'dash',
  'special',
]

const STRENGTH_META: Record<
  StrengthInfo['label'],
  { color: string; icon: LucideIcon }
> = {
  Weak: { color: 'var(--destructive)', icon: ShieldAlert },
  Fine: { color: 'var(--warning)', icon: Shield },
  Strong: { color: 'var(--accent)', icon: ShieldCheck },
  Excellent: { color: 'var(--success)', icon: BadgeCheck },
}

const DEFAULT_SPECIAL = '!@#$%^&*_=+?'

function pickClasses(active: Array<CharClass>): Record<CharClass, boolean> {
  return {
    lowercase: active.includes('lowercase'),
    uppercase: active.includes('uppercase'),
    digits: active.includes('digits'),
    dash: active.includes('dash'),
    special: active.includes('special'),
  }
}

type CharsetPreset = {
  id: string
  label: string
  icon: LucideIcon
  options: CharsetOptions
}

type BytePreset = {
  id: string
  label: string
  icon: LucideIcon
  options: ByteOptions
}

const CHARSET_PRESETS: Array<CharsetPreset> = [
  {
    id: 'strong',
    label: 'Strong password',
    icon: ShieldCheck,
    options: {
      length: 20,
      classes: pickClasses(['lowercase', 'uppercase', 'digits', 'special']),
      special: DEFAULT_SPECIAL,
      excludeAmbiguous: false,
      guaranteeEachClass: true,
      prefix: '',
      suffix: '',
      count: 1,
    },
  },
  {
    id: 'readable',
    label: 'Easy to read',
    icon: Eye,
    options: {
      length: 16,
      classes: pickClasses(['lowercase', 'uppercase', 'digits']),
      special: DEFAULT_SPECIAL,
      excludeAmbiguous: true,
      guaranteeEachClass: true,
      prefix: '',
      suffix: '',
      count: 1,
    },
  },
  {
    id: 'pin',
    label: 'Numeric PIN',
    icon: Lock,
    options: {
      length: 6,
      classes: pickClasses(['digits']),
      special: DEFAULT_SPECIAL,
      excludeAmbiguous: false,
      guaranteeEachClass: false,
      prefix: '',
      suffix: '',
      count: 1,
    },
  },
  {
    id: 'apikey',
    label: 'API key (sk_)',
    icon: KeyRound,
    options: {
      length: 36,
      classes: pickClasses(['lowercase', 'uppercase', 'digits']),
      special: DEFAULT_SPECIAL,
      excludeAmbiguous: true,
      guaranteeEachClass: true,
      prefix: 'sk_',
      suffix: '',
      count: 1,
    },
  },
]

const BYTE_PRESETS: Array<BytePreset> = [
  {
    id: 'hex32',
    label: 'Hex (32 B)',
    icon: Hash,
    options: { bytes: 32, format: 'hex', prefix: '', suffix: '', count: 1 },
  },
  {
    id: 'jwt',
    label: 'JWT secret (HS256)',
    icon: KeyRound,
    options: {
      bytes: 32,
      format: 'base64url',
      prefix: '',
      suffix: '',
      count: 1,
    },
  },
  {
    id: 'token64',
    label: 'Long token (64 B)',
    icon: Binary,
    options: {
      bytes: 64,
      format: 'base64url',
      prefix: '',
      suffix: '',
      count: 1,
    },
  },
]

export const Route = createFileRoute('/tools/secret-generator')({
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
  const [mode, setMode] = React.useState<Mode>('charset')

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <Tabs
          value={mode}
          onChange={setMode}
          className="mb-6"
          options={[
            {
              value: 'charset',
              label: (
                <span className="flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5" />
                  Characters
                </span>
              ),
            },
            {
              value: 'bytes',
              label: (
                <span className="flex items-center gap-1.5">
                  <Binary className="h-3.5 w-3.5" />
                  Random bytes
                </span>
              ),
            },
          ]}
        />
        {mode === 'charset' ? <CharsetView /> : <ByteView />}
      </div>
    </div>
  )
}

function CharsetView() {
  const [length, setLength] = React.useState(24)
  const [classMap, setClassMap] = React.useState<Record<CharClass, boolean>>({
    lowercase: true,
    uppercase: true,
    digits: true,
    dash: false,
    special: false,
  })
  const [special, setSpecial] = React.useState(DEFAULT_SPECIAL)
  const [excludeAmbiguous, setExcludeAmbiguous] = React.useState(false)
  const [guaranteeEachClass, setGuaranteeEachClass] = React.useState(true)
  const [prefix, setPrefix] = React.useState('')
  const [suffix, setSuffix] = React.useState('')
  const [count, setCount] = React.useState(3)
  const [list, setList] = React.useState<Array<string>>([])
  const [error, setError] = React.useState('')

  const options = {
    length,
    classes: classMap,
    special,
    excludeAmbiguous,
    guaranteeEachClass,
    prefix,
    suffix,
    count,
  }

  const run = (opts: CharsetOptions) => {
    try {
      setList(generateSecrets(opts))
      setError('')
    } catch (err) {
      setError((err as Error).message)
      setList([])
    }
  }

  const generate = () => run(options)

  const applyPreset = (preset: CharsetPreset) => {
    const o = preset.options
    setLength(o.length)
    setClassMap(o.classes)
    setSpecial(o.special)
    setExcludeAmbiguous(o.excludeAmbiguous)
    setGuaranteeEachClass(o.guaranteeEachClass)
    setPrefix(o.prefix)
    setSuffix(o.suffix)
    setCount(o.count)
    run(o)
  }

  React.useEffect(() => {
    try {
      setList(
        generateSecrets({
          length: 24,
          classes: {
            lowercase: true,
            uppercase: true,
            digits: true,
            dash: false,
            special: false,
          },
          special: DEFAULT_SPECIAL,
          excludeAmbiguous: false,
          guaranteeEachClass: true,
          prefix: '',
          suffix: '',
          count: 3,
        }),
      )
    } catch {
      /* ignore initial render */
    }
  }, [])

  const { pool } = buildCharPool(options)
  const coreLength = Math.max(
    0,
    (Number.isNaN(length) ? 0 : length) - prefix.length - suffix.length,
  )
  const bits = charsetEntropyBits(pool.length, coreLength)
  const strength = entropyStrength(bits)

  const toggleClass = (key: CharClass) =>
    setClassMap((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
          <Field
            icon={Ruler}
            label="Length"
            hint="Total length incl. prefix & suffix (1–256)."
          >
            <Input
              type="number"
              min={1}
              max={256}
              value={Number.isNaN(length) ? '' : length}
              onChange={(event) => setLength(Number(event.target.value))}
            />
          </Field>

          <Field icon={Type} label="Character sets">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {CLASS_ORDER.map((key) => (
                <ClassPill
                  key={key}
                  meta={CLASS_META[key]}
                  active={classMap[key]}
                  onClick={() => toggleClass(key)}
                />
              ))}
            </div>
          </Field>

          {classMap.special ? (
            <Field icon={Asterisk} label="Special characters">
              <Input
                value={special}
                onChange={(event) => setSpecial(event.target.value)}
                spellCheck={false}
                className="font-mono"
                placeholder={DEFAULT_SPECIAL}
              />
            </Field>
          ) : null}

          <Field icon={SlidersHorizontal} label="Options">
            <div className="grid grid-cols-2 gap-2">
              <TogglePill
                active={excludeAmbiguous}
                onClick={() => setExcludeAmbiguous((value) => !value)}
                icon={EyeOff}
                color={ACCENT}
              >
                Exclude look-alikes
              </TogglePill>
              <TogglePill
                active={guaranteeEachClass}
                onClick={() => setGuaranteeEachClass((value) => !value)}
                icon={CheckCheck}
                color="var(--success)"
              >
                One of each set
              </TogglePill>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field icon={ChevronFirst} label="Prefix">
              <Input
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
                spellCheck={false}
                className="font-mono"
                placeholder="sk_"
              />
            </Field>
            <Field icon={ChevronLast} label="Suffix">
              <Input
                value={suffix}
                onChange={(event) => setSuffix(event.target.value)}
                spellCheck={false}
                className="font-mono"
              />
            </Field>
          </div>

          <Field icon={ListOrdered} label="Count" hint="Generate 1–100 at once.">
            <Input
              type="number"
              min={1}
              max={100}
              value={Number.isNaN(count) ? '' : count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </Field>

          <Button onClick={generate}>
            <RefreshCw className="h-4 w-4" />
            Generate
          </Button>

          {error ? <ErrorText>{error}</ErrorText> : null}
        </div>

        <div className="space-y-4">
          <EntropyPanel
            bits={bits}
            strength={strength}
            detail={`${coreLength} random chars from a pool of ${pool.length}`}
            note={
              guaranteeEachClass
                ? 'Approximate — the “one of each set” rule slightly lowers true entropy.'
                : undefined
            }
          />
          <ResultList list={list} prefix={prefix} suffix={suffix} />
        </div>
      </div>

      <PresetRow presets={CHARSET_PRESETS} onApply={applyPreset} />
    </div>
  )
}

function ByteView() {
  const [bytes, setBytes] = React.useState(32)
  const [format, setFormat] = React.useState<EncodeFormat>('base64url')
  const [prefix, setPrefix] = React.useState('')
  const [suffix, setSuffix] = React.useState('')
  const [count, setCount] = React.useState(3)
  const [list, setList] = React.useState<Array<string>>([])

  const generate = () => {
    setList(generateBytesSecrets({ bytes, format, prefix, suffix, count }))
  }

  const applyPreset = (preset: BytePreset) => {
    const o = preset.options
    setBytes(o.bytes)
    setFormat(o.format)
    setPrefix(o.prefix)
    setSuffix(o.suffix)
    setCount(o.count)
    setList(generateBytesSecrets(o))
  }

  React.useEffect(() => {
    setList(
      generateBytesSecrets({
        bytes: 32,
        format: 'base64url',
        prefix: '',
        suffix: '',
        count: 3,
      }),
    )
  }, [])

  const bits = byteEntropyBits(Number.isNaN(bytes) ? 0 : bytes)
  const strength = entropyStrength(bits)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
          <Field
            icon={Binary}
            label="Bytes"
            hint="Random bytes before encoding (1–256)."
          >
            <Input
              type="number"
              min={1}
              max={256}
              value={Number.isNaN(bytes) ? '' : bytes}
              onChange={(event) => setBytes(Number(event.target.value))}
            />
          </Field>

          <Field icon={Code} label="Encoding">
            <Tabs
              value={format}
              onChange={setFormat}
              size="sm"
              options={[
                {
                  value: 'hex',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Hash className="h-3 w-3" />
                      hex
                    </span>
                  ),
                },
                {
                  value: 'base64',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Binary className="h-3 w-3" />
                      base64
                    </span>
                  ),
                },
                {
                  value: 'base64url',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Link className="h-3 w-3" />
                      base64url
                    </span>
                  ),
                },
              ]}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field icon={ChevronFirst} label="Prefix">
              <Input
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
                spellCheck={false}
                className="font-mono"
              />
            </Field>
            <Field icon={ChevronLast} label="Suffix">
              <Input
                value={suffix}
                onChange={(event) => setSuffix(event.target.value)}
                spellCheck={false}
                className="font-mono"
              />
            </Field>
          </div>

          <Field icon={ListOrdered} label="Count" hint="Generate 1–100 at once.">
            <Input
              type="number"
              min={1}
              max={100}
              value={Number.isNaN(count) ? '' : count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </Field>

          <Button onClick={generate}>
            <RefreshCw className="h-4 w-4" />
            Generate
          </Button>
        </div>

        <div className="space-y-4">
          <EntropyPanel
            bits={bits}
            strength={strength}
            detail={`${Number.isNaN(bytes) ? 0 : bytes} random bytes × 8 bits`}
          />
          <ResultList list={list} prefix={prefix} suffix={suffix} />
        </div>
      </div>

      <PresetRow presets={BYTE_PRESETS} onApply={applyPreset} />
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  hint,
  children,
}: {
  icon?: LucideIcon
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
        {Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
        {label}
      </span>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function ClassPill({
  meta,
  active,
  onClick,
}: {
  meta: { label: string; icon: LucideIcon; color: string }
  active: boolean
  onClick: () => void
}) {
  const Icon = meta.icon
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        active
          ? {
              color: meta.color,
              borderColor: `color-mix(in oklab, ${meta.color} 45%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
            }
          : undefined
      }
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-2 text-sm transition-colors',
        !active && 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {meta.label}
    </button>
  )
}

function TogglePill({
  active,
  onClick,
  icon: Icon,
  color = ACCENT,
  children,
}: {
  active: boolean
  onClick: () => void
  icon?: LucideIcon
  color?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        active
          ? {
              color,
              borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
            }
          : undefined
      }
      className={cn(
        'flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
        !active && 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      {children}
    </button>
  )
}

function PresetRow<T extends { id: string; label: string; icon: LucideIcon }>({
  presets,
  onApply,
}: {
  presets: Array<T>
  onApply: (preset: T) => void
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <span className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        Common presets
      </span>
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((preset) => {
          const Icon = preset.icon
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApply(preset)}
              className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              <Icon className="h-4 w-4" style={{ color: GEN }} />
              {preset.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ResultList({
  list,
  prefix,
  suffix,
}: {
  list: Array<string>
  prefix: string
  suffix: string
}) {
  return (
    <Card
      label={`Generated (${list.length})`}
      copyValue={list.join('\n')}
      bodyClassName="max-h-[calc(100svh-30rem)] min-h-32 gap-1.5 overflow-auto overscroll-contain p-2"
    >
      {list.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center px-4 text-center text-sm text-muted-foreground">
          No secrets yet — hit Generate.
        </div>
      ) : (
        list.map((value, index) => {
          const cut = Math.max(0, value.length - suffix.length)
          const start = Math.min(prefix.length, cut)
          const head = value.slice(0, start)
          const core = value.slice(start, cut)
          const tail = value.slice(cut)
          return (
            <div
              key={`${value}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 transition-colors hover:border-border-strong"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Key className="h-3.5 w-3.5 shrink-0" style={{ color: GEN }} />
                <span className="break-all font-mono text-[13px]">
                  {head ? <span style={{ color: ACCENT }}>{head}</span> : null}
                  {core}
                  {tail ? <span style={{ color: ACCENT }}>{tail}</span> : null}
                </span>
              </span>
              <CopyButton value={value} />
            </div>
          )
        })
      )}
    </Card>
  )
}

function EntropyPanel({
  bits,
  strength,
  detail,
  note,
}: {
  bits: number
  strength: StrengthInfo
  detail: string
  note?: string
}) {
  const meta = STRENGTH_META[strength.label]
  const Icon = meta.icon
  const pct = Math.min(100, (bits / 128) * 100)
  return (
    <div
      className="flex h-fit flex-col gap-4 rounded-lg border bg-card p-5"
      style={{
        borderColor: `color-mix(in oklab, ${meta.color} 35%, var(--border))`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          Entropy
        </span>
        <span
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            color: meta.color,
            backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
          }}
        >
          <Icon className="h-3.5 w-3.5" />
          {strength.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className="font-mono text-4xl font-semibold tabular-nums"
          style={{ color: meta.color }}
        >
          {bits.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">bits</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: meta.color }}
        />
      </div>

      <p className="text-xs text-muted-foreground">{detail}</p>
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
}
