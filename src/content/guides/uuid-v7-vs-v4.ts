import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'For years the advice on UUID primary keys was to avoid them. The reasoning was sound and the measurements were real: swapping a bigint key for a random UUID made large tables measurably slower to write into. UUID v7, standardised in RFC 9562, removes the cause rather than the symptom, and the advice needs updating.',
    'The short version is that the problem was never UUIDs. It was randomness in the leading bits.',
  ],
  sections: [
    {
      heading: 'Why random keys are slow to insert',
      paragraphs: [
        'Databases keep primary key indexes as B-trees, which stay sorted. When you insert a row, the engine finds the leaf page where that key belongs and writes it there.',
        'With a sequential key every insert lands in the same rightmost leaf page. That page is already in memory, it fills up, it gets written once, and the next one opens. The working set is one page wide no matter how large the table is.',
        'With a random key every insert lands in a different, unpredictable page. On a table too large to fit in cache, each insert may need a read before it can write. The pages you dirty are scattered, so checkpoints flush far more of them. Pages that were neatly full get split down the middle to make room, which both wastes space and fragments the index.',
        'None of this shows up on a small table, which is why the problem tends to arrive suddenly, at scale, long after the schema decision was made.',
      ],
    },
    {
      heading: 'What v7 changes',
      paragraphs: [
        'A v7 UUID puts a 48-bit millisecond timestamp in the leading bits, then a version nibble, then randomness for the remaining 74 bits. Because the leading bits increase over time, values generated later sort after values generated earlier.',
        'That restores insert locality completely. Consecutive inserts land in the same rightmost page again, exactly as an auto-increment integer does, while the trailing randomness keeps the value globally unique and generatable offline.',
      ],
      code: {
        lang: 'text',
        body: '019ee6e6-ae66-71e5-a2ca-14dad13b7237\n└────┬─────┘ │└┬┘ ││└──────┬───────┘\n  timestamp  │ │  │└─ variant + 62 random bits\n   (48 bits) │ │  └── random\n             │ └───── random (12 bits)\n             └─────── version = 7',
      },
    },
    {
      heading: 'What you keep from v4',
      bullets: [
        'Offline generation. Any client or service can mint an identifier with no coordination and no round trip to a sequence.',
        'No collision risk in practice. 74 random bits within a single millisecond is an enormous space.',
        'The same 16-byte storage format, so any existing UUID column accepts a v7 value without migration.',
        'Merge-friendliness. Two datasets generated independently can be combined without key conflicts, which sequences cannot offer.',
      ],
    },
    {
      heading: 'What v7 gives away',
      paragraphs: [
        'The timestamp is recoverable by anyone holding the identifier. That is usually harmless and sometimes useful — you can read a record creation time without querying, which is genuinely handy during an incident.',
        'It becomes a problem when the identifiers are public. Exposed v7 keys tell anyone the exact creation time of every record, let them order two records by comparing ids, and allow volume estimation by sampling identifiers over time. For a competitor watching your signups, that is real intelligence.',
        'The fix is not to abandon v7. Keep it as the internal primary key for the index locality, and expose a separate random identifier — a v4, or a short opaque token — on public surfaces. You pay one extra indexed column for the separation.',
      ],
    },
    {
      heading: 'When v4 is still the right answer',
      paragraphs: [
        'Use v4 for anything where the creation time must not be inferable: password reset tokens, share links, public-facing object identifiers, anything a user might enumerate or correlate.',
        'Use v4 also where the value is a secret rather than a key. A v7 identifier has 74 bits of entropy rather than 122, and while that is ample for uniqueness it is a weaker basis for unguessability. For an actual secret, generate random bytes rather than any UUID.',
      ],
    },
    {
      heading: 'Comparing against the alternatives',
      bullets: [
        'ULID — solves the same problem with a 48-bit timestamp and Crockford Base32 encoding. Functionally equivalent; v7 has the advantage of being a real UUID that every database, ORM and validator already understands.',
        'Snowflake — smaller at 64 bits and sortable, but requires coordinated worker ids to stay unique, which reintroduces the coordination v7 avoids.',
        'Auto-increment bigint — still the smallest and fastest option, and still correct when you have a single writer, do not need client-side generation, and do not mind exposing a guessable sequence.',
        'v4 — when unpredictability matters more than write throughput.',
      ],
    },
    {
      heading: 'Adopting it',
      paragraphs: [
        'PostgreSQL added a native uuidv7() function in version 18. Before that, generate in the application layer — every major language now has a v7 implementation — or use an extension.',
        'Migration does not require changing column types, since the storage format is identical. New rows simply start getting v7 values while existing v4 rows stay valid. The index will not gain locality for the old rows, but it will stop losing it for new ones, and a reindex afterwards cleans up the fragmentation the old keys left behind.',
        'Verify before assuming a win. The benefit is proportional to how far your table exceeds cache, and on a table that fits in memory the difference is close to nothing.',
      ],
    },
  ],
}
