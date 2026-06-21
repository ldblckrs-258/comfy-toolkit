import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { openCommandPalette } from '@/lib/command-palette'
import type { ToolGroup } from '@/lib/tools/registry'
import { GROUP_COLORS, toolsByGroup } from '@/lib/tools/registry'
import { cn } from '@/lib/utils'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Search } from 'lucide-react'
import * as React from 'react'
import { ThemeToggle } from './theme-toggle'

const OPEN_KEY = 'comfy-toolkit-open-groups'
const groups = toolsByGroup()

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.group, true])),
  )

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(OPEN_KEY)
      if (raw) setOpen(JSON.parse(raw))
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = (group: ToolGroup) =>
    setOpen((prev) => {
      const next = { ...prev, [group]: !prev[group] }
      try {
        localStorage.setItem(OPEN_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-17.25 items-center gap-1.5 border-b border-border pl-4 pr-3">
        <img src="/logo.svg" alt="ComfyToolkit Logo" className="h-10 w-10" />
        <div className="-mt-1">
          <Link
            to="/"
            onClick={onNavigate}
            className="text-[15px] font-bold tracking-tight"
          >
            Comfy<span className="text-accent">Toolkit</span>
          </Link>
          <p className="text-[10px] text-muted-foreground font-mono leading-tight">
            Dev tools, made comfy.
          </p>
        </div>
      </div>

      <div className="px-3 py-3">
        <button
          type="button"
          onClick={() => {
            openCommandPalette()
            onNavigate?.()
          }}
          className="flex w-full items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search tools</span>
          <kbd className="rounded-sm border border-border-strong bg-background px-1.5 py-0.5 font-mono text-[10px] tracking-wide">
            ⌘K
          </kbd>
        </button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 pb-4">
          {groups.map((g) => {
            const color = GROUP_COLORS[g.group]
            const isOpen = open[g.group] ?? true
            return (
              <Collapsible
                key={g.group}
                open={isOpen}
                onOpenChange={() => toggle(g.group)}
                className="mb-1"
              >
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="flex-1 text-left">{g.label}</span>
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      isOpen && 'rotate-90',
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-content">
                  <div className="mt-0.5 space-y-0.5">
                    {g.tools.map((tool) => {
                      const Icon = tool.icon
                      return (
                        <Link
                          key={tool.id}
                          to={tool.to as LinkProps['to']}
                          onClick={onNavigate}
                          style={{ '--tool': color } as React.CSSProperties}
                          className="tool-link flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors"
                        >
                          <Icon data-icon className="h-4 w-4 shrink-0" />
                          {tool.name}
                        </Link>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="flex h-12 items-center justify-between border-t border-border px-4">
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
          @ldblckrs-258
        </span>
        <ThemeToggle />
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden h-full border-r border-border bg-card md:block">
      <SidebarContent />
    </aside>
  )
}
