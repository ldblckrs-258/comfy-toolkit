import CronPage from '@/components/tools/pages/cron'
import { cronContent } from '@/content/tools/cron'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('cron')

export const Route = createFileRoute('/tools/cron')({
  head: () => toolHead(tool, cronContent),
  component: CronPage,
})
