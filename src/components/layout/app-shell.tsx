import { useHydrateSidebarPrefs } from '@/lib/sidebar-prefs'
import { Link } from '@tanstack/react-router'
import { CommandPalette } from './command-palette'
import { MobileSidebar } from './mobile-sidebar'
import { Sidebar } from './sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  useHydrateSidebarPrefs()

  return (
    <div className="grid h-screen grid-cols-1 bg-background text-foreground md:grid-cols-[15rem_1fr]">
      <Sidebar />
      <main className="app-canvas flex min-w-0 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-2.5 border-b border-border bg-card/60 px-4 backdrop-blur md:hidden">
          <MobileSidebar />
          <Link to="/" className="text-[15px] font-bold tracking-tight">
            Comfy<span className="text-accent">Toolkit</span>
          </Link>
        </header>
        <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  )
}
