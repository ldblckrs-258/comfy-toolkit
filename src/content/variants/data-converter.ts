import type { ToolVariant } from './types'

function pair(
  slug: string,
  from: string,
  to: string,
  title: string,
  metaDescription: string,
  intro: Array<string>,
  sections: Array<{
    heading: string
    paragraphs?: Array<string>
    bullets?: Array<string>
    code?: { lang: string; body: string }
  }>,
): ToolVariant {
  return {
    slug,
    toolId: 'data-converter',
    preset: { from, to },
    content: {
      updated: '2026-07-27',
      title,
      metaDescription,
      intro,
      sections,
    },
  }
}

export const dataConverterVariants: Array<ToolVariant> = [
  pair(
    'json-to-yaml',
    'json',
    'yaml',
    'JSON to YAML Converter',
    'Convert JSON to YAML online. Paste a payload and get indented YAML back, with parse errors reported inline and nothing uploaded.',
    [
      'Turn a JSON document into YAML, usually because the destination is a Kubernetes manifest, a CI pipeline definition or an application config where humans do the editing.',
      'This page opens with JSON selected as the input and YAML as the output.',
    ],
    [
      {
        heading: 'What you gain and what you lose',
        paragraphs: [
          'YAML gives you comments, which JSON has no syntax for, and a less punctuation-heavy shape that is easier to hand-edit. That is the whole reason config ends up in YAML.',
          'You lose unambiguity. JSON types are explicit; YAML infers them, and the inference has famous edge cases. Anything that must stay a string after conversion is worth quoting deliberately.',
        ],
      },
      {
        heading: 'Values that change meaning',
        paragraphs: [
          'YAML 1.1 reads a set of bare words as booleans, so a country code of NO becomes false and a value of ON becomes true. A version string of 1.20 becomes the number 1.2 and loses its trailing zero. A git SHA that happens to be all digits with an e in the middle can be read as scientific notation.',
        ],
        code: {
          lang: 'text',
          body: '{"country":"NO","version":"1.20"}\n\ncountry: NO      ← now a boolean\nversion: 1.20    ← now the number 1.2',
        },
      },
      {
        heading: 'Indentation rules',
        paragraphs: [
          'Tabs are forbidden as YAML indentation — an editor that inserts one produces a file that will not parse, and the error rarely points at the tab. Output here uses spaces consistently.',
        ],
      },
      {
        heading: 'Multi-line strings become readable',
        paragraphs: [
          'A long string with embedded newlines is one unreadable line in JSON. YAML block scalars using a pipe preserve those newlines while letting the text lay out normally, which is the main readability win when moving certificates, scripts or templates into config.',
          'The distinction between the pipe and the greater-than form matters: the first keeps newlines, the second folds them into spaces.',
        ],
      },
    ],
  ),
  pair(
    'yaml-to-json',
    'yaml',
    'json',
    'YAML to JSON Converter',
    'Convert YAML to JSON online. Resolves anchors, makes inferred types explicit, and reports parse errors inline. Runs in your browser.',
    [
      'Turn YAML into JSON, typically to feed a tool or API that only speaks JSON, or to find out what your YAML actually says.',
      'This page opens with YAML as the input and JSON as the output.',
    ],
    [
      {
        heading: 'The best way to audit a YAML file',
        paragraphs: [
          'Because JSON types are explicit, converting is the fastest way to discover that a value you believed was a string is a boolean, or that a version number lost a digit. If the JSON shows true where you wrote NO, the YAML was always wrong and you simply could not see it.',
        ],
      },
      {
        heading: 'What does not survive',
        bullets: [
          'Comments — JSON has nowhere to put them, so they are dropped permanently.',
          'Anchors and aliases — resolved and expanded, so shared structure becomes duplicated literal data.',
          'Multiple documents in one file — JSON has no equivalent of the --- separator.',
          'Non-string keys — legal in YAML, not in JSON.',
        ],
      },
      {
        heading: 'Keep the original',
        paragraphs: [
          'Because comments and anchors are lost, a YAML to JSON to YAML round trip is not lossless. Convert to inspect or to feed a consumer, but keep editing the original file.',
        ],
      },
      {
        heading: 'Use it to diff two configs',
        paragraphs: [
          'Two YAML files that differ only in key order and indentation produce a large, useless textual diff. Converting both to JSON normalises the representation so the diff shows only genuine changes.',
          'It is also the quickest way to confirm that a refactor of a manifest changed nothing semantically, which is otherwise surprisingly hard to prove by reading.',
        ],
      },
      {
        heading: 'Empty values become null',
        paragraphs: [
          'A YAML key with nothing after the colon is null, not an empty string. That distinction is invisible in the YAML and explicit in the JSON, which catches a surprising number of config bugs where a value was deleted rather than set.',
          'An empty string has to be written with explicit quotes if that is what you meant.',
        ],
      },
    ],
  ),
  pair(
    'json-to-toml',
    'json',
    'toml',
    'JSON to TOML Converter',
    'Convert JSON to TOML online. Produces table syntax suitable for pyproject, Cargo and similar config, computed in your browser.',
    [
      'Turn a JSON document into TOML, the format used by pyproject.toml, Cargo.toml and a growing number of application configs.',
      'This page opens with JSON as the input and TOML as the output.',
    ],
    [
      {
        heading: 'Why TOML for config',
        paragraphs: [
          'TOML was designed to be obvious. There is no significant whitespace, types are explicit, and a value cannot silently become a boolean the way it can in YAML. For a config file a human edits and a machine parses, that predictability is usually worth more than YAML expressiveness.',
          'It also has a real date and time type, which neither JSON nor most YAML consumers provide.',
        ],
      },
      {
        heading: 'Nesting becomes tables',
        paragraphs: [
          'Nested JSON objects become bracketed table headers rather than indentation, so a deeply nested structure reads as a flat list of sections. This is clearer at two or three levels and less so beyond that — TOML is happiest with shallow config rather than deeply nested data.',
        ],
        code: {
          lang: 'text',
          body: '{"tool":{"ruff":{"line-length":88}}}\n\n[tool.ruff]\nline-length = 88',
        },
      },
      {
        heading: 'Nulls have no home',
        paragraphs: [
          'TOML has no null. A JSON null cannot be represented and must be either omitted or given a sentinel value, so check what happened to any nullable field after converting.',
        ],
      },
      {
        heading: 'Arrays of tables',
        paragraphs: [
          'A JSON array of objects becomes a repeated double-bracket section block rather than an inline list. That reads well for a handful of entries and becomes unwieldy past a dozen or so.',
          'Where the data is genuinely a long list of records rather than configuration, TOML is the wrong destination and CSV or JSON is the better fit.',
        ],
      },
    ],
  ),
  pair(
    'toml-to-json',
    'toml',
    'json',
    'TOML to JSON Converter',
    'Convert TOML to JSON online. Flattens table syntax into nested objects and surfaces the explicit types, all in your browser.',
    [
      'Turn TOML into JSON, usually to feed tooling that cannot read TOML or to inspect how a config file is actually structured.',
      'This page opens with TOML as the input and JSON as the output.',
    ],
    [
      {
        heading: 'Tables become nesting',
        paragraphs: [
          'A [tool.ruff] header becomes a nested object under tool, then ruff. Seeing that expansion is often the point of converting — a long TOML file with many bracketed sections hides its actual shape, and the JSON makes the hierarchy obvious.',
        ],
      },
      {
        heading: 'Dates lose their type',
        paragraphs: [
          'TOML dates and times are first-class values. JSON has no date type, so they become strings. If a consumer expects to parse them back, the format matters — check that the string form round-trips into whatever library reads it.',
        ],
      },
      {
        heading: 'Comments do not survive',
        paragraphs: [
          'TOML config is usually heavily commented, and none of that reaches JSON. Convert to read or to feed a tool, and keep the TOML as the file you edit.',
        ],
      },
      {
        heading: 'Inline tables and mixed arrays',
        paragraphs: [
          'TOML inline tables written in braces convert to ordinary nested objects, so the distinction between inline and section syntax disappears entirely — it was only ever a formatting choice in the source.',
          'TOML also permits heterogeneous arrays in recent versions, which JSON accepts happily, so nothing is lost in that direction either.',
        ],
      },
      {
        heading: 'Dotted keys and deep nesting',
        paragraphs: [
          'A dotted key such as a.b.c = 1 expands to three levels of nested objects, identical to what a bracketed section would produce. TOML treats the two spellings as equivalent, so the JSON reveals the structure regardless of which the author used.',
          'Redefining a table already defined by a dotted key is an error in TOML, which is worth knowing if a hand-merged config refuses to parse.',
        ],
      },
    ],
  ),
  pair(
    'json-to-csv',
    'json',
    'csv',
    'JSON to CSV Converter',
    'Convert a JSON array to CSV online. Quotes fields containing commas and newlines per RFC 4180, ready for a spreadsheet, computed locally.',
    [
      'Turn a JSON array of objects into rows and columns, usually so it can go into a spreadsheet or a tool that only ingests tabular data.',
      'This page opens with JSON as the input and CSV as the output.',
    ],
    [
      {
        heading: 'It only works on tabular shapes',
        paragraphs: [
          'CSV has exactly one level of structure. An array of flat objects converts cleanly, with keys becoming the header row. Nested objects and arrays have nowhere to go and must be flattened into path-style column names or serialised into a single cell.',
          'If your JSON is a deeply nested document rather than a list of records, extract the array you actually want as rows first.',
        ],
      },
      {
        heading: 'Quoting is where exports break',
        paragraphs: [
          'Any field containing a comma, a quote or a newline must be quoted, and embedded quotes doubled, per the RFC 4180 convention. Getting this wrong is what produces a spreadsheet where one row has spilled across three.',
        ],
        code: {
          lang: 'text',
          body: 'name,note\nAcme,"Ltd, trading as Acme"\nBeta,"He said ""hello"""',
        },
      },
      {
        heading: 'Long numeric strings are a spreadsheet hazard',
        paragraphs: [
          'Spreadsheets aggressively coerce on import: a long numeric identifier becomes scientific notation, and a leading zero disappears. That is the receiving application rather than the CSV, but the data is damaged all the same. Where identifiers matter, import as text rather than double-clicking the file.',
        ],
      },
      {
        heading: 'Column order comes from the first record',
        paragraphs: [
          'Headers are derived from the keys of the first object. If later records carry keys the first one lacks, those columns need reconciling rather than being silently dropped.',
          'Normalising the records so every object has the same keys before converting avoids the problem entirely, and is worth doing when the JSON came from an API that omits null fields.',
        ],
      },
    ],
  ),
  pair(
    'csv-to-json',
    'csv',
    'json',
    'CSV to JSON Converter',
    'Convert CSV to a JSON array online. Handles quoted fields, embedded commas and newlines, with everything parsed in your browser.',
    [
      'Turn a spreadsheet export into a JSON array of objects, with the header row becoming the keys.',
      'This page opens with CSV as the input and JSON as the output.',
    ],
    [
      {
        heading: 'CSV is barely a format',
        paragraphs: [
          'There is no single specification, which is why exports disagree with each other. Delimiters vary by locale — semicolons are standard wherever the comma is the decimal separator. Line endings differ. Whether the first row is a header is a convention rather than a rule.',
          'Quoted fields containing commas and newlines are parsed correctly here, which is the part naive splitting on commas gets wrong.',
        ],
      },
      {
        heading: 'Everything arrives as a string',
        paragraphs: [
          'CSV carries no type information, so every value is text until something coerces it. Deciding what becomes a number, a boolean or a date is a judgement call, and doing it automatically is how a product code of 0012 becomes 12. Convert first, then coerce deliberately on the fields you know.',
        ],
      },
      {
        heading: 'Watch the first cell',
        paragraphs: [
          'Exports frequently carry a byte-order mark at the start of the file. It is invisible, and it attaches itself to your first column name, producing a key that looks correct and does not match. If a lookup on the first column is mysteriously failing, that is usually why.',
        ],
      },
      {
        heading: 'Duplicate and empty headers',
        paragraphs: [
          'A spreadsheet export frequently has blank trailing columns or two columns sharing a name. Both produce awkward JSON — a key that is the empty string, or one column silently overwriting another.',
          'Cleaning the header row before converting is the single highest-value thing you can do to a CSV, and it takes seconds.',
        ],
      },
    ],
  ),
]
