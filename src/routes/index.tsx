import { GROUP_COLORS, TOOLS, toolsByGroup } from '@/lib/tools/registry'
import { SITE_DESCRIPTION, SITE_NAME, buildSeo } from '@/lib/seo'
import type { LinkProps } from '@tanstack/react-router'
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => {
    const seo = buildSeo({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      path: '/',
    })
    return { meta: [{ title: SITE_NAME }, ...seo.meta], links: seo.links }
  },
  component: Home,
})

const groups = toolsByGroup()

function Home() {
  let index = 0
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="reveal flex flex-col gap-3 border-b border-border pb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {TOOLS.length} tools · runs entirely in your browser
        </span>
        <h1 className="text-4xl font-bold tracking-tight">
          Comfy<span className="text-accent">Toolkit</span>
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          A fast, offline-friendly console of developer utilities. Pick a tool
          below or press{' '}
          <kbd className="rounded-sm border border-border-strong bg-muted px-1.5 py-0.5 font-mono text-[11px]">
            ⌘K
          </kbd>{' '}
          to jump anywhere.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {groups.map((g) => {
          const color = GROUP_COLORS[g.group]
          return (
            <section key={g.group}>
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <h2 className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {g.label}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.tools.map((tool) => {
                  const Icon = tool.icon
                  const delay = `${index++ * 45}ms`
                  return (
                    <Link
                      key={tool.id}
                      to={tool.to as LinkProps['to']}
                      style={
                        {
                          '--tool': color,
                          animationDelay: delay,
                        } as React.CSSProperties
                      }
                      className="tool-card reveal flex flex-col gap-3 rounded-lg border border-border bg-card p-4 overflow-hidden"
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
                        <h3 className="font-semibold tracking-tight">
                          {tool.name}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                      <div className="mt-auto flex flex-wrap gap-1">
                        {tool.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
