import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { Tabs } from '@/components/ui/tabs'
import { buildSeo, ogUrl } from '@/lib/seo'
import type { DiffLine, InlineSpan, LineKind } from '@/lib/tools/diff'
import { computeDiff, toUnifiedDiff } from '@/lib/tools/diff'
import { requireTool } from '@/lib/tools/registry'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { Check, Copy } from 'lucide-react'
import type { PrismTheme } from 'prism-react-renderer'
import { Highlight } from 'prism-react-renderer'
import * as React from 'react'

const tool = requireTool('diff')
const RENDER_CAP = 5000

type View = 'split' | 'unified'

type PrismToken = { types: Array<string>; content: string; empty?: boolean }
type GetTokenProps = (input: { token: PrismToken }) => {
  className?: string
  style?: React.CSSProperties
}

const LANGUAGES: Array<{ value: string; label: string }> = [
  { value: 'text', label: 'Plain' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'json', label: 'JSON' },
  { value: 'markup', label: 'HTML / XML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C / C++' },
  { value: 'sql', label: 'SQL' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'graphql', label: 'GraphQL' },
]

const prismTheme: PrismTheme = {
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

export const Route = createFileRoute('/tools/diff')({
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

function rowBg(kind: LineKind): string {
  if (kind === 'added') return 'bg-success/10'
  if (kind === 'removed') return 'bg-destructive/10'
  return ''
}

function LineTokens({
  tokens,
  spans,
  kind,
  getTokenProps,
}: {
  tokens: Array<PrismToken>
  spans: Array<InlineSpan>
  kind: LineKind
  getTokenProps: GetTokenProps
}) {
  const highlight = kind === 'added' ? 'bg-success/30' : 'bg-destructive/30'
  const nodes: Array<React.ReactNode> = []
  let spanIdx = 0
  let spanOffset = 0

  tokens.forEach((token, ti) => {
    const props = getTokenProps({ token })
    const text = token.content
    let i = 0
    let seg = 0
    while (i < text.length) {
      while (
        spanIdx < spans.length &&
        spanOffset >= spans[spanIdx].text.length
      ) {
        spanIdx += 1
        spanOffset = 0
      }
      const span = spans[spanIdx] as InlineSpan | undefined
      const isChanged = span?.changed ?? false
      const remainInSpan = span
        ? span.text.length - spanOffset
        : text.length - i
      const take = Math.min(text.length - i, remainInSpan)
      nodes.push(
        <span
          key={`${ti}-${seg}`}
          className={cn(
            props.className,
            isChanged && cn('rounded-[2px]', highlight),
          )}
          style={props.style}
        >
          {text.slice(i, i + take)}
        </span>,
      )
      i += take
      spanOffset += take
      seg += 1
    }
  })

  if (nodes.length === 0) return <span> </span>
  return <>{nodes}</>
}

function LineNo({ n }: { n?: number }) {
  return (
    <span className="w-10 shrink-0 select-none px-2 text-right text-muted-foreground/50">
      {n ?? ''}
    </span>
  )
}

function UnifiedRow({
  line,
  tokens,
  getTokenProps,
}: {
  line: DiffLine
  tokens: Array<PrismToken>
  getTokenProps: GetTokenProps
}) {
  const sign = line.kind === 'added' ? '+' : line.kind === 'removed' ? '-' : ' '
  return (
    <div className={cn('flex', rowBg(line.kind))}>
      <LineNo n={line.oldLine} />
      <LineNo n={line.newLine} />
      <span className="w-4 shrink-0 select-none text-center text-muted-foreground">
        {sign}
      </span>
      <span className="min-h-[1.35em] flex-1 whitespace-pre-wrap break-all pr-3">
        <LineTokens
          tokens={tokens}
          spans={line.spans}
          kind={line.kind}
          getTokenProps={getTokenProps}
        />
      </span>
    </div>
  )
}

function SplitCell({
  n,
  line,
  active,
  tokens,
  getTokenProps,
}: {
  n?: number
  line: DiffLine
  active: boolean
  tokens: Array<PrismToken>
  getTokenProps: GetTokenProps
}) {
  return (
    <div className={cn('flex', active ? rowBg(line.kind) : '')}>
      <LineNo n={active ? n : undefined} />
      <span className="min-h-[1.35em] flex-1 whitespace-pre-wrap break-all pr-3">
        {active ? (
          <LineTokens
            tokens={tokens}
            spans={line.spans}
            kind={line.kind}
            getTokenProps={getTokenProps}
          />
        ) : null}
      </span>
    </div>
  )
}

function SplitRow({
  line,
  tokens,
  getTokenProps,
}: {
  line: DiffLine
  tokens: Array<PrismToken>
  getTokenProps: GetTokenProps
}) {
  const hasLeft = line.kind !== 'added'
  const hasRight = line.kind !== 'removed'
  return (
    <div className="grid grid-cols-2 divide-x divide-border">
      <SplitCell
        n={line.oldLine}
        line={line}
        active={hasLeft}
        tokens={tokens}
        getTokenProps={getTokenProps}
      />
      <SplitCell
        n={line.newLine}
        line={line}
        active={hasRight}
        tokens={tokens}
        getTokenProps={getTokenProps}
      />
    </div>
  )
}

function CopyUnifiedButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      disabled={!value}
      className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      Copy unified diff
    </button>
  )
}

function OverviewRuler({
  lines,
  scrollRef,
}: {
  lines: Array<DiffLine>
  scrollRef: React.RefObject<HTMLDivElement | null>
}) {
  const rulerRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)
  const [thumb, setThumb] = React.useState({ top: 0, height: 1 })

  const sync = React.useCallback(() => {
    const el = scrollRef.current
    if (!el || el.scrollHeight <= 0) return
    setThumb({
      top: el.scrollTop / el.scrollHeight,
      height: el.clientHeight / el.scrollHeight,
    })
  }, [scrollRef])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', sync)
      observer.disconnect()
    }
  }, [scrollRef, sync, lines])

  const scrollToClientY = (clientY: number) => {
    const el = scrollRef.current
    const ruler = rulerRef.current
    if (!el || !ruler) return
    const rect = ruler.getBoundingClientRect()
    const fraction = Math.min(
      1,
      Math.max(0, (clientY - rect.top) / rect.height),
    )
    el.scrollTop = fraction * el.scrollHeight - el.clientHeight / 2
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    scrollToClientY(event.clientY)
  }
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) scrollToClientY(event.clientY)
  }
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const total = lines.length || 1

  return (
    <div
      ref={rulerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="relative w-3 shrink-0 cursor-pointer border-l border-border bg-muted/20"
      aria-hidden
    >
      {lines.map((line, i) =>
        line.kind === 'context' ? null : (
          <span
            key={i}
            className={cn(
              'pointer-events-none absolute left-0 right-0 z-10',
              line.kind === 'added' ? 'bg-success/60' : 'bg-destructive/60',
            )}
            style={{
              top: `${(i / total) * 100}%`,
              height: `${100 / total}%`,
              minHeight: '2px',
            }}
          />
        ),
      )}
      <span
        className="pointer-events-none absolute inset-x-0 rounded-full bg-foreground/15 ring-1 ring-inset ring-border"
        style={{
          top: `${thumb.top * 100}%`,
          height: `${Math.max(thumb.height * 100, 5)}%`,
        }}
      />
    </div>
  )
}

