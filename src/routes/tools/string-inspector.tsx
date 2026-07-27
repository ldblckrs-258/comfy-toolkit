import StringInspectorPage from '@/components/tools/pages/string-inspector'
import { stringInspectorContent } from '@/content/tools/string-inspector'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('string-inspector')

export const Route = createFileRoute('/tools/string-inspector')({
  head: () => toolHead(tool, stringInspectorContent),
  component: StringInspectorPage,
})
