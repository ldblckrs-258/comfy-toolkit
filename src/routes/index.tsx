import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  ChevronRight,
  Command,
  Keyboard,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from 'lucide-react'

import { CategoryCard } from '@/components/landing/category-card'
import { HeroCanvas } from '@/components/landing/hero-canvas'
import { LandingFooter } from '@/components/landing/landing-footer'
import { NetworkPanel } from '@/components/landing/network-panel'
import { Playground } from '@/components/landing/playground'
import { Reveal } from '@/components/landing/reveal'
import { trackSpotlight } from '@/components/landing/spotlight'
import { StatBand } from '@/components/landing/stat-band'
import { ToolDeckCard } from '@/components/landing/tool-deck-card'
import { openCommandPalette } from '@/lib/command-palette'
import { HOME_TITLE, SITE_DESCRIPTION, SITE_NAME, buildSeo } from '@/lib/seo'
import {
  faqNode,
  schemaGraph,
  toolListNode,
  websiteNode,
} from '@/lib/structured-data'
import { GROUP_ORDER, TOOLS, toolsByGroup } from '@/lib/tools/registry'

import type { ToolMeta } from '@/lib/tools/registry'

const FAQ = [
  {
    q: 'Is anything I paste uploaded to a server?',
    a: `No. Every tool in ${SITE_NAME} computes in the browser tab you have open. Hashing, JWT decoding, formatting and colour conversion all run on your own machine, so a production payload or a live token never leaves it.`,
  },
  {
    q: 'Does it work offline?',
    a: 'Yes. A service worker caches the app after the first visit, so tools keep working on a plane, on a locked-down network, or with the tab left open after the connection drops.',
  },
  {
    q: 'Do I need an account?',
    a: 'No account, no sign-in and no tracking of what you paste. Starred tools and per-tool inputs are kept in your browser local storage and never sent anywhere.',
  },
  {
    q: 'How do I find a tool quickly?',
    a: 'Press ⌘K (Ctrl+K on Windows and Linux) anywhere in the app to open the command palette and search all tools by name, tag or keyword.',
  },
  {
    q: 'Is it free?',
    a: 'Yes, every tool is free with no usage limits, no paid tier and no ads.',
  },
]

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: 'Nothing leaves the tab',
    body: 'No upload step, no server round-trip, no log of your input. Safe for production payloads, live tokens and files you have not published.',
    colorVar: 'var(--tool-generators)',
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    body: 'Installable as a PWA and cached by a service worker. Open it once and it keeps working without a connection.',
    colorVar: 'var(--tool-formatters)',
  },
  {
    icon: Keyboard,
    title: 'Keyboard first',
    body: 'One palette reaches every tool. Search by name, tag or keyword, hit enter, paste, done — without touching the mouse.',
    colorVar: 'var(--tool-encoders)',
  },
]

const POPULAR_IDS = [
  'json-formatter',
  'jwt-decoder',
  'base64',
  'hash',
  'unix-timestamp',
  'colors',
]

export const Route = createFileRoute('/')({
  head: () => {
    const seo = buildSeo({
      title: HOME_TITLE,
      description: SITE_DESCRIPTION,
      path: '/',
    })
    return {
      meta: [
        { title: HOME_TITLE },
        ...seo.meta,
        {
          'script:ld+json': schemaGraph(
            websiteNode(),
            toolListNode(),
            faqNode(FAQ),
          ),
        },
      ],
      links: seo.links,
    }
  },
  component: Home,
})

const groups = toolsByGroup()
const popular = POPULAR_IDS.map((id) =>
  TOOLS.find((tool) => tool.id === id),
).filter((tool): tool is ToolMeta => Boolean(tool))

