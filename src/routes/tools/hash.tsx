import HashPage from '@/components/tools/pages/hash'
import { hashContent } from '@/content/tools/hash'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('hash')

export const Route = createFileRoute('/tools/hash')({
  head: () => toolHead(tool, hashContent),
  component: HashPage,
})
