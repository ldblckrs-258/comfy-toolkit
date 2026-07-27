import CodeFormatterPage from '@/components/tools/pages/code-formatter'
import { codeFormatterContent } from '@/content/tools/code-formatter'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('code-formatter')

export const Route = createFileRoute('/tools/code-formatter')({
  head: () => toolHead(tool, codeFormatterContent),
  component: CodeFormatterPage,
})
