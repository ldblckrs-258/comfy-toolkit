import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'Base64 turns up wherever binary data has to travel through something that only handles text. It also turns up, regularly, in code reviews where someone has used it to hide a value.',
    'It hides nothing. Understanding what it is actually for, and what it costs, settles both the security question and several performance ones.',
  ],
  sections: [
    {
      heading: 'What it does',
      paragraphs: [
        'Base64 reads the input three bytes at a time — 24 bits — and re-slices those bits into four 6-bit groups. Each group indexes a 64-character alphabet defined in RFC 4648: A-Z, a-z, 0-9, then + and /.',
        'Because every three bytes become four characters, output is about 33% larger than input. When the input length is not a multiple of three, the final group is padded with = so the output length stays a multiple of four. That is why so many encoded strings end in one or two equals signs.',
      ],
      code: {
        lang: 'text',
        body: "'Hello'  →  SGVsbG8=\n\nH  e  l  l  o          5 bytes\n72 101 108 108 111     not divisible by 3\n→ 7 chars + 1 padding  = 8",
      },
    },
    {
      heading: 'It is not encryption',
      paragraphs: [
        'There is no key. Decoding requires nothing but the algorithm, which every language implements in its standard library and every browser exposes to any script on the page.',
        'A Base64-encoded password is a plaintext password with extra steps, and encoding a credential before storing it provides precisely zero protection. If a value needs to stay secret, encrypt it; if it needs to be verifiable rather than secret, sign or hash it.',
        'This matters more than it sounds because Base64 output looks opaque. It has the visual texture of ciphertext, which is exactly why people mistake it for one.',
      ],
    },
    {
      heading: 'It is not compression either',
      paragraphs: [
        'Encoding grows the payload by a third. That has real consequences when data URIs are involved: inlining an image into CSS or HTML removes a network request but adds 33% to a file that must be parsed on every page load and cannot be cached separately from the document containing it.',
        'Below roughly a kilobyte inlining usually wins. Above that it usually does not, and the crossover moves against you as soon as the containing document is something users request repeatedly.',
      ],
    },
    {
      heading: 'Unicode is where naive implementations break',
      paragraphs: [
        'Base64 encodes bytes, not characters, so text has to be converted to bytes first. The browser built-in btoa() throws on any code point above U+00FF, which means it fails the moment someone pastes an accented letter or an emoji.',
        'The correct approach runs the string through TextEncoder to get UTF-8 bytes, encodes those, and reverses with TextDecoder. Done properly, a string like "héllo — 世界 🌍" round-trips byte for byte including the astral-plane emoji.',
        'A tool that corrupts your emoji is calling btoa() directly on the string. That is the entire diagnosis.',
      ],
    },
    {
      heading: 'base64url, and when you need it',
      paragraphs: [
        'The standard alphabet contains + and /, both of which carry meaning inside a URL. The same RFC defines a URL-safe variant that swaps them for - and _, and usually drops padding.',
        'JWTs use base64url for exactly this reason — a token has to survive being placed in a header, a query string or a cookie. If you are putting encoded data in a URL, you want the variant; if you are decoding something containing - and _ where you expected + and /, you have found one.',
        'Both encode identical bytes, so converting between them is a character substitution rather than a re-encode.',
      ],
    },
    {
      heading: 'Where it legitimately belongs',
      bullets: [
        'Email attachments, which is what MIME was built around and the original motivating case.',
        'Binary fields inside JSON or XML, neither of which can carry raw bytes.',
        'Data URIs for small inline assets.',
        'HTTP headers, including Basic authentication — which encodes credentials for transport, not for secrecy, and is safe only over TLS.',
        'PEM-encoded keys and certificates, which are Base64 with line wrapping and header lines.',
      ],
    },
    {
      heading: 'Recognising and troubleshooting it',
      paragraphs: [
        'Base64 strings draw from a restricted alphabet and have a length that is a multiple of four once padding is counted. Trailing equals signs are a strong signal.',
        'Decodes fail for a small set of reasons: characters lost in transit so the length is wrong; line wrapping from an email or PEM file that was not stripped; a base64url value fed to a standard decoder; or a successful decode of bytes that were never text, which produces garbage and is expected rather than an error.',
        'And whatever comes out is untrusted input. A decoded string can still contain zero-width characters, control codes or markup — the round trip validates nothing.',
      ],
    },
    {
      heading: 'Size, and what to do instead',
      paragraphs: [
        'If the reason you are encoding is transport, the 33% overhead is simply the price and there is nothing to optimise. If the reason is inlining, weigh it: gzip and brotli recover some of the expansion, but compressed Base64 is still larger than the compressed original bytes.',
        'For images specifically, an HTTP/2 or HTTP/3 connection has largely removed the request overhead that made inlining attractive in the first place. The per-request cost that justified data URIs on HTTP/1.1 is mostly gone.',
        'Where you do inline, keep it to genuinely tiny assets and keep them out of documents that users request repeatedly.',
      ],
    },
  ],
}
