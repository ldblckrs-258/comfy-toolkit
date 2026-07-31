import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { GROUP_COLORS, GROUP_LABELS } from '@/lib/tools/registry'

import { Reveal } from './reveal'
import { trackSpotlight } from './spotlight'

import type { ToolGroupView } from '@/lib/tools/registry'

export function CategoryCard({
  view,
  index,
}: {
  view: ToolGroupView
  index: number
}) {
  const group = view.group
  const color = GROUP_COLORS[group]

  return (
    <Reveal as="li" delay={index * 60}>
      <Link
        to="/categories/$group"
        params={{ group }}
        style={{ '--tool': color } as React.CSSProperties}
        onPointerMove={trackSpotlight}
        className="cat-card spotlight group flex h-full flex-col rounded-xl border border-border bg-card px-5 pb-5 pt-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Category
            </span>
            <h3 className="mt-1 font-display text-2xl leading-tight tracking-normal">
              {GROUP_LABELS[group]}
            </h3>
          </div>
          <span
            className="cat-count font-display text-4xl leading-none tabular-nums"
            style={{ color }}
          >
            {view.tools.length}
          </span>
        </div>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {view.tools.map((tool, i) => {
            const Icon = tool.icon
            return (
              <li
                key={tool.id}
                title={tool.name}
                style={{ transitionDelay: `${i * 40}ms` }}
                className="cat-chip flex h-9 w-9 items-center justify-center rounded-lg border border-border"
              >
                <Icon className="h-4 w-4" />
              </li>
            )
          })}
        </ul>

        <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground/80">
          {view.tools.map((tool) => tool.name).join(' · ')}
        </p>

        <span className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          Explore
          <ArrowRight className="cat-arrow h-3 w-3" />
        </span>
      </Link>
    </Reveal>
  )
}
