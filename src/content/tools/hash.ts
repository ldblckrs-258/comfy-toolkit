import type { ToolContent } from '../types'

export const hashContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'A cryptographic hash reduces any input - three bytes or three gigabytes - to a fixed-length digest. The same input always yields the same digest, and changing a single bit changes roughly half the output bits. That property is what makes hashes useful for verifying that a file arrived exactly as it left.',
    'This tool computes MD5, SHA-1, SHA-256, SHA-384 and SHA-512 side by side, from typed text or a dropped file, and outputs hex or Base64. The SHA family runs through the Web Crypto API in your browser; nothing is uploaded, so hashing a private file does not hand it to a server.',
  ],
  sections: [
    {
      heading: 'Text and files take the same path',
      paragraphs: [
        'Hashing is defined over bytes, not characters, so a file and a string containing identical bytes must produce identical digests. This implementation is tested against exactly that invariant: hashing an ArrayBuffer returns the same result as hashing the equivalent string.',
        'The practical consequence is that you can verify a download by dropping the file in, or paste a snippet you expect it to contain, and compare against the same reference digest either way.',
      ],
    },
    {
      heading: 'Known-answer vectors',
      paragraphs: [
        'The published digests for the empty string and for "abc" are the standard way to confirm a hash implementation is correct. Both are pinned in this tool\'s test suite, so the values below are the ones you will actually get.',
      ],
      code: {
        lang: 'text',
        body: "MD5('')      d41d8cd98f00b204e9800998ecf8427e\nMD5('abc')   900150983cd24fb0d6963f7d28e17f72\nSHA-1('abc') a9993e364706816aba3e25717850c26c9cd0d89d\nSHA-256('') base64  47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
      },
    },
    {
      heading: 'Comparing a checksum you were given',
      paragraphs: [
        'Checksums get copied out of release notes and terminal output, arriving with stray spaces, line breaks, or in a different case. Pasting one for comparison should not fail on formatting.',
        'Hex digests are normalised before comparison - whitespace stripped, case folded - because hex is case-insensitive. Base64 is treated differently: whitespace is stripped, but case is preserved, since Base64 encodes distinct values in upper and lower case and folding it would produce false matches.',
      ],
    },
    {
      heading: 'Which algorithm is still appropriate',
      bullets: [
        'MD5 - broken for any security purpose since practical collisions arrived in 2004. Still legitimate as a non-adversarial integrity check: catching a truncated download or a corrupted disk read. Never for signatures or deduplicating untrusted input.',
        'SHA-1 - collisions demonstrated by the SHAttered attack in 2017. Git and some legacy protocols still use it for content addressing, but do not choose it for anything new.',
        'SHA-256 - the sensible default. No practical attacks; fast in hardware on modern CPUs.',
        'SHA-384 and SHA-512 - larger digests from the same family. On 64-bit hardware SHA-512 is often faster than SHA-256, and SHA-384 is a truncated SHA-512 that resists length-extension attacks.',
      ],
    },
    {
      heading: 'Hashing a password is a different problem',
      paragraphs: [
        'None of these algorithms are password hashes. They are designed to be fast, which is precisely wrong when an attacker holds your database and wants to try billions of guesses. Password storage needs a deliberately slow, salted, memory-hard function - Argon2, scrypt or bcrypt.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why do MD5 and SHA-1 still appear if they are broken?',
      a: 'Because verifying a download against a vendor-published MD5 is still a real task, and plenty of existing systems emit these digests. They are safe for detecting accidental corruption, and unsafe against anyone deliberately crafting a collision. The distinction is who you are defending against.',
    },
    {
      q: 'Are my files uploaded anywhere?',
      a: "No. The SHA algorithms come from the browser's built-in Web Crypto API and MD5 is computed in-page. The file never leaves your machine, which is the main reason to prefer a local tool for anything sensitive.",
    },
    {
      q: 'Why does my hex digest not match even though the file looks right?',
      a: 'Usually a trailing newline. Editors frequently append one, and it changes every byte of the digest. Hash the file directly instead of pasting its contents, or check whether the reference digest was taken before or after that newline.',
    },
    {
      q: 'Hex or Base64 - which should I use?',
      a: 'Hex is the convention for checksums and is case-insensitive, so it survives copy-paste. Base64 is about a third shorter and shows up in HTTP headers such as Subresource Integrity. Both encode identical bytes; this tool will show you the same digest either way.',
    },
  ],
  related: [
    { id: 'hmac', anchor: 'Add a secret key to the digest with HMAC' },
    {
      id: 'base64',
      anchor: 'Encode the raw bytes as Base64 instead of hashing',
    },
    { id: 'secret-generator', anchor: 'Generate a random key to sign with' },
    {
      id: 'jwt-decoder',
      anchor: 'Inspect a token whose signature is a keyed hash',
    },
  ],
}
