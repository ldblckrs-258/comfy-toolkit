import UuidGeneratorPage from '@/components/tools/pages/uuid-generator'
import { uuidContent } from '@/content/tools/uuid-generator'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('uuid-generator')

export const Route = createFileRoute('/tools/uuid-generator')({
  head: () => toolHead(tool, uuidContent),
  component: UuidGeneratorPage,
})
