import { ToolHeader } from '@/components/layout/tool-header'
import { Card, CopyIcon } from '@/components/tools/card'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import type { HashAlgorithm, HashEncoding } from '@/lib/tools/hash'
import { HASH_ALGORITHMS, hashAll, matchAlgorithm } from '@/lib/tools/hash'
import { requireTool } from '@/lib/tools/registry'
import { buildSeo, ogUrl } from '@/lib/seo'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { Check, Upload, X } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('hash')

type Source = 'text' | 'file'

interface LoadedFile {
  name: string
  size: number
  buffer: ArrayBuffer
}

const EMPTY: Record<HashAlgorithm, string> = Object.freeze({
  MD5: '',
  'SHA-1': '',
  'SHA-256': '',
  'SHA-384': '',
  'SHA-512': '',
})

export const Route = createFileRoute('/tools/hash')({
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1)} ${units[unit]}`
}

function Page() {
  const [source, setSource] = React.useState<Source>('text')
  const [text, setText] = usePersistedState('hash:text', '')
  const [expected, setExpected] = usePersistedState('hash:expected', '')
  const [encoding, setEncoding] = React.useState<HashEncoding>('hex')
  const [file, setFile] = React.useState<LoadedFile | null>(null)
  const [digests, setDigests] = React.useState<Record<HashAlgorithm, string>>(
    EMPTY,
  )
  const [computing, setComputing] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (source === 'text') {
      if (text === '') {
        setDigests(EMPTY)
        return
      }
      let active = true
      void hashAll(text, encoding)
        .then((result) => active && setDigests(result))
        .catch(() => active && setDigests(EMPTY))
      return () => {
        active = false
      }
    }
    if (!file) {
      setDigests(EMPTY)
      return
    }
    let active = true
    setComputing(true)
    void hashAll(file.buffer, encoding)
      .then((result) => {
        if (!active) return
        setDigests(result)
        setComputing(false)
      })
      .catch(() => {
        if (!active) return
        setDigests(EMPTY)
        setComputing(false)
      })
    return () => {
      active = false
      setComputing(false)
    }
  }, [source, text, file, encoding])

  const hasInput = source === 'text' ? text !== '' : file !== null
  const matched = React.useMemo(
    () => matchAlgorithm(digests, expected, encoding),
    [digests, expected, encoding],
  )

  async function loadFile(picked: File) {
    setError(null)
    try {
      const buffer = await picked.arrayBuffer()
      setFile({ name: picked.name, size: picked.size, buffer })
    } catch {
      setFile(null)
      setError('Could not read file')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={source}
            onChange={setSource}
            options={[
              { value: 'text', label: 'Text' },
              { value: 'file', label: 'File' },
            ]}
          />
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
          <div className="flex min-h-0 flex-col gap-3">
            {source === 'text' ? (
              <Card
                label="Text"
                className="flex-1"
                value={text}
                onChange={setText}
                onClear={() => setText('')}
                copyValue={text}
                placeholder="Text to hash"
              />
            ) : (
              <Card label="File" className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setDragging(false)
                    const { files } = event.dataTransfer
                    if (files.length > 0) void loadFile(files[0])
                  }}
                  className={cn(
                    'flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center transition-colors',
                    dragging ? 'bg-accent/10' : 'bg-transparent',
                  )}
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  {file ? (
                    <span className="text-sm text-foreground">
                      {file.name}
                      <span className="ml-2 text-muted-foreground">
                        {formatBytes(file.size)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Drop a file here or click to browse
                    </span>
                  )}
                  {computing ? (
                    <span className="text-xs text-muted-foreground">
                      Hashing…
                    </span>
                  ) : null}
                  {error ? (
                    <span className="text-xs text-destructive">{error}</span>
                  ) : null}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const picked = event.target.files?.[0]
                    if (picked) void loadFile(picked)
                    event.target.value = ''
                  }}
                />
              </Card>
            )}
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-col gap-2">
              {HASH_ALGORITHMS.map((algorithm) => (
                <HashRow
                  key={algorithm}
                  algorithm={algorithm}
                  value={digests[algorithm]}
                  matched={matched === algorithm}
                />
              ))}
            </div>

            <Card label="Verify">
              <Input
                value={expected}
                onChange={(event) => setExpected(event.target.value)}
                placeholder="Paste a hash to identify"
                spellCheck={false}
                className="rounded-none border-0 bg-transparent hover:border-0 focus-within:bg-transparent focus-visible:border-0"
              />
            </Card>
            {expected.trim() && hasInput && !computing ? (
              matched ? (
                <Status ok>Matches {matched}</Status>
              ) : (
                <Status ok={false}>No algorithm matches</Status>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function HashRow({
  algorithm,
  value,
  matched,
}: {
  algorithm: HashAlgorithm
  value: string
  matched: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border px-3 py-2 transition-colors',
        matched ? 'border-success bg-success/10' : 'border-border bg-card',
      )}
    >
      <span className="w-16 shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {algorithm}
      </span>
      <span className="min-w-0 flex-1 break-all font-mono text-[13px] text-foreground">
        {value || (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
      {matched ? (
        <Check className="h-4 w-4 shrink-0 text-success" />
      ) : null}
      <CopyIcon value={value} />
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
