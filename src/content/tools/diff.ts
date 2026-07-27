import type { ToolContent } from '../types'

export const diffContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'Comparing two versions of anything by eye is unreliable past about ten lines, and completely hopeless when the difference is a changed character inside an otherwise identical line. A diff computes the answer instead of asking you to spot it.',
    'This tool compares two texts at line and character granularity, in side-by-side or unified view, entirely in your browser - so a config file or a production payload can be diffed without uploading either version.',
  ],
  sections: [
    {
      heading: 'What a diff algorithm actually computes',
      paragraphs: [
        'Diffing is the longest-common-subsequence problem: find the largest set of lines appearing in both versions in the same order, and everything left over is an insertion or a deletion.',
        'There is no single correct diff - several edit scripts can be equally minimal, and algorithms differ in which they pick and how readable the result is. That is why the same change can look quite different in two tools, and why a diff that reports a moved block as one deletion plus one insertion is not wrong, just unhelpful.',
      ],
    },
    {
      heading: 'Line diff versus character diff',
      paragraphs: [
        'Line granularity is the right default for source code, where a line is a meaningful unit. It falls apart on prose and on long single-line content such as minified JSON, where a one-character change reports the entire line as replaced.',
        'Character diffing narrows it to the exact substring that changed, which is what you want for a typo hunt or a reworded sentence. The trade is noise: on a rewritten paragraph it produces confetti rather than insight.',
      ],
    },
    {
      heading: 'Differences you cannot see',
      bullets: [
        'Line endings - a file converted from CRLF to LF reports every line as changed while the visible text is identical.',
        'Trailing whitespace - invisible, and enough to mark a line as modified.',
        'Tabs against spaces - they render the same width and are different bytes.',
        'Unicode normalisation - an accented character stored composed in one file and decomposed in the other looks identical and compares unequal.',
        'A byte-order mark - makes the first line differ and nothing else.',
      ],
      paragraphs: [
        'When a diff insists two seemingly identical lines differ, it is almost always one of these. Inspecting the code points is the quickest way to confirm which.',
      ],
    },
    {
      heading: 'Diffing JSON needs care',
      paragraphs: [
        'A textual diff of two JSON documents reports formatting changes as content changes: reordered keys, different indentation and a re-serialised payload all show up as differences even when the parsed value is identical.',
        'Format both sides consistently first, and the diff collapses to the changes that actually matter. Object key order is not semantically meaningful in JSON, so a diff that flags it is telling you about the serialiser, not the data.',
      ],
      code: {
        lang: 'text',
        body: '- {"b":2,"a":1}\n+ {"a":1,"b":2}\n\nsame value, different bytes',
      },
    },
  ],
  faq: [
    {
      q: 'Is my text uploaded anywhere?',
      a: 'No. The comparison runs in your browser, which is the point of using this rather than an online diff service for anything from a private repository.',
    },
    {
      q: 'Side-by-side or unified?',
      a: 'Side-by-side reads better for wide screens and for understanding a rewrite in context. Unified is more compact, matches what git and code review tools show, and is easier to copy into a ticket.',
    },
    {
      q: 'Why is a moved block shown as a delete plus an insert?',
      a: 'Because a standard LCS diff has no concept of movement - the lines are absent from one position and present at another, which is exactly a deletion and an insertion. Some tools add move detection on top; it is a presentation layer, not part of the algorithm.',
    },
    {
      q: 'Can I diff two files rather than pasted text?',
      a: 'Paste the contents in. For repository history, git diff already does this with far more context; this tool is for the cases where the two versions are not both in a repository - a config from a server against one from a laptop, or two API responses.',
    },
  ],
  related: [
    {
      id: 'json-formatter',
      anchor: 'Normalise both sides before diffing JSON',
    },
    {
      id: 'string-inspector',
      anchor: 'Identify the invisible character causing a phantom diff',
    },
    {
      id: 'code-formatter',
      anchor: 'Format both versions so only real changes show',
    },
    {
      id: 'data-converter',
      anchor: 'Convert both files to one format before comparing',
    },
  ],
}
