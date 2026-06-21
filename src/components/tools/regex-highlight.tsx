import * as React from 'react'
import type { RegexMatch } from '@/lib/tools/regex'
import { cn } from '@/lib/utils'

const FONT = 'font-mono text-[13px] leading-relaxed'
const SHADES = ['bg-accent/25 text-foreground', 'bg-warning/25 text-foreground']

function buildSegments(
  text: string,
  matches: Array<RegexMatch>,
): Array<React.ReactNode> {
  const ranges = matches
    .filter((m) => m.end > m.start)
    .sort((a, b) => a.start - b.start)
  const nodes: Array<React.ReactNode> = []
  let cursor = 0
  let key = 0
  for (const range of ranges) {
    if (range.start < cursor) continue
    if (range.start > cursor) nodes.push(text.slice(cursor, range.start))
    nodes.push(
      <mark
        key={key}
        className={cn(
          'rounded-sm box-decoration-clone',
          SHADES[key % SHADES.length],
        )}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    )
    cursor = range.end
    key++
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

export function RegexHighlight({
  value,
  onChange,
  matches,
  placeholder,
  className,
  minRows = 8,
  bare = false,
}: {
  value: string
  onChange: (value: string) => void
  matches: Array<RegexMatch>
  placeholder?: string
  className?: string
  minRows?: number
  bare?: boolean
}) {
  const segments = React.useMemo(
    () => buildSegments(value, matches),
    [value, matches],
  )

  return (
    <div
      className={cn(
        'relative overflow-auto overscroll-contain',
        bare
          ? 'bg-transparent'
          : 'rounded-md border border-border bg-background transition-colors focus-within:bg-card',
        className,
      )}
      style={{ minHeight: minRows * 21 + 24 }}
    >
      <div className="relative min-h-full w-full">
        <div
          aria-hidden
          className={cn(
            FONT,
            'pointer-events-none whitespace-pre-wrap break-words p-3 text-foreground',
          )}
        >
          {segments}
          {value.endsWith('\n') ? ' ' : null}
        </div>
        <textarea
          className={cn(
            FONT,
            'absolute inset-0 h-full w-full resize-none overflow-hidden border-0 bg-transparent p-3 text-transparent caret-foreground outline-none placeholder:text-muted-foreground selection:bg-accent/25',
          )}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
