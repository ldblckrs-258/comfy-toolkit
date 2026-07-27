import type { ToolContent } from '../types'

export const jsonFormatterContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'JSON arrives minified from an API, escaped inside a log line, or subtly malformed after a hand edit. Reading it in that state is guesswork, and the parser errors most tools surface - "Unexpected token" with no position - do not help.',
    'This tool pretty-prints, minifies and validates, reporting the line and column where parsing actually failed. It runs entirely in your browser, which matters when the payload contains a customer record or an access token.',
  ],
  sections: [
    {
      heading: 'Formatting and minifying are the same operation',
      paragraphs: [
        'Both parse the input into a value and re-serialise it: once with indentation for reading, once without for transport. Because it is a genuine parse rather than a text transform, formatting doubles as validation - anything that comes out formatted was structurally valid going in.',
        'Minifying strips whitespace only. It does not reorder keys or drop nulls, so the result is byte-different but semantically identical to what you pasted.',
      ],
    },
    {
      heading: 'The errors you will actually hit',
      bullets: [
        'Trailing comma - legal in JavaScript object literals, illegal in JSON. The single most common cause of a hand-edited config failing to load.',
        'Single quotes - JSON strings require double quotes. Pasting a JavaScript object literal fails here immediately.',
        'Unquoted keys - also legal in JavaScript, also invalid JSON.',
        'Comments - there is no comment syntax in JSON. // and /* */ are both parse errors, which is why JSONC and JSON5 exist as separate formats.',
        'A leading byte-order mark - invisible, and enough to make the parser reject character one of an otherwise perfect file.',
      ],
    },
    {
      heading: 'Numbers are the quiet data-loss risk',
      paragraphs: [
        'JSON does not specify a numeric precision, but almost every parser reads numbers into a 64-bit float. Integers beyond 2^53 therefore lose their low digits silently - a 19-digit Twitter/X Snowflake ID parses to a nearby but wrong value with no error raised.',
        'This is why APIs that deal in large integer identifiers return them as strings. If you are designing a payload, do the same; if you are consuming one, check whether an id round-trips before assuming it does.',
      ],
      code: {
        lang: 'text',
        body: 'input   {"id": 1234567890123456789}\nparsed  1234567890123456800   ← last digits lost',
      },
    },
    {
      heading: 'Duplicate keys',
      paragraphs: [
        'The specification permits duplicate keys and does not say what should happen, so implementations differ: most JavaScript parsers keep the last occurrence, some other languages keep the first, and a few error. A payload relying on that behaviour is portable only by accident, and duplicates in a config file usually mean an edit that silently did nothing.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is my data uploaded to a server?',
      a: 'No. Parsing and serialising happen in the browser, so you can format a production payload or a token-bearing response without it leaving your machine.',
    },
    {
      q: 'Two spaces or four?',
      a: 'Neither is more correct. Two is the prevailing convention in the JavaScript ecosystem and keeps deeply nested structures narrower; four is common elsewhere. Consistency within a repository matters more than the choice.',
    },
    {
      q: 'Can I format JSON with comments in it?',
      a: 'Not as JSON - comments are a parse error by specification. If the file is JSONC or JSON5, as tsconfig.json and many editor configs are, strip the comments first or treat it as the different format it actually is.',
    },
    {
      q: 'Why does the formatter reorder nothing but my diff is huge?',
      a: 'Key order is preserved exactly, so a large diff after formatting is whitespace only. If keys genuinely moved, something upstream re-serialised the object - that happens when a payload passes through a parser that sorts keys.',
    },
  ],
  related: [
    { id: 'data-converter', anchor: 'Convert this JSON to YAML or TOML' },
    { id: 'diff', anchor: 'Compare two JSON payloads structurally' },
    { id: 'jwt-decoder', anchor: 'Pretty-print the payload inside a JWT' },
    { id: 'code-formatter', anchor: 'Format the surrounding source file too' },
  ],
}
