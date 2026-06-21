import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { JsonHighlight } from '@/components/tools/json-highlight'
import { JwtTokenInput } from '@/components/tools/jwt-token-input'
import { Tabs } from '@/components/ui/tabs'
import type { JwtParts, JwtSignResult, JwtVerifyResult } from '@/lib/tools/jwt'
import {
  TIMESTAMP_CLAIMS,
  decodeJwt,
  describeClaim,
  signJwt,
  timestampToLocale,
  verifyJwtSignature,
} from '@/lib/tools/jwt'
import { requireTool } from '@/lib/tools/registry'
import { buildSeo, ogUrl } from '@/lib/seo'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { Check, ShieldCheck, ShieldX, X } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('jwt-decoder')

export const Route = createFileRoute('/tools/jwt')({
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

type View = 'json' | 'claims'

type Mode = 'decode' | 'encode'

const DEFAULT_HEADER = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}'
const DEFAULT_PAYLOAD =
  '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "admin": true,\n  "iat": 1516239022\n}'
const DEFAULT_SECRET = 'a-string-secret-at-least-256-bits-long'

function Page() {
  const [mode, setMode] = React.useState<Mode>('decode')

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <Tabs
          value={mode}
          onChange={setMode}
          className="mb-6"
          options={[
            { value: 'encode', label: 'Encoder' },
            { value: 'decode', label: 'Decoder' },
          ]}
        />
        {mode === 'decode' ? <DecodeView /> : <EncodeView />}
      </div>
    </div>
  )
}

function DecodeView() {
  const [token, setToken] = usePersistedState('jwt:token', '')
  const [secret, setSecret] = usePersistedState('jwt:secret', '')
  const [base64urlSecret, setBase64urlSecret] = React.useState(false)
  const [headerView, setHeaderView] = React.useState<View>('claims')
  const [payloadView, setPayloadView] = React.useState<View>('json')
  const [verify, setVerify] = React.useState<JwtVerifyResult | null>(null)

  const decoded = React.useMemo(() => {
    if (!token.trim()) return null
    try {
      return { parts: decodeJwt(token), error: undefined as string | undefined }
    } catch (error) {
      return {
        parts: null as JwtParts | null,
        error: error instanceof Error ? error.message : 'Invalid token.',
      }
    }
  }, [token])

  const parts = decoded?.parts ?? null

  React.useEffect(() => {
    if (!parts || !secret.trim()) {
      setVerify(null)
      return
    }
    let active = true
    void verifyJwtSignature(parts, secret, base64urlSecret).then((result) => {
      if (active) setVerify(result)
    })
    return () => {
      active = false
    }
  }, [parts, secret, base64urlSecret])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex min-h-[18rem] flex-col gap-3 lg:h-[calc(100vh-16rem)]">
        <Card
          variant="terminal"
          className="flex-1"
          label={<TermLabel>JSON Web Token (JWT)</TermLabel>}
          copyValue={token}
          onClear={() => setToken('')}
        >
          <JwtTokenInput
            value={token}
            onChange={setToken}
            placeholder="Paste a JWT — eyJhbGciOi…"
          />
        </Card>
        <div className="flex flex-col gap-1.5">
          {decoded ? (
            parts ? (
              <Status tone="success" icon={Check}>
                Valid JWT
              </Status>
            ) : (
              <Status tone="destructive" icon={X}>
                {decoded.error}
              </Status>
            )
          ) : null}
          {verify ? <SignatureStatus result={verify} /> : null}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <DecodedCard
          title="Decoded Header"
          data={parts?.header}
          view={headerView}
          onView={setHeaderView}
        />
        <DecodedCard
          title="Decoded Payload"
          data={parts?.payload}
          view={payloadView}
          onView={setPayloadView}
        />
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                JWT Signature Verification{' '}
                <span className="font-normal text-muted-foreground">
                  (Optional)
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Enter the secret used to sign the JWT below.
              </p>
            </div>
            <SecretToggle
              checked={base64urlSecret}
              onChange={setBase64urlSecret}
            />
          </div>
          <Card
            variant="terminal"
            label={<TermLabel>Secret</TermLabel>}
            copyValue={secret}
            onClear={() => setSecret('')}
          >
            <SecretInput value={secret} onChange={setSecret} />
          </Card>
          {verify ? <SignatureStatus result={verify} variant="secret" /> : null}
        </section>
      </div>
    </div>
  )
}

