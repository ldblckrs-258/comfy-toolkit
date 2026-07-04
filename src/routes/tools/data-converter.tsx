import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { Button } from '@/components/ui/button'
import type { DataFormat } from '@/lib/tools/data-converter'
import { convertData } from '@/lib/tools/data-converter'
import { requireTool } from '@/lib/tools/registry'
import { buildSeo, ogUrl } from '@/lib/seo'
import { usePersistedState } from '@/lib/use-persisted-state'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeftRight } from 'lucide-react'
import { Prism } from 'prism-react-renderer'
import * as React from 'react'

const tool = requireTool('data-converter')

const FORMATS: Array<{ value: DataFormat; label: string }> = [
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
  { value: 'csv', label: 'CSV' },
]

const PRISM_LANG: Record<DataFormat, string> = {
  json: 'json',
  yaml: 'yaml',
  toml: 'toml',
  csv: 'text',
}

Prism.languages.toml = {
  comment: /#.*/,
  table: {
    pattern: /(^[ \t]*)\[\[?[^\]]*\]\]?/m,
    lookbehind: true,
    alias: 'class-name',
  },
  key: {
    pattern: /(^[ \t]*)[^\s=#[]+(?=[ \t]*=)/m,
    lookbehind: true,
    alias: 'property',
  },
  string: {
    pattern: /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'[^']*'/,
    greedy: true,
  },
  date: /\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?/i,
  number:
    /[+-]?\b(?:\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?|0x[\da-fA-F]+|0o[0-7]+|0b[01]+)\b|\b(?:inf|nan)\b/,
  boolean: /\b(?:true|false)\b/,
  punctuation: /[{}[\],=.]/,
}

export const Route = createFileRoute('/tools/data-converter')({
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

const selectClass =
  'h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground transition-colors hover:border-border-strong focus-within:bg-card focus-visible:border-accent focus-visible:outline-none'

function FormatSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={selectClass}
    >
      {FORMATS.map((format) => (
        <option key={format.value} value={format.value}>
          {format.label}
        </option>
      ))}
    </select>
  )
}

function Page() {
  const [input, setInput] = usePersistedState('data-converter:input', '')
  const [from, setFrom] = usePersistedState('data-converter:from', 'json')
  const [to, setTo] = usePersistedState('data-converter:to', 'yaml')

  const { output, error } = React.useMemo(() => {
    if (!input.trim())
      return { output: '', error: undefined as string | undefined }
    try {
      return {
        output: convertData(input, from as DataFormat, to as DataFormat),
        error: undefined as string | undefined,
      }
    } catch (caught) {
      return {
        output: '',
        error: caught instanceof Error ? caught.message : 'Conversion failed.',
      }
    }
  }, [input, from, to])

  const swap = () => {
    setInput(output)
    setFrom(to)
    setTo(from)
  }

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <FormatSelect value={from} onChange={setFrom} />
          <Button
            variant="subtle"
            onClick={swap}
            disabled={Boolean(error) || !output}
            aria-label="Swap formats"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </Button>
          <FormatSelect value={to} onChange={setTo} />
        </div>
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <Card
            label="Input"
            className="flex-1"
            value={input}
            onChange={setInput}
            language={PRISM_LANG[from as DataFormat]}
            placeholder='{"hello": "world"}'
          />
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <Card
              label="Output"
              className="flex-1"
              copyValue={output}
              value={output}
              readOnly
              language={PRISM_LANG[to as DataFormat]}
            />
            {error ? <ErrorText>{error}</ErrorText> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
