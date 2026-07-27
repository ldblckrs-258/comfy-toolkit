import type { ToolContent } from '../types'

export const uuidContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'UUID v7, standardised in RFC 9562, puts a millisecond Unix timestamp in the leading 48 bits and fills the rest with randomness. The result is still a 128-bit identifier you can generate without coordination, but unlike v4 it sorts chronologically.',
    'This tool generates v7 and v4 identifiers in bulk and decomposes any v7 you paste back into its constituent bit fields, so you can read the creation time straight out of the value.',
  ],
  sections: [
    {
      heading: 'Why time-ordering matters for a database',
      paragraphs: [
        'A v4 UUID is entirely random, so consecutive inserts land at random positions in a B-tree index. Every insert dirties a different page, the working set balloons, and page splits fragment the index. On a large table this is a measurable write-throughput problem.',
        'A v7 UUID increases monotonically, so inserts append to the rightmost leaf, the way an auto-increment integer does. You keep global uniqueness and offline generation while getting back the locality that made sequential keys fast.',
        'The ordering guarantee is real and tested here: two v7 values generated in sequence compare correctly on their leading timestamp bits.',
      ],
    },
    {
      heading: 'Reading the bit layout',
      paragraphs: [
        'The 128 bits are not opaque. The first 48 are the timestamp, then 4 version bits, 12 bits of randomness, 2 variant bits, and 62 more random bits. Pasting a v7 into this tool splits out each field with its hex and binary value.',
      ],
      code: {
        lang: 'text',
        body: 'timestamp  019ee6e6ae66   48 bits, ms since epoch\nversion    7              4 bits\nrandA      1e5            12 bits\nvariant    2  (binary 10) 2 bits\nrandB      ca14dad13b72378  62 bits',
      },
    },
    {
      heading: 'What v7 gives away',
      paragraphs: [
        'Because the timestamp is recoverable, a v7 identifier discloses when the record was created - to the millisecond. Usually that is harmless or actively useful. Occasionally it is not: exposing v7 primary keys in a public API tells anyone who looks the exact creation time of every row, and comparing two of them reveals signup order or internal volume.',
        'Where that matters, keep v7 as the internal key for index locality and expose a separate random identifier publicly.',
      ],
    },
    {
      heading: 'Choosing between the versions',
      bullets: [
        'v7 - new database keys, event ids, anything sorted or range-scanned by time.',
        'v4 - public-facing identifiers, tokens, and anything where leaking a creation time is undesirable.',
        'ULID - solves the same problem as v7 with a 26-character Crockford Base32 encoding. Functionally similar; v7 has the advantage of being a real UUID that any UUID column accepts.',
        'Auto-increment integers - still smaller and faster if you have a single writer and do not need to generate ids client-side.',
      ],
    },
  ],
  faq: [
    {
      q: 'Are these safe to use as primary keys?',
      a: 'Yes, and v7 specifically addresses the reason people avoided UUID keys. You still pay 16 bytes per key against 8 for a bigint, which matters in wide secondary indexes, but the insert-locality problem that made v4 keys painful is gone.',
    },
    {
      q: 'Could two generated UUIDs collide?',
      a: 'Not in practice. v4 has 122 random bits; v7 has 74 random bits within a single millisecond. Generating collisions requires astronomically many identifiers in the same millisecond. Randomness comes from the platform CSPRNG, not Math.random.',
    },
    {
      q: 'Can I generate a large batch?',
      a: 'Yes, with a cap. The count is clamped to between 1 and 1000 - asking for zero returns one, asking for five thousand returns a thousand. Batches are checked for uniqueness rather than assumed unique.',
    },
    {
      q: 'Is v7 supported by my database?',
      a: 'The storage format is an ordinary UUID, so any UUID column accepts it regardless of version. Native generation functions are newer: PostgreSQL added uuidv7() in version 18, and before that you generate in the application or with an extension.',
    },
  ],
  related: [
    {
      id: 'unix-timestamp',
      anchor: 'Convert the extracted v7 timestamp to a readable date',
    },
    {
      id: 'secret-generator',
      anchor: 'Generate random tokens rather than identifiers',
    },
    {
      id: 'string-inspector',
      anchor: 'Check a pasted identifier for invisible characters',
    },
    { id: 'hash', anchor: 'Derive a deterministic id by hashing instead' },
  ],
}
