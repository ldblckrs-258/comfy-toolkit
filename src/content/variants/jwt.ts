import type { ToolVariant } from './types'

export const jwtVariants: Array<ToolVariant> = [
  {
    slug: 'decode',
    toolId: 'jwt-decoder',
    preset: { mode: 'decode' },
    content: {
      updated: '2026-07-27',
      title: 'JWT Decoder',
      metaDescription:
        'Decode a JSON Web Token online. Read the header and payload, resolve exp and iat to real dates, and verify HMAC signatures locally in your browser.',
      intro: [
        'Paste a token and read what is inside it. The header and payload are base64url, not encrypted, so decoding needs no key and reveals every claim the issuer put there.',
        'This page opens in decoder mode. Nothing is transmitted, which matters because a token you are debugging is usually still valid.',
      ],
      sections: [
        {
          heading: 'Reading the output',
          paragraphs: [
            'The header names the signing algorithm in alg. The payload carries the claims: sub for the subject, iss for the issuer, aud for the intended audience, and the time claims exp, iat and nbf.',
            'Time claims are rendered as dates alongside their raw values, because they are Unix seconds and a number like 1516239022 tells you nothing at a glance. If a value resolves to a date tens of thousands of years out, the issuer built it from milliseconds — the most common JWT bug there is.',
          ],
        },
        {
          heading: 'Decoding proves nothing about trust',
          paragraphs: [
            'A decoder will read a token forged in a text editor thirty seconds ago just as happily as a real one. The claims become trustworthy only once the signature is verified against a key, which is a separate operation.',
            'Use the decoder to see what a token says while debugging. Never let a decoded-but-unverified claim decide whether a request is authorised — pin the expected algorithm server-side and reject anything else, including alg: none.',
          ],
        },
        {
          heading: 'When a token will not decode',
          bullets: [
            'It does not have exactly three dot-separated parts, usually because it was truncated on copy.',
            'A Bearer prefix or surrounding quotes came along with it.',
            'It is a JWE rather than a JWS — five segments, and genuinely encrypted.',
            'It is an opaque session identifier that merely looks like a token, with no structure to read.',
          ],
        },
      ],
    },
  },
  {
    slug: 'encode',
    toolId: 'jwt-decoder',
    preset: { mode: 'encode' },
    content: {
      updated: '2026-07-27',
      title: 'JWT Encoder',
      metaDescription:
        'Build and sign a JSON Web Token online. Compose header and payload claims, sign with HMAC, and keep the secret in your browser rather than on a server.',
      intro: [
        'Compose a token from scratch: choose the claims, supply a secret, and get a signed JWT back. Useful for producing a fixture for a test suite or reproducing a token shape a service is rejecting.',
        'This page opens in encoder mode, with signing performed locally so the secret never leaves your machine.',
      ],
      sections: [
        {
          heading: 'Claims worth setting deliberately',
          bullets: [
            'exp — expiry, in Unix seconds. Without it the token is valid forever, which is almost never what you want.',
            'iat — issued-at, also seconds. Lets a verifier reason about token age independently of expiry.',
            'sub — who the token is about, usually a stable user identifier rather than an email.',
            'iss and aud — who minted it and who is meant to accept it. A verifier that ignores aud will accept a token issued for a different service.',
          ],
        },
        {
          heading: 'Seconds, not milliseconds',
          paragraphs: [
            'Every time claim in the spec is seconds since the epoch. JavaScript hands you milliseconds, so a token built from Date.now() without dividing by 1000 expires roughly 50,000 years from now and never rejects.',
            'The rendered date next to each claim makes the mistake obvious immediately, which is the fastest way to catch it.',
          ],
          code: {
            lang: 'text',
            body: 'exp: 1767225600   → 2026-01-01   correct\nexp: 1767225600000 → year 57907   milliseconds by mistake',
          },
        },
        {
          heading: 'Tokens minted here are real',
          paragraphs: [
            'A token signed with your production secret is a production credential regardless of where it was generated. For anything beyond local testing, mint tokens from the service that owns the key, and treat anything produced here as disposable.',
          ],
        },
        {
          heading: 'Algorithm choice is part of the token',
          paragraphs: [
            'The alg header travels with the token, which means a verifier that trusts it can be told which algorithm to use by an attacker. Pin the expected algorithm on the verifying side and reject anything else.',
            'When generating here, pick the algorithm your verifier already expects rather than assuming it will adapt.',
          ],
        },
      ],
    },
  },
]
