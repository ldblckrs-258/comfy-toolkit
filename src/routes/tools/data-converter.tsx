import DataConverterPage from '@/components/tools/pages/data-converter'
import { dataConverterContent } from '@/content/tools/data-converter'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('data-converter')

export const Route = createFileRoute('/tools/data-converter')({
  head: () => toolHead(tool, dataConverterContent),
  component: DataConverterPage,
})
