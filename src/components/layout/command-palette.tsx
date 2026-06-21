import * as React from 'react'
import { Command } from 'cmdk'
import { CornerDownLeft, Search } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { GROUP_COLORS, toolsByGroupSorted } from '@/lib/tools/registry'
import { COMMAND_PALETTE_EVENT } from '@/lib/command-palette'

const groups = toolsByGroupSorted()

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(COMMAND_PALETTE_EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(COMMAND_PALETTE_EVENT, onOpen)
    }
  }, [])

  const go = (to: string) => {
    setOpen(false)
    void navigate({ to: to as LinkProps['to'] })
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Search tools"
      overlayClassName="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[18vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border-strong bg-card shadow-2xl shadow-black/40"
    >
      <div className="flex items-center gap-2.5 border-b border-border px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Command.Input
          placeholder="Search tools by name or tag…"
          className="h-12 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      <Command.List className="max-h-[22rem] overflow-auto p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted-foreground">
        <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
          No tools found.
        </Command.Empty>
        {groups.map((g) => {
          const color = GROUP_COLORS[g.group]
          return (
            <Command.Group key={g.group} heading={g.label}>
              {g.tools.map((tool) => {
                const Icon = tool.icon
                return (
                  <Command.Item
                    key={tool.id}
                    value={`${tool.name} ${tool.tags.join(' ')} ${tool.keywords?.join(' ') ?? ''}`}
                    onSelect={() => go(tool.to)}
                    className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{
                        color,
                        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{tool.name}</span>
                    <CornerDownLeft className="h-3.5 w-3.5 opacity-0 transition-opacity group-data-[selected=true]:opacity-60" />
                  </Command.Item>
                )
              })}
            </Command.Group>
          )
        })}
      </Command.List>
    </Command.Dialog>
  )
}
