import type { ToolContent } from '../types'

export const hmacContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'HMAC answers a question a plain hash cannot: not merely "have these bytes changed?" but "were these bytes produced by someone holding the shared secret?" It combines a message with a key under a hash function, so a digest cannot be forged by anyone who does not know the key.',
    "This tool both generates and verifies HMAC signatures using SHA-256, SHA-384 or SHA-512, with hex or Base64 output. Everything runs through the browser's Web Crypto API, so the secret you paste stays on your machine.",
  ],
  sections: [
    {
      heading: 'Why not just hash the key and message together',
      paragraphs: [
        'The obvious construction - hash(key + message) - is broken against Merkle-Damgård hashes such as SHA-256. An attacker who has a valid digest can append data and compute a valid digest for the extended message without ever learning the key. That is a length-extension attack.',
        'HMAC defeats it by hashing twice with two derived keys: an inner pad mixed with the message, then an outer pad mixed with that result. The nested structure means the attacker never holds the internal state needed to extend anything.',
      ],
    },
    {
      heading: 'Verifying rather than eyeballing',
      paragraphs: [
        'The common workflow is checking an incoming webhook: the sender computes an HMAC over the request body with a secret you both hold and puts it in a header. You recompute and compare.',
        'Paste the expected signature into the verify field rather than comparing strings by eye. Hex comparison is case-insensitive here - an uppercase digest and its lowercase twin both verify - because hex case carries no meaning and rejecting on it would produce confusing failures.',
        'The verifier distinguishes the two ways verification fails: a tampered message and a wrong secret both return false, and knowing which one you are looking at usually tells you whether the problem is transport or configuration.',
      ],
    },
    {
      heading: 'Comparing signatures in your own code',
      paragraphs: [
        'When you implement this server-side, do not compare with == or strcmp. Ordinary string comparison returns as soon as it finds a differing byte, so the time it takes leaks how many leading bytes were correct - enough, over many attempts, to reconstruct a signature.',
        'Use a constant-time comparison: crypto.timingSafeEqual in Node, hmac.compare_digest in Python, subtle.ConstantTimeCompare in Go.',
      ],
    },
    {
      heading: 'Choosing a key',
      bullets: [
        'Use random bytes, not a passphrase. HMAC keys are not stretched; a guessable key is a guessable signature.',
        'Length up to the hash block size adds security - 32 bytes is a sensible floor for SHA-256.',
        'Keys longer than the block size are hashed down first, so a very long key buys nothing.',
        'Rotate on a schedule, and accept both old and new keys during the overlap so in-flight requests do not fail.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the difference between HMAC and a plain hash?',
      a: 'A plain hash proves the data has not changed. HMAC proves the data has not changed and came from someone with the key. Anyone can recompute a SHA-256; only a key holder can produce a valid HMAC.',
    },
    {
      q: 'Is HMAC encryption?',
      a: 'No. It produces a fixed-size tag and there is no way to recover the message from it. It provides authenticity and integrity, not confidentiality. If the payload must stay private, encrypt it as well.',
    },
    {
      q: 'Which hash should I pair it with?',
      a: 'SHA-256 unless something specifies otherwise. HMAC-SHA-256 is what most webhook providers use. SHA-384 and SHA-512 give longer tags and can be faster on 64-bit hardware, but the security difference is not the bottleneck in practice.',
    },
    {
      q: 'My signature does not match the one the sender computed.',
      a: 'Almost always a difference in the exact bytes signed rather than the algorithm. Check whether the sender signed the raw request body or a re-serialised version, whether a timestamp or version prefix is part of the signed string, and whether the key is being read as hex, Base64 or literal text.',
    },
  ],
  related: [
    { id: 'hash', anchor: 'Compute an unkeyed digest instead' },
    {
      id: 'jwt-decoder',
      anchor: 'Verify a JWT, which signs its segments with HMAC',
    },
    { id: 'secret-generator', anchor: 'Generate a random 32-byte signing key' },
    {
      id: 'base64',
      anchor: 'Convert the signature between Base64 and raw bytes',
    },
  ],
}
