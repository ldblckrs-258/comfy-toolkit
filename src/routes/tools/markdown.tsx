import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { requireTool } from '@/lib/tools/registry'
import { buildSeo, ogUrl } from '@/lib/seo'
import { usePersistedState } from '@/lib/use-persisted-state'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

const tool = requireTool('markdown')

const SAMPLE = `# Hello

Type **Markdown** on the left and see it _rendered_ on the right.

- Lists
- [Links](https://example.com)
- \`inline code\`

\`\`\`js
const greet = () => 'hi'
\`\`\`
`

export const Route = createFileRoute('/tools/markdown')({
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
  const [input, setInput] = usePersistedState('markdown:input', SAMPLE)
  const [html, setHtml] = React.useState('')
  const [error, setError] = React.useState<string>()

  React.useEffect(() => {
    let active = true
    void import('@/lib/tools/markdown')
      .then(({ renderMarkdown }) => renderMarkdown(input))
      .then((result) => {
        if (active) {
          setHtml(result)
          setError(undefined)
        }
      })
      .catch(() => {
        if (active) {
          setHtml('')
          setError('Failed to render Markdown.')
        }
      })
    return () => {
      active = false
    }
  }, [input])

  return (
    <div className="flex h-full flex-col">
      <ToolHeader tool={tool} />
      <div className="grid min-h-0 flex-1 gap-4 p-6 lg:grid-cols-2">
        <Card
          label="Markdown"
          className="flex-1"
          copyValue={input}
          value={input}
          onChange={setInput}
        />
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Card label="Preview" className="flex-1">
            <div
              className="md-preview flex-1 overflow-auto p-4 text-sm"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </Card>
          {error ? <ErrorText>{error}</ErrorText> : null}
        </div>
      </div>
    </div>
  )
}
