import type { ToolMeta } from '@/lib/tools/registry'
import { GROUP_COLORS } from '@/lib/tools/registry'
import type { ReactNode } from 'react'

export function ToolHeader({
  tool,
  actions,
}: {
  tool: ToolMeta
  actions?: ReactNode
}) {
  const Icon = tool.icon
  const color = GROUP_COLORS[tool.group]

  return (
    <header className="flex flex-col gap-3 border-b border-border px-5 py-3 bg-background/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg border"
          style={{
            color,
            backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
            borderColor: `color-mix(in oklab, ${color} 32%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight">{tool.name}</h1>
          <p className="text-xs text-muted-foreground">{tool.description}</p>
        </div>
        {actions ? (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
