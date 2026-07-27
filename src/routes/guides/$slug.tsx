import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { ProseSections } from '@/components/content/prose-sections'
import { GUIDE_CONTENT } from '@/content/guides/content'
import { getGuide } from '@/content/guides'
import { buildSeo, ogUrl } from '@/lib/seo'
import { articleNode, breadcrumbNode, schemaGraph } from '@/lib/structured-data'
import { getTool } from '@/lib/tools/registry'

import type { LinkProps } from '@tanstack/react-router'

function resolve(slug: string) {
  const meta = getGuide(slug)
  const content = GUIDE_CONTENT[slug]
  if (!meta || !content) throw notFound()
  return { meta, content }
}

export const Route = createFileRoute('/guides/$slug')({
  loader: ({ params }) => {
    resolve(params.slug)
    return { slug: params.slug }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { meta } = resolve(loaderData.slug)
    const path = `/guides/${meta.slug}`
    const image = ogUrl(`guide-${meta.slug}`)
    const seo = buildSeo({
      title: meta.title,
      description: meta.metaDescription,
      path,
      image,
      type: 'article',
    })
    return {
      meta: [
        { title: meta.title },
        ...seo.meta,
        {
          'script:ld+json': schemaGraph(
            articleNode({
              headline: meta.title,
              description: meta.metaDescription,
              path,
              published: meta.published,
              updated: meta.updated,
              image,
            }),
            breadcrumbNode([
              { name: 'Home', path: '/' },
              { name: 'Guides', path: '/guides' },
              { name: meta.title, path },
            ]),
          ),
        },
      ],
      links: seo.links,
    }
  },
  component: GuidePage,
})

function GuidePage() {
  const { slug } = Route.useLoaderData()
  const { meta, content } = resolve(slug)
  const tools = meta.relatedTools
    .map((id) => getTool(id))
    .filter((tool) => Boolean(tool))

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="border-b border-border pb-8">
        <Link to="/guides" className="text-xs text-accent hover:underline">
          Guides
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{meta.title}</h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Updated {meta.updated}
        </p>
        {content.intro.map((text) => (
          <p
            key={text}
            className="mt-3 text-sm leading-relaxed text-muted-foreground"
          >
            {text}
          </p>
        ))}
      </header>

      <article>
        <ProseSections sections={content.sections} />
      </article>

      {tools.length > 0 ? (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="text-base font-semibold tracking-tight">
            Tools for this
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {tools.map((tool) => (
              <li key={tool!.id}>
                <Link
                  to={tool!.to as LinkProps['to']}
                  className="text-accent hover:underline"
                >
                  {tool!.name}
                </Link>
                <span className="text-muted-foreground">
                  {' '}
                  — {tool!.description}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
