import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { Button } from '@/components/ui/button'
import type { JsonIndent } from '@/lib/tools/json'
import { formatJson, minifyJson } from '@/lib/tools/json'
import { requireTool } from '@/lib/tools/registry'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { Zap } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('json-formatter')
const INDENTS: Array<JsonIndent> = [2, 4, 'tab']

export const Route = createFileRoute('/tools/json-formatter')({
  head: () => ({ meta: [{ title: `${tool.name} — ComfyToolkit` }] }),
  component: Page,
})

function Page() {
  const [input, setInput] = usePersistedState('json-formatter:input', '')
  const [indent, setIndent] = React.useState<JsonIndent>(2)
  const [auto, setAuto] = React.useState(true)
  const [output, setOutput] = React.useState('')
  const [error, setError] = React.useState<string>()

  const debouncedInput = useDebouncedValue(input, 350)

  React.useEffect(() => {
    if (!auto) return
    const result = formatJson(debouncedInput, indent)
    setOutput(result.output)
    setError(result.error)
  }, [auto, debouncedInput, indent])

  const run = (mode: 'format' | 'minify') => {
    const result =
      mode === 'format' ? formatJson(input, indent) : minifyJson(input)
    setOutput(result.output)
    setError(result.error)
  }

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="subtle"
            onClick={() => setAuto((value) => !value)}
            className={cn(auto && 'border-accent/50 text-accent')}
          >
            <Zap className="h-3.5 w-3.5" />
            Auto
          </Button>
          {!auto ? <Button onClick={() => run('format')}>Format</Button> : null}
          <Button variant="outline" onClick={() => run('minify')}>
            Minify
          </Button>
          <div className="ml-1 flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <span className="uppercase tracking-wide">indent</span>
            {INDENTS.map((option) => (
              <button
                key={String(option)}
                type="button"
                onClick={() => setIndent(option)}
                className={cn(
                  'rounded-md px-2 py-1 transition-colors',
                  indent === option
                    ? 'bg-muted text-foreground'
                    : 'hover:text-foreground',
                )}
              >
                {option === 'tab' ? 'tab' : option}
              </button>
            ))}
          </div>
        </div>
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <Card
            label="Input"
            className="flex-1"
            value={input}
            onChange={setInput}
            placeholder='{"hello":"world"}'
            language="json"
          />
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <Card
              label="Output"
              className="flex-1"
              copyValue={output}
              value={output}
              readOnly
              language="json"
            />
            {error ? <ErrorText>{error}</ErrorText> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
