import { createFileRoute } from '@tanstack/react-router'
import { ImageResponse, loadGoogleFont } from 'workers-og'

import { GROUP_LABELS, getTool } from '@/lib/tools/registry'
import { SITE_DESCRIPTION } from '@/lib/seo'
import type { ToolGroup } from '@/lib/tools/registry'

const SITE_ACCENT = '#24b1b1'

const GROUP_HEX: Record<ToolGroup, string> = {
  formatters: '#38bdf8',
  encoders: '#a78bfa',
  generators: '#34d399',
  text: '#fb923c',
  color: '#f472b6',
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const Route = createFileRoute('/api/og')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cache =
          typeof caches !== 'undefined' && 'default' in caches
            ? (caches as unknown as { default: Cache }).default
            : undefined
        const hit = await cache?.match(request)
        if (hit) return hit

        const id = new URL(request.url).searchParams.get('tool') ?? undefined
        const tool = id ? getTool(id) : undefined

        const accent = (tool ? GROUP_HEX[tool.group] : undefined) ?? SITE_ACCENT
        const eyebrow = (
          tool ? GROUP_LABELS[tool.group] : 'Developer & Designer Tools'
        ).toUpperCase()
        const title = tool ? tool.name : 'ComfyToolkit'
        const description = tool ? tool.description : SITE_DESCRIPTION

        const html = `
          <div style="width:1200px;height:630px;display:flex;flex-direction:column;justify-content:space-between;background:#090b11;padding:80px;font-family:Jakarta;">
            <div style="display:flex;flex-direction:column;">
              <div style="display:flex;color:${accent};font-size:28px;font-weight:700;letter-spacing:4px;">${escapeHtml(eyebrow)}</div>
              <div style="display:flex;color:#e8edf7;font-size:88px;font-weight:700;margin-top:28px;">${escapeHtml(title)}</div>
              <div style="display:flex;color:#828fa8;font-size:36px;font-weight:400;margin-top:24px;max-width:940px;line-height:1.4;">${escapeHtml(description)}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div style="display:flex;font-size:38px;font-weight:700;">
                <span style="color:#e8edf7;">Comfy</span>
                <span style="color:${SITE_ACCENT};">Toolkit</span>
              </div>
              <div style="display:flex;height:8px;width:220px;background:${accent};border-radius:999px;"></div>
            </div>
          </div>`

        const text = `${eyebrow}${title}${description}ComfyToolkit`

        try {
          const [bold, regular] = await Promise.all([
            loadGoogleFont({ family: 'Plus Jakarta Sans', weight: 700, text }),
            loadGoogleFont({ family: 'Plus Jakarta Sans', weight: 400, text }),
          ])

          const image = new ImageResponse(html, {
            width: 1200,
            height: 630,
            fonts: [
              { name: 'Jakarta', data: bold, weight: 700, style: 'normal' },
              { name: 'Jakarta', data: regular, weight: 400, style: 'normal' },
            ],
          })
          if (!image.body) {
            return new Response('OG image generation failed', { status: 500 })
          }

          const response = new Response(image.body, image)
          response.headers.set('Content-Type', 'image/png')
          response.headers.set(
            'Cache-Control',
            'public, max-age=31536000, immutable',
          )
          await cache?.put(request, response.clone())
          return response
        } catch {
          return new Response('OG image generation failed', { status: 500 })
        }
      },
    },
  },
})
