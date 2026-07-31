import type { ToolVariant } from './types'

export const hashVariants: Array<ToolVariant> = [
  {
    slug: 'text',
    toolId: 'hash',
    preset: { source: 'text' },
    content: {
      updated: '2026-07-27',
      title: 'Text Hash Generator',
      metaDescription:
        'Hash text online and see MD5, SHA-1, SHA-256, SHA-384 and SHA-512 side by side. Output as hex or Base64, computed in your browser.',
      intro: [
        'Type or paste a string and get every digest at once rather than picking an algorithm first. Seeing them together is what you want when you have a reference digest and do not know which algorithm produced it - match it by length and value.',
        'This page opens with text input selected.',
      ],
      sections: [
        {
          heading: 'Identifying an unknown digest by length',
          bullets: [
            '32 hex characters - MD5.',
            '40 - SHA-1.',
            '64 - SHA-256.',
            '96 - SHA-384.',
            '128 - SHA-512.',
          ],
          paragraphs: [
            'Length narrows it to one algorithm in almost every case, which is why showing all five simultaneously answers the question faster than guessing and re-running.',
          ],
        },
        {
          heading: 'Trailing newlines change everything',
          paragraphs: [
            'A hash is over exact bytes, so an invisible trailing newline produces a completely different digest. This is the single most common reason a hand-typed string fails to match a reference value, and it is why hashing a file directly is more reliable than pasting its contents.',
          ],
          code: {
            lang: 'text',
            body: "MD5('abc')   900150983cd24fb0d6963f7d28e17f72\nMD5('abc\\n') 0bee89b07a248e27c83fc3d5951213c1",
          },
        },
        {
          heading: 'Not for passwords',
          paragraphs: [
            'These algorithms are built to be fast, which is exactly wrong for password storage - speed is what lets an attacker with your database try billions of guesses. Password hashing needs a deliberately slow, salted function such as Argon2, scrypt or bcrypt.',
          ],
        },
        {
          heading: 'Hashing is not encoding',
          paragraphs: [
            'A hash is one-way: there is no operation that turns a digest back into the input. Sites that appear to reverse MD5 are looking the value up in a table of precomputed common inputs, not inverting anything.',
            'That is exactly why unsalted hashes of predictable values such as passwords or email addresses offer so little protection.',
          ],
        },
      ],
    },
  },
  {
    slug: 'file',
    toolId: 'hash',
    preset: { source: 'file' },
    content: {
      updated: '2026-07-27',
      title: 'File Checksum Calculator',
      metaDescription:
        'Calculate a file checksum online with MD5, SHA-1 and SHA-256. Verify a download against its published hash without uploading the file anywhere.',
      intro: [
        'Drop a file in and get its digests. The file is read in the browser and never uploaded, which is the whole point of doing this locally rather than through a web service.',
        'This page opens with file input selected.',
      ],
      sections: [
        {
          heading: 'Verifying a download',
          paragraphs: [
            'A project publishes a checksum next to its release. Compute the same digest locally and compare: if they match, the bytes you received are the bytes that were published.',
            'Paste the published value into the comparison field rather than reading it character by character. Hex is normalised before comparison - whitespace stripped, case folded - so a value copied out of release notes with stray formatting still compares correctly.',
          ],
        },
        {
          heading: 'What a matching checksum does and does not prove',
          paragraphs: [
            'It proves the file was not corrupted in transit or on disk. It does not prove the file is safe, because whoever published the checksum also published the file - an attacker who replaced one would replace the other. Only a signature backed by a key you already trust proves origin.',
            'MD5 is adequate here despite being cryptographically broken: catching an accidental truncation is not an adversarial problem. Prefer SHA-256 where the publisher offers it.',
          ],
        },
        {
          heading: 'Text and file paths agree',
          paragraphs: [
            'Hashing a file and hashing a string with identical bytes produce identical digests - an invariant the test suite pins directly. So you can verify a small text file either way and get the same answer.',
          ],
        },
        {
          heading: 'Large files and memory',
          paragraphs: [
            'Very large files are read in the browser, so the practical ceiling is available memory rather than an upload limit. A multi-gigabyte disk image may be better hashed with a native tool.',
            'For everything a browser can hold comfortably, doing it locally is both faster than uploading and safer, since the bytes never leave the machine.',
          ],
        },
      ],
    },
  },
]
