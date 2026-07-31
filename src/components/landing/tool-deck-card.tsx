import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

import { GROUP_COLORS, GROUP_LABELS } from '@/lib/tools/registry'

import { Reveal } from './reveal'
import { trackSpotlight } from './spotlight'

import type { ToolMeta } from '@/lib/tools/registry'
import type { LinkProps } from '@tanstack/react-router'

export function ToolDeckCard({
  tool,
  index,
}: {
  tool: ToolMeta
  index: number
}) {
  const Icon = tool.icon
  const color = GROUP_COLORS[tool.group]

  return (
    <Reveal as="li" delay={index * 60}>
      <Link
        to={tool.to as LinkProps['to']}
        style={{ '--tool': color } as React.CSSProperties}
        onPointerMove={trackSpotlight}
        className="deck-card spotlight group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5"
      >
        <Icon className="deck-mark" aria-hidden="true" />

        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground/70">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className="deck-tag font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color }}
          >
            {GROUP_LABELS[tool.group]}
          </span>
          <ArrowUpRight className="deck-arrow ml-auto h-4 w-4 text-muted-foreground" />
        </div>

        <h3 className="mt-5 font-display text-2xl leading-tight tracking-normal">
          {tool.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {tool.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-x-2 gap-y-1 pt-5 font-mono text-[10px] tracking-wide text-muted-foreground/70">
          {tool.tags.slice(0, 3).map((tag, i) => (
            <span key={tag}>
              {i > 0 ? <span className="pr-2 opacity-40">/</span> : null}
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </Reveal>
  )
}
