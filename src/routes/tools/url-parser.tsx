import UrlParserPage from '@/components/tools/pages/url-parser'
import { urlParserContent } from '@/content/tools/url-parser'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('url-parser')

export const Route = createFileRoute('/tools/url-parser')({
  head: () => toolHead(tool, urlParserContent),
  component: UrlParserPage,
})
