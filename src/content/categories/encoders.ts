import type { CategoryContent } from '../types'

export const encodersCategory: CategoryContent = {
  updated: '2026-07-27',
  title: 'Encoder and Decoder Tools',
  metaDescription:
    'Free online encoders and decoders: Base64, JWT, URL and percent-encoding, plus hash and HMAC generators. Everything computed locally in your browser.',
  intro: [
    'This group covers the transformations that let arbitrary data survive a channel that was not designed to carry it, and the ones that prove data has not been altered on the way. They are frequently confused with each other, and the confusion is where the security bugs come from.',
    'Encoding is reversible by anyone. Hashing is one-way. Signing needs a key. Nothing here is encryption.',
  ],
  sections: [
    {
      heading: 'How these tools chain together',
      paragraphs: [
        'A JWT is the clearest example of the whole group working at once. Its three segments are base64url encoded, so the JWT Decoder reads them without a key. Its signature is an HMAC over the first two segments, so verifying it needs the HMAC tool and the shared secret. And the secret itself should come from a generator rather than a keyboard.',
        'The other common chain is integrity checking: hash a file to get a digest, then encode that digest as Base64 if the destination is an HTTP header rather than a terminal.',
      ],
    },
    {
      heading: 'Choosing between them',
      bullets: [
        'Base64 — you need binary or Unicode text to survive a transport that only handles ASCII.',
        'URL Parser / Encoder — the destination is a URL or query string, where percent-encoding applies and Base64 does not.',
        'Hash Generator — you want to know whether two things are identical without keeping a copy of either.',
        'HMAC — you want to know that a message came from someone holding the shared secret, not merely that it is unchanged.',
        'JWT — you have a token and need to read its claims or check its signature.',
      ],
    },
    {
      heading: 'The distinction that matters',
      paragraphs: [
        'Base64 is not encryption, and a Base64-encoded password is a plaintext password with extra steps. Decoding a JWT is not verifying it, and a decoded-but-unverified claim must never drive an authorisation decision. A plain hash proves integrity but not origin — only a keyed construction like HMAC does that.',
        'Getting these three distinctions right eliminates most of the vulnerabilities that involve this group of tools.',
      ],
    },
    {
      heading: 'Why local execution matters here more than elsewhere',
      paragraphs: [
        'The inputs to these tools are disproportionately sensitive: live session tokens, signing secrets, files you have not published. Every computation here uses the browser Web Crypto API and stays on your machine, so pasting a real token does not hand it to a third party. It is still a live credential, so treat it accordingly.',
      ],
    },
  ],
}
