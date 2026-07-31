import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'MD5 has been cryptographically broken since 2004 and SHA-1 since 2017, and both are still in daily use across systems that are not wrong to use them. "Broken" is a precise claim about a specific property, not a verdict that a function is useless.',
    'The question that decides every case is the same: are you defending against corruption, or against someone deliberately constructing an input?',
  ],
  sections: [
    {
      heading: 'What broken actually means',
      paragraphs: [
        'A cryptographic hash is expected to resist three attacks. Preimage resistance means you cannot find an input producing a given digest. Second preimage resistance means that given one input you cannot find a different one with the same digest. Collision resistance means you cannot find any two inputs that collide.',
        'Collision resistance is the weakest of the three and the first to fall. MD5 collisions can be generated in seconds on a laptop; the SHAttered attack demonstrated a practical SHA-1 collision in 2017 and the cost has fallen since.',
        'Neither has a practical preimage attack. You still cannot take an MD5 digest and recover the input, and sites that appear to do so are looking the value up in a table of precomputed common inputs rather than inverting anything.',
      ],
    },
    {
      heading: 'Why the distinction matters in practice',
      paragraphs: [
        'A collision attack requires the attacker to control both inputs. That is devastating for a signature scheme - craft a benign document and a malicious one with the same digest, get the benign one signed, and the signature transfers.',
        'It is irrelevant when you are checking whether a file downloaded intact. Cosmic rays and flaky network cards do not craft collisions. If nobody is choosing the inputs adversarially, collision resistance is not the property you were relying on.',
      ],
    },
    {
      heading: 'Where each one still belongs',
      bullets: [
        'MD5 - verifying a download did not truncate, detecting a corrupted disk read, cache keys over data you control, deduplicating your own files. Never for signatures, never over untrusted input, never for anything security-bearing.',
        'SHA-1 - legacy protocols and git object addressing. Do not choose it for anything new; git itself has a migration to SHA-256 underway for precisely this reason.',
        'SHA-256 - the sensible default for everything. No practical attacks, and hardware acceleration on modern CPUs makes it fast.',
        'SHA-384 and SHA-512 - the same family with longer digests. Often faster than SHA-256 on 64-bit hardware, and SHA-384 additionally resists length-extension.',
      ],
    },
    {
      heading: 'Length extension, the subtler weakness',
      paragraphs: [
        'MD5, SHA-1 and SHA-256 all use the Merkle-Damgård construction, which leaks internal state in its output. Given the digest of a message and its length, an attacker can compute the digest of that message with data appended, without knowing the original content.',
        'That breaks the naive authentication scheme of hashing a secret concatenated with a message. HMAC exists to prevent exactly this by nesting two hash operations with derived keys, which is why you should never invent your own keyed-hash construction.',
        'SHA-384, being a truncated SHA-512, does not leak enough state for the attack, and the SHA-3 family avoids it structurally.',
      ],
    },
    {
      heading: 'None of these are password hashes',
      paragraphs: [
        'Every algorithm here is designed to be fast, which is exactly the wrong property for storing passwords. Speed is what lets an attacker holding your database try billions of candidates per second on commodity hardware.',
        'Password storage needs a function that is deliberately slow and memory-hard: Argon2id where available, otherwise scrypt or bcrypt. Salting is necessary but not sufficient - a salted SHA-256 is still far too fast.',
        'This is the single most consequential misuse of these functions, and it is still common in code written today.',
      ],
    },
    {
      heading: 'Identifying a digest you have been handed',
      paragraphs: [
        'Digest length identifies the algorithm in almost every case, which is why viewing all of them at once is faster than guessing and re-running.',
      ],
      code: {
        lang: 'text',
        body: '32 hex chars   MD5\n40             SHA-1\n64             SHA-256\n96             SHA-384\n128            SHA-512',
      },
    },
    {
      heading: 'Verifying a download properly',
      paragraphs: [
        'Compute the digest locally and compare it against the published one. If they match, the bytes you received are the bytes that were published.',
        'What that does not prove is that the file is safe, because whoever published the checksum also published the file. An attacker who replaced one would replace the other. Only a signature made with a key you already trust - a GPG signature, a signed release artifact - establishes origin rather than integrity.',
        'Checksums answer "did this arrive intact". Signatures answer "did this come from who I think". They are different questions and a checksum is routinely mistaken for an answer to the second.',
      ],
    },
    {
      heading: 'Choosing for a new system',
      paragraphs: [
        'Default to SHA-256 and stop thinking about it. It is fast, unbroken, hardware-accelerated on anything modern, and universally available.',
        'Reach past it only for a specific reason: SHA-384 or SHA-512 when a spec requires them or when you want length-extension resistance without HMAC, and BLAKE3 when throughput over large files genuinely dominates.',
        'Never choose MD5 or SHA-1 for something new, even for a non-adversarial check. The cost of SHA-256 is negligible, and choosing a broken function deliberately means every future reader has to reconstruct whether the choice was reasoned or careless.',
      ],
    },
  ],
}
