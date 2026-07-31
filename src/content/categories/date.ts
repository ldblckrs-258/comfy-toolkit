import type { CategoryContent } from '../types'

export const dateCategory: CategoryContent = {
  updated: '2026-07-27',
  title: 'Date and Time Tools',
  metaDescription:
    'Free online date and time tools: convert Unix timestamps in seconds or milliseconds, read timezones side by side, and time or schedule work.',
  intro: [
    'Time is the subject that produces the most confidently wrong code. An offset stored where a timezone belonged, milliseconds read as seconds, a scheduled job that skips a day twice a year.',
    'These two tools cover the two halves of the problem: converting an instant between representations, and reasoning about what an instant means to people in different places.',
  ],
  sections: [
    {
      heading: 'How these tools chain together',
      paragraphs: [
        'A log line gives you an epoch value. The Unix Timestamp tool turns it into a date, infers whether it was seconds or milliseconds from its magnitude, and will pull the embedded creation time out of a Snowflake ID, a MongoDB ObjectId or a ULID if that is all you have.',
        'The Clock answers the follow-up: what time was that where the person who filed the report was sitting. Together they cover reconstructing a timeline from logs written by machines in different zones, which is most incident work.',
      ],
    },
    {
      heading: 'Choosing between them',
      bullets: [
        'Unix Timestamp - converting epoch values to dates and back, or extracting a timestamp embedded in an identifier.',
        'Clock - comparing several timezones at once, timing something with a stopwatch, or counting down with an alert.',
      ],
    },
    {
      heading: 'Units are the most common bug',
      paragraphs: [
        'Nothing in an epoch number states its unit. Seconds are ten digits today, milliseconds thirteen, microseconds sixteen, nanoseconds nineteen - wide enough apart to infer, which is what the converter does. Read the wrong one and you land in 1970 or tens of thousands of years out.',
        'JWT claims use seconds. JavaScript Date uses milliseconds. Mixing them produces a token that expires in the year 50000, which is the single most common JWT bug. Name the column so the unit is unambiguous and the class of bug disappears.',
      ],
    },
    {
      heading: 'Offsets are not timezones',
      paragraphs: [
        'Storing UTC+1 for a colleague in Berlin is wrong for half the year. An offset is a value at an instant; a timezone is a rule set saying which offset applies when, and those rules change by legislation. Store an IANA identifier such as Europe/Berlin instead.',
        'The same distinction breaks schedules. A cron job set for 02:30 simply does not run on the day the clocks skip that hour, and runs twice on the day the hour repeats. Scheduling in UTC avoids both.',
      ],
    },
  ],
}
