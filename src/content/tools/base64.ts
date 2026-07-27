import type { ToolContent } from '../types'

export const base64Content: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'Base64 rewrites arbitrary bytes using only 64 printable characters, so data that would otherwise be mangled - by an email header, a JSON string, a URL, an XML document - survives the trip intact. It is a transport encoding, not a cipher.',
    'This tool encodes and decodes in the browser using the Web Crypto era primitives already built into the page. Nothing you paste is transmitted anywhere, which matters because tokens and config blobs are exactly the sort of thing people paste into a Base64 box.',
  ],
  sections: [
    {
      heading: 'How the encoding works',
      paragraphs: [
        'Base64 reads your input three bytes at a time - 24 bits - and re-slices those bits into four 6-bit groups. Each group indexes into the 64-character alphabet defined by RFC 4648: A–Z, a–z, 0–9, then + and /. Because three bytes always become four characters, encoded output is about 33% larger than the input.',
        'When the input length is not a multiple of three, the final group is padded with = so the output length stays a multiple of four. That is why encoded strings so often end in one or two equals signs.',
      ],
    },
    {
      heading: 'A worked example',
      paragraphs: [
        'The five ASCII bytes of "Hello" are 72 101 108 108 111. Grouped into 24-bit blocks and re-sliced into 6-bit values, they index the alphabet as S, G, V, s, b, G, 8 - seven characters. Five bytes is not a multiple of three, so one = is appended to round the output to eight characters.',
      ],
      code: {
        lang: 'text',
        body: "encode('Hello')   → SGVsbG8=\ndecode('SGVsbG8=') → Hello",
      },
    },
    {
      heading: 'Unicode is the part that usually breaks',
      paragraphs: [
        "Base64 encodes bytes, not characters, so any non-ASCII text has to be converted to bytes first. The browser's built-in btoa() throws on any code point above U+00FF, which is why naive implementations fail the moment someone pastes an accented letter or an emoji.",
        'This tool runs the input through TextEncoder to get UTF-8 bytes before encoding, and TextDecoder after decoding. A string like "héllo - 世界 🌍" round-trips byte-for-byte, including the em dash, the CJK characters and the astral-plane emoji.',
      ],
    },
    {
      heading: 'What Base64 is not',
      bullets: [
        'It is not encryption. Anyone can decode it - including this page, with no key. Never use it to protect a secret.',
        'It is not compression. It makes data roughly a third larger, so Base64-inlining large images into CSS or HTML is a size trade, not a saving.',
        'It is not a checksum. It cannot tell you whether the underlying bytes were corrupted; for that you want a hash.',
        'It is not URL-safe by default. The standard alphabet contains + and /, which carry meaning in URLs and query strings.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why does my Base64 string end in one or two equals signs?',
      a: 'Padding. Encoding works on three-byte groups; when the input length is not divisible by three, = characters fill the final group so the output length stays a multiple of four. One = means the input had two bytes left over, two = means one byte.',
    },
    {
      q: 'Is Base64 secure?',
      a: 'No. It is reversible by design and requires no key. A Base64-encoded password is a plaintext password with extra steps. If you need confidentiality, encrypt; if you need integrity, hash.',
    },
    {
      q: 'Why did another tool corrupt my emoji?',
      a: 'It almost certainly called btoa() directly on the string. btoa() only accepts code points up to U+00FF and either throws or mangles anything above that. Encoding the UTF-8 bytes first, as this tool does, avoids the problem.',
    },
    {
      q: 'What is base64url and do I need it?',
      a: 'A variant from the same RFC that swaps + and / for - and _, and usually drops padding, so the result is safe in URLs and filenames. JWTs use it. If you are pasting output into a query string, you want that variant rather than standard Base64.',
    },
  ],
  related: [
    {
      id: 'jwt-decoder',
      anchor: 'Decode a JWT, whose segments are base64url-encoded',
    },
    {
      id: 'hash',
      anchor: 'Hash the data instead, to verify it has not changed',
    },
    {
      id: 'url-parser',
      anchor: 'Percent-encode text for a query string rather than Base64',
    },
    {
      id: 'string-inspector',
      anchor: 'Inspect the decoded text for hidden Unicode characters',
    },
  ],
}
