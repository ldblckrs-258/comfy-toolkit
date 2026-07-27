import ContrastPage from '@/components/tools/pages/contrast'
import { contrastContent } from '@/content/tools/contrast'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('contrast')

export const Route = createFileRoute('/tools/contrast')({
  head: () => toolHead(tool, contrastContent),
  component: ContrastPage,
})
