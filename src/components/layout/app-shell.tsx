import { useHydrateSidebarPrefs } from '@/lib/sidebar-prefs'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import * as React from 'react'
import { LandingNav } from '../landing/landing-nav'
import { CommandPalette } from './command-palette'
import { MobileSidebar } from './mobile-sidebar'
import { Sidebar } from './sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  useHydrateSidebarPrefs()

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()
  const isLanding = useRouterState({
    select: (state) => state.location.pathname === '/',
  })

  React.useEffect(() => {
    return router.subscribe('onRendered', ({ pathChanged, toLocation }) => {
      if (!pathChanged || toLocation.hash) return
      scrollRef.current?.scrollTo({ top: 0 })
      window.scrollTo({ top: 0 })
    })
  }, [router])

  if (isLanding) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <LandingNav />
        <main>{children}</main>
        <CommandPalette />
      </div>
    )
  }

  return (
    <div className="grid h-screen grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden bg-background text-foreground md:grid-cols-[15rem_1fr]">
      <Sidebar />
      <main className="app-canvas flex min-h-0 min-w-0 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-2.5 border-b border-border bg-card/60 px-4 backdrop-blur md:hidden">
          <MobileSidebar />
          <Link to="/" className="text-[15px] font-bold tracking-tight">
            Comfy<span className="text-accent">Toolkit</span>
          </Link>
        </header>
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-auto overscroll-contain"
        >
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  )
}
