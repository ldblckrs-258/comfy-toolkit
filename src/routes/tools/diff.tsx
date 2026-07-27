import DiffPage from '@/components/tools/pages/diff'
import { diffContent } from '@/content/tools/diff'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('diff')

export const Route = createFileRoute('/tools/diff')({
  head: () => toolHead(tool, diffContent),
  component: DiffPage,
})
