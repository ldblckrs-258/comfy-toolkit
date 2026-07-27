import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'A JSON Web Token looks opaque, which is the root of most misunderstandings about it. It is not encrypted. Anyone holding the token can read every claim inside it with no key, no secret and no permission.',
    'What a JWT provides is integrity: proof that the claims have not been altered since the issuer signed them. Getting the distinction between reading and trusting right is the whole of JWT security.',
  ],
  sections: [
    {
      heading: 'The three segments',
      paragraphs: [
        'A token is three base64url strings joined by dots. The header names the signing algorithm and the token type. The payload carries the claims. The signature covers the first two segments.',
        'base64url is the URL-safe variant of Base64: - and _ replace + and /, and padding is usually dropped, so the token survives being put in a header or a query string.',
      ],
      code: {
        lang: 'text',
        body: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.dBjftJeZ4CVP...\n└──── header ────┘ └─── payload ───┘ └─ signature ─┘\n\n{"alg":"HS256","typ":"JWT"}\n{"sub":"1234","name":"John Doe","iat":1516239022}',
      },
    },
    {
      heading: 'Decoding is not verifying',
      paragraphs: [
        'Decoding splits the token and Base64-decodes two segments. It requires nothing and proves nothing. A decoder will read a token forged in a text editor thirty seconds ago exactly as happily as a genuine one.',
        'Verifying recomputes the signature over the header and payload using a key and checks that it matches. Only after that do the claims mean anything.',
        'The vulnerability, and it is common, is code that decodes a token to read a user id or a role and acts on it without verifying. Every library makes both operations available and the decode-only one is usually the shorter call.',
      ],
    },
    {
      heading: 'The alg field is attacker-controlled',
      paragraphs: [
        'The algorithm is named inside the token, which means whoever supplies the token also supplies the instruction for how to check it. A verifier that reads alg from the header and does what it says has handed the attacker control of its own verification.',
      ],
      bullets: [
        'alg: none — the specification permits an unsigned token. Strip the signature, set none, and a naive verifier accepts it.',
        'HS256 for RS256 confusion — if a verifier accepts either and chooses based on the header, an attacker can re-sign an RS256 token as HS256 using the public key as the HMAC secret. The public key is, by definition, public.',
        'The fix in both cases is identical: pin the expected algorithm server-side and reject any token whose header disagrees.',
      ],
    },
    {
      heading: 'Claims that must be checked',
      paragraphs: [
        'A valid signature means the claims are authentic. It does not mean they are currently applicable.',
      ],
      bullets: [
        'exp — expiry. Nothing enforces it automatically; a verifier that skips the check accepts tokens forever.',
        'nbf — not before. A token can be issued for future use.',
        'aud — audience. A verifier that ignores it will accept a validly signed token that was issued for a completely different service.',
        'iss — issuer. Confirms which authority minted it, which matters when you trust more than one.',
      ],
    },
    {
      heading: 'Seconds, and the expiry that never expires',
      paragraphs: [
        "Every time claim in the specification is Unix seconds. JavaScript's Date.now() returns milliseconds. A token whose exp was built without dividing by 1000 expires roughly 55,000 years from now.",
        'It is a security bug that no test will catch, because the token is always valid and everything works. The only way to notice is to render the claim as a date and look at it, which is why a decoder that resolves time claims is worth using during development.',
      ],
    },
    {
      heading: 'Revocation is the real trade-off',
      paragraphs: [
        'A signed token is valid until it expires. There is no mechanism to recall one, which is precisely what makes stateless verification possible and is also the main operational cost.',
        'The practical answers are short expiry paired with refresh tokens, or a server-side denylist checked on each request — which reintroduces exactly the state JWTs were adopted to avoid. Choose deliberately rather than discovering the constraint during an incident.',
        'Where tokens live matters too. localStorage is readable by any script on the page, so an XSS becomes a token theft. That is an XSS problem rather than a JWT one, but JWTs are where it usually lands.',
      ],
    },
    {
      heading: 'Safe debugging habits',
      paragraphs: [
        'Decode tokens locally rather than pasting them into a hosted decoder. A token that has not expired is a live credential, and a decoder that runs in your browser does not transmit it.',
        'Treat a token in a screenshot, a ticket or a chat log the same way you would treat a password in one. Rotate if it leaks, and prefer short-lived tokens so that a leak has a bounded window.',
      ],
    },
    {
      heading: 'When not to use a JWT at all',
      paragraphs: [
        'A JWT is worth its complexity when verification has to happen without shared state — several services checking a token independently, or an edge that cannot reach a session store.',
        'For an ordinary server-rendered application with one backend and a database it is already talking to, an opaque session identifier in a cookie is simpler and strictly better: revocation is a delete, the token carries no readable claims, and there is no algorithm confusion to get wrong.',
        'Reaching for a JWT because it is the default in a tutorial is how projects acquire the revocation problem without ever needing the property that justifies it.',
      ],
    },
  ],
}
