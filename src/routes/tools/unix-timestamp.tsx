import UnixTimestampPage from '@/components/tools/pages/unix-timestamp'
import { timestampContent } from '@/content/tools/unix-timestamp'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('unix-timestamp')

export const Route = createFileRoute('/tools/unix-timestamp')({
  head: () => toolHead(tool, timestampContent),
  component: UnixTimestampPage,
})
