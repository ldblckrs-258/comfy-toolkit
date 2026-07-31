import type * as React from 'react'

export function trackSpotlight(event: React.PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty(
    '--mx',
    `${event.clientX - rect.left}px`,
  )
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
}
