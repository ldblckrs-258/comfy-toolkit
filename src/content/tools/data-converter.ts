import type { ToolContent } from '../types'

export const dataConverterContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'Configuration formats multiply across a stack: a Kubernetes manifest in YAML, a Rust or Python project file in TOML, an API fixture in JSON, an export from a spreadsheet in CSV. Moving data between them by hand is where indentation bugs and quoting mistakes come from.',
    'This tool converts between all four in either direction, reporting parse errors inline rather than producing a plausible-looking wrong result.',
  ],
  sections: [
    {
      heading: 'The formats do not model the same things',
      paragraphs: [
        'Conversion is lossy in specific, predictable ways, and knowing which ones saves you a confusing afternoon.',
      ],
      bullets: [
        'JSON has no comments, so YAML and TOML comments are dropped on the way in. There is nowhere to put them.',
        'CSV is a flat table. Nested objects have to be flattened or serialised into a cell, and converting back cannot reliably reconstruct the original shape.',
        'TOML has a first-class date and time type; JSON does not, so those become strings.',
        'YAML anchors and aliases are resolved and expanded - the shared structure they expressed becomes duplicated literal data.',
        'YAML supports non-string keys and multiple documents in one file. Neither survives a trip through JSON.',
      ],
    },
    {
      heading: 'The Norway problem',
      paragraphs: [
        'YAML 1.1 treats a set of bare words as booleans, so a country-code list containing NO becomes false. The same applies to ON, OFF, YES and Y. Version numbers fare no better: 1.20 is parsed as a number and loses its trailing zero, and a MAC address or a git SHA of all digits can end up as a float in scientific notation.',
        'The defence is quoting anything that must stay a string. Converting to JSON is a good way to find out whether your YAML says what you think - the types become explicit and unambiguous.',
      ],
      code: {
        lang: 'text',
        body: 'country: NO      →  "country": false\nversion: 1.20    →  "version": 1.2\nsha: 1234e5      →  "sha": 123400000',
      },
    },
    {
      heading: 'Choosing a format for a new file',
      bullets: [
        'JSON - machine-to-machine payloads and anything a browser consumes. Unambiguous, universally supported, unpleasant to hand-edit.',
        'YAML - long human-maintained config where comments and readability matter. Powerful and full of sharp edges.',
        'TOML - application and tooling config. Deliberately boring, no significant whitespace, obvious types. Usually the right pick for a new config file.',
        'CSV - tabular data going into or out of a spreadsheet. Nothing else.',
      ],
    },
    {
      heading: 'CSV is barely a format',
      paragraphs: [
        'There is no single CSV specification, which is why exports disagree. Delimiters vary by locale - semicolons are standard where a comma is the decimal separator. Quoting rules differ, line endings differ, and whether the first row is a header is a convention rather than a rule.',
        'Embedded commas, quotes and newlines inside fields are the usual failure point. Fields are quoted on output where required, and quotes inside a field are doubled per the RFC 4180 convention.',
      ],
    },
  ],
  faq: [
    {
      q: 'Are my comments preserved?',
      a: 'Only if both sides support them and the conversion does not route through JSON. Going YAML to JSON drops them permanently, because JSON has no syntax to hold them. Keep the original file if the comments matter.',
    },
    {
      q: 'Why did my YAML indentation break after a round trip?',
      a: 'The output is re-serialised from the parsed structure rather than edited as text, so it uses consistent indentation that may differ from yours. The data is equivalent; the bytes are not. Diff the parsed JSON rather than the YAML if you need to confirm nothing changed.',
    },
    {
      q: 'Can I convert deeply nested JSON to CSV?',
      a: 'Not faithfully. CSV has one level of structure. Either flatten the paths into column names or extract the specific array of records you actually want as rows.',
    },
    {
      q: 'Is tabs-versus-spaces a real YAML problem?',
      a: 'Yes, and it is absolute: tabs are forbidden as indentation in YAML. An editor that inserts a tab produces a file that will not parse, and the error rarely points at the tab.',
    },
  ],
  related: [
    { id: 'json-formatter', anchor: 'Validate and pretty-print the JSON side' },
    { id: 'diff', anchor: 'Compare the before and after of a conversion' },
    { id: 'code-formatter', anchor: 'Format the resulting file with Prettier' },
    {
      id: 'string-inspector',
      anchor: 'Find invisible characters breaking a parse',
    },
  ],
}
