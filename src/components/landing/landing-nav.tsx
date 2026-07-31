import { Link } from '@tanstack/react-router'
import { Menu, Search, X } from 'lucide-react'
import * as React from 'react'

import { ThemeToggle } from '@/components/layout/theme-toggle'
import { openCommandPalette } from '@/lib/command-palette'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/tools', label: 'Tools' },
  { to: '/categories', label: 'Categories' },
  { to: '/guides', label: 'Guides' },
] as const

export function LandingNav() {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const islandRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (desktop.matches) setOpen(false)
    }
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (islandRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const compact = scrolled && !open

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4">
      <div
        ref={islandRef}
        className={cn(
          'island w-full max-w-fit overflow-hidden',
          compact ? 'island-compact' : 'island-wide',
          open ? 'rounded-[1.75rem]' : 'rounded-full',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-1 px-2 transition-[height] duration-500 ease-out',
            compact ? 'h-12' : 'h-14',
          )}
        >
          <Link
            to="/"
            className="flex shrink-0 items-center rounded-full pl-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src="/logo.svg"
              alt=""
              aria-hidden="true"
              className={cn(
                'transition-all duration-500 ease-out',
                compact ? 'h-7 w-7' : 'h-8 w-8',
              )}
            />
            <span
              className={cn(
                'island-collapse text-[15px] font-bold tracking-tight',
                compact ? 'max-w-0 opacity-0' : 'max-w-[10rem] opacity-100',
              )}
            >
              <span className="pl-2.5">
                Comfy<span className="text-accent">Toolkit</span>
              </span>
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-0.5 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <span
            className={cn(
              'island-collapse hidden sm:block',
              compact ? 'max-w-0 opacity-0' : 'max-w-[2rem] opacity-100',
            )}
            aria-hidden="true"
          >
            <span className="ml-2 block h-5 w-px bg-border" />
          </span>

          <div className="ml-1 flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search tools"
              className="flex h-9 cursor-pointer items-center rounded-full px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  'island-collapse hidden sm:block',
                  compact ? 'max-w-0 opacity-0' : 'max-w-[8rem] opacity-100',
                )}
              >
                <span className="flex items-center gap-2 pl-2">
                  Search
                  <kbd className="rounded-sm border border-border-strong bg-background px-1.5 py-0.5 font-mono text-[10px] tracking-wide">
                    ⌘K
                  </kbd>
                </span>
              </span>
            </button>

            <ThemeToggle size="sm" />

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-400 ease-out md:hidden',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <nav className="overflow-hidden">
            <div className="flex flex-col gap-0.5 border-t border-border px-2 py-2">
              {LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  tabIndex={open ? undefined : -1}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
