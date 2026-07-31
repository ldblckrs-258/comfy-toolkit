import { createFileRoute } from '@tanstack/react-router'

import { CATEGORY_CONTENT } from '@/content/categories'
import { GUIDES } from '@/content/guides'
import { TOOL_CONTENT } from '@/content/tools'
import { VARIANTS } from '@/content/variants'
import { GUIDES_ENABLED, VARIANTS_ENABLED } from '@/lib/feature-flags'
import { HOME_UPDATED, SITE_UPDATED, SITE_URL } from '@/lib/seo'
import { GROUP_ORDER, TOOLS } from '@/lib/tools/registry'

interface SitemapEntry {
  path: string
  lastmod: string
  changefreq?: 'daily' | 'weekly' | 'monthly'
  priority?: number
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

function sitemapEntries(): Array<SitemapEntry> {
  return [
    { path: '/', lastmod: HOME_UPDATED, changefreq: 'weekly', priority: 1 },
    {
      path: '/tools',
      lastmod: SITE_UPDATED,
      changefreq: 'weekly' as const,
      priority: 0.9,
    },
    ...GROUP_ORDER.map((group) => ({
      path: `/categories/${group}`,
      lastmod: CATEGORY_CONTENT[group].updated,
      changefreq: 'monthly' as const,
      priority: 0.7,
    })),
    ...TOOLS.map((tool) => ({
      path: tool.to,
      lastmod: TOOL_CONTENT[tool.id]?.updated ?? SITE_UPDATED,
      changefreq: 'monthly' as const,
      priority: 0.8,
    })),
    ...(GUIDES_ENABLED
      ? [
          {
            path: '/guides',
            lastmod: SITE_UPDATED,
            changefreq: 'weekly' as const,
            priority: 0.8,
          },
        ]
      : []),
    ...(GUIDES_ENABLED ? GUIDES : []).map((guide) => ({
      path: `/guides/${guide.slug}`,
      lastmod: guide.updated,
      changefreq: 'monthly' as const,
      priority: 0.7,
    })),
    ...(VARIANTS_ENABLED ? VARIANTS : []).map((variant) => ({
      path: `${TOOLS.find((t) => t.id === variant.toolId)?.to ?? ''}/${variant.slug}`,
      lastmod: variant.content.updated,
      changefreq: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}

function renderEntry(entry: SitemapEntry): string {
  const parts = [
    `<loc>${esc(SITE_URL + entry.path)}</loc>`,
    `<lastmod>${entry.lastmod}</lastmod>`,
  ]
  if (entry.changefreq)
    parts.push(`<changefreq>${entry.changefreq}</changefreq>`)
  if (entry.priority !== undefined) {
    parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`)
  }
  return `<url>${parts.join('')}</url>`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const body =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
          sitemapEntries().map(renderEntry).join('') +
          `</urlset>`

        return new Response(body, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
