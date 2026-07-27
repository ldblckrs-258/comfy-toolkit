import ColorsPage from '@/components/tools/pages/colors'
import { colorsContent } from '@/content/tools/colors'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('colors')

export const Route = createFileRoute('/tools/colors')({
  head: () => toolHead(tool, colorsContent),
  component: ColorsPage,
})
