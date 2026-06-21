import { createFileRoute } from '@tanstack/react-router'

import { SITE_URL } from '@/lib/seo'
import { TOOLS } from '@/lib/tools/registry'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const esc = (value: string) => value.replace(/&/g, '&amp;')
        const paths = ['/', ...TOOLS.map((t) => t.to)]
        const body =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
          paths
            .map((p) => `<url><loc>${esc(SITE_URL + p)}</loc></url>`)
            .join('') +
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
