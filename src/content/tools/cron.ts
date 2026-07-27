import type { ToolContent } from '../types'

export const cronContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'A cron expression is five fields - minute, hour, day-of-month, month, day-of-week - that together describe a recurring schedule. The syntax is terse to the point of being write-only, and a misread field means a job that runs every minute instead of once a month.',
    'This tool translates an expression into plain English, shows the next fire times, and lets you build a schedule field by field. It understands the standard Unix form plus the Quartz and node-cron dialects, which disagree with each other in ways that quietly break things.',
  ],
  sections: [
    {
      heading: 'The dialects disagree, and it matters',
      paragraphs: [
        'Standard Unix cron takes five fields and numbers day-of-week 0-6 from Sunday, accepting 7 as Sunday too. node-cron prepends an optional seconds field, making six. Quartz also uses six or seven fields - with seconds first and an optional trailing year - and, critically, numbers day-of-week 1-7 starting at Sunday.',
        'So "1" in the day-of-week field means Monday under Unix and Sunday under Quartz. Copying an expression between a crontab and a Quartz scheduler shifts every weekly job by a day. Select the right dialect here before trusting the translation.',
      ],
      code: {
        lang: 'text',
        body: '*/5 * * * *        unix, 5 fields   every 5 minutes\n0,30 * * * * *     node-cron, 6     at :00 and :30 seconds\n0 0 12 1 * ? 2027  quartz, 7        noon on the 1st, 2027 only',
      },
    },
    {
      heading: 'Field syntax',
      bullets: [
        '* - every value for the field.',
        '*/n - every nth value from the start of the range. */5 in minutes is :00, :05, :10 and so on.',
        'a-b - an inclusive range. 9-17 in hours covers nine through five.',
        'a,b,c - a specific list.',
        'Names - JAN-DEC and SUN-SAT are accepted in the month and day-of-week fields and are considerably easier to read than the numbers.',
        '@daily, @hourly, @weekly, @monthly, @yearly - macros that expand to the equivalent expression. @daily becomes midnight.',
      ],
    },
    {
      heading: 'The day-of-month and day-of-week trap',
      paragraphs: [
        'When both day fields are restricted, cron ORs them rather than ANDing them. "0 0 1 * MON" does not mean "the first of the month, if it is a Monday" - it means "the first of the month, and also every Monday". This surprises people constantly.',
        'The two fields are only ANDed when one of them is a wildcard. Quartz sidesteps the ambiguity with a ? character meaning "no specific value", which is why Quartz expressions usually have a ? in one of the two day fields.',
      ],
    },
    {
      heading: 'Timezones and the hours that do not exist',
      paragraphs: [
        'Classic cron runs in the system timezone, which is a problem twice a year. When clocks spring forward, a job scheduled for 02:30 in a zone that jumps from 02:00 to 03:00 simply does not run that day. When clocks fall back, 01:30 happens twice and the job may run twice.',
        'Scheduling in UTC avoids both. If the job must run at a particular local time, use a scheduler with explicit timezone support rather than relying on the host clock.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I run something every 90 minutes?',
      a: 'You cannot express it in one line. Cron fields have no notion of intervals crossing an hour boundary, so */90 is invalid and */1.5 is meaningless. Either use two expressions covering the alternating pattern, or schedule hourly and have the job decide whether to act.',
    },
    {
      q: 'Why did my */5 job fire at an odd minute?',
      a: 'Step values count from the start of the field range, not from when you deployed. */5 fires at :00, :05, :10 and so on regardless of the current time. If you see something else, check whether the field you edited is the minute field - miscounting field position is the most common cause.',
    },
    {
      q: 'What is the difference between 0 0 * * * and @daily?',
      a: 'Nothing - @daily expands to exactly midnight. The macros are shorthand for common expressions and are easier to read; use them where they fit.',
    },
    {
      q: 'Does the schedule account for a job that overruns?',
      a: 'Plain cron does not. If a job is still running when the next trigger arrives, cron starts another copy. Use a lockfile or a scheduler with overlap protection for anything that takes longer than its interval.',
    },
  ],
  related: [
    {
      id: 'unix-timestamp',
      anchor: 'Convert a computed run time into an epoch value',
    },
    {
      id: 'clock',
      anchor: 'Check what the schedule means in another timezone',
    },
    { id: 'regex', anchor: 'Test a pattern for validating cron strings' },
    { id: 'diff', anchor: 'Compare two crontabs to see what changed' },
  ],
}
