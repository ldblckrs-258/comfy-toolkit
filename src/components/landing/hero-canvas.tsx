import * as React from 'react'

import type { HeroScene } from './scene'

export function HeroCanvas() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let scene: HeroScene | undefined
    let cancelled = false

    const schedule = (cb: () => void) => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => cb(), { timeout: 900 })
      } else {
        setTimeout(cb, 200)
      }
    }

    schedule(() => {
      if (cancelled) return
      void import('./scene')
        .then((mod) => {
          if (cancelled) return
          scene = mod.createHeroScene(canvas, container)
          setReady(true)
        })
        .catch(() => {})
    })

    return () => {
      cancelled = true
      scene?.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="hero-canvas-mask pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="starfield-fallback absolute inset-0" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  )
}
