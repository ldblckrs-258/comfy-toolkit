import { buildSeo, ogUrl, toolTitle } from './seo'
import {
  breadcrumbNode,
  faqNode,
  schemaGraph,
  softwareAppNode,
} from './structured-data'

import type { ToolContent } from '@/content/types'
import type { ToolMeta } from './tools/registry'

export function toolHead(tool: ToolMeta, content?: ToolContent) {
  const title = toolTitle(tool.name)
  const seo = buildSeo({
    title,
    description: tool.metaDescription ?? tool.description,
    path: tool.to,
    image: ogUrl(tool.id),
  })

  const nodes = [
    softwareAppNode(tool),
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: tool.name, path: tool.to },
    ]),
  ]
  if (content && content.faq.length > 0) nodes.push(faqNode(content.faq))

  return {
    meta: [{ title }, ...seo.meta, { 'script:ld+json': schemaGraph(...nodes) }],
    links: seo.links,
  }
}
