import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { RegexHighlight } from '@/components/tools/regex-highlight'
import { ErrorText } from '@/components/tools/tool-panel'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip'
import { buildSeo, ogUrl } from '@/lib/seo'
import type { RegexResult } from '@/lib/tools/regex'
import { MATCH_CAP } from '@/lib/tools/regex'
import { requireTool } from '@/lib/tools/registry'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('regex')

const FLAGS: Array<{ k: string; name: string; desc: string }> = [
  { k: 'g', name: 'global', desc: 'Find all matches, not just the first one.' },
  {
    k: 'i',
    name: 'ignore case',
    desc: 'Match regardless of upper / lowercase.',
  },
  { k: 'm', name: 'multiline', desc: '^ and $ match at every line break.' },
  { k: 's', name: 'dotall', desc: '. also matches newline characters.' },
  { k: 'u', name: 'unicode', desc: 'Full Unicode: \\u{…}, \\p{…}, emoji.' },
  { k: 'y', name: 'sticky', desc: 'Match only at the current lastIndex.' },
]

const CHEATSHEET: Array<{ token: string; meaning: string }> = [
  { token: '\\d \\w \\s', meaning: 'digit, word char, whitespace' },
  { token: '\\D \\W \\S', meaning: 'negated classes' },
  { token: '. ', meaning: 'any char (except newline)' },
  { token: '[abc] [^abc]', meaning: 'set / negated set' },
  { token: '+ * ?', meaning: '1+, 0+, optional' },
  { token: '{n} {n,} {n,m}', meaning: 'exact / min / range count' },
  { token: '(...) (?:...)', meaning: 'capturing / non-capturing group' },
  { token: '(?<name>...)', meaning: 'named group' },
  { token: 'a|b', meaning: 'alternation' },
  { token: '^ $ \\b', meaning: 'start, end, word boundary' },
  { token: '\\1 $1 $<name>', meaning: 'backref / replace reference' },
]

const SAMPLE = `Contacts:
bob@acme.com
alice@dev.io`

