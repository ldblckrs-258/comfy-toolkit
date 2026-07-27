import Base64Page from '@/components/tools/pages/base64'
import { base64Content } from '@/content/tools/base64'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('base64')

export const Route = createFileRoute('/tools/base64')({
  head: () => toolHead(tool, base64Content),
  component: Base64Page,
})
