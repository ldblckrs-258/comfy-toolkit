import type { ToolVariant } from './types'

export const base64Variants: Array<ToolVariant> = [
  {
    slug: 'encode',
    toolId: 'base64',
    preset: { mode: 'encode' },
    content: {
      updated: '2026-07-27',
      title: 'Base64 Encoder',
      metaDescription:
        'Encode text to Base64 online. Full Unicode support via UTF-8, no upload, and the encoder opens ready to go rather than defaulting to decode.',
      intro: [
        'Encoding turns arbitrary bytes into 64 printable characters so they survive a channel that would otherwise mangle them: an email header, a JSON string, an XML document, a data URI.',
        'This page opens with the encoder selected. Paste text, get Base64, with the conversion happening in your browser.',
      ],
      sections: [
        {
          heading: 'What happens to your input',
          paragraphs: [
            'The text is first converted to UTF-8 bytes, then those bytes are re-sliced into 6-bit groups and mapped onto the RFC 4648 alphabet. The UTF-8 step is the part naive encoders skip, and skipping it is why so many tools throw or corrupt output the moment you paste an accented character or an emoji.',
            'Three bytes become four characters, so the output is roughly a third larger than the input. Where the input length is not divisible by three, the result is padded with = so its length stays a multiple of four.',
          ],
          code: {
            lang: 'text',
            body: 'Hello         → SGVsbG8=\nhéllo — 世界 🌍  → aMOpbGxvIOKAlCDkuJbnlYwg8J+MjQ==',
          },
        },
        {
          heading: 'When encoding is the wrong tool',
          bullets: [
            'To hide something — it is trivially reversible with no key. Encrypt instead.',
            'To shrink something — it grows the payload by a third.',
            'To put a value in a URL — the standard alphabet contains + and /, which mean something in a query string. Percent-encoding or base64url is what you want.',
            'To detect corruption — encoding carries no checksum. Hash the bytes instead.',
          ],
        },
        {
          heading: 'Data URIs are the common destination',
          paragraphs: [
            'Inlining a small image or font into CSS or HTML means Base64-encoding its bytes and prefixing a media type. It removes a network request, which is why it is tempting for icons and tiny assets.',
            'The size penalty is the reason not to overdo it: a third larger, uncacheable separately from the document that contains it, and parsed on every page load. Below about a kilobyte it usually wins; above that it usually does not.',
          ],
        },
      ],
    },
  },
  {
    slug: 'decode',
    toolId: 'base64',
    preset: { mode: 'decode' },
    content: {
      updated: '2026-07-27',
      title: 'Base64 Decoder',
      metaDescription:
        'Decode Base64 to plain text online. Handles UTF-8 correctly so accents and emoji survive, runs locally, and opens in decode mode.',
      intro: [
        'Decoding reverses the transform: four Base64 characters become three bytes, and those bytes are read back as UTF-8 text.',
        'This page opens with the decoder selected, which is the mode you want when you have pulled an opaque-looking string out of a token, a config file or an HTTP header.',
      ],
      sections: [
        {
          heading: 'Recognising Base64 in the wild',
          paragraphs: [
            'Base64 strings are drawn from A-Z, a-z, 0-9, + and /, and their length is a multiple of four once padding is counted. A string ending in one or two equals signs is a strong signal.',
            'If it contains - or _ instead of + and /, it is base64url — the URL-safe variant used by JWTs and often written without padding. It decodes to the same bytes.',
          ],
        },
        {
          heading: 'Why a decode fails',
          bullets: [
            'Wrong length — characters were lost in transit, or a line was truncated on copy.',
            'Whitespace and newlines — Base64 in emails and PEM files is line-wrapped, and the breaks must be stripped before decoding.',
            'It is base64url with padding stripped, and the decoder expects standard Base64.',
            'It decoded fine, but the bytes were never text. Compressed data and images produce garbage when read as UTF-8, and that is expected rather than an error.',
          ],
        },
        {
          heading: 'What you get back is untrusted input',
          paragraphs: [
            'Decoding a value from a token or a request body gives you exactly what the sender put in. It has not been validated by the round trip, and a decoded string can still contain zero-width characters, control codes or markup. Treat it as you would any other input from outside your system.',
          ],
        },
      ],
    },
  },
]