export const Route = createFileRoute('/tools/regex')({
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
  const [pattern, setPattern] = usePersistedState(
    'regex:pattern',
    '(\\w+)@(\\w+)\\.(\\w+)',
  )
  const [flags, setFlags] = usePersistedState('regex:flags', 'g')
  const [replacement, setReplacement] = usePersistedState(
    'regex:replacement',
    '',
  )
  const [text, setText] = usePersistedState('regex:text', SAMPLE)

  const [result, setResult] = React.useState<RegexResult | null>(null)
  const [slow, setSlow] = React.useState(false)

  const workerRef = React.useRef<Worker | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const spawn = React.useCallback(() => {
    const worker = new Worker(
      new URL('../../lib/tools/regex.worker.ts', import.meta.url),
      { type: 'module' },
    )
    worker.onmessage = (event: MessageEvent<RegexResult>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setResult(event.data)
      setSlow(false)
    }
    workerRef.current = worker
    return worker
  }, [])

  React.useEffect(() => {
    if (typeof Worker === 'undefined') return
    const worker = spawn()
    return () => {
      worker.terminate()
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [spawn])

  React.useEffect(() => {
    if (typeof Worker === 'undefined') return
    if (!pattern) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setResult(null)
      setSlow(false)
      return
    }
    const debounce = setTimeout(() => {
      const worker = workerRef.current
      if (!worker) return
      worker.postMessage({ pattern, flags, text, replacement })
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null
          worker.terminate()
          spawn()
          setResult(null)
          setSlow(true)
        }, 1000)
      }
    }, 150)
    return () => clearTimeout(debounce)
  }, [pattern, flags, text, replacement, spawn])

  const toggleFlag = (key: string) => {
    const has = flags.includes(key)
    setFlags(
      FLAGS.map((f) => f.k)
        .filter((k) => (k === key ? !has : flags.includes(k)))
        .join(''),
    )
  }

  const matches = result?.matches ?? []
  const hasReplacement = replacement.length > 0

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="grid min-h-0 flex-1 gap-4 p-6 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center gap-2 px-3 font-mono text-sm">
              <span>REGEX: </span>
              <input
                value={pattern}
                onChange={(event) => setPattern(event.target.value)}
                placeholder="pattern"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-muted-foreground"
              />
              <span className="shrink-0 text-muted-foreground">/{flags}</span>
            </div>

            <TooltipProvider
              delayDuration={120}
              skipDelayDuration={300}
              disableHoverableContent
            >
              <div className="flex flex-wrap gap-1 items-center border-t border-border py-1.5 px-3">
                <span className="font-mono text-sm">FLAGS: </span>
                {FLAGS.map((flag) => {
                  const active = flags.includes(flag.k)
                  return (
                    <Tooltip
                      key={flag.k}
                      content={
                        <span>
                          <span className="font-mono font-semibold text-accent">
                            {flag.k}
                          </span>{' '}
                          <span className="font-medium">{flag.name}</span>
                          <span className="mt-0.5 block text-muted-foreground">
                            {flag.desc}
                          </span>
                        </span>
                      }
                    >
                      <button
                        type="button"
                        onClick={() => toggleFlag(flag.k)}
                        aria-label={`${flag.name} flag`}
                        aria-pressed={active}
                        className={cn(
                          'h-7 w-7 rounded font-mono text-sm transition-colors',
                          active
                            ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {flag.k}
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>

            <RegexHighlight
              bare
              value={text}
              onChange={setText}
              matches={matches}
              placeholder="Test string…"
              className="min-h-0 flex-1 border-t border-border"
            />
          </div>

          {result?.error ? <ErrorText>{result.error}</ErrorText> : null}
          {slow ? (
            <ErrorText>Pattern too slow — try simplifying it.</ErrorText>
          ) : null}
          {result?.truncated ? (
            <p className="text-xs text-muted-foreground">
              Showing first {MATCH_CAP.toLocaleString()} matches.
            </p>
          ) : null}
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 font-mono text-sm">
            <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em]">
              Replace:
            </span>

            <input
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              placeholder="$1 $<name> $&"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="min-w-0 flex-1 bg-transparent pb-2 pt-1.75 outline-none placeholder:text-muted-foreground"
            />
          </div>
          {hasReplacement ? (
            <Card
              label="Replacement result"
              fieldClassName="min-h-43.5"
              copyValue={result?.replaced ?? ''}
              value={result?.replaced ?? ''}
              readOnly
              minRows={3}
            />
          ) : null}
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <Card
            label={
              !pattern
                ? 'Matches'
                : `${matches.length} match${matches.length === 1 ? '' : 'es'}`
            }
            className="min-h-0 flex-1"
            bodyClassName="overflow-auto p-2"
          >
            {matches.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">
                {!pattern
                  ? 'Enter a pattern to see matches.'
                  : result?.error
                    ? 'Invalid pattern.'
                    : 'No matches.'}
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {matches.map((match, i) => (
                  <li
                    key={i}
                    className="rounded border border-border bg-background/40 p-2 text-sm"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <span className="text-accent">#{i + 1}</span>
                      <span>
                        {match.start}–{match.end}
                      </span>
                    </div>
                    <div className="mt-1 break-all font-mono text-[13px] text-foreground">
                      {match.value || '∅'}
                    </div>
                    {match.groups.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {match.groups.map((group, gi) => (
                          <span
                            key={gi}
                            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                          >
                            <span className="text-accent">
                              {group.name ?? gi + 1}
                            </span>
                            : {group.value === undefined ? '∅' : group.value}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Collapsible className="rounded-md border border-border bg-card">
            <CollapsibleTrigger className="group flex w-full items-center justify-between px-3 py-[11.75px] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground">
              Cheatsheet
              <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 gap-1.5 border-t border-border p-3 sm:grid-cols-2">
                {CHEATSHEET.map((row) => (
                  <div
                    key={row.token}
                    className="flex items-baseline gap-2 text-xs"
                  >
                    <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                      {row.token}
                    </code>
                    <span className="text-muted-foreground">{row.meaning}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
