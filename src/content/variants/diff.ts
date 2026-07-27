import type { ToolVariant } from './types'

export const diffVariants: Array<ToolVariant> = [
  {
    slug: 'split',
    toolId: 'diff',
    preset: { view: 'split' },
    content: {
      updated: '2026-07-27',
      title: 'Side by Side Diff Checker',
      metaDescription:
        'Compare two texts side by side online. Aligned panes with syntax highlighting make a rewrite easy to follow, computed in your browser.',
      intro: [
        'Two aligned panes, original on the left and changed on the right, with matching lines held level so your eye can track across. This is the view that reads best on a wide screen and when you are trying to understand a rewrite rather than just spot an edit.',
        'This page opens in split view.',
      ],
      sections: [
        {
          heading: 'When side by side wins',
          paragraphs: [
            'Split view keeps both versions fully visible, so you can read the old wording and the new wording as complete thoughts. That matters for prose, for configuration where a value moved between keys, and for any change large enough that a unified view becomes a wall of plus and minus signs.',
            'It costs horizontal space. On a narrow window the panes get cramped and unified becomes the more readable option.',
          ],
        },
        {
          heading: 'Line diff and character diff',
          paragraphs: [
            'Line granularity suits source code, where a line is a meaningful unit. It reads badly on long single-line content such as minified JSON, where changing one character marks the entire line as replaced. Character granularity narrows it to the exact substring that changed, which is what you want for a typo hunt.',
          ],
        },
        {
          heading: 'Nothing is uploaded',
          paragraphs: [
            'The comparison runs in your browser, which is the reason to use this rather than a hosted diff service when one side is a production config or a file from a private repository.',
          ],
        },
        {
          heading: 'Diffing minified or generated files',
          paragraphs: [
            'Side by side loses its advantage on files with very long lines, because each pane wraps and the alignment that makes the view useful disappears.',
            'Format or beautify both sides first. A diff of two formatted files is readable; a diff of two minified bundles is not, in any view.',
          ],
        },
      ],
    },
  },
  {
    slug: 'unified',
    toolId: 'diff',
    preset: { view: 'unified' },
    content: {
      updated: '2026-07-27',
      title: 'Unified Diff Viewer',
      metaDescription:
        'View a unified diff online with additions and deletions inline. Matches what git and code review tools show, and pastes cleanly into a ticket.',
      intro: [
        'One column, with removed lines and added lines interleaved in place. This is the format git prints and code review tools display, so it is the one to use when the output is going into a commit message, a ticket or a chat message.',
        'This page opens in unified view.',
      ],
      sections: [
        {
          heading: 'Reading it',
          paragraphs: [
            'A removed line is followed immediately by its replacement, so a small edit reads as a tight pair rather than requiring you to look across two panes. Unchanged context lines sit between the changes to anchor them.',
            'It stays readable at narrow widths, which makes it the better choice on a laptop or in a split editor.',
          ],
          code: {
            lang: 'text',
            body: '- timeout: 30\n+ timeout: 60\n  retries: 3',
          },
        },
        {
          heading: 'Moved blocks look like churn',
          paragraphs: [
            'A standard diff has no concept of movement: a block that relocated is absent from one position and present at another, which is precisely a deletion plus an insertion. That is the algorithm being correct rather than unhelpful, but it does mean a large reorganisation produces a diff that overstates how much really changed.',
          ],
        },
        {
          heading: 'Normalise before comparing structured data',
          paragraphs: [
            'A textual diff of two JSON documents reports reordered keys and different indentation as changes even when the parsed value is identical. Format both sides first and the diff collapses to what actually differs.',
          ],
        },
        {
          heading: 'Context lines and patch format',
          paragraphs: [
            'Unified output with surrounding context is the shape of a patch file, which is why it can be pasted into a review or an issue and read by anyone familiar with git.',
            'It is not a valid patch without file headers and hunk ranges, so do not expect the output to apply with git apply — it is for humans reading a change, not for tooling.',
          ],
        },
      ],
    },
  },
]
