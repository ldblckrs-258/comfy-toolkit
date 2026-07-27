import type { ToolContent } from '../types'

export const timestampContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'A Unix timestamp counts elapsed time from 1970-01-01T00:00:00Z. The awkward part is that nothing in the number itself says which unit it is in - seconds, milliseconds, microseconds and nanoseconds all appear in the wild, and mixing them up produces dates in 1970 or in the year 55000.',
    'This tool converts in both directions, infers the unit from the magnitude, and extracts the embedded timestamps from Snowflake IDs, MongoDB ObjectIds and ULIDs.',
  ],
  sections: [
    {
      heading: 'Unit detection by magnitude',
      paragraphs: [
        'A present-day timestamp in seconds is ten digits; in milliseconds thirteen; in microseconds sixteen; in nanoseconds nineteen. That separation is wide enough to guess correctly, and this tool does, while letting you override the guess when you know better.',
        "Nanosecond values are the interesting case. A 19-digit integer exceeds JavaScript's safe integer range, so parsing it as a Number silently loses the last few digits. This implementation carries nanoseconds through BigInt, so 1700000000999999999 keeps every digit rather than rounding to something ending in 000.",
      ],
      code: {
        lang: 'text',
        body: '1700000000            → seconds\n1700000000000         → milliseconds\n1700000000000000      → microseconds\n1700000000000000000   → nanoseconds',
      },
    },
    {
      heading: 'Dates before 1970',
      paragraphs: [
        'Negative timestamps are valid and mean "before the epoch": -86400 is 1969-12-31. Plenty of tools reject them or render nonsense. This one handles them, which matters for birth dates and historical records more often than you would expect.',
      ],
    },
    {
      heading: 'What counts as a valid input',
      paragraphs: [
        'Parsing is strict rather than forgiving, because a silently coerced timestamp is worse than a rejected one. Non-numeric text is rejected, an empty string is rejected, and so are fractional values like 12.5 - a partial second is not a representable epoch value in any of the four units.',
        'Dates are parsed as wall-clock time in the timezone you select, so 2023-11-14 22:13:20 in UTC is exactly 1700000000000 ms. Choosing a different zone shifts the result, which is the behaviour you want when reading a log written in local time.',
      ],
    },
    {
      heading: 'Timestamps hidden inside identifiers',
      bullets: [
        'Snowflake (Twitter/X, Discord) - 41 bits of milliseconds since a service-specific epoch, offset from 1970. Reveals when a message or account was created.',
        'MongoDB ObjectId - the first 4 bytes are seconds since the epoch, so every document carries its own insert time.',
        'ULID - a 48-bit millisecond timestamp in Crockford Base32, the same idea as UUID v7 in a different encoding.',
        'UUID v7 - 48 bits of milliseconds in the leading field; use the UUID tool for a full field-by-field breakdown.',
      ],
    },
    {
      heading: 'Leap seconds and the epoch',
      paragraphs: [
        'Unix time deliberately pretends leap seconds do not exist: every day is exactly 86400 seconds. When a leap second occurs, the counter repeats a value rather than incrementing. This keeps arithmetic simple at the cost of the count not being a true elapsed-seconds figure since 1970 - it is short by the number of leap seconds inserted, currently 27.',
      ],
    },
  ],
  faq: [
    {
      q: 'My timestamp shows 1970 or a date thousands of years away.',
      a: 'A unit mismatch. A millisecond value read as seconds lands far in the future; a second value read as milliseconds lands moments after the epoch. Paste it here and let the magnitude detection tell you which unit it actually is.',
    },
    {
      q: 'What is the 2038 problem?',
      a: 'A signed 32-bit integer holding seconds overflows on 19 January 2038. Anything still using a 32-bit time_t wraps to 1901. Modern systems use 64-bit values and are unaffected, but embedded devices and old database columns still surface it.',
    },
    {
      q: 'Should I store seconds or milliseconds?',
      a: "Be consistent above all. Milliseconds match JavaScript's native Date and most APIs; seconds match Unix tooling and are what JWT claims use. Whichever you pick, name the column so the unit is unambiguous - created_at_ms beats created_at.",
    },
    {
      q: 'Why does the same timestamp show a different date for me than a colleague?',
      a: 'The timestamp is an absolute instant; the rendering is timezone-dependent. Select the zone explicitly rather than relying on the browser default when you are comparing against a log from another machine.',
    },
  ],
  related: [
    {
      id: 'uuid-generator',
      anchor: 'Decompose a UUID v7 into its timestamp fields',
    },
    {
      id: 'clock',
      anchor: 'Compare the same instant across several timezones',
    },
    { id: 'cron', anchor: 'Work out when a scheduled job will next fire' },
    { id: 'jwt-decoder', anchor: 'Read the exp and iat claims inside a token' },
  ],
}
