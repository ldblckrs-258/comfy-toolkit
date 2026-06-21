import { Highlight } from 'prism-react-renderer'
import type { PrismTheme } from 'prism-react-renderer'
import { cn } from '@/lib/utils'

const FONT = 'font-mono text-[13px] leading-relaxed'
const GUTTER = cn(
  FONT,
  'w-10 shrink-0 select-none self-stretch pr-2 text-right text-[12px] text-muted-foreground/50',
)
const CONTENT = cn(
  FONT,
  'min-w-0 flex-1 whitespace-pre-wrap break-words px-3 text-foreground',
)

const theme: PrismTheme = {
  plain: { color: 'var(--foreground)' },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--code-comment)', fontStyle: 'italic' },
    },
    { types: ['punctuation'], style: { color: 'var(--code-punctuation)' } },
    { types: ['property'], style: { color: 'var(--code-key)' } },
    {
      types: ['string', 'attr-value', 'char', 'inserted'],
      style: { color: 'var(--code-string)' },
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol'],
      style: { color: 'var(--code-number)' },
    },
    {
      types: ['keyword', 'selector', 'important', 'atrule', 'rule'],
      style: { color: 'var(--code-keyword)' },
    },
    {
      types: ['function', 'class-name', 'builtin'],
      style: { color: 'var(--code-function)' },
    },
    { types: ['tag', 'deleted'], style: { color: 'var(--code-tag)' } },
    { types: ['attr-name'], style: { color: 'var(--code-keyword)' } },
    {
      types: ['operator', 'entity', 'url', 'variable'],
      style: { color: 'var(--code-operator)' },
    },
  ],
}

export function CodeEditor({
  value,
  onChange,
  readOnly,
  placeholder,
  minRows = 4,
  className,
  language,
}: {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  minRows?: number
  className?: string
  language?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-auto overscroll-contain rounded-md border border-border bg-background transition-colors focus-within:bg-card',
        className,
      )}
      style={{ minHeight: minRows * 21 + 20 }}
    >
      <div className="relative min-h-full w-full">
        <div className="pointer-events-none py-2.5">
          <Highlight code={value} language={language ?? 'text'} theme={theme}>
            {({ tokens, getTokenProps }) =>
              tokens.map((line, i) => {
                const empty = line.every((token) => token.content === '')
                return (
                  <div key={i} className="flex">
                    <span className={GUTTER}>{i + 1}</span>
                    <span className={CONTENT}>
                      {empty
                        ? ' '
                        : line.map((token, key) => {
                            const props = getTokenProps({ token })
                            return (
                              <span
                                key={key}
                                className={props.className}
                                style={props.style}
                              >
                                {props.children}
                              </span>
                            )
                          })}
                    </span>
                  </div>
                )
              })
            }
          </Highlight>
        </div>
        <textarea
          className={cn(
            FONT,
            'absolute inset-0 h-full w-full resize-none overflow-hidden border-0 bg-transparent py-2.5 pl-[3.25rem] pr-3 text-transparent caret-foreground outline-none placeholder:text-muted-foreground selection:bg-accent/25',
          )}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}
