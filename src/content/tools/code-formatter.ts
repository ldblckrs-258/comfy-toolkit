import type { ToolContent } from '../types'

export const codeFormatterContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    "Prettier ends formatting arguments by removing the choice. It parses your code to an abstract syntax tree, discards the original formatting almost entirely, and prints the tree back out using its own rules. The output depends on the code's structure and your line width, not on how it was written.",
    'This tool runs Prettier in your browser across JavaScript, TypeScript, CSS, HTML, JSON, YAML and Markdown - useful for a snippet from a code review or a chat message, where installing a toolchain would be absurd.',
  ],
  sections: [
    {
      heading: 'Why the output is not always what you expect',
      paragraphs: [
        'Because the original layout is discarded, Prettier will collapse a carefully hand-wrapped call onto one line if it fits, and explode a one-liner across several if it does not. That is the intended behaviour and the source of most complaints about it.',
        'The one thing it does preserve is blank lines between statements - collapsed to a maximum of one - because those carry authorial intent about grouping that the AST does not otherwise record.',
        'The escape hatch is an objectExpression whose first property sits on its own line: Prettier keeps such an object expanded. That is the documented way to stop a config object being crushed onto one line.',
      ],
    },
    {
      heading: 'Picking the parser',
      paragraphs: [
        'Prettier chooses a parser by file extension, and there is no extension when you paste a snippet - so select the language. It matters more than it sounds: TypeScript syntax fed to the babel parser fails on type annotations, and JSON fed to the JavaScript parser is accepted but reformatted under JavaScript rules, which can produce output that is no longer valid JSON.',
      ],
    },
    {
      heading: 'Formatting is not linting',
      paragraphs: [
        "Prettier only changes how code looks. It will not tell you about an unused variable, a missing await, or a condition that is always true - that is a linter's job, and the two are complementary rather than alternatives.",
        'They can also conflict, since some ESLint rules encode formatting opinions. The standard resolution is to disable the stylistic rules and let Prettier own layout entirely, which is what eslint-config-prettier exists to do.',
      ],
      code: {
        lang: 'text',
        body: 'prettier  → how it looks   (line width, quotes, semicolons)\neslint    → what it means  (unused vars, bad awaits, bugs)',
      },
    },
    {
      heading: 'Print width is a limit, not a target',
      paragraphs: [
        'The default 80 characters is a ceiling Prettier tries to stay under, not a length it aims for. Raising it produces fewer, longer lines and often worse diffs, since a change anywhere in a long line rewrites the whole line in the patch.',
        'Whatever the value, commit it to a config file and format the whole repository once. A print width that varies between contributors turns every pull request into a formatting diff.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does formatting change what my code does?',
      a: 'It should not - the transformation goes through the syntax tree, so semantics are preserved. The narrow exception is code that depends on its own source text, such as reading Function.prototype.toString, which is rare and usually a mistake.',
    },
    {
      q: 'Can I configure the style?',
      a: 'A little. Prettier deliberately exposes few options: print width, tab width, semicolons, quote style, trailing commas and a handful more. Everything else is fixed, which is the reason it ends debates.',
    },
    {
      q: 'Why does it keep moving my JSX attributes?',
      a: 'Attributes go on one line while they fit within the print width, and each onto its own line once they do not. There is no partial wrapping. Shortening an attribute or raising the width are the only levers.',
    },
    {
      q: 'Is it safe to reformat a whole legacy repository?',
      a: "Yes, and doing it in a single isolated commit is the recommended approach. Add that commit's hash to a .git-blame-ignore-revs file so blame keeps pointing at the real authors instead of the reformat.",
    },
  ],
  related: [
    { id: 'json-formatter', anchor: 'Validate JSON as well as format it' },
    { id: 'diff', anchor: 'See exactly what formatting changed' },
    { id: 'markdown', anchor: 'Preview the Markdown you just formatted' },
    { id: 'data-converter', anchor: 'Convert the config to another format' },
  ],
}
