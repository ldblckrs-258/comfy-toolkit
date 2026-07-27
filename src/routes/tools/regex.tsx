import RegexPage from '@/components/tools/pages/regex'
import { regexContent } from '@/content/tools/regex'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('regex')

export const Route = createFileRoute('/tools/regex')({
  head: () => toolHead(tool, regexContent),
  component: RegexPage,
})
