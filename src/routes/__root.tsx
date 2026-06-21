import { useEffect } from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import { AppShell } from '@/components/layout/app-shell'
import { THEME_INIT_SCRIPT } from '@/lib/theme'
import { SITE_DESCRIPTION, SITE_NAME, ogUrl } from '@/lib/seo'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: SITE_NAME,
      },
      { name: 'theme-color', content: '#24b1b1' },
      { name: 'description', content: SITE_DESCRIPTION },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: ogUrl() },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: ogUrl() },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'apple-touch-icon', href: '/logo192.png' },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page doesn&apos;t exist.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm text-accent hover:underline"
      >
        Back to ComfyToolkit
      </Link>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
