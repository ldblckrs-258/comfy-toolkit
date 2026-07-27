/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

import type { PrecacheEntry } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<PrecacheEntry | string>
}

self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'html',
      networkTimeoutSeconds: 3,
    }),
    { denylist: [/^\/sw\.js$/, /^\/manifest\.json$/] },
  ),
)

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = '/tools/clock?tab=timer'
  event.waitUntil(
    (async () => {
      try {
        const windows = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        const existing = windows.find((client) =>
          client.url.includes('/tools/clock'),
        )
        if (existing) {
          await existing.focus()
          return
        }
        await self.clients.openWindow(url)
      } catch {
        /* ignore */
      }
    })(),
  )
})
