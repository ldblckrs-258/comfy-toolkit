import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { buildSeo, ogUrl } from '@/lib/seo'
import { requireTool } from '@/lib/tools/registry'
import type { UrlParam, UrlTokenType } from '@/lib/tools/url-parser'
import {
  buildUrl,
  decodeComponent,
  decodeFullUrl,
  encodeComponent,
  encodeFullUrl,
  parseUrl,
  tokenizeUrl,
} from '@/lib/tools/url-parser'
import { usePersistedState } from '@/lib/use-persisted-state'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Trash2 } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('url-parser')

type Mode = 'parse' | 'encode'
type EncodeMode =
  | 'encode-component'
  | 'decode-component'
  | 'encode-url'
  | 'decode-url'

export const Route = createFileRoute('/tools/url-parser')({
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
  const [mode, setMode] = React.useState<Mode>('parse')

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="min-h-0 flex-1 overflow-auto p-6 flex flex-col">
        <Tabs
          value={mode}
          onChange={setMode}
          className="mb-6"
          options={[
            { value: 'parse', label: 'Parse' },
            { value: 'encode', label: 'Encode / Decode' },
          ]}
        />
        {mode === 'parse' ? <ParseView /> : <EncodeView />}
      </div>
    </div>
  )
}

function ParseView() {
  const [input, setInput] = usePersistedState('url-parser:input', '')

  const parsed = React.useMemo(() => {
    if (!input.trim())
      return { parts: null, error: undefined as string | undefined }
    try {
      return { parts: parseUrl(input), error: undefined as string | undefined }
    } catch {
      return { parts: null, error: 'Invalid URL.' }
    }
  }, [input])

  const [params, setParams] = React.useState<Array<UrlParam>>([])
  React.useEffect(() => {
    if (parsed.parts) setParams(parsed.parts.params)
  }, [parsed.parts])

  const rebuilt = parsed.parts ? buildUrl({ ...parsed.parts, params }) : ''

  const updateParam = (index: number, patch: Partial<UrlParam>) => {
    setParams((prev) =>
      prev.map((param, i) => (i === index ? { ...param, ...patch } : param)),
    )
  }
  const removeParam = (index: number) => {
    setParams((prev) => prev.filter((_, i) => i !== index))
  }
  const addParam = () => {
    setParams((prev) => [...prev, { key: '', value: '' }])
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
          <label className="text-sm font-semibold tracking-tight">URL</label>
          <UrlInputField
            value={input}
            onChange={setInput}
            placeholder="https://user:pass@example.com:8443/path?a=1&b=2#section"
          />
          {parsed.error ? <ErrorText>{parsed.error}</ErrorText> : null}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          {parsed.parts ? (
            <Components parts={parsed.parts} />
          ) : (
            <Empty>Paste a URL to inspect its components.</Empty>
          )}
        </div>
      </div>

      {parsed.parts ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold tracking-tight">
              Query parameters
            </span>
            <Button variant="outline" size="sm" onClick={addParam}>
              <Plus className="h-3.5 w-3.5" />
              Add param
            </Button>
          </div>
          {params.length ? (
            <div className="flex flex-col gap-2">
              {params.map((param, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={param.key}
                    onChange={(event) =>
                      updateParam(index, { key: event.target.value })
                    }
                    placeholder="key"
                    spellCheck={false}
                    className="font-mono text-xs md:text-xs"
                  />
                  <Input
                    value={param.value}
                    onChange={(event) =>
                      updateParam(index, { value: event.target.value })
                    }
                    placeholder="value"
                    spellCheck={false}
                    className="font-mono text-xs md:text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove param"
                    onClick={() => removeParam(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No query parameters.
            </p>
          )}
        </div>
      ) : null}

      {parsed.parts ? (
        <Card label="Rebuilt URL" copyValue={rebuilt}>
          <div className="whitespace-pre-wrap break-all p-3 font-mono text-[13px] leading-relaxed">
            <UrlHighlight url={rebuilt} />
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function Components({ parts }: { parts: ReturnType<typeof parseUrl> }) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Protocol', value: parts.protocol },
    { label: 'Host', value: parts.hostname },
    ...(parts.port ? [{ label: 'Port', value: parts.port }] : []),
    { label: 'Path', value: parts.pathname },
    ...(parts.hash ? [{ label: 'Hash', value: parts.hash }] : []),
    ...(parts.username ? [{ label: 'Username', value: parts.username }] : []),
    ...(parts.password ? [{ label: 'Password', value: parts.password }] : []),
  ]

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <SummaryRow key={row.label} label={row.label} value={row.value} />
      ))}
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

const ENCODE_OPTIONS: Array<{ value: EncodeMode; label: string }> = [
  { value: 'encode-component', label: 'Encode component' },
  { value: 'decode-component', label: 'Decode component' },
  { value: 'encode-url', label: 'Encode URL' },
  { value: 'decode-url', label: 'Decode URL' },
]

function runEncode(mode: EncodeMode, input: string): string {
  switch (mode) {
    case 'encode-component':
      return encodeComponent(input)
    case 'decode-component':
      return decodeComponent(input)
    case 'encode-url':
      return encodeFullUrl(input)
    case 'decode-url':
      return decodeFullUrl(input)
  }
}

function EncodeView() {
  const [mode, setMode] = React.useState<EncodeMode>('encode-component')
  const [input, setInput] = usePersistedState('url-parser:encode', '')

  const { output, error } = React.useMemo(() => {
    if (!input) return { output: '', error: undefined as string | undefined }
    try {
      return {
        output: runEncode(mode, input),
        error: undefined as string | undefined,
      }
    } catch {
      return { output: '', error: 'Malformed input for this mode.' }
    }
  }, [mode, input])

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
        {ENCODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            className={
              mode === option.value
                ? 'rounded-md border border-accent bg-accent/10 px-3 py-2.5 text-sm text-foreground transition-colors'
                : 'rounded-md border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 flex-1">
        <Card
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Paste text to transform"
          minRows={6}
        />
        <div className="flex flex-col gap-2 h-full">
          <Card
            label="Output"
            className="flex-1"
            value={output}
            copyValue={output}
            readOnly
            minRows={6}
          />
          {error ? <ErrorText>{error}</ErrorText> : null}
        </div>
      </div>
    </>
  )
}

const URL_TOKEN_COLORS: Record<UrlTokenType, string> = {
  protocol: 'var(--code-keyword)',
  auth: 'var(--code-comment)',
  host: 'var(--code-function)',
  port: 'var(--code-number)',
  path: 'var(--foreground)',
  punct: 'var(--code-punctuation)',
  'query-key': 'var(--code-key)',
  'query-value': 'var(--code-string)',
  hash: 'var(--code-operator)',
  text: 'var(--foreground)',
}

function UrlHighlight({ url }: { url: string }) {
  return (
    <>
      {tokenizeUrl(url).map((token, index) => (
        <span key={index} style={{ color: URL_TOKEN_COLORS[token.type] }}>
          {token.text}
        </span>
      ))}
    </>
  )
}

function UrlInputField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative rounded-md border border-border bg-background transition-colors hover:border-border-strong focus-within:border-accent focus-within:bg-card">
      <div className="pointer-events-none min-h-[5.5rem] whitespace-pre-wrap break-all p-3 font-mono text-[13px] leading-relaxed">
        {value ? (
          <UrlHighlight url={value} />
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none break-all bg-transparent p-3 font-mono text-[13px] leading-relaxed text-transparent caret-foreground outline-none selection:bg-accent/25"
      />
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
