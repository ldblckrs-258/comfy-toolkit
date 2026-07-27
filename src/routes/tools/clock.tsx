import ClockPage from '@/components/tools/pages/clock'
import { clockContent } from '@/content/tools/clock'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('clock')

type Tab = 'world' | 'stopwatch' | 'timer'

export const Route = createFileRoute('/tools/clock')({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    const tab = search.tab
    return tab === 'world' || tab === 'stopwatch' || tab === 'timer'
      ? { tab }
      : {}
  },
  head: () => toolHead(tool, clockContent),
  component: ClockPage,
})
