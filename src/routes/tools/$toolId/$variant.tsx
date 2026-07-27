import { createFileRoute, notFound } from '@tanstack/react-router'
import * as React from 'react'

import { ProseSections } from '@/components/content/prose-sections'
import { TOOL_PAGES } from '@/components/tools/pages'
import { getVariant } from '@/content/variants'
import { buildSeo, ogUrl } from '@/lib/seo'
import {
  breadcrumbNode,
  schemaGraph,
  softwareAppNode,
} from '@/lib/structured-data'
import { GROUP_LABELS, TOOLS } from '@/lib/tools/registry'

function resolve(segment: string, variantSlug: string) {
  const tool = TOOLS.find((t) => t.to === `/tools/${segment}`)
  if (!tool) throw notFound()
  const variant = getVariant(tool.id, variantSlug)
  if (!variant || !(tool.id in TOOL_PAGES)) throw notFound()
  return { tool, variant }
}

export const Route = createFileRoute('/tools/$toolId/$variant')({
  loader: ({ params }) => {
    resolve(params.toolId, params.variant)
    return { toolId: params.toolId, variantSlug: params.variant }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { tool, variant } = resolve(loaderData.toolId, loaderData.variantSlug)
    const path = `${tool.to}/${variant.slug}`
    const seo = buildSeo({
      title: variant.content.title,
      description: variant.content.metaDescription,
      path,
      image: ogUrl(`${tool.id}-${variant.slug}`),
    })
    return {
      meta: [
        { title: variant.content.title },
        ...seo.meta,
        {
          'script:ld+json': schemaGraph(
            softwareAppNode(tool),
            breadcrumbNode([
              { name: 'Home', path: '/' },
              {
                name: GROUP_LABELS[tool.group],
                path: `/categories/${tool.group}`,
              },
              { name: tool.name, path: tool.to },
              { name: variant.content.title, path },
            ]),
          ),
        },
      ],
      links: seo.links,
    }
  },
  component: VariantPage,
})

function VariantPage() {
  const { toolId, variantSlug } = Route.useLoaderData()
  const { tool, variant } = resolve(toolId, variantSlug)
  const ToolPage = TOOL_PAGES[tool.id]

  return (
    <React.Suspense fallback={null}>
      <ToolPage
        preset={variant.preset}
        variantArticle={
          <article className="mx-auto w-full max-w-3xl border-t border-border px-6 py-12">
            <h2 className="text-lg font-semibold tracking-tight">
              {variant.content.title}
            </h2>
            {variant.content.intro.map((text) => (
              <p
                key={text}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                {text}
              </p>
            ))}
            <ProseSections sections={variant.content.sections} />
            <p className="mt-10 text-sm">
              <a href={tool.to} className="text-accent hover:underline">
                Open the full {tool.name}
              </a>
            </p>
          </article>
        }
      />
    </React.Suspense>
  )
}
