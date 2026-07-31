import { Link, createFileRoute } from '@tanstack/react-router'

import { GUIDES } from '@/content/guides'
import { SITE_NAME, buildSeo, ogUrl } from '@/lib/seo'
import { breadcrumbNode, schemaGraph, websiteNode } from '@/lib/structured-data'

const TITLE = `Guides - Developer Reference Articles | ${SITE_NAME}`
const DESCRIPTION =
  'Practical guides on identifiers, timestamps, hashing, colour and text encoding - the background behind the tools, written for people debugging real problems.'

export const Route = createFileRoute('/guides/')({
  head: () => {
    const seo = buildSeo({
      title: TITLE,
      description: DESCRIPTION,
      path: '/guides',
      image: ogUrl('guides'),
    })
    return {
      meta: [
        { title: TITLE },
        ...seo.meta,
        {
          'script:ld+json': schemaGraph(
            websiteNode(),
            breadcrumbNode([
              { name: 'Home', path: '/' },
              { name: 'Guides', path: '/guides' },
            ]),
          ),
        },
      ],
      links: seo.links,
    }
  },
  component: GuidesIndex,
})

const sorted = [...GUIDES].sort((a, b) =>
  b.published.localeCompare(a.published),
)

function GuidesIndex() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="border-b border-border pb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {GUIDES.length} guides
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Guides</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The tools answer a question quickly. These explain the thing behind
          the question - why random primary keys slow down inserts, why two
          contrast checkers disagree, why a string that looks identical to
          another one compares unequal.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Each is written for someone mid-debug rather than someone browsing, so
          they lead with the mechanism and the failure mode rather than with
          definitions. Every guide links to the tools that apply it.
        </p>
      </header>

      <ul className="mt-8 space-y-8">
        {sorted.map((guide) => (
          <li key={guide.slug}>
            <Link
              to="/guides/$slug"
              params={{ slug: guide.slug }}
              className="group block"
            >
              <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent">
                {guide.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {guide.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
