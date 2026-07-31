import type { ToolVariant } from './types'

export const timestampVariants: Array<ToolVariant> = [
  {
    slug: 'convert',
    toolId: 'unix-timestamp',
    preset: { mode: 'convert' },
    content: {
      updated: '2026-07-27',
      title: 'Unix Timestamp Converter',
      metaDescription:
        'Convert a Unix timestamp to a date and back online. Detects seconds, milliseconds, microseconds and nanoseconds automatically, in your browser.',
      intro: [
        'Paste an epoch value and get a readable date, or pick a date and get the epoch value. This page opens in convert mode.',
        'The unit is inferred from magnitude, because nothing in the number itself says whether it is seconds or milliseconds and guessing wrong is the usual bug.',
      ],
      sections: [
        {
          heading: 'How the unit is detected',
          code: {
            lang: 'text',
            body: '1700000000            10 digits  seconds\n1700000000000         13 digits  milliseconds\n1700000000000000      16 digits  microseconds\n1700000000000000000   19 digits  nanoseconds',
          },
          paragraphs: [
            'The bands are far enough apart to be unambiguous for any present-day value, and you can override the detection when you know better. Nanosecond values are carried through BigInt rather than a float, so the last digits survive instead of rounding away.',
          ],
        },
        {
          heading: 'Before 1970',
          paragraphs: [
            'Negative timestamps are valid and mean earlier than the epoch: -86400 is the last day of 1969. Plenty of converters reject them or render nonsense, which matters for birth dates and historical records.',
          ],
        },
        {
          heading: 'Timezone is a rendering choice',
          paragraphs: [
            'The timestamp is an absolute instant; the date shown depends on the zone you select. Dates you enter are read as wall-clock time in that zone, so 2023-11-14 22:13:20 UTC is exactly 1700000000000 ms. Choose the zone explicitly when comparing against a log written on another machine.',
          ],
        },
        {
          heading: 'The 2038 problem',
          paragraphs: [
            'A signed 32-bit integer holding seconds overflows on 19 January 2038 and wraps to 1901. Modern systems use 64-bit values and are unaffected.',
            'It still surfaces in embedded devices, old database columns and file formats that fixed the width. A date near 1901 in otherwise sane data is a strong hint you are looking at an overflow.',
          ],
        },
      ],
    },
  },
  {
    slug: 'extract',
    toolId: 'unix-timestamp',
    preset: { mode: 'extract' },
    content: {
      updated: '2026-07-27',
      title: 'Extract Timestamp from Snowflake, ObjectId and ULID',
      metaDescription:
        'Pull the creation time out of a Snowflake ID, MongoDB ObjectId, ULID or UUID v7 online. Paste the identifier and read the embedded timestamp.',
      intro: [
        'Several widely used identifier formats embed the moment they were created. If all you have is an id, you can often recover a timestamp without touching the database.',
        'This page opens in extract mode.',
      ],
      sections: [
        {
          heading: 'What carries a timestamp',
          bullets: [
            'Snowflake - 41 bits of milliseconds since a service-specific epoch, offset from 1970. Used by X and Discord, so a message or account id reveals its creation time.',
            'MongoDB ObjectId - the leading 4 bytes are seconds since the epoch, so every document knows when it was inserted.',
            'ULID - a 48-bit millisecond timestamp in Crockford Base32.',
            'UUID v7 - 48 bits of milliseconds in the leading field.',
          ],
        },
        {
          heading: 'Why this is useful',
          paragraphs: [
            'During an incident you frequently have an id from a log line and no corresponding row, either because it was deleted or because you are looking at the wrong shard. The embedded time narrows the window immediately.',
            'It also settles ordering questions: two Snowflakes or two ULIDs sort chronologically by their raw string, so you can tell which event came first without any lookup at all.',
          ],
        },
        {
          heading: 'What it discloses',
          paragraphs: [
            'The same property is an information leak when these ids are public. Exposed sequential or time-ordered identifiers let anyone read creation times, infer signup order, and estimate volume by sampling. Where that matters, keep the time-ordered id internal and expose a random one.',
          ],
        },
        {
          heading: 'Not every identifier carries a time',
          paragraphs: [
            'UUID v4 is entirely random and discloses nothing. A hash-based identifier reveals nothing either. Only formats that deliberately embed a clock reading can be decoded this way.',
            'If extraction returns something implausible, the id is probably one of those rather than a malformed Snowflake.',
          ],
        },
      ],
    },
  },
  {
    slug: 'batch',
    toolId: 'unix-timestamp',
    preset: { mode: 'batch' },
    content: {
      updated: '2026-07-27',
      title: 'Bulk Unix Timestamp Converter',
      metaDescription:
        'Convert many Unix timestamps at once online. Paste a column of epoch values and get dates back for all of them, computed in your browser.',
      intro: [
        'Paste a whole column of epoch values and convert them together, rather than one at a time. This page opens in batch mode.',
        'The typical source is a log extract or a query result where the timestamps are unreadable and you need the whole set in context.',
      ],
      sections: [
        {
          heading: 'Reading a sequence rather than a point',
          paragraphs: [
            'Converting in bulk is what makes gaps and clusters visible. A run of events every few seconds followed by a four-minute hole is obvious as a list of times and invisible as a list of ten-digit integers.',
            'Because the whole set converts under one unit assumption, a value that lands wildly out of line usually means that row is in a different unit - worth knowing before you draw conclusions from it.',
          ],
        },
        {
          heading: 'Keeping the data local',
          paragraphs: [
            'A column of timestamps pasted out of production logs often arrives with identifiers and paths attached. Everything here is converted in the browser, so a bulk paste does not become an upload.',
          ],
        },
        {
          heading: 'Mixed units in one column',
          paragraphs: [
            'Systems that changed their logging at some point produce columns with both seconds and milliseconds in them. Detection is per value by magnitude, so a mixed column still converts sensibly, but it is worth checking the boundary rows to confirm the split is where you expect.',
          ],
        },
        {
          heading: 'Sorting before converting',
          paragraphs: [
            'Epoch values sort correctly as numbers but not as strings, and a column pasted from a spreadsheet is text. Sorting lexicographically puts a 13-digit millisecond value before a 10-digit second value regardless of the instant.',
            'Convert first, then sort by the resulting date, or sort numerically before pasting.',
          ],
        },
      ],
    },
  },
  {
    slug: 'duration',
    toolId: 'unix-timestamp',
    preset: { mode: 'duration' },
    content: {
      updated: '2026-07-27',
      title: 'Duration Between Two Timestamps',
      metaDescription:
        'Calculate the elapsed time between two Unix timestamps or dates online, broken into days, hours, minutes and seconds. Runs in your browser.',
      intro: [
        'Give two instants and get the interval between them, expressed in units you can actually reason about rather than a raw difference in seconds.',
        'This page opens in duration mode.',
      ],
      sections: [
        {
          heading: 'What this answers',
          paragraphs: [
            'How long a job ran between its start and end log lines. How stale a cached record is. How much time elapsed between a request and the error it produced. All questions where the two endpoints are epoch values and the answer needs to be human-readable.',
            'Both endpoints can be epoch values or dates, and mixing the two is fine - enter whichever form you have.',
          ],
        },
        {
          heading: 'Elapsed time is not calendar arithmetic',
          paragraphs: [
            'A duration in seconds is exact. Expressing it in months is not, because months have different lengths, and expressing it in days across a daylight saving boundary is not either - one local day that year is 23 or 25 hours long.',
            'For anything that must be precise, work in the raw difference and convert to larger units only for display.',
          ],
        },
        {
          heading: 'Leap seconds are already ignored',
          paragraphs: [
            'Unix time defines every day as exactly 86400 seconds, so a leap second repeats a value rather than incrementing. Durations computed from epoch values are short by however many leap seconds fell inside the interval - currently 27 in total since 1972. This matters for scientific timing and for essentially nothing else.',
          ],
        },
        {
          heading: 'Negative durations mean reversed inputs',
          paragraphs: [
            'A negative result simply means the second instant precedes the first. That is often correct and occasionally a signal that two log lines were written by machines whose clocks disagree.',
            'Clock skew of a few seconds between hosts is normal; a skew of minutes usually means NTP is not running somewhere.',
          ],
        },
      ],
    },
  },
  {
    slug: 'format',
    toolId: 'unix-timestamp',
    preset: { mode: 'format' },
    content: {
      updated: '2026-07-27',
      title: 'Timestamp Format Converter',
      metaDescription:
        'Render a Unix timestamp as ISO 8601, RFC formats or a relative time online, and copy the representation your system expects.',
      intro: [
        'The same instant has many written forms, and systems disagree about which one they accept. This page opens in format mode, showing an instant rendered several ways at once.',
      ],
      sections: [
        {
          heading: 'Which format to use where',
          bullets: [
            'ISO 8601 - the default for APIs and log lines. Sorts correctly as a plain string, which is why it is worth preferring.',
            'With a Z suffix - explicitly UTC. Prefer this to an offset like +00:00 when a consumer might parse naively.',
            'Relative time - good for interfaces, wrong for storage, because it is only meaningful relative to when it was rendered.',
            'Epoch - compact and unambiguous for machines, unreadable for people, and silent about its unit.',
          ],
        },
        {
          heading: 'The trap in ISO 8601',
          paragraphs: [
            'A timestamp with no zone designator is ambiguous, and parsers disagree about what to assume. Some treat it as UTC, some as local time, and the same string then means two different instants on two machines.',
            'Always emit an explicit zone. A string like 2026-07-27T14:30:00 is an invitation to a bug that only appears in one deployment region.',
          ],
          code: {
            lang: 'text',
            body: '2026-07-27T14:30:00Z        unambiguous\n2026-07-27T14:30:00+07:00   unambiguous\n2026-07-27T14:30:00         ambiguous',
          },
        },
        {
          heading: 'Store one form, render many',
          paragraphs: [
            'Keep the instant in a single canonical form - UTC - and format at the edge. Storing a formatted local string is how a record becomes impossible to compare against another one written in a different zone.',
          ],
        },
        {
          heading: 'Week numbers and ordinal dates',
          paragraphs: [
            'ISO 8601 also defines week-based dates, where the year belongs to the week rather than the calendar. Around New Year the ISO week year can differ from the calendar year, which breaks naive reporting that mixes the two.',
            'If a dashboard shows a stray week in the wrong year every January, this is why.',
          ],
        },
      ],
    },
  },
]
