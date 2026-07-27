import { createFileRoute, notFound } from '@tanstack/react-router'

import { ProseSections } from '@/components/content/prose-sections'
import { ToolGrid } from '@/components/content/tool-grid'
import { CATEGORY_CONTENT } from '@/content/categories'
import { buildSeo, ogUrl } from '@/lib/seo'
import {
  breadcrumbNode,
  collectionPageNode,
  schemaGraph,
} from '@/lib/structured-data'
import { GROUP_LABELS, GROUP_ORDER, toolsByGroup } from '@/lib/tools/registry'

import type { ToolGroup } from '@/lib/tools/registry'

function resolveGroup(value: string): ToolGroup {
  const match = GROUP_ORDER.find((group) => group === value)
  if (!match) throw notFound()
  return match
}

export const Route = createFileRoute('/categories/$group')({
  loader: ({ params }) => ({ group: resolveGroup(params.group) }),
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { group } = loaderData
    const content = CATEGORY_CONTENT[group]
    const path = `/categories/${group}`
    const seo = buildSeo({
      title: content.title,
      description: content.metaDescription,
      path,
      image: ogUrl(`category-${group}`),
    })
    return {
      meta: [
        { title: content.title },
        ...seo.meta,
        {
          'script:ld+json': schemaGraph(
            collectionPageNode({
              name: content.title,
              description: content.metaDescription,
              path,
              tools: toolsByGroup().find((v) => v.group === group)?.tools ?? [],
            }),
            breadcrumbNode([
              { name: 'Home', path: '/' },
              { name: 'Tools', path: '/tools' },
              { name: GROUP_LABELS[group], path },
            ]),
          ),
        },
      ],
      links: seo.links,
    }
  },
  component: CategoryPage,
})

function CategoryPage() {
  const { group } = Route.useLoaderData()
  const content = CATEGORY_CONTENT[group]
  const tools = toolsByGroup().find((view) => view.group === group)?.tools ?? []

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="border-b border-border pb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {tools.length} tools
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {content.title}
        </h1>
        {content.intro.map((text) => (
          <p
            key={text}
            className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground"
          >
            {text}
          </p>
        ))}
      </header>

      <div className="mt-8">
        <ToolGrid tools={tools} />
      </div>

      <article className="mt-4 max-w-3xl">
        <ProseSections sections={content.sections} />
      </article>
    </div>
  )
}
