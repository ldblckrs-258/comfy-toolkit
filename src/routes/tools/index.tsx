import { Link, createFileRoute } from '@tanstack/react-router'

import { ToolGrid } from '@/components/content/tool-grid'
import { CATEGORY_CONTENT } from '@/content/categories'
import { SITE_NAME, buildSeo, ogUrl } from '@/lib/seo'
import {
  breadcrumbNode,
  collectionPageNode,
  schemaGraph,
} from '@/lib/structured-data'
import { GROUP_COLORS, TOOLS, toolsByGroupSorted } from '@/lib/tools/registry'

const TITLE = `All Tools — Free Online Developer Utilities | ${SITE_NAME}`
const DESCRIPTION = `Every tool in ${SITE_NAME}: formatters, encoders, generators, text utilities, colour tools and date converters. All ${TOOLS.length} run entirely in your browser.`

export const Route = createFileRoute('/tools/')({
  head: () => {
    const seo = buildSeo({
      title: TITLE,
      description: DESCRIPTION,
      path: '/tools',
      image: ogUrl('tools'),
    })
    return {
      meta: [
        { title: TITLE },
        ...seo.meta,
        {
          'script:ld+json': schemaGraph(
            collectionPageNode({
              name: 'All Tools',
              description: DESCRIPTION,
              path: '/tools',
              tools: TOOLS,
            }),
            breadcrumbNode([
              { name: 'Home', path: '/' },
              { name: 'Tools', path: '/tools' },
            ]),
          ),
        },
      ],
      links: seo.links,
    }
  },
  component: ToolsIndex,
})

const groups = toolsByGroupSorted()

function ToolsIndex() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="border-b border-border pb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {TOOLS.length} tools
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">All tools</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Every utility here computes in your browser. Nothing you paste is
          uploaded, which is the point when the input is a production payload, a
          live token or a file you have not published.
        </p>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
          The six groups below are ordered the way work tends to flow: parse and
          reformat data, encode or sign it, generate what you need, then reason
          about time, text and colour.
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {groups.map((view) => {
          const content = CATEGORY_CONTENT[view.group]
          return (
            <section key={view.group}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: GROUP_COLORS[view.group] }}
                />
                <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {view.label}
                </h2>
                <Link
                  to="/categories/$group"
                  params={{ group: view.group }}
                  className="ml-auto text-xs text-accent hover:underline"
                >
                  About {view.label.toLowerCase()}
                </Link>
              </div>
              <p className="mb-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {content.intro[0]}
              </p>
              <ToolGrid tools={view.tools} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
