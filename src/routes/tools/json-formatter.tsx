import JsonFormatterPage from '@/components/tools/pages/json-formatter'
import { jsonFormatterContent } from '@/content/tools/json-formatter'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('json-formatter')

export const Route = createFileRoute('/tools/json-formatter')({
  head: () => toolHead(tool, jsonFormatterContent),
  component: JsonFormatterPage,
})
