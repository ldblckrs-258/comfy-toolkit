import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { openCommandPalette } from '@/lib/command-palette'
import {
  toggleGroup,
  toggleStar,
  useGroupOpen,
  useIsStarred,
  useStarred,
} from '@/lib/sidebar-prefs'
import type { ToolGroupView, ToolMeta } from '@/lib/tools/registry'
import { GROUP_COLORS, getTool, toolsByGroupSorted } from '@/lib/tools/registry'
import { cn } from '@/lib/utils'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Search, Star } from 'lucide-react'
import * as React from 'react'
import { ThemeToggle } from './theme-toggle'

const groups = toolsByGroupSorted()

function ToolRow({
  tool,
  color,
  onNavigate,
}: {
  tool: ToolMeta
  color: string
  onNavigate?: () => void
}) {
  const starred = useIsStarred(tool.id)
  const Icon = tool.icon
  return (
    <div
      className="tool-row group relative"
      style={{ '--tool': color } as React.CSSProperties}
    >
      <Link
        to={tool.to as LinkProps['to']}
        onClick={onNavigate}
        className="tool-link flex items-center gap-2.5 rounded-md py-1.5 pl-2.5 pr-8 text-xs transition-colors"
      >
        <Icon data-icon className="h-3.5 w-3.5 shrink-0" />
        {tool.name}
      </Link>
      <button
        type="button"
        aria-label={starred ? `Unstar ${tool.name}` : `Star ${tool.name}`}
        aria-pressed={starred}
        onClick={() => toggleStar(tool.id)}
        className={cn(
          'tool-star absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1',
          starred && 'is-starred',
        )}
      >
        <Star className={cn('h-3 w-3', starred && 'fill-current')} />
      </button>
    </div>
  )
}

function StarredSection({ onNavigate }: { onNavigate?: () => void }) {
  const starred = useStarred()
  const tools = starred
    .map((id) => getTool(id))
    .filter((tool): tool is ToolMeta => Boolean(tool))

  if (tools.length === 0) return null

  return (
    <div className="mb-1">
      <div className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        <Star
          className="h-3 w-3 fill-current"
          style={{ color: 'var(--star)' }}
        />
        <span className="flex-1 text-left">Starred</span>
      </div>
      <div className="mt-0.5 space-y-0.5">
        {tools.map((tool) => (
          <ToolRow
            key={tool.id}
            tool={tool}
            color={GROUP_COLORS[tool.group]}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  )
}

function GroupSection({
  group,
  onNavigate,
}: {
  group: ToolGroupView
  onNavigate?: () => void
}) {
  const color = GROUP_COLORS[group.group]
  const isOpen = useGroupOpen(group.group)
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => toggleGroup(group.group)}
      className="mb-1"
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            isOpen && 'rotate-90',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="collapsible-content">
        <div className="mt-0.5 space-y-0.5">
          {group.tools.map((tool) => (
            <ToolRow
              key={tool.id}
              tool={tool}
              color={color}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-17.25 items-center gap-2.5 border-b border-border pl-4 pr-3">
        <img src="/logo.svg" alt="ComfyToolkit Logo" className="h-8 w-8" />
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

      <ScrollArea className="min-h-0 flex-1">
        <nav className="px-2 pb-4">
          <StarredSection onNavigate={onNavigate} />
          {groups.map((g) => (
            <GroupSection key={g.group} group={g} onNavigate={onNavigate} />
          ))}
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
    <aside className="hidden h-full min-h-0 overflow-hidden border-r border-border bg-card md:block">
      <SidebarContent />
    </aside>
  )
}
