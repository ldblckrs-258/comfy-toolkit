import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { Tabs } from '@/components/ui/tabs'
import { decodeBase64, encodeBase64 } from '@/lib/tools/base64'
import { requireTool } from '@/lib/tools/registry'
import { buildSeo, ogUrl } from '@/lib/seo'
import { usePersistedState } from '@/lib/use-persisted-state'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

const tool = requireTool('base64')
type Mode = 'encode' | 'decode'

export const Route = createFileRoute('/tools/base64')({
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
  const [mode, setMode] = React.useState<Mode>('encode')
  const [input, setInput] = usePersistedState('base64:input', '')

  const { output, error } = React.useMemo(() => {
    if (!input) return { output: '', error: undefined as string | undefined }
    try {
      return {
        output: mode === 'encode' ? encodeBase64(input) : decodeBase64(input),
        error: undefined as string | undefined,
      }
    } catch {
      return { output: '', error: 'Invalid Base64 input.' }
    }
  }, [input, mode])

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <Tabs
          value={mode}
          onChange={setMode}
          className="self-start"
          options={[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]}
        />
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <Card
            label={mode === 'encode' ? 'Plain text' : 'Base64'}
            className="flex-1"
            value={input}
            onChange={setInput}
            placeholder={mode === 'encode' ? 'Hello, world' : 'SGVsbG8='}
          />
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <Card
              label={mode === 'encode' ? 'Base64' : 'Plain text'}
              className="flex-1"
              copyValue={output}
              value={output}
              readOnly
            />
            {error ? <ErrorText>{error}</ErrorText> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
