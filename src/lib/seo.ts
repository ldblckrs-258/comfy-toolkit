export const SITE_NAME = 'ComfyToolkit'

export const SITE_DESCRIPTION =
  'A fast, offline-friendly console of developer and designer utilities — formatters, encoders, generators, and color tools that run entirely in your browser.'

const RAW_SITE_URL = import.meta.env.VITE_SITE_URL ?? 'http://localhost:3000'

export const SITE_URL = RAW_SITE_URL.replace(/\/$/, '')

export function ogUrl(toolId?: string): string {
  return `${SITE_URL}/og/${toolId ?? 'default'}.png`
}

interface SeoInput {
  title: string
  description: string
  path: string
  image?: string
  type?: string
}

export function buildSeo({
  title,
  description,
  path,
  image,
  type = 'website',
}: SeoInput) {
  const url = `${SITE_URL}${path}`
  const img = image ?? ogUrl()
  return {
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: img },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: SITE_NAME },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: img },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
