import type { ToolContent } from '../types'

export const stringInspectorContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'Two strings can render identically and still be different data. A zero-width space, a Cyrillic а standing in for a Latin a, a stray byte-order mark at the top of a file - none of them are visible, and all of them break comparisons, lookups and deploys.',
    'This tool counts a string several different ways, lists every code point with its encoding, and flags the characters that are invisible or deliberately deceptive.',
  ],
  sections: [
    {
      heading: 'Four different answers to "how long is it"',
      paragraphs: [
        'Length depends entirely on what you are counting. A family emoji built from several people joined by zero-width joiners is one thing on screen, but many code points and more bytes still.',
        'The counts reported here are graphemes (what a reader perceives as one character), code points (Unicode scalar values), UTF-16 units (what JavaScript\'s .length returns), and UTF-8 bytes (what your database column limit measures). A ZWJ emoji sequence counts as a single grapheme while contributing a much larger byte count - which is exactly why a "20 character" username can overflow a VARCHAR(20).',
        'Words and lines are counted too, with line splitting handling CRLF, bare CR and LF, so a file written on Windows does not report double.',
      ],
    },
    {
      heading: 'What gets flagged as suspicious',
      bullets: [
        'Zero-width characters - ZWSP, ZWNJ, ZWJ and the byte-order mark. Invisible, and they survive copy-paste into identifiers, passwords and config keys.',
        'Bidi controls - right-to-left override and friends. These reorder how text displays without changing what it is, the basis of the Trojan Source attack where source code reads one way and compiles another.',
        'Control characters - DEL and the C0/C1 ranges, which have no business in ordinary text.',
        'Homoglyphs - characters from other scripts that look like Latin letters. Cyrillic а, Greek ο, fullwidth Ａ.',
      ],
      paragraphs: [
        'Each flagged character is reported with its kind and its position in the string, so you can find it rather than just knowing it exists.',
      ],
    },
    {
      heading: 'Per-code-point breakdown',
      paragraphs: [
        'Every code point is listed with its hex value, decimal value and UTF-8 byte count. This is the view you want when a regex is not matching what you think it should, or when you need to know whether a character is one byte or four before sizing a column.',
      ],
      code: {
        lang: 'text',
        body: 'U+0041  65     1 byte   A\nU+00E9  233    2 bytes  é\nU+200B  8203   3 bytes  (zero-width space)\nU+1F30D 127757 4 bytes  🌍',
      },
    },
    {
      heading: 'Normalisation, and why é != é',
      paragraphs: [
        'An accented character can be stored as one composed code point or as a base letter plus a combining mark. They look identical and compare unequal, which is how a username lookup fails for a user who typed their own name correctly.',
        'Unicode defines four normalisation forms. NFC composes and is what you almost always want for storage and comparison - it is the form the web platform assumes. NFD decomposes. NFKC and NFKD additionally fold compatibility characters, turning ﬁ into fi and fullwidth forms into ASCII, which is useful for search indexing and destructive for display.',
        'The tool reports whether the input is already in a given form before you convert, so you can tell whether normalising would change anything.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why does my string length differ between languages?',
      a: "They count different units. JavaScript's .length counts UTF-16 units, Python 3 counts code points, Go's len() counts UTF-8 bytes. For anything user-facing you usually want graphemes, which none of them return by default.",
    },
    {
      q: 'How would a zero-width character get into my code?',
      a: 'Copy-paste, overwhelmingly. Documentation sites, chat clients and word processors all insert them. They also arrive deliberately: invisible characters are used to watermark text so a leaked document can be traced.',
    },
    {
      q: 'What is a homoglyph attack?',
      a: 'Registering a name that renders identically to a trusted one using characters from another script - a domain, a package name, a username. The rendered text is indistinguishable; the bytes are not. Checking the code points is the only reliable defence.',
    },
    {
      q: 'Should I normalise user input before storing it?',
      a: 'Generally yes, to NFC, at the boundary. It makes comparison and uniqueness constraints behave. Avoid NFKC for anything you will display back, since it discards distinctions the user may have intended.',
    },
  ],
  related: [
    { id: 'diff', anchor: 'Compare two strings that look identical' },
    { id: 'regex', anchor: 'Test a pattern against the inspected text' },
    { id: 'base64', anchor: 'Encode the bytes to see them exactly' },
    {
      id: 'url-parser',
      anchor: 'Percent-encode the characters for safe transport',
    },
  ],
}
