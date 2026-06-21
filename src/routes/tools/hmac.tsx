import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import type { HmacAlgorithm, HmacEncoding } from '@/lib/tools/hmac'
import { HMAC_ALGORITHMS, generateHmac, verifyHmac } from '@/lib/tools/hmac'
import { requireTool } from '@/lib/tools/registry'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { Check, X } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('hmac')

type Mode = 'generate' | 'verify'

export const Route = createFileRoute('/tools/hmac')({
  head: () => ({ meta: [{ title: `${tool.name} — ComfyToolkit` }] }),
  component: Page,
})

function Page() {
  const [mode, setMode] = React.useState<Mode>('generate')
  const [message, setMessage] = usePersistedState('hmac:message', '')
  const [secret, setSecret] = usePersistedState('hmac:secret', '')
  const [expected, setExpected] = usePersistedState('hmac:expected', '')
  const [algorithm, setAlgorithm] = React.useState<HmacAlgorithm>('SHA-256')
  const [encoding, setEncoding] = React.useState<HmacEncoding>('hex')
  const [output, setOutput] = React.useState('')
  const [valid, setValid] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (mode !== 'generate') return
    if (!secret) {
      setOutput('')
      return
    }
    let active = true
    void generateHmac(message, secret, algorithm, encoding)
      .then((result) => active && setOutput(result))
      .catch(() => active && setOutput(''))
    return () => {
      active = false
    }
  }, [mode, message, secret, algorithm, encoding])

  React.useEffect(() => {
    if (mode !== 'verify' || !secret || !expected.trim()) {
      setValid(null)
      return
    }
    let active = true
    void verifyHmac(message, secret, algorithm, encoding, expected).then(
      (result) => active && setValid(result),
    )
    return () => {
      active = false
    }
  }, [mode, message, secret, algorithm, encoding, expected])

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={mode}
            onChange={setMode}
            options={[
              { value: 'generate', label: 'Generate' },
              { value: 'verify', label: 'Verify' },
            ]}
          />
          <select
            value={algorithm}
            onChange={(event) =>
              setAlgorithm(event.target.value as HmacAlgorithm)
            }
            className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground transition-colors hover:border-border-strong focus-within:bg-card focus-visible:border-accent focus-visible:outline-none"
          >
            {HMAC_ALGORITHMS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Tabs
            value={encoding}
            onChange={setEncoding}
            size="sm"
            options={[
              { value: 'hex', label: 'Hex' },
              { value: 'base64', label: 'Base64' },
            ]}
          />
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <div className="flex min-h-0 flex-col gap-4">
            <Card
              label="Message"
              className="flex-1"
              value={message}
              onChange={setMessage}
              placeholder="Message to sign"
            />
            <Card label="Secret key">
              <Input
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder="Shared secret"
                spellCheck={false}
                className="rounded-none border-0 bg-transparent hover:border-0 focus-within:bg-transparent focus-visible:border-0"
              />
            </Card>
          </div>

          {mode === 'generate' ? (
            <Card
              label="Signature"
              className="flex-1"
              copyValue={output}
              value={output}
              readOnly
              placeholder="Signature appears here"
              fieldClassName="break-all"
            />
          ) : (
            <div className="flex min-h-0 flex-col gap-3">
              <Card
                label="Expected signature"
                className="flex-1"
                value={expected}
                onChange={setExpected}
                placeholder="Paste the signature to verify"
                fieldClassName="break-all"
              />
              {valid === null ? null : valid ? (
                <Status ok>Signature is valid</Status>
              ) : (
                <Status ok={false}>Signature does not match</Status>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        'flex items-center gap-1.5 text-[13px]',
        ok ? 'text-success' : 'text-destructive',
      )}
    >
      {ok ? (
        <Check className="h-4 w-4 shrink-0" />
      ) : (
        <X className="h-4 w-4 shrink-0" />
      )}
      {children}
    </p>
  )
}
