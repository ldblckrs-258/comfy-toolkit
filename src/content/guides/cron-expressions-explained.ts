import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'Cron syntax is compact to the point of being write-only. Five fields, a handful of operators, and two behaviours that are genuinely surprising rather than merely terse.',
    'Most cron bugs are not typos. They are one of a small set of misunderstandings, and knowing them is most of what you need.',
  ],
  sections: [
    {
      heading: 'The five fields',
      code: {
        lang: 'text',
        body: '*/5 9-17 * * 1-5\n │    │   │ │  └ day of week (0-6, Sunday = 0)\n │    │   │ └── month (1-12)\n │    │   └──── day of month (1-31)\n │    └──────── hour (0-23)\n └───────────── minute (0-59)\n\nevery 5 minutes, 9am to 5pm, Monday to Friday',
      },
      paragraphs: [
        'Names are accepted in the month and day-of-week fields - JAN through DEC, SUN through SAT - and are worth using. An expression reading MON-FRI is self-documenting in a way 1-5 is not.',
      ],
    },
    {
      heading: 'The operators',
      bullets: [
        '* - every value in the field.',
        '*/n - every nth value counting from the start of the range, not from now. */5 in minutes fires at :00, :05, :10 regardless of when you deployed.',
        'a-b - an inclusive range.',
        'a,b,c - an explicit list.',
        '@daily, @hourly, @weekly, @monthly, @yearly - macros expanding to the obvious expressions. @reboot runs once at startup.',
      ],
    },
    {
      heading: 'The two day fields are ORed',
      paragraphs: [
        'This is the behaviour that catches almost everyone. When both day-of-month and day-of-week are restricted, cron runs the job if either matches, not both.',
        'So 0 0 1 * MON does not mean "the first of the month, if it is a Monday". It means "the first of the month, and additionally every Monday" - roughly five times more often than intended.',
        'The two fields combine as you would expect only when one of them is a wildcard. There is no syntax in standard cron for the AND case; you have to check the date inside the job itself.',
      ],
    },
    {
      heading: 'Intervals that do not divide the hour',
      paragraphs: [
        'Cron fields have no concept of an interval crossing a boundary. There is no way to express "every 90 minutes" in a single expression, because */90 in a field that runs 0-59 is meaningless.',
        'A */7 in the minutes field is a subtler version of the same problem: it fires at :00, :07 … :56, then the hour rolls over and it fires at :00 again, seven minutes after :56 became four. The interval is not actually uniform.',
        'For anything that must be evenly spaced across hour boundaries, either enumerate the times explicitly or schedule frequently and have the job decide whether to act.',
      ],
    },
    {
      heading: 'The dialects disagree',
      paragraphs: [
        'Standard Unix cron takes five fields and numbers day-of-week from 0 at Sunday. node-cron prepends an optional seconds field, making six, and keeps the Unix numbering. Quartz also takes six or seven fields with seconds first and an optional trailing year - but numbers day-of-week from 1 at Sunday.',
        'So the digit 1 in day-of-week means Monday under Unix and Sunday under Quartz. Copying a weekly job between a crontab and a Quartz scheduler shifts it by a day, and nothing errors.',
        'Quartz also resolves the day-field ambiguity explicitly with ?, meaning "no specific value", which is required in whichever day field you are not using. That is why almost every Quartz expression has a ? in one of the two positions.',
      ],
      code: {
        lang: 'text',
        body: 'unix    0 9 * * 1      Monday 09:00\nquartz  0 0 9 ? * 2    Monday 09:00\nquartz  0 0 9 ? * 1    Sunday 09:00',
      },
    },
    {
      heading: 'Quartz-only operators',
      paragraphs: [
        'Quartz adds operators that express rules plain cron cannot. L means last, so L in day-of-month is the final day of the month and 6L is the last Friday. W finds the nearest weekday to a date, useful for "run on the 1st, or the following Monday if that is a weekend". The # operator selects an ordinal weekday, so 6#3 is the third Friday.',
        'Needing any of these is usually the reason a project reaches for Quartz rather than crontab in the first place.',
      ],
    },
    {
      heading: 'Daylight saving eats jobs',
      paragraphs: [
        'Classic cron runs in the system timezone. On the day clocks spring forward, the hour between 02:00 and 03:00 does not exist, so a job scheduled for 02:30 does not run at all. On the day they fall back, 01:30 happens twice and the job may run twice.',
        'Scheduling in UTC avoids both entirely, and is the right default for anything that does not need to align with human working hours. Where local time genuinely matters, use a scheduler with explicit timezone support rather than relying on the host clock.',
      ],
    },
    {
      heading: 'Operational details that bite',
      bullets: [
        'Cron runs with a minimal environment. A job that works in your shell and fails under cron is nearly always missing PATH or a variable your profile sets.',
        'Overlapping runs are not prevented. If a job outlives its interval, cron starts another copy. Use a lockfile or a runner with overlap protection.',
        'Output goes to mail by default, which on most modern hosts means nowhere. Redirect stdout and stderr somewhere you will actually look.',
        'A missed run is not retried. If the machine was down at the scheduled time, that execution simply did not happen.',
      ],
    },
  ],
}
