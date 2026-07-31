import { TOOLS } from '@/lib/tools/registry'

import { Reveal } from './reveal'

const STATS = [
  { value: String(TOOLS.length), label: 'tools' },
  { value: '0', label: 'bytes uploaded' },
  { value: '0', label: 'accounts required' },
  { value: '∞', label: 'runs offline' },
]

export function StatBand() {
  return (
    <div className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <dl className="grid grid-cols-2 divide-border sm:grid-cols-4 sm:divide-x">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 70}
              className="px-2 py-7 text-center"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-4xl tabular-nums leading-none sm:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </div>
  )
}
