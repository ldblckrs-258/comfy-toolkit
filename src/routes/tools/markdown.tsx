import MarkdownPage from '@/components/tools/pages/markdown'
import { markdownContent } from '@/content/tools/markdown'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('markdown')

export const Route = createFileRoute('/tools/markdown')({
  head: () => toolHead(tool, markdownContent),
  component: MarkdownPage,
})
