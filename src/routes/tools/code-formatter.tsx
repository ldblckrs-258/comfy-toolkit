import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { Button } from '@/components/ui/button'
import type { PrettierLang } from '@/lib/tools/prettier'
import { PRETTIER_LANGS, formatCode } from '@/lib/tools/prettier'
import { requireTool } from '@/lib/tools/registry'
import { buildSeo, ogUrl } from '@/lib/seo'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { Zap } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('code-formatter')

const PRISM_LANG: Record<PrettierLang, string> = {
  babel: 'jsx',
  typescript: 'tsx',
  json: 'json',
  json5: 'json',
  css: 'css',
  scss: 'scss',
  less: 'less',
  html: 'markup',
  vue: 'markup',
  markdown: 'markdown',
  mdx: 'markdown',
  yaml: 'yaml',
  graphql: 'graphql',
}

export const Route = createFileRoute('/tools/code-formatter')({
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
  const [lang, setLang] = React.useState<PrettierLang>('babel')
  const [source, setSource] = usePersistedState('code-formatter:source', '')
  const [auto, setAuto] = React.useState(true)
  const [output, setOutput] = React.useState('')
  const [error, setError] = React.useState<string>()
  const [busy, setBusy] = React.useState(false)

  const debouncedSource = useDebouncedValue(source, 600)

  const format = React.useCallback(
    async (value: string, parser: PrettierLang) => {
      setBusy(true)
      setError(undefined)
      try {
        return await formatCode(value, parser)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Failed to format.')
        return null
      } finally {
        setBusy(false)
      }
    },
    [],
  )

  React.useEffect(() => {
    if (!auto || !debouncedSource.trim()) return
    let active = true
    void format(debouncedSource, lang).then((result) => {
      if (active && result !== null) setOutput(result)
    })
    return () => {
      active = false
    }
  }, [auto, debouncedSource, lang, format])

  const run = async () => {
    const result = await format(source, lang)
    if (result !== null) setOutput(result)
  }

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={lang}
            onChange={(event) => setLang(event.target.value as PrettierLang)}
            className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground transition-colors hover:border-border-strong focus-within:bg-card focus-visible:border-accent focus-visible:outline-none"
          >
            {PRETTIER_LANGS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            variant="subtle"
            onClick={() => setAuto((value) => !value)}
            className={cn(auto && 'border-accent/50 text-accent')}
          >
            <Zap className="h-3.5 w-3.5" />
            Auto
          </Button>
          {!auto ? (
            <Button onClick={run} disabled={busy || !source}>
              {busy ? 'Formatting…' : 'Format'}
            </Button>
          ) : null}
          {auto && busy ? (
            <span className="font-mono text-xs text-muted-foreground">
              formatting…
            </span>
          ) : null}
        </div>
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <Card
            label="Source"
            className="flex-1"
            value={source}
            onChange={setSource}
            placeholder="Paste code to format"
            language={PRISM_LANG[lang]}
          />
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <Card
              label="Formatted"
              className="flex-1"
              copyValue={output}
              value={output}
              readOnly
              language={PRISM_LANG[lang]}
            />
            {error ? <ErrorText>{error}</ErrorText> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
