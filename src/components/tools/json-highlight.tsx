import * as React from 'react'
import { CodeEditor } from '@/components/ui/code-editor'
import { cn } from '@/lib/utils'

const TOKEN =
  /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false)\b|\bnull\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

const COLOR = {
  key: 'var(--foreground)',
  string: 'var(--success)',
  number: 'var(--accent)',
  boolean: 'var(--warning)',
  null: 'var(--muted-foreground)',
}

function tokenize(text: string): Array<React.ReactNode> {
  const nodes: Array<React.ReactNode> = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  TOKEN.lastIndex = 0
  while ((match = TOKEN.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const [raw, keyToken, stringToken, boolToken, numberToken] = match
    let color: string
    if (keyToken) color = COLOR.key
    else if (stringToken) color = COLOR.string
    else if (boolToken) color = COLOR.boolean
    else if (numberToken) color = COLOR.number
    else color = COLOR.null
    nodes.push(
      <span key={key++} style={{ color }}>
        {raw}
      </span>,
    )
    last = match.index + raw.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function JsonHighlight({
  value,
  className,
}: {
  value: unknown
  className?: string
}) {
  const nodes = React.useMemo(() => {
    if (value === undefined) return []
    return tokenize(JSON.stringify(value, null, 2))
  }, [value])

  return (
    <pre
      className={cn(
        'overflow-auto font-mono text-[13px] leading-relaxed text-muted-foreground',
        className,
      )}
    >
      {nodes}
    </pre>
  )
}

export function JsonEditor({
  value,
  onChange,
  minRows = 4,
}: {
  value: string
  onChange: (value: string) => void
  minRows?: number
}) {
  return (
    <CodeEditor
      value={value}
      onChange={onChange}
      minRows={minRows}
      language="json"
    />
  )
}