function Home() {
  return (
    <>
      <section className="relative isolate flex min-h-[48rem] items-center overflow-hidden pt-16 md:min-h-[46rem]">
        <div className="hero-veil absolute inset-0 -z-10" />
        <HeroCanvas />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <span className="hero-in inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-accent" />
              {TOOLS.length} tools · 100% client-side
            </span>

            <h1
              className="hero-in mt-6 text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ animationDelay: '80ms' }}
            >
              Dev tools,
              <br />
              made{' '}
              <span className="hero-accent text-gradient-accent italic">
                comfy
              </span>
              .
            </h1>

            <p
              className="hero-in mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ animationDelay: '160ms' }}
            >
              Format, encode, sign, convert and inspect — {TOOLS.length}{' '}
              utilities that run entirely in your browser. Nothing you paste is
              uploaded, so a live token or a production payload stays on your
              machine.
            </p>

            <div
              className="hero-in mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '240ms' }}
            >
              <Link
                to="/tools"
                className="cta cta-primary inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Browse all tools
                <ArrowRight className="cta-icon h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={openCommandPalette}
                onPointerMove={trackSpotlight}
                className="cta cta-ghost inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-border px-5 text-[15px] font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Command className="h-4 w-4 text-muted-foreground" />
                Search tools
                <kbd className="cta-kbd rounded-sm border border-border-strong bg-background/60 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground">
                  ⌘K
                </kbd>
              </button>
            </div>

            <ul
              className="hero-in mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              style={{ animationDelay: '320ms' }}
            >
              <li>No account</li>
              <li>No upload</li>
              <li>No tracking</li>
              <li>Works offline</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="relative">
        <div
          aria-hidden="true"
          className="cosmos pointer-events-none absolute inset-0 -z-10"
        />

        <hr className="divider-glow" />

        <section>
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Try it right here
                </span>
                <h2 className="mt-2 font-display text-4xl font-normal tracking-normal sm:text-5xl">
                  Paste something in
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                This is the real tool code, running in your tab. Open the
                network panel and watch it stay empty.
              </p>
            </Reveal>

            <Reveal className="mt-8" delay={80}>
              <Playground />
            </Reveal>
          </div>
        </section>

        <StatBand />

        <section>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <ul className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
              <Reveal
                as="li"
                className="spotlight flex flex-col rounded-2xl border border-border bg-card p-6 md:col-span-2 md:row-span-2"
                style={
                  { '--tool': VALUE_PROPS[0].colorVar } as React.CSSProperties
                }
                onPointerMove={trackSpotlight}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    color: VALUE_PROPS[0].colorVar,
                    backgroundColor: `color-mix(in oklab, ${VALUE_PROPS[0].colorVar} 14%, transparent)`,
                  }}
                >
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-xl font-semibold tracking-tight">
                  {VALUE_PROPS[0].title}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {VALUE_PROPS[0].body}
                </p>
                <div className="mt-6 md:mt-auto md:pt-6">
                  <NetworkPanel />
                </div>
              </Reveal>

              {VALUE_PROPS.slice(1).map((prop, i) => {
                const Icon = prop.icon
                return (
                  <Reveal
                    as="li"
                    key={prop.title}
                    delay={(i + 1) * 90}
                    className="spotlight rounded-2xl border border-border bg-card p-6"
                    style={{ '--tool': prop.colorVar } as React.CSSProperties}
                    onPointerMove={trackSpotlight}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        color: prop.colorVar,
                        backgroundColor: `color-mix(in oklab, ${prop.colorVar} 14%, transparent)`,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold tracking-tight">
                      {prop.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {prop.body}
                    </p>
                  </Reveal>
                )
              })}
            </ul>
          </div>
        </section>

        <hr className="divider-glow" />

        <section>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Most reached for
                </span>
                <h2 className="mt-2 font-display text-4xl font-normal tracking-normal sm:text-5xl">
                  Popular tools
                </h2>
              </div>
              <Link
                to="/tools"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                All {TOOLS.length} tools
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((tool, i) => (
                <ToolDeckCard key={tool.id} tool={tool} index={i} />
              ))}
            </ul>
          </div>
        </section>

        <hr className="divider-glow" />

        <section>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <Reveal>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Six groups
              </span>
              <h2 className="mt-2 font-display text-4xl font-normal tracking-normal sm:text-5xl">
                Browse by category
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
                Ordered the way work tends to flow: parse and reformat data,
                encode or sign it, generate what you need, then reason about
                time, text and colour.
              </p>
            </Reveal>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GROUP_ORDER.map((group, i) => {
                const view = groups.find((g) => g.group === group)
                if (!view) return null
                return <CategoryCard key={group} view={view} index={i} />
              })}
            </ul>
          </div>
        </section>

        <hr className="divider-glow" />

        <section>
          <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
            <Reveal>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Questions
              </span>
              <h2 className="mt-2 font-display text-4xl font-normal tracking-normal sm:text-5xl">
                Before you paste anything
              </h2>
            </Reveal>

            <div className="mt-8 divide-y divide-border border-y border-border">
              {FAQ.map((item, i) => (
                <Reveal key={item.q} delay={i * 50}>
                  <details className="faq-item group" open={i === 0}>
                    <summary className="flex items-center gap-3 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <ChevronRight className="faq-chevron h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      <h3 className="font-display text-xl font-normal tracking-normal">
                        {item.q}
                      </h3>
                    </summary>
                    <p className="faq-answer pb-5 pl-7 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Still looking for something?
              </span>
              <button
                type="button"
                onClick={openCommandPalette}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Command className="h-3.5 w-3.5 text-muted-foreground" />
                Search all {TOOLS.length} tools
                <kbd className="rounded-sm border border-border-strong bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  ⌘K
                </kbd>
              </button>
            </Reveal>
          </div>
        </section>
      </div>

      <LandingFooter />
    </>
  )
}
