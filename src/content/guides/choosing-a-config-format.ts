import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'Every project accumulates configuration in several formats, usually not by choice. A Kubernetes manifest is YAML because Kubernetes says so, a Rust project is TOML because Cargo says so, an API fixture is JSON because that is what came back.',
    'When you do get to choose, the four common options differ in ways that matter, and each has a characteristic failure mode worth knowing before you commit.',
  ],
  sections: [
    {
      heading: 'JSON',
      paragraphs: [
        'Unambiguous, universally supported, and unpleasant to hand-edit. Types are explicit, there is exactly one way to write any value, and every language parses it identically.',
        'The costs are the absence of comments — there is no syntax for them, which is disqualifying for human-maintained config — and punctuation-heavy nesting that gets hard to read past two or three levels.',
        'There is also a quiet data-loss risk: JSON does not specify numeric precision, and nearly every parser reads numbers into a 64-bit float. Integers beyond 2^53 silently lose their low digits, which is why APIs dealing in large identifiers return them as strings.',
      ],
      code: {
        lang: 'text',
        body: '{"id": 1234567890123456789}\nparsed → 1234567890123456800   ← last digits gone',
      },
    },
    {
      heading: 'YAML',
      paragraphs: [
        'Readable, comment-friendly, and full of sharp edges. It is the right choice for long configuration that humans maintain and read, which is why the infrastructure world settled on it.',
        'Its defining problem is type inference. YAML 1.1 reads a set of bare words as booleans, so a country code of NO becomes false. A version of 1.20 becomes the number 1.2 and loses its trailing zero. A git SHA of all digits containing an e can be read as scientific notation.',
        'Tabs are forbidden as indentation outright, and an editor that inserts one produces a file that will not parse with an error that rarely points at the tab. Anchors and aliases add real expressive power and make files harder to reason about.',
      ],
    },
    {
      heading: 'TOML',
      paragraphs: [
        'Deliberately boring, which is the entire point. No significant whitespace, explicit types, obvious syntax, and a first-class date and time type that neither JSON nor most YAML consumers offer.',
        'Nesting becomes bracketed table headers rather than indentation, which reads clearly at two or three levels and becomes unwieldy beyond that. TOML is happiest with shallow configuration rather than deeply nested data.',
        'It has no null. A nullable field must be omitted or given a sentinel, which is worth knowing before converting from JSON.',
        'For a new application config file, this is usually the right default.',
      ],
    },
    {
      heading: 'CSV',
      paragraphs: [
        'Tabular data going into or out of a spreadsheet, and nothing else. It has exactly one level of structure, so nested data has to be flattened or serialised into a cell.',
        'There is no single specification, which is why exports disagree. Delimiters vary by locale — semicolons are standard wherever the comma is the decimal separator. Line endings differ. Whether the first row is a header is a convention rather than a rule.',
        'Quoting is where it breaks: any field containing a comma, a quote or a newline must be quoted with embedded quotes doubled, and getting that wrong produces a spreadsheet where one row has spilled across three.',
      ],
    },
    {
      heading: 'What conversion loses',
      bullets: [
        'Comments do not survive a trip through JSON, in either direction, because there is nowhere to put them.',
        'YAML anchors are resolved and expanded, so the structure they existed to share becomes duplicated literal data.',
        'TOML dates become strings in JSON, since JSON has no date type.',
        'Multiple YAML documents in one file cannot be represented at all.',
        'CSV round trips cannot reconstruct nesting that was flattened on the way out.',
      ],
    },
    {
      heading: 'Converting as a debugging technique',
      paragraphs: [
        'Turning YAML into JSON is the fastest way to find out what your YAML actually says. Types become explicit, so a value you believed was a string reveals itself as a boolean, and a version number shows its lost digit.',
        'It is also the cleanest way to diff two configs meaningfully. Two YAML files differing only in key order and indentation produce a large, useless textual diff; converting both to JSON first normalises the representation so the diff shows only genuine changes.',
        'Keep the original as the file you edit, though. Because comments and anchors are lost, a round trip is not lossless.',
      ],
    },
    {
      heading: 'A rule of thumb',
      paragraphs: [
        'Machine-to-machine payloads: JSON. Human-maintained infrastructure config where the ecosystem expects it: YAML, with anything ambiguous quoted deliberately. A new application config file you control: TOML. Tabular data for a spreadsheet: CSV, and nothing else.',
        'The worst outcome is a format chosen by accident and then defended. Every one of these has a failure mode; picking with the failure mode in mind is the whole exercise.',
      ],
    },
    {
      heading: 'Validate the shape, whatever the format',
      paragraphs: [
        'None of these formats validate anything beyond syntax. A YAML file can parse cleanly and still be missing a required key, or carry a string where a number belongs.',
        'A schema catches that. JSON Schema works against all four once parsed, since they all produce the same kind of structure, and wiring it into startup means a malformed config fails immediately with a useful message rather than surfacing as a confusing error later.',
        'This matters more than the format choice itself. A well-validated YAML file causes fewer incidents than an unvalidated TOML one.',
      ],
    },
  ],
}
