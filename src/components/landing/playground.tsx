import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import * as React from 'react'

import { CodeEditor } from '@/components/ui/code-editor'
import { encodeBase64 } from '@/lib/tools/base64'
import { hashAll } from '@/lib/tools/hash'
import { formatJson } from '@/lib/tools/json'
import { decodeJwt } from '@/lib/tools/jwt'
import { requireTool } from '@/lib/tools/registry'
import { cn } from '@/lib/utils'

import { trackSpotlight } from './spotlight'

import type { LinkProps } from '@tanstack/react-router'

interface Demo {
  id: string
  label: string
  toolId: string
  outputLabel: string
  seed: string
  inputLang: string
  outputLang: string
  run: (input: string) => Promise<{ ok: boolean; text: string }>
}

const PANE =
  'playground-pane h-44 rounded-none border-0 bg-transparent focus-within:bg-transparent md:h-52'

function fail(error: unknown) {
  return {
    ok: false,
    text:
      error instanceof Error ? error.message : 'Could not parse that input.',
  }
}

const DEMOS: Array<Demo> = [
  {
    id: 'json',
    label: 'JSON',
    toolId: 'json-formatter',
    outputLabel: 'Formatted',
    inputLang: 'json',
    outputLang: 'json',
    seed: '{"service":"checkout","retries":3,"tags":["prod","eu-west"],"healthy":true}',
    run: async (input) => {
      const result = formatJson(input, 2)
      return result.ok
        ? { ok: true, text: result.output }
        : { ok: false, text: result.error ?? 'Invalid JSON' }
    },
  },
  {
    id: 'base64',
    label: 'Base64',
    toolId: 'base64',
    outputLabel: 'Encoded',
    inputLang: 'text',
    outputLang: 'text',
    seed: 'Nothing here is uploaded - ever.',
    run: async (input) => {
      try {
        return { ok: true, text: encodeBase64(input) }
      } catch (error) {
        return fail(error)
      }
    },
  },
  {
    id: 'hash',
    label: 'Hash',
    toolId: 'hash',
    outputLabel: 'Digests',
    inputLang: 'text',
    outputLang: 'yaml',
    seed: 'correct horse battery staple',
    run: async (input) => {
      try {
        const digests = await hashAll(input, 'hex')
        return {
          ok: true,
          text: `MD5:     ${digests.MD5}\nSHA-1:   ${digests['SHA-1']}\nSHA-256: ${digests['SHA-256']}`,
        }
      } catch (error) {
        return fail(error)
      }
    },
  },
  {
    id: 'jwt',
    label: 'JWT',
    toolId: 'jwt-decoder',
    outputLabel: 'Payload',
    inputLang: 'text',
    outputLang: 'json',
    seed: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImFkbWluIjp0cnVlLCJpYXQiOjE3NTM2MDAwMDB9.4c8Vv0mYQ1w5bqU3ZzWJH3wq2xk9d1sQmVXY7pTgLro',
    run: async (input) => {
      try {
        return {
          ok: true,
          text: JSON.stringify(decodeJwt(input).payload, null, 2),
        }
      } catch (error) {
        return fail(error)
      }
    },
  },
]

export function Playground() {
  const [active, setActive] = React.useState(0)
  const [inputs, setInputs] = React.useState<Array<string>>(() =>
    DEMOS.map((demo) => demo.seed),
  )
  const [result, setResult] = React.useState({ ok: true, text: '' })

  const demo = DEMOS[active]
  const input = inputs[active]
  const tool = requireTool(demo.toolId)

  React.useEffect(() => {
    let cancelled = false
    void demo.run(input).then((next) => {
      if (!cancelled) setResult(next)
    })
    return () => {
      cancelled = true
    }
  }, [demo, input])

  return (
    <div
      onPointerMove={trackSpotlight}
      className="spotlight overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div
        role="tablist"
        aria-label="Tool demos"
        className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-2"
      >
        {DEMOS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            onClick={() => setActive(index)}
            className={cn(
              'shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              index === active
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
        <span className="ml-auto hidden shrink-0 items-center gap-1.5 pr-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:flex">
          <span className="live-dot" />
          Live
        </span>
      </div>

      <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="flex min-w-0 flex-col">
          <span className="border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Input · editable
          </span>
          <CodeEditor
            value={input}
            language={demo.inputLang}
            minRows={2}
            onChange={(next) => {
              const copy = [...inputs]
              copy[active] = next
              setInputs(copy)
            }}
            className={PANE}
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {demo.outputLabel}
          </span>
          <div aria-live="polite" className="min-w-0">
            {result.ok ? (
              <CodeEditor
                value={result.text}
                language={demo.outputLang}
                minRows={2}
                readOnly
                className={PANE}
              />
            ) : (
              <p className="h-44 px-4 py-3 font-mono text-[13px] leading-relaxed text-destructive md:h-52">
                {result.text}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          0 network requests · computed in this tab
        </span>
        <Link
          to={tool.to as LinkProps['to']}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
        >
          Open {tool.name}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
