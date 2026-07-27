import HmacPage from '@/components/tools/pages/hmac'
import { hmacContent } from '@/content/tools/hmac'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('hmac')

export const Route = createFileRoute('/tools/hmac')({
  head: () => toolHead(tool, hmacContent),
  component: HmacPage,
})
