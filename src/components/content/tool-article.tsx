import { Link } from '@tanstack/react-router'

import { getTool } from '@/lib/tools/registry'

import type { ToolContent } from '@/content/types'
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

export function ToolArticle({ content }: { content: ToolContent }) {
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
          </ul>
        </section>
      ) : null}
    </article>
  )
}
