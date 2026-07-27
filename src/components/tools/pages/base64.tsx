import type { ToolPageProps } from './props'
import { ToolPageLayout } from '@/components/content/tool-page-layout'
import { base64Content } from '@/content/tools/base64'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { Tabs } from '@/components/ui/tabs'
import { decodeBase64, encodeBase64 } from '@/lib/tools/base64'
import { requireTool } from '@/lib/tools/registry'
import { usePersistedState } from '@/lib/use-persisted-state'
import * as React from 'react'

const tool = requireTool('base64')
type Mode = 'encode' | 'decode'

export default function Base64Page({
  content,
  preset,
  variantArticle,
}: ToolPageProps) {
  const [mode, setMode] = React.useState<Mode>(
    preset?.mode === 'decode' ? 'decode' : 'encode',
  )
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
    <ToolPageLayout
      tool={tool}
      content={content ?? base64Content}
      article={variantArticle}
    >
      <div className="flex min-h-0 h-[calc(100svh-var(--shell-top))] flex-col gap-4 p-6">
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
    </ToolPageLayout>
  )
}