function DiffViewport({
  lines,
  view,
  language,
}: {
  lines: Array<DiffLine>
  view: View
  language: string
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const code = React.useMemo(
    () =>
      lines
        .map((line) => line.spans.map((span) => span.text).join(''))
        .join('\n'),
    [lines],
  )
  return (
    <div className="relative flex min-h-0 flex-1">
      <div
        ref={scrollRef}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-auto outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Highlight code={code} language={language} theme={prismTheme}>
          {({ tokens, getTokenProps }) => (
            <div className="font-mono text-[13px] leading-relaxed">
              {lines.map((line, i) =>
                view === 'split' ? (
                  <SplitRow
                    key={i}
                    line={line}
                    tokens={tokens[i] ?? []}
                    getTokenProps={getTokenProps}
                  />
                ) : (
                  <UnifiedRow
                    key={i}
                    line={line}
                    tokens={tokens[i] ?? []}
                    getTokenProps={getTokenProps}
                  />
                ),
              )}
            </div>
          )}
        </Highlight>
      </div>
      <OverviewRuler lines={lines} scrollRef={scrollRef} />
    </div>
  )
}

function Page() {
  const [oldText, setOldText] = usePersistedState('diff:old', '')
  const [newText, setNewText] = usePersistedState('diff:new', '')
  const [ignoreWhitespace, setIgnoreWhitespace] = React.useState(false)
  const [ignoreCase, setIgnoreCase] = React.useState(false)
  const [view, setView] = React.useState<View>('split')
  const [language, setLanguage] = usePersistedState('diff:lang', 'text')

  const hasInput = oldText.length > 0 || newText.length > 0

  const result = React.useMemo(
    () => computeDiff(oldText, newText, { ignoreWhitespace, ignoreCase }),
    [oldText, newText, ignoreWhitespace, ignoreCase],
  )

  const unified = React.useMemo(
    () => (hasInput ? toUnifiedDiff(oldText, newText) : ''),
    [hasInput, oldText, newText],
  )

  const tooLarge = result.lines.length > RENDER_CAP

  const counts = (
    <span className="flex items-center gap-2 font-mono text-[11px] normal-case tracking-normal">
      <span className="text-success">+{result.addedCount}</span>
      <span className="text-destructive">−{result.removedCount}</span>
    </span>
  )

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card
            label="Original"
            value={oldText}
            onChange={setOldText}
            language={language}
            placeholder="Paste the original text…"
            fieldClassName="max-h-40"
          />
          <Card
            label="Changed"
            value={newText}
            onChange={setNewText}
            language={language}
            placeholder="Paste the changed text…"
            fieldClassName="max-h-40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(event) => setIgnoreWhitespace(event.target.checked)}
              className="h-3.5 w-3.5 accent-accent"
            />
            Ignore whitespace
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(event) => setIgnoreCase(event.target.checked)}
              className="h-3.5 w-3.5 accent-accent"
            />
            Ignore case
          </label>
          <div className="ml-auto flex items-center gap-3">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label="Syntax language"
              className="rounded-md border border-border bg-card px-2 py-1 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-accent"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <Tabs
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: 'split', label: 'Split' },
                { value: 'unified', label: 'Unified' },
              ]}
            />
          </div>
        </div>

        <Card
          label={counts}
          headerRight={<CopyUnifiedButton value={unified} />}
          className="min-h-0 flex-1"
        >
          {!hasInput ? (
            <p className="p-4 text-sm text-muted-foreground">
              Paste text into both panels to see the diff.
            </p>
          ) : tooLarge ? (
            <p className="p-4 text-sm text-muted-foreground">
              Diff too large to display ({result.lines.length.toLocaleString()}{' '}
              lines). Reduce the input to under {RENDER_CAP.toLocaleString()}{' '}
              lines.
            </p>
          ) : (
            <DiffViewport
              lines={result.lines}
              view={view}
              language={language}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
