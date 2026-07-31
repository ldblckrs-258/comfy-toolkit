import { Link } from '@tanstack/react-router'

import { GUIDES } from '@/content/guides'
import { SITE_AUTHOR, SITE_NAME } from '@/lib/seo'
import { GROUP_LABELS, GROUP_ORDER, TOOLS } from '@/lib/tools/registry'

import type { LinkProps } from '@tanstack/react-router'

const topTools = [
  'json-formatter',
  'jwt-decoder',
  'base64',
  'hash',
  'unix-timestamp',
  'colors',
]

export function LandingFooter() {
  const featured = topTools
    .map((id) => TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is (typeof TOOLS)[number] => Boolean(tool))

  const recentGuides = [...GUIDES]
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, 5)

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.svg"
                alt=""
                className="h-8 w-8"
                aria-hidden="true"
              />
              <span className="text-[15px] font-bold tracking-tight">
                Comfy<span className="text-accent">Toolkit</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {TOOLS.length} developer utilities that compute in your browser.
              No account, no upload, no server round-trip.
            </p>
          </div>

          <div>
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Top tools
            </h2>
            <ul className="mt-3 space-y-2">
              {featured.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={tool.to as LinkProps['to']}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Categories
            </h2>
            <ul className="mt-3 space-y-2">
              {GROUP_ORDER.map((group) => (
                <li key={group}>
                  <Link
                    to="/categories/$group"
                    params={{ group }}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {GROUP_LABELS[group]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Guides
            </h2>
            <ul className="mt-3 space-y-2">
              {recentGuides.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    to="/guides/$slug"
                    params={{ slug: guide.slug }}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
            {SITE_NAME} · {SITE_AUTHOR}
          </span>
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
            Everything runs client-side.
          </span>
        </div>
      </div>
    </footer>
  )
}
