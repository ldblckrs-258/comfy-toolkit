import type { CategoryContent } from '../types'

export const formattersCategory: CategoryContent = {
  updated: '2026-07-27',
  title: 'Formatter Tools',
  metaDescription:
    'Free online formatters for JSON, YAML, TOML, CSV, Markdown and source code. Pretty-print, minify, validate and convert between formats in your browser.',
  intro: [
    'Formatters take structured text that is technically correct but unreadable, and make it legible again. Minified JSON from an API, a config file after a hand edit, a payload copied out of a log line with the escaping still attached.',
    'Every tool in this group parses its input rather than transforming the text, which means formatting doubles as validation: if it comes out formatted, it went in valid.',
  ],
  sections: [
    {
      heading: 'How these tools chain together',
      paragraphs: [
        'The usual sequence starts with the JSON Formatter, because it tells you whether the payload is well-formed and where it broke if it is not. Once it parses, the Data Converter moves it to whichever format the destination wants — YAML for a Kubernetes manifest, TOML for a project config, CSV for a spreadsheet.',
        'The Code Formatter is the last step when the result is going into a repository, since it applies the same Prettier rules your editor would. If two versions of a config disagree, format both first and then diff them: a formatting-normalised diff shows only the changes that matter.',
      ],
    },
    {
      heading: 'Choosing between them',
      bullets: [
        'JSON Formatter — you have JSON and need it readable, minified, or validated with a line number on the error.',
        'Data Converter — you have one format and need another. Handles JSON, YAML, TOML and CSV in both directions.',
        'Code Formatter — you have source code in JavaScript, TypeScript, CSS, HTML, YAML or Markdown and want Prettier applied without installing it.',
        'Markdown Preview — you are writing prose rather than data and want to see the rendered result as you type.',
      ],
    },
    {
      heading: 'The failures worth knowing about',
      paragraphs: [
        'Each format fails in its own characteristic way. JSON rejects trailing commas, single quotes and comments, which is what makes a hand-edited config break. YAML silently reinterprets bare words — a country code of NO becomes the boolean false, and a version of 1.20 becomes the number 1.2. CSV has no real specification, so delimiters and quoting differ between exporters.',
        'Converting to JSON is a quick way to find out what your YAML actually says, because JSON has explicit types and no room for the guessing that causes the problem in the first place.',
      ],
    },
    {
      heading: 'Everything runs locally',
      paragraphs: [
        'Config files and API payloads routinely carry credentials, customer records and internal hostnames. Every tool in this group parses in the browser, so none of that is transmitted anywhere. That is the main reason to reach for these rather than the first result in a search when the payload is real.',
      ],
    },
  ],
}
