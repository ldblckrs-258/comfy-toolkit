import type { ContentSection } from '@/content/types'

export function ProseSections({
  sections,
}: {
  sections: Array<ContentSection>
}) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-base font-semibold tracking-tight">
            {section.heading}
          </h2>
          {section.paragraphs?.map((text) => (
            <p
              key={text}
              className="mt-3 text-sm leading-relaxed text-muted-foreground"
            >
              {text}
            </p>
          ))}
          {section.bullets ? (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              {section.bullets.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          ) : null}
          {section.code ? (
            <pre className="mt-3 overflow-x-auto overscroll-contain rounded-md border border-border bg-muted p-3 font-mono text-xs">
              <code>{section.code.body}</code>
            </pre>
          ) : null}
        </section>
      ))}
    </>
  )
}
