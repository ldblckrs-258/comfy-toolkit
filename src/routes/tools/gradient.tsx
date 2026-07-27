import GradientPage from '@/components/tools/pages/gradient'
import { gradientContent } from '@/content/tools/gradient'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('gradient')

export const Route = createFileRoute('/tools/gradient')({
  head: () => toolHead(tool, gradientContent),
  component: GradientPage,
})
