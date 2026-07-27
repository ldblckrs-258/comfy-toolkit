import type { ToolContent } from '../types'

export const markdownContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'Markdown is readable as plain text and renders as structured HTML, which is why it ended up as the default format for READMEs, issues, documentation and notes. The gap between those two states is where the surprises are - a list that will not nest, a line break that vanishes, a table that renders as a row of pipes.',
    'This tool renders GitHub-flavoured Markdown live as you type, with the output sanitised before it reaches the page.',
  ],
  sections: [
    {
      heading: 'There is no single Markdown',
      paragraphs: [
        'The original 2004 implementation left many cases undefined, so every renderer resolved them differently. CommonMark exists to pin down the ambiguities, and GitHub Flavored Markdown is CommonMark plus tables, strikethrough, task lists and autolinking.',
        'This preview targets GFM, which is what most people mean by Markdown in practice. A document that renders here should render the same in a GitHub issue, though a documentation generator with its own extensions may differ.',
      ],
    },
    {
      heading: 'The line break problem',
      paragraphs: [
        'A single newline does not produce a line break. Markdown joins consecutive lines into one paragraph, which is deliberate - it lets you hard-wrap source text without affecting output - and is the single most common surprise for new users.',
        'To force a break you need two trailing spaces, a backslash at end of line, or a blank line to start a new paragraph. Some renderers enable a "breaks" option that treats every newline as a break; GitHub does this in comments but not in .md files, which is why the same text behaves differently in an issue and in a README.',
      ],
      code: {
        lang: 'text',
        body: 'line one\nline two          → one paragraph\n\nline one··        → line break (two trailing spaces)\nline two',
      },
    },
    {
      heading: 'Nesting rules that catch people',
      bullets: [
        "Nested lists need enough indentation to align with the parent's content, not its marker - generally two spaces for a bullet list, three or four after a numbered marker.",
        "A fenced code block inside a list item must be indented to the item's content column, or it breaks out of the list.",
        'Ordered lists renumber themselves. Writing 1. for every item produces 1, 2, 3 - useful, since inserting an item does not require renumbering the source.',
        'Tables require the header separator row. Without the |---|---| line it is not a table, just text containing pipes.',
      ],
    },
    {
      heading: 'Rendering untrusted Markdown safely',
      paragraphs: [
        'Markdown permits inline HTML by design, so rendering a document from an untrusted source is equivalent to rendering untrusted HTML - script tags, event handlers and javascript: URLs all arrive through it.',
        'The output here is sanitised before being inserted into the page. If you are building something that renders user-submitted Markdown, do the same: sanitise the generated HTML rather than trying to filter the Markdown source, because the number of ways to express a payload in Markdown is larger than it appears.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why did my table not render?',
      a: 'Almost always the missing separator row beneath the header, or a blank line breaking the table in half. Tables are also a GFM extension rather than core Markdown, so a strict CommonMark renderer will not produce one at all.',
    },
    {
      q: 'How do I show a literal asterisk or underscore?',
      a: 'Escape it with a backslash, or wrap it in backticks if it is code. Snake_case identifiers in prose are a frequent casualty - the underscores get read as emphasis markers and the word comes out italicised.',
    },
    {
      q: 'Can I use HTML inside Markdown?',
      a: 'Generally yes, and it is the usual escape hatch for things Markdown cannot express, such as a table cell containing a list. Note that Markdown syntax is not processed inside block-level HTML, so the contents of a div are passed through as raw HTML.',
    },
    {
      q: 'Is the preview identical to GitHub?',
      a: 'Very close for standard GFM. GitHub layers on repository-specific behaviour - issue and commit autolinking, task list interactivity, emoji shortcodes - that a general renderer has no context to reproduce.',
    },
  ],
  related: [
    {
      id: 'code-formatter',
      anchor: 'Format the Markdown source with Prettier',
    },
    { id: 'diff', anchor: 'Compare two revisions of a document' },
    {
      id: 'string-inspector',
      anchor: 'Track down a character breaking the rendering',
    },
    { id: 'regex', anchor: 'Bulk-edit the source with a pattern replace' },
  ],
}
