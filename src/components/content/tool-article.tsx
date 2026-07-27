import { Link } from '@tanstack/react-router'

import { variantsForTool } from '@/content/variants'
import { GROUP_LABELS, getTool } from '@/lib/tools/registry'

import type { ToolContent } from '@/content/types'
import type { ToolGroup } from '@/lib/tools/registry'
import type { LinkProps } from '@tanstack/react-router'

function Section({
  heading,
  paragraphs,
  bullets,
  code,
}: ToolContent['sections'][number]) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold tracking-tight">{heading}</h2>
      {paragraphs?.map((text) => (
        <p
          key={text}
          className="mt-3 text-sm leading-relaxed text-muted-foreground"
        >
          {text}
        </p>
      ))}
      {bullets ? (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          {bullets.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      ) : null}
      {code ? (
        <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-xs">
          <code>{code.body}</code>
        </pre>
      ) : null}
    </section>
  )
}

export function ToolArticle({
  content,
  group,
  toolId,
  toolPath,
}: {
  content: ToolContent
  group?: ToolGroup
  toolId?: string
  toolPath?: string
}) {
  const variants = toolId ? variantsForTool(toolId) : []
  const related = content.related
    .map((link) => ({ link, tool: getTool(link.id) }))
    .filter((entry) => Boolean(entry.tool))

  return (
    <article className="mx-auto w-full max-w-3xl border-t border-border px-6 py-12">
      {content.intro.map((text) => (
        <p
          key={text}
          className="mt-3 text-sm leading-relaxed text-muted-foreground first:mt-0"
        >
          {text}
        </p>
      ))}

      {content.sections.map((section) => (
        <Section key={section.heading} {...section} />
      ))}

      {variants.length > 0 && toolPath ? (
        <section className="mt-10">
          <h2 className="text-base font-semibold tracking-tight">
            Open a specific mode
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {variants.map((variant) => (
              <li key={variant.slug}>
                <a
                  href={`${toolPath}/${variant.slug}`}
                  className="text-accent hover:underline"
                >
                  {variant.content.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.faq.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-base font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <dl className="mt-3 space-y-5">
            {content.faq.map((item) => (
              <div key={item.q}>
                <dt className="text-sm font-medium">{item.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-base font-semibold tracking-tight">
            Related tools
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {related.map(({ link, tool }) => (
              <li key={link.id}>
                <Link
                  to={tool!.to as LinkProps['to']}
                  className="text-accent hover:underline"
                >
                  {link.anchor}
                </Link>
              </li>
            ))}
            {group ? (
              <li>
                <Link
                  to="/categories/$group"
                  params={{ group }}
                  className="text-accent hover:underline"
                >
                  Browse all {GROUP_LABELS[group].toLowerCase()}
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
