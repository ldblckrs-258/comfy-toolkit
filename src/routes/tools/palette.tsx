import PalettePage from '@/components/tools/pages/palette'
import { paletteContent } from '@/content/tools/palette'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('palette')

export const Route = createFileRoute('/tools/palette')({
  head: () => toolHead(tool, paletteContent),
  component: PalettePage,
})
