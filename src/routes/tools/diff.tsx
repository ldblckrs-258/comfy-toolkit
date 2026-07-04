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
import * as React from 'react'

const tool = requireTool('diff')
const RENDER_CAP = 5000

type View = 'split' | 'unified'

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

function Spans({ spans, kind }: { spans: Array<InlineSpan>; kind: LineKind }) {
  const highlight = kind === 'added' ? 'bg-success/30' : 'bg-destructive/30'
  return (
    <>
      {spans.map((span, i) =>
        span.changed ? (
          <span key={i} className={cn('rounded-[2px]', highlight)}>
            {span.text}
          </span>
        ) : (
          <span key={i}>{span.text}</span>
        ),
      )}
    </>
  )
}

function LineNo({ n }: { n?: number }) {
  return (
    <span className="w-10 shrink-0 select-none px-2 text-right text-muted-foreground/50">
      {n ?? ''}
    </span>
  )
}

function UnifiedRow({ line }: { line: DiffLine }) {
  const sign = line.kind === 'added' ? '+' : line.kind === 'removed' ? '-' : ' '
  return (
    <div className={cn('flex', rowBg(line.kind))}>
      <LineNo n={line.oldLine} />
      <LineNo n={line.newLine} />
      <span className="w-4 shrink-0 select-none text-center text-muted-foreground">
        {sign}
      </span>
      <span className="min-h-[1.35em] flex-1 whitespace-pre-wrap break-all pr-3">
        <Spans spans={line.spans} kind={line.kind} />
      </span>
    </div>
  )
}

function SplitCell({
  n,
  line,
  active,
}: {
  n?: number
  line: DiffLine
  active: boolean
}) {
  return (
    <div className={cn('flex', active ? rowBg(line.kind) : '')}>
      <LineNo n={active ? n : undefined} />
      <span className="min-h-[1.35em] flex-1 whitespace-pre-wrap break-all pr-3">
        {active ? <Spans spans={line.spans} kind={line.kind} /> : null}
      </span>
    </div>
  )
}

function SplitRow({ line }: { line: DiffLine }) {
  const hasLeft = line.kind !== 'added'
  const hasRight = line.kind !== 'removed'
  return (
    <div className="grid grid-cols-2 divide-x divide-border">
      <SplitCell n={line.oldLine} line={line} active={hasLeft} />
      <SplitCell n={line.newLine} line={line} active={hasRight} />
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

function Page() {
  const [oldText, setOldText] = usePersistedState('diff:old', '')
  const [newText, setNewText] = usePersistedState('diff:new', '')
  const [ignoreWhitespace, setIgnoreWhitespace] = React.useState(false)
  const [ignoreCase, setIgnoreCase] = React.useState(false)
  const [view, setView] = React.useState<View>('split')

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
            placeholder="Paste the original text…"
            fieldClassName="min-h-40"
          />
          <Card
            label="Changed"
            value={newText}
            onChange={setNewText}
            placeholder="Paste the changed text…"
            fieldClassName="min-h-40"
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
          <Tabs
            className="ml-auto"
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: 'split', label: 'Split' },
              { value: 'unified', label: 'Unified' },
            ]}
          />
        </div>

        <Card
          label={counts}
          headerRight={<CopyUnifiedButton value={unified} />}
          className="min-h-0 flex-1"
          bodyClassName="overflow-auto"
        >
          {!hasInput ? (
            <p className="p-4 text-sm text-muted-foreground">
              Paste text into both panels to see the diff.
            </p>
          ) : tooLarge ? (
            <p className="p-4 text-sm text-muted-foreground">
              Diff too large to display ({result.lines.length.toLocaleString()}{' '}
              lines). Reduce the input to under{' '}
              {RENDER_CAP.toLocaleString()} lines.
            </p>
          ) : (
            <div className="font-mono text-[13px] leading-relaxed">
              {result.lines.map((line, i) =>
                view === 'split' ? (
                  <SplitRow key={i} line={line} />
                ) : (
                  <UnifiedRow key={i} line={line} />
                ),
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
