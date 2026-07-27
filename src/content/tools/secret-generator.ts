import type { ToolContent } from '../types'

export const secretGeneratorContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'A secret is only as good as the randomness behind it. Values produced by Math.random, by a date, or by a person typing what feels random are all predictable enough to attack, and the failure is invisible - a weak key looks exactly like a strong one.',
    'This tool generates secrets from the platform cryptographic random number generator via the Web Crypto API, in hex, Base64, alphanumeric or passphrase form. Generation happens in your browser, so the value is never transmitted and never appears in a server log.',
  ],
  sections: [
    {
      heading: 'CSPRNG, not Math.random',
      paragraphs: [
        'Math.random is a fast pseudo-random generator seeded from ordinary state. It is fine for shuffling a carousel and unacceptable for a key: observing enough output lets an attacker reconstruct the internal state and predict every subsequent value.',
        'crypto.getRandomValues draws from the operating system entropy pool and is designed so that past output reveals nothing about future output. Every value this tool produces comes from there.',
      ],
    },
    {
      heading: 'How much entropy you actually need',
      bullets: [
        '128 bits - the standard floor for anything long-lived. Sixteen random bytes; 32 hex characters.',
        '256 bits - for signing keys and anything protecting other secrets. Thirty-two bytes; 64 hex characters.',
        'Encoding does not add entropy. A 32-byte value is 256 bits whether you write it as hex, Base64 or raw. Base64 is simply shorter on screen - 44 characters against 64.',
        'Alphanumeric output trades a little density for values that survive being pasted into shells, URLs and config files without escaping.',
      ],
    },
    {
      heading: 'Passphrases and the word-count arithmetic',
      paragraphs: [
        'For a secret a person has to type or remember, a passphrase of random words beats a short scramble of symbols. Entropy comes from the size of the word list and the number of words chosen, not from the apparent messiness of the result.',
        'From a 7,776-word list, each word contributes about 12.9 bits. Four words is roughly 51 bits - too weak for anything valuable. Six words is about 77 bits, which is reasonable for a master password. The words must be machine-chosen: a phrase a human picks has a fraction of the entropy the arithmetic suggests.',
      ],
      code: {
        lang: 'text',
        body: '4 words  ≈  51 bits   weak\n5 words  ≈  64 bits   marginal\n6 words  ≈  77 bits   good\n7 words  ≈  90 bits   strong',
      },
    },
    {
      heading: 'Handling the value afterwards',
      paragraphs: [
        'Generation is the easy half. Most secrets leak later - committed to a repository, pasted into a ticket, left in a shell history file, or baked into a container image layer that persists after being deleted in a later layer.',
        'Put the value straight into a secret manager or an environment variable that is not checked in. If a secret has ever been committed, rotate it rather than rewriting history; assume anything pushed to a remote has been indexed.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is generating a secret in a browser safe?',
      a: 'The randomness is sound - it is the same OS entropy source a server would use, and nothing is transmitted. The residual risks are local: a malicious extension with page access, or the value sitting in your clipboard. For the highest-value keys, generate on an isolated machine.',
    },
    {
      q: 'Do I need special characters in a password?',
      a: 'Not if it is long. Composition rules were designed for short human-chosen passwords and mostly push people toward predictable substitutions. Length and genuine randomness dominate; a long alphanumeric value beats a short one full of punctuation.',
    },
    {
      q: 'How long should an API key be?',
      a: '32 random bytes, rendered as hex or Base64. Prefix it with something identifying the key type, as several major providers do - it makes secret scanners able to recognise and revoke a leaked key automatically.',
    },
    {
      q: 'Can I reuse one secret across environments?',
      a: 'No. Separate values for development, staging and production mean a leak from a laptop or a screenshot cannot touch production, and rotation in one environment does not require coordinating a deploy in another.',
    },
  ],
  related: [
    { id: 'hmac', anchor: 'Sign a message with the key you just generated' },
    {
      id: 'uuid-generator',
      anchor: 'Generate identifiers rather than secrets',
    },
    { id: 'hash', anchor: 'Hash a value instead of generating one' },
    { id: 'base64', anchor: 'Re-encode the secret in another representation' },
  ],
}
