import type { ToolVariant } from './types'

interface Spec {
  slug: string
  lang: string
  title: string
  metaDescription: string
  intro: Array<string>
  sections: Array<{
    heading: string
    paragraphs?: Array<string>
    bullets?: Array<string>
    code?: { lang: string; body: string }
  }>
}

const SPECS: Array<Spec> = [
  {
    slug: 'javascript',
    lang: 'babel',
    title: 'JavaScript Formatter',
    metaDescription:
      'Format JavaScript online with Prettier. Paste a snippet and get consistent output without installing anything, computed in your browser.',
    intro: [
      'Run Prettier over a JavaScript snippet. This page opens with the Babel parser selected, which handles modern syntax including JSX.',
      'Prettier parses to a syntax tree and reprints it, so the original layout is discarded entirely and the output depends only on the code structure and your print width.',
    ],
    sections: [
      {
        heading: 'What it will and will not preserve',
        paragraphs: [
          'Blank lines between statements survive, collapsed to at most one, because they carry authorial intent about grouping. Everything else about your layout does not.',
          'The one deliberate escape hatch: an object literal whose first property sits on its own line stays expanded. That is the documented way to stop a config object being crushed onto a single line.',
        ],
      },
      {
        heading: 'Formatting is not linting',
        paragraphs: [
          'Prettier will not tell you about an unused variable, a missing await or a condition that is always true. That is a linter, and the two are complementary. Where ESLint rules encode layout opinions they will fight Prettier, which is what eslint-config-prettier exists to switch off.',
        ],
      },
      {
        heading: 'Print width is a ceiling, not a target',
        paragraphs: [
          'The default 80 characters is a limit Prettier tries to stay under rather than a length it aims for. Raising it produces fewer, longer lines and often worse diffs, because a change anywhere in a long line rewrites the whole line in the patch.',
          'Whatever value you choose, commit it to a config file and format the repository once in an isolated commit. A print width that varies between contributors turns every pull request into a formatting diff, and adding that commit hash to a .git-blame-ignore-revs file keeps blame pointing at the real authors.',
        ],
      },
    ],
  },
  {
    slug: 'typescript',
    lang: 'typescript',
    title: 'TypeScript Formatter',
    metaDescription:
      'Format TypeScript online with Prettier. Handles type annotations, generics and decorators that the JavaScript parser rejects.',
    intro: [
      'Run Prettier over TypeScript with the TypeScript parser selected, which is required - feeding annotated code to the Babel parser fails on the first type annotation.',
      'This page opens with that parser already chosen.',
    ],
    sections: [
      {
        heading: 'Why the parser choice matters here',
        paragraphs: [
          'Prettier normally picks a parser from the file extension, and a pasted snippet has none. Type annotations, interfaces, generics, enums and decorators are all syntax the JavaScript parser does not accept, so the wrong selection produces a parse error rather than badly formatted output.',
        ],
      },
      {
        heading: 'Long generic signatures',
        paragraphs: [
          'Type-heavy code hits the print width quickly, and Prettier breaks generic parameter lists one per line once they no longer fit. That is often the point at which a signature is telling you the type is doing too much - the formatting is a symptom rather than the problem.',
        ],
      },
      {
        heading: 'Type-only imports and decorators',
        paragraphs: [
          'Prettier preserves the import type distinction rather than collapsing it into a value import, which matters because the two compile differently under isolatedModules and verbatimModuleSyntax.',
          'Decorators are formatted onto their own line above the declaration they annotate, which is the convention Angular and NestJS codebases already follow. If your project keeps short decorators inline, that is one of the choices Prettier removes.',
        ],
      },
      {
        heading: 'Formatting does not typecheck',
        paragraphs: [
          'Prettier parses TypeScript syntax but ignores its meaning entirely. Code with a genuine type error formats perfectly, because the formatter only needs a valid syntax tree.',
          'So a clean format is not a signal that anything compiles. Run tsc for that; the two tools answer completely different questions about the same file.',
        ],
      },
    ],
  },
  {
    slug: 'css',
    lang: 'css',
    title: 'CSS Formatter',
    metaDescription:
      'Format CSS online with Prettier. Normalises declaration layout, indentation and spacing for stylesheets, in your browser.',
    intro: [
      'Run Prettier over a stylesheet. This page opens with the CSS parser selected.',
      'Useful for making a minified stylesheet readable, or for normalising a snippet copied out of devtools before committing it.',
    ],
    sections: [
      {
        heading: 'What changes',
        paragraphs: [
          'One declaration per line, consistent spacing around colons and braces, and normalised indentation for nested rules. Prettier does not reorder declarations or merge duplicate selectors - the cascade depends on order, so changing it would change behaviour.',
        ],
      },
      {
        heading: 'Comments and licence headers survive',
        paragraphs: [
          'CSS comments are preserved, including the licence banners minifiers preserve at the top of vendored files. Reformatting a third-party stylesheet keeps its attribution intact.',
        ],
      },
      {
        heading: 'Custom properties and modern syntax',
        paragraphs: [
          'Custom property values are largely left alone, because their content is not necessarily CSS - a variable can hold a fragment that only makes sense once substituted, and reformatting it could change meaning.',
          'Nesting, container queries and layer rules are all understood and indented like any other block, so a modern stylesheet formats correctly without extra configuration.',
        ],
      },
      {
        heading: 'Minified stylesheets',
        paragraphs: [
          'Pasting a minified stylesheet is one of the most useful things you can do here: everything on one line becomes a readable set of rules, which is often the fastest way to work out what a vendored file is actually doing.',
          'Reformatting does not recover anything the minifier discarded, though. Comments, original class names and source ordering hints are gone for good unless a source map exists.',
        ],
      },
      {
        heading: 'Ordering of vendor prefixes',
        paragraphs: [
          'Prefixed declarations must precede their unprefixed counterpart so the standard property wins in browsers that support it. Prettier preserves the order you wrote rather than sorting, which is the only safe behaviour.',
          'If prefixes are missing or out of order, that is a job for Autoprefixer in your build rather than for a formatter.',
        ],
      },
    ],
  },
  {
    slug: 'html',
    lang: 'html',
    title: 'HTML Formatter',
    metaDescription:
      'Format HTML online with Prettier. Indents nested elements while respecting whitespace sensitivity, computed in your browser.',
    intro: [
      'Run Prettier over HTML, with the parser already selected on this page.',
      'HTML is the hardest case Prettier handles, because in HTML whitespace is sometimes significant and reformatting can change rendering.',
    ],
    sections: [
      {
        heading: 'Whitespace sensitivity',
        paragraphs: [
          'Inline elements are whitespace-sensitive: a space between two spans is a rendered space, and removing it changes the page. Prettier tracks each element display type and avoids reformatting where it would alter output, which is why HTML formatting sometimes looks less tidy than you expect.',
          'A pre or textarea block is left alone entirely, since every character inside it is meaningful.',
        ],
      },
      {
        heading: 'Attributes wrap all or nothing',
        paragraphs: [
          'Attributes stay on one line while they fit within the print width and go one per line once they do not. There is no partial wrapping, so a single long class attribute can explode the whole tag.',
        ],
      },
      {
        heading: 'Embedded CSS and JavaScript',
        paragraphs: [
          'Prettier formats the contents of style and script blocks with the matching parser, so a page with inline styling and inline script comes out consistent throughout rather than only in its markup.',
          'Template syntax from a server-side language is a different matter. Handlebars, Jinja and ERB constructs are not HTML, and Prettier will either leave them alone or, in awkward cases, refuse to parse the file. Format the template as its own language where a plugin exists.',
        ],
      },
      {
        heading: 'Self-closing tags and void elements',
        paragraphs: [
          'Void elements such as img, br and input have no closing tag, and Prettier writes them without a trailing slash in plain HTML because the slash is meaningless there.',
          'In JSX and Vue templates the slash is required, which is one of several reasons the parser selection matters rather than being cosmetic.',
        ],
      },
    ],
  },
  {
    slug: 'json',
    lang: 'json',
    title: 'JSON Formatter with Prettier',
    metaDescription:
      'Format JSON online with the Prettier JSON parser, preserving key order and matching what your editor produces on save.',
    intro: [
      'Format JSON using Prettier rather than a generic pretty-printer, so the output matches exactly what your editor writes on save.',
      'This page opens with the JSON parser selected.',
    ],
    sections: [
      {
        heading: 'Why not the plain JSON formatter',
        paragraphs: [
          'Both produce valid, readable JSON. The difference is that this applies your Prettier settings, so a file formatted here will not produce a diff the next time someone saves it in an editor with Prettier configured.',
          'If what you want is validation with a line and column on the error, the dedicated JSON formatter reports that more directly.',
        ],
      },
      {
        heading: 'Parser choice still matters',
        paragraphs: [
          'Feeding JSON to the JavaScript parser appears to work and then reformats it under JavaScript rules, which can emit output that is no longer valid JSON. For files with comments, such as tsconfig.json, the JSON5 parser is the one that accepts them.',
        ],
      },
      {
        heading: 'package.json and lockfiles',
        paragraphs: [
          'Formatting package.json is safe and produces no semantic change, but be aware that npm rewrites parts of it on install, so a formatted file can drift back. Some teams add it to .prettierignore for exactly that reason.',
          'Never format a lockfile. It is generated, enormous, and reformatting it creates a diff nobody can review while gaining nothing.',
        ],
      },
      {
        heading: 'Key order is preserved exactly',
        paragraphs: [
          'Prettier never sorts keys. JSON objects are unordered by specification, but the serialised text is not, and reordering would produce enormous diffs while breaking any consumer relying on document order.',
          'If you want sorted keys that is a separate transformation and a deliberate one, not something a formatter should do behind your back.',
        ],
      },
    ],
  },
  {
    slug: 'yaml',
    lang: 'yaml',
    title: 'YAML Formatter',
    metaDescription:
      'Format YAML online with Prettier. Normalises indentation and spacing without changing values, so a diff shows only real changes.',
    intro: [
      'Run Prettier over YAML, with the parser preselected here.',
      'YAML indentation is structural rather than cosmetic, so normalising it consistently is worth more than it is in most formats.',
    ],
    sections: [
      {
        heading: 'Tabs are fatal',
        paragraphs: [
          'YAML forbids tabs as indentation outright. An editor that inserts one produces a file that will not parse, and the resulting error rarely points at the tab. Formatting normalises everything to spaces, which is the quickest way to eliminate the problem.',
        ],
      },
      {
        heading: 'Formatting does not fix types',
        paragraphs: [
          'Prettier reformats layout; it does not requote values. A bare NO is still going to parse as a boolean, and a version of 1.20 is still going to lose its trailing zero. Converting to JSON is what surfaces those, not formatting.',
        ],
      },
      {
        heading: 'Multi-document files and long strings',
        paragraphs: [
          'A file containing several documents separated by --- is preserved as separate documents rather than merged, which matters for Kubernetes manifests that bundle a deployment and a service together.',
          'Block scalars written with | or > keep their form, because the choice between them changes whether newlines survive. Prettier will not silently convert one to the other.',
        ],
      },
      {
        heading: 'Anchors and aliases survive',
        paragraphs: [
          'Anchors and their aliases are preserved rather than expanded, because expanding them would duplicate the structure they exist to share and quietly change the file.',
          'That differs from converting YAML to JSON, where anchors necessarily get resolved because JSON has no equivalent construct.',
        ],
      },
      {
        heading: 'Quoting is left as you wrote it',
        paragraphs: [
          'Prettier does not add or remove quotes around scalar values, because in YAML quoting changes type. Adding quotes to a bare NO would turn a boolean into a string and silently alter the config.',
          'That means formatting cannot rescue you from the type-inference traps. It normalises layout and nothing else, which is precisely what you want from a formatter here.',
        ],
      },
    ],
  },
  {
    slug: 'markdown',
    lang: 'markdown',
    title: 'Markdown Formatter',
    metaDescription:
      'Format Markdown online with Prettier. Normalises list markers, heading style, table alignment and wrapping, in your browser.',
    intro: [
      'Run Prettier over Markdown, with the parser already selected.',
      'Mostly useful for making tables line up and for normalising documents that several people have edited with different conventions.',
    ],
    sections: [
      {
        heading: 'What gets normalised',
        bullets: [
          'List markers become consistent, rather than a mix of -, * and +.',
          'Table columns are padded so the pipes align in the source.',
          'Ordered lists are renumbered.',
          'Heading style is made consistent.',
          'Emphasis markers are unified.',
        ],
      },
      {
        heading: 'Prose wrapping is left alone by default',
        paragraphs: [
          'Prettier preserves your line breaks in prose rather than reflowing paragraphs, because rewrapping produces enormous diffs when one word changes. If your project prefers one sentence per line, that convention survives formatting.',
        ],
      },
      {
        heading: 'Code blocks inside Markdown',
        paragraphs: [
          'Fenced blocks with a language tag are formatted with that language parser, so a JavaScript sample inside your README is tidied along with the prose. A block with no language tag is left exactly as written.',
          'That behaviour is occasionally unwanted - a deliberately misformatted example demonstrating a lint rule will be quietly corrected. Removing the language tag, or adding an ignore comment, protects it.',
        ],
      },
      {
        heading: 'Front matter is left alone',
        paragraphs: [
          'YAML front matter at the top of a Markdown file is recognised and passed through rather than reformatted as prose, which keeps static site generators working.',
          'Its contents are formatted as YAML where the parser can do so safely, so a static site post comes out consistent in both halves of the file.',
        ],
      },
      {
        heading: 'Tables and alignment markers',
        paragraphs: [
          'Column widths are padded so pipes line up in the source, and alignment colons in the separator row are preserved. The rendered output is unchanged either way, but a source-aligned table is far easier to edit by hand.',
          'Very wide tables are left unpadded, since padding them would push lines past any sensible width for no readability gain.',
        ],
      },
    ],
  },
]

export const codeFormatterVariants: Array<ToolVariant> = SPECS.map((spec) => ({
  slug: spec.slug,
  toolId: 'code-formatter',
  preset: { lang: spec.lang },
  content: {
    updated: '2026-07-27',
    title: spec.title,
    metaDescription: spec.metaDescription,
    intro: spec.intro,
    sections: spec.sections,
  },
}))