function EncodeView() {
  const [header, setHeader] = usePersistedState(
    'jwt:enc-header',
    DEFAULT_HEADER,
  )
  const [payload, setPayload] = usePersistedState(
    'jwt:enc-payload',
    DEFAULT_PAYLOAD,
  )
  const [secret, setSecret] = usePersistedState(
    'jwt:enc-secret',
    DEFAULT_SECRET,
  )
  const [base64urlSecret, setBase64urlSecret] = React.useState(false)
  const [result, setResult] = React.useState<JwtSignResult | null>(null)

  React.useEffect(() => {
    if (!secret) {
      setResult({ error: 'Enter a secret to sign the token.' })
      return
    }
    let active = true
    void signJwt(header, payload, secret, base64urlSecret).then((signed) => {
      if (active) setResult(signed)
    })
    return () => {
      active = false
    }
  }, [header, payload, secret, base64urlSecret])

  const token = result?.token ?? ''

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card
          label="Decoded Header"
          copyValue={header}
          value={header}
          onChange={setHeader}
          language="json"
        />
        <Card
          label="Decoded Payload"
          copyValue={payload}
          value={payload}
          onChange={setPayload}
          language="json"
          minRows={9}
        />
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Sign JWT</h2>
            <SecretToggle
              checked={base64urlSecret}
              onChange={setBase64urlSecret}
            />
          </div>
          <Card
            variant="terminal"
            label={<TermLabel>Secret</TermLabel>}
            copyValue={secret}
            onClear={() => setSecret('')}
          >
            <SecretInput value={secret} onChange={setSecret} />
          </Card>
        </section>
      </div>

      <div className="flex min-h-[18rem] flex-col gap-3 lg:h-[calc(100vh-16rem)]">
        <Card
          variant="terminal"
          className="flex-1"
          label={<TermLabel>JSON Web Token (JWT)</TermLabel>}
          copyValue={token}
        >
          <JwtTokenInput
            readOnly
            value={token}
            onChange={() => {}}
            placeholder="The signed token appears here"
          />
        </Card>
        {result?.error ? (
          <Status tone="destructive" icon={X}>
            {result.error}
          </Status>
        ) : token ? (
          <Status tone="success" icon={ShieldCheck}>
            JWT generated
          </Status>
        ) : null}
      </div>
    </div>
  )
}

function TermLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-accent">{'>_'}</span>
      {children}
    </span>
  )
}

function SecretToggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
      Base64url encoded
      <Switch checked={checked} onChange={onChange} />
    </label>
  )
}

function SecretInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="a-string-secret-at-least-256-bits-long"
      spellCheck={false}
      className="h-20 w-full resize-none bg-transparent p-3 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
    />
  )
}

function DecodedCard({
  title,
  data,
  view,
  onView,
}: {
  title: string
  data: unknown
  view: View
  onView: (view: View) => void
}) {
  const copyValue = data === undefined ? '' : JSON.stringify(data, null, 2)
  const isObject = data !== null && typeof data === 'object'

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <Card
        copyValue={copyValue}
        bodyClassName="max-h-80 overflow-auto p-3"
        headerLeft={
          <Tabs
            value={view}
            onChange={onView}
            size="sm"
            options={[
              { value: 'json', label: 'JSON' },
              { value: 'claims', label: 'Claims' },
            ]}
          />
        }
      >
        {data === undefined ? (
          <p className="font-mono text-[13px] text-muted-foreground">—</p>
        ) : view === 'json' ? (
          <JsonHighlight value={data} />
        ) : isObject ? (
          <ClaimsTable data={data as Record<string, unknown>} />
        ) : (
          <JsonHighlight value={data} />
        )}
      </Card>
    </section>
  )
}

function ClaimsTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data)
  if (entries.length === 0) {
    return (
      <p className="font-mono text-[13px] text-muted-foreground">No claims.</p>
    )
  }
  return (
    <div className="divide-y divide-border">
      {entries.map(([key, value]) => {
        const description = describeClaim(key)
        const iso =
          TIMESTAMP_CLAIMS.has(key) && typeof value === 'number'
            ? timestampToLocale(value)
            : null
        return (
          <div
            key={key}
            className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-1 py-2.5 sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.3fr)]"
          >
            <span className="font-mono text-[13px] text-accent">{key}</span>
            <span className="min-w-0 break-words font-mono text-[13px] text-foreground">
              {formatValue(value)}
              {iso ? (
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {iso}
                </span>
              ) : null}
            </span>
            <span className="col-span-2 text-[12px] text-muted-foreground sm:col-span-1">
              {description}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (value === null || typeof value !== 'object') return String(value)
  return JSON.stringify(value)
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full border transition-colors',
        checked ? 'border-accent bg-accent' : 'border-border-strong bg-muted',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-3.5 w-3.5 rounded-full bg-foreground transition-all',
          checked ? 'left-[1.125rem] bg-accent-foreground' : 'left-0.5',
        )}
      />
    </button>
  )
}


const TONES = {
  success: 'text-success',
  destructive: 'text-destructive',
  warning: 'text-warning',
  muted: 'text-muted-foreground',
} as const

function Status({
  tone,
  icon: Icon,
  children,
}: {
  tone: keyof typeof TONES
  icon: typeof Check
  children: React.ReactNode
}) {
  return (
    <p className={cn('flex items-center gap-1.5 text-[13px]', TONES[tone])}>
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </p>
  )
}

function SignatureStatus({
  result,
  variant = 'signature',
}: {
  result: JwtVerifyResult
  variant?: 'signature' | 'secret'
}) {
  if (result.status === 'verified') {
    return (
      <Status tone="success" icon={ShieldCheck}>
        {variant === 'secret' ? 'Valid secret' : 'Signature verified'}
      </Status>
    )
  }
  if (result.status === 'invalid') {
    return (
      <Status tone="destructive" icon={ShieldX}>
        {variant === 'secret' ? 'Invalid secret' : 'Invalid signature'}
      </Status>
    )
  }
  return (
    <Status tone="warning" icon={ShieldX}>
      {result.message}
    </Status>
  )
}
