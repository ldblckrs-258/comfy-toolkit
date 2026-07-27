import type { ToolContent } from '@/content/types'
import { ToolPageLayout } from '@/components/content/tool-page-layout'
import { markdownContent } from '@/content/tools/markdown'
import { Card } from '@/components/tools/card'
import { ErrorText } from '@/components/tools/tool-panel'
import { Button } from '@/components/ui/button'
import { formatCode } from '@/lib/tools/prettier'
import { requireTool } from '@/lib/tools/registry'
import { usePersistedState } from '@/lib/use-persisted-state'
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

export default function MarkdownPage({ content }: { content?: ToolContent }) {
  const [input, setInput] = usePersistedState('markdown:input', SAMPLE)
  const [html, setHtml] = React.useState('')
  const [error, setError] = React.useState<string>()
  const [formatError, setFormatError] = React.useState<string>()
  const [formatting, setFormatting] = React.useState(false)

  const format = async () => {
    if (!input.trim()) return
    setFormatting(true)
    setFormatError(undefined)
    try {
      setInput(await formatCode(input, 'markdown'))
    } catch (caught) {
      setFormatError(
        caught instanceof Error ? caught.message : 'Failed to format.',
      )
    } finally {
      setFormatting(false)
    }
  }

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
    <ToolPageLayout tool={tool} content={content ?? markdownContent}>
      <div className="grid min-h-0 h-[calc(100svh-var(--shell-top))] gap-4 p-6 lg:grid-cols-2">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Card
            label="Markdown"
            className="flex-1"
            copyValue={input}
            value={input}
            onChange={setInput}
            language="markdown"
            headerRight={
              <Button
                size="xs"
                variant="subtle"
                onClick={format}
                disabled={formatting || !input.trim()}
              >
                {formatting ? 'Formatting…' : 'Format'}
              </Button>
            }
          />
          {formatError ? <ErrorText>{formatError}</ErrorText> : null}
        </div>
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
    </ToolPageLayout>
  )
}
