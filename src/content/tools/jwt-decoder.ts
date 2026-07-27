import type { ToolContent } from '../types'

export const jwtContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'A JSON Web Token is three base64url segments joined by dots: a header describing the algorithm, a payload of claims, and a signature over the first two. The first two are encoded, not encrypted - anyone holding the token can read them, including this page.',
    'This tool decodes a token into readable JSON, resolves the timestamp claims into dates, and can verify an HMAC signature if you supply the secret. All of it happens in your browser, which matters given that a real token is a live credential.',
  ],
  sections: [
    {
      heading: 'Decoding is not verifying',
      paragraphs: [
        'These are two distinct operations and conflating them is the classic JWT vulnerability. Decoding splits the token and Base64-decodes the segments; it will happily read a token that was forged five seconds ago in a text editor.',
        'Verifying recomputes the signature over the header and payload with a key and checks it matches. Only verification tells you the claims are trustworthy. Decode freely for debugging; never let a decoded-but-unverified claim make an authorisation decision.',
      ],
    },
    {
      heading: 'What the three segments hold',
      paragraphs: [
        'The header names the signing algorithm in alg and the token type in typ. The payload carries claims - registered ones such as sub, iss, aud, exp, iat and nbf, plus whatever the issuer added. The signature is a keyed hash over the first two segments.',
        'A well-formed token has exactly three parts. This decoder rejects anything else outright rather than guessing, so a truncated token fails loudly instead of yielding a half-parsed payload.',
      ],
      code: {
        lang: 'text',
        body: 'header.payload.signature\n\n{"alg":"HS256","typ":"JWT"}\n{"sub":"1234567890","name":"John Doe","iat":1516239022}',
      },
    },
    {
      heading: 'Time claims are seconds, not milliseconds',
      paragraphs: [
        "exp, iat and nbf are Unix timestamps in seconds, per the spec. JavaScript's Date.now() returns milliseconds, and mixing the two is the single most common JWT bug: an exp built from Date.now() lands in the year 50000 and never expires.",
        'This tool renders each numeric time claim as an ISO date so the mistake is visible at a glance - 1516239022 resolves to January 2018, whereas a millisecond value resolves to something obviously absurd. Non-numeric values are reported as unparseable rather than silently coerced.',
      ],
    },
    {
      heading: 'The alg field is attacker-controlled',
      bullets: [
        "alg: none - the spec permits an unsigned token. A verifier that honours the header's algorithm choice can be handed a token with the signature stripped. Pin the expected algorithm server-side; never read it from the token.",
        'HS256 versus RS256 confusion - if a verifier accepts either and picks based on the header, an attacker can re-sign an RS256 token as HS256 using the public key as the HMAC secret.',
        'Expiry is only enforced if you check it. Nothing about holding a token makes exp self-enforcing.',
        'Tokens in localStorage are readable by any script on the page. That is an XSS exposure decision, not a JWT one, but it is where JWTs usually end up.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is it safe to paste a real token here?',
      a: 'Safer than a server-side decoder, because decoding happens in your browser and the token is not transmitted. It is still a live credential: if it has not expired, treat it like a password and avoid leaving it in shared screenshots or chat logs.',
    },
    {
      q: 'Can I change a claim and re-sign the token?',
      a: 'Only if you hold the signing secret. Editing the payload invalidates the signature, and without the key you cannot produce a new valid one - that is the entire point of the design.',
    },
    {
      q: 'Why does my token contain characters Base64 does not use?',
      a: 'JWTs use base64url, a variant that replaces + with - and / with _ and drops the = padding, so the token is safe in URLs and headers. It decodes to the same bytes as standard Base64.',
    },
    {
      q: 'How do I revoke a JWT?',
      a: 'You largely cannot, which is the main trade-off of stateless tokens. A signed token stays valid until it expires. Practical answers are short expiry with refresh tokens, or a server-side denylist - which reintroduces the state JWTs were meant to avoid.',
    },
  ],
  related: [
    { id: 'hmac', anchor: 'Compute the HMAC signature that signs a JWT' },
    { id: 'base64', anchor: 'Decode a single base64url segment by hand' },
    {
      id: 'unix-timestamp',
      anchor: 'Convert the exp and iat claims to readable dates',
    },
    { id: 'json-formatter', anchor: 'Pretty-print the decoded payload' },
  ],
}
