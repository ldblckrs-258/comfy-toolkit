import type { ToolVariant } from './types'

export const hmacVariants: Array<ToolVariant> = [
  {
    slug: 'generate',
    toolId: 'hmac',
    preset: { mode: 'generate' },
    content: {
      updated: '2026-07-27',
      title: 'HMAC Generator',
      metaDescription:
        'Generate an HMAC signature online with SHA-256, SHA-384 or SHA-512. Sign a payload with a shared secret in your browser, output as hex or Base64.',
      intro: [
        'Produce a keyed signature over a message. Anyone can recompute a plain hash, but only a holder of the shared secret can produce a matching HMAC, which is what makes it useful for proving where a payload came from.',
        'This page opens in generate mode, computing through the Web Crypto API so the secret stays local.',
      ],
      sections: [
        {
          heading: 'Signing a webhook payload',
          paragraphs: [
            'The common use is emitting a signature a receiver will check. Sign the exact bytes of the request body, not a re-serialised version of the parsed object — key order and whitespace change the signature, and a receiver recomputing over different bytes will always disagree.',
            'Many providers sign a composed string rather than the body alone, typically a timestamp and a version prefix joined with the payload. If you are reproducing a provider signature, that composition is usually the piece that differs.',
          ],
        },
        {
          heading: 'Choosing hash and encoding',
          bullets: [
            'SHA-256 — the default nearly everyone uses for webhook signatures.',
            'SHA-384 and SHA-512 — longer tags, often faster on 64-bit hardware; pick them only if a spec asks.',
            'Hex — the usual header encoding, case-insensitive and copy-paste safe.',
            'Base64 — about a third shorter, common where header size matters.',
          ],
        },
        {
          heading: 'The key is not a password',
          paragraphs: [
            'HMAC does not stretch its key. A memorable passphrase is a guessable signature, so use random bytes — 32 is a sensible floor for SHA-256. Keys longer than the hash block size are hashed down first, so extreme length buys nothing.',
          ],
        },
        {
          heading: 'Signing a URL rather than a body',
          paragraphs: [
            'Presigned URLs apply the same construction to a canonical string built from the method, path, expiry and selected headers, rather than to a request body.',
            'Reproducing one means matching that canonical string exactly, character for character. Almost every failed signature reproduction is a difference in the string being signed rather than in the HMAC itself.',
          ],
        },
      ],
    },
  },
  {
    slug: 'verify',
    toolId: 'hmac',
    preset: { mode: 'verify' },
    content: {
      updated: '2026-07-27',
      title: 'HMAC Verifier',
      metaDescription:
        'Verify an HMAC signature online. Paste the message, secret and expected signature to check a webhook, with hex compared case-insensitively.',
      intro: [
        'Check a signature you were sent. Paste the message, the shared secret and the expected tag, and find out whether they agree.',
        'This page opens in verify mode, which is the one you want when a webhook is being rejected and you need to know whether the signature or the payload is at fault.',
      ],
      sections: [
        {
          heading: 'Hex case does not matter',
          paragraphs: [
            'Hex digests carry no meaning in their case, so an uppercase signature and its lowercase twin both verify here. Rejecting on case would produce failures that look like tampering and are not.',
            'Base64 is treated differently: whitespace is stripped but case is preserved, because Base64 encodes distinct values in upper and lower case and folding it would produce false matches.',
          ],
        },
        {
          heading: 'Reading a failure',
          paragraphs: [
            'A mismatch narrows the problem to one of three things: the message bytes differ from what was signed, the secret is wrong, or the algorithm does not match. Checking against a known-good pair first tells you whether your secret is right before you start suspecting the payload.',
            'The most frequent real cause is the body being reparsed and re-serialised somewhere in the middle — a proxy, a framework body parser, a logging layer — so the bytes you verify are not the bytes that were signed.',
          ],
        },
        {
          heading: 'In production, compare in constant time',
          paragraphs: [
            'Verifying here is for debugging. In your own code, never compare signatures with == or strcmp: those return early on the first differing byte, and the timing difference leaks how much of a forged signature was correct. Use crypto.timingSafeEqual, hmac.compare_digest or subtle.ConstantTimeCompare.',
          ],
        },
      ],
    },
  },
]
