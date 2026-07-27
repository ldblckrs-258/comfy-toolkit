import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'A Unix timestamp is a count of elapsed time since 1970-01-01T00:00:00Z. The specification does not say what unit that count is in, and in practice four are in circulation. Nothing in the number tells you which one you are holding.',
    'That single ambiguity produces more date bugs than timezones do, and unlike timezone bugs it usually fails silently.',
  ],
  sections: [
    {
      heading: 'Identifying the unit by digit count',
      paragraphs: [
        'For any present-day value the four units are far enough apart that digit count identifies them unambiguously. That will remain true for centuries, which makes magnitude detection a reliable heuristic rather than a guess.',
      ],
      code: {
        lang: 'text',
        body: '1700000000            10 digits   seconds\n1700000000000         13 digits   milliseconds\n1700000000000000      16 digits   microseconds\n1700000000000000000   19 digits   nanoseconds',
      },
    },
    {
      heading: 'How the mistake presents',
      paragraphs: [
        'Read a millisecond value as seconds and you land roughly 54,000 years in the future. Read a second value as milliseconds and you land a few weeks after 1 January 1970.',
        'Both are obviously wrong when a human looks at the rendered date, and both are completely invisible when the value stays numeric. Code that compares two timestamps, sorts by one, or checks whether one has passed will behave consistently and wrongly.',
        'The JWT case is the canonical example. The exp claim is defined in seconds. JavaScript hands you milliseconds from Date.now(). A token whose expiry was built without dividing by 1000 expires in the year 57907 and therefore never expires — a security bug that no test catches, because the token is always valid.',
      ],
    },
    {
      heading: 'Precision beyond milliseconds',
      paragraphs: [
        "Nanosecond timestamps appear in tracing systems, high-frequency logging and some databases. A 19-digit integer exceeds JavaScript's safe integer range, so parsing one into a Number silently loses the low digits.",
        'The value 1700000000999999999 becomes 1700000001000000000 — close enough to look right and wrong in exactly the digits you wanted the precision for. Carrying these through BigInt is the only way to keep them intact in JavaScript.',
      ],
    },
    {
      heading: 'Negative values are legal',
      paragraphs: [
        'Timestamps before 1970 are negative. -86400 is 31 December 1969. Plenty of tools reject them outright or render nonsense, which matters for birth dates, historical records and anything migrated from a system with a different epoch.',
        'If a date library returns an error for a pre-1970 date, that is a limitation of the library rather than of the format.',
      ],
    },
    {
      heading: 'Timestamps hidden inside identifiers',
      paragraphs: [
        'Several widely used identifier formats embed their creation time, which means you can often recover a timestamp from an id alone without touching a database.',
      ],
      bullets: [
        'Snowflake — 41 bits of milliseconds since a service-specific epoch, offset from 1970. Used by X and Discord, so any message or account id carries its creation time.',
        'MongoDB ObjectId — the leading four bytes are seconds since the epoch.',
        'ULID — a 48-bit millisecond timestamp encoded in Crockford Base32.',
        'UUID v7 — 48 bits of milliseconds in the leading field.',
      ],
    },
    {
      heading: 'Why that matters during an incident',
      paragraphs: [
        'You frequently have an identifier from a log line and no corresponding row, because it was deleted or you are querying the wrong shard. The embedded time narrows the window immediately.',
        'It also settles ordering without a lookup: two Snowflakes or two ULIDs sort chronologically as raw strings, so you can tell which event came first from the ids alone.',
        'The same property is a disclosure risk when these identifiers are public, since anyone can read creation times and estimate volume by sampling.',
      ],
    },
    {
      heading: 'Leap seconds and the 2038 problem',
      paragraphs: [
        'Unix time defines every day as exactly 86400 seconds, so it ignores leap seconds entirely. When one occurs the counter repeats a value rather than incrementing. The count is therefore short by the number of leap seconds inserted since 1972 — currently 27. This matters for scientific timing and almost nothing else.',
        'The 2038 problem is more concrete. A signed 32-bit integer holding seconds overflows on 19 January 2038 and wraps to 1901. Modern systems use 64-bit values and are unaffected, but embedded devices, old database columns and fixed-width file formats still carry it. A date near 1901 sitting in otherwise sane data is a strong hint you are looking at an overflow.',
      ],
    },
    {
      heading: 'Avoiding the whole category',
      bullets: [
        'Name the unit in the column or field: created_at_ms rather than created_at. The bug cannot survive an unambiguous name.',
        'Pick one unit per system and convert only at boundaries.',
        'Store UTC and format at the edge. A stored local-time string cannot be compared against one written in another zone.',
        'Emit ISO 8601 with an explicit zone designator in anything humans or other systems will read. A string with no zone is ambiguous and parsers disagree about what to assume.',
      ],
    },
    {
      heading: 'Testing around time',
      paragraphs: [
        'Time-dependent code is famously hard to test because the thing it depends on keeps changing. Injecting a clock rather than calling the system one directly is the fix, and it costs almost nothing at the point you write the code.',
        'Pick test timestamps that would expose unit bugs rather than round numbers. A value where seconds and milliseconds readings both produce plausible-looking dates hides the bug; one where the millisecond reading lands in the far future makes it obvious the moment an assertion prints.',
        'Include a pre-1970 date, a leap day and a daylight saving transition in the fixtures. All three break naive implementations, and all three are cheap to add once.',
      ],
    },
  ],
}
