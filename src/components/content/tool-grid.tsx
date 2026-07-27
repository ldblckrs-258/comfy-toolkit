import { Link } from '@tanstack/react-router'

import { GROUP_COLORS } from '@/lib/tools/registry'

import type { ToolMeta } from '@/lib/tools/registry'
import type { LinkProps } from '@tanstack/react-router'

export function ToolGrid({ tools }: { tools: Array<ToolMeta> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => {
        const Icon = tool.icon
        const color = GROUP_COLORS[tool.group]
        return (
          <Link
            key={tool.id}
            to={tool.to as LinkProps['to']}
            style={{ '--tool': color } as React.CSSProperties}
            className="tool-card flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-4"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-md"
              style={{
                color,
                backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
              }}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="font-semibold tracking-tight">{tool.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
