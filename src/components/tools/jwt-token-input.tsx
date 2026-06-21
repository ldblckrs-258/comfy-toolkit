import * as React from 'react'

const SEGMENT_COLORS = [
  'var(--destructive)',
  'var(--tool-encoders)',
  'var(--success)',
]

const SHARED =
  'm-0 w-full whitespace-pre-wrap break-all p-3 font-mono text-[13px] leading-relaxed'

function segments(value: string): Array<React.ReactNode> {
  const parts = value.split('.')
  const nodes: Array<React.ReactNode> = []
  parts.forEach((part, index) => {
    if (index > 0) {
      nodes.push(
        <span key={`dot-${index}`} style={{ color: 'var(--muted-foreground)' }}>
          .
        </span>,
      )
    }
    const color = SEGMENT_COLORS[Math.min(index, SEGMENT_COLORS.length - 1)]
    nodes.push(
      <span key={`seg-${index}`} style={{ color }}>
        {part}
      </span>,
    )
  })
  return nodes
}

export function JwtTokenInput({
  value,
  onChange,
  placeholder,
  className,
  readOnly,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}) {
  const preRef = React.useRef<HTMLPreElement>(null)

  const syncScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    if (!preRef.current) return
    preRef.current.scrollTop = event.currentTarget.scrollTop
    preRef.current.scrollLeft = event.currentTarget.scrollLeft
  }

  return (
    <div
      className={
        'relative min-h-0 flex-1 overflow-hidden bg-transparent ' +
        (className ?? '')
      }
    >
      <pre
        ref={preRef}
        aria-hidden
        className={
          SHARED + ' pointer-events-none absolute inset-0 overflow-auto'
        }
      >
        {value ? segments(value) : null}
      </pre>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        spellCheck={false}
        readOnly={readOnly}
        className={
          SHARED +
          ' absolute inset-0 resize-none overflow-auto bg-transparent text-transparent caret-foreground outline-none placeholder:text-muted-foreground selection:bg-accent/25'
        }
      />
    </div>
  )
}
