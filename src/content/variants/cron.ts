import type { ToolVariant } from './types'

export const cronVariants: Array<ToolVariant> = [
  {
    slug: 'unix',
    toolId: 'cron',
    preset: { dialect: 'unix' },
    content: {
      updated: '2026-07-27',
      title: 'Unix Crontab Expression Parser',
      metaDescription:
        'Translate a standard five-field crontab expression to plain English and see its next run times. Opens in the Unix dialect.',
      intro: [
        'The five-field form you put in a crontab: minute, hour, day of month, month, day of week. This page opens with the Unix dialect selected, so day-of-week is numbered 0-6 from Sunday and 7 is accepted as Sunday too.',
        'Paste an expression to get a plain-English reading and the next fire times.',
      ],
      sections: [
        {
          heading: 'The fields',
          code: {
            lang: 'text',
            body: '*/5 9-17 * * 1-5\n │    │   │ │  └ day of week (0-6, Sun=0)\n │    │   │ └── month (1-12)\n │    │   └──── day of month (1-31)\n │    └──────── hour (0-23)\n └───────────── minute (0-59)',
          },
          paragraphs: [
            'Names work too and read far better than numbers: JAN-DEC in the month field, SUN-SAT in day of week.',
          ],
        },
        {
          heading: 'The two day fields are ORed, not ANDed',
          paragraphs: [
            'When both day-of-month and day-of-week are restricted, cron runs the job if either matches. So 0 0 1 * MON means the first of the month and also every Monday - not "the first, when it falls on a Monday". They combine as you would expect only when one of the two is a wildcard.',
            'This surprises people constantly, and it is the reason Quartz introduced a separate no-value marker.',
          ],
        },
        {
          heading: 'Daylight saving eats jobs',
          paragraphs: [
            'Classic cron runs in the system timezone. A job scheduled for 02:30 does not run at all on the day the clocks skip that hour, and may run twice on the day the hour repeats. Scheduling in UTC avoids both, or use a scheduler with explicit timezone support.',
          ],
        },
        {
          heading: 'Special strings and environment',
          paragraphs: [
            'A crontab also accepts shorthand macros: @daily, @hourly, @weekly, @monthly, @yearly and @reboot. They expand to ordinary expressions and are considerably easier to read than the numeric equivalents.',
            'Remember that cron runs with a minimal environment. A job that works in your shell and fails under cron is nearly always missing PATH or a variable your profile sets.',
          ],
        },
      ],
    },
  },
  {
    slug: 'node-cron',
    toolId: 'cron',
    preset: { dialect: 'node-cron' },
    content: {
      updated: '2026-07-27',
      title: 'node-cron Expression Parser',
      metaDescription:
        'Parse a six-field node-cron expression with seconds precision, see it in plain English, and preview the next run times.',
      intro: [
        'node-cron accepts an optional leading seconds field, making six fields in total. This page opens in that dialect, so the first number is seconds rather than minutes.',
        'Misreading which field is which is the single most common cause of a job that fires sixty times more often than intended.',
      ],
      sections: [
        {
          heading: 'Six fields, seconds first',
          code: {
            lang: 'text',
            body: '0,30 * * * * *   at :00 and :30 of every minute\n*/5 * * * * *    every 5 seconds\n0 */5 * * * *    every 5 minutes, on the minute',
          },
          paragraphs: [
            'The middle example is the trap. Written in five-field Unix form, */5 in the leading position means every five minutes. Here it means every five seconds.',
          ],
        },
        {
          heading: 'Day-of-week numbering matches Unix',
          paragraphs: [
            'Unlike Quartz, node-cron keeps the Unix convention of 0-6 starting at Sunday. So an expression copied from a crontab keeps working when a seconds field is prepended, which is not true of a copy into Quartz.',
          ],
        },
        {
          heading: 'Second-level schedules deserve scrutiny',
          paragraphs: [
            'A job firing every few seconds will overlap itself the moment it takes longer than its interval, and the scheduler will happily start another copy. Add a lock, or use a runner with overlap protection, before scheduling anything below about a minute.',
          ],
        },
        {
          heading: 'Timezone support is explicit',
          paragraphs: [
            'node-cron accepts a timezone option per scheduled task rather than inheriting the system clock, which sidesteps the daylight saving problem that breaks plain crontab entries twice a year.',
            'Set it explicitly even when the server is already on UTC. A future migration to a differently configured host is exactly when an implicit assumption becomes an incident.',
          ],
        },
      ],
    },
  },
  {
    slug: 'quartz',
    toolId: 'cron',
    preset: { dialect: 'quartz' },
    content: {
      updated: '2026-07-27',
      title: 'Quartz Cron Expression Parser',
      metaDescription:
        'Parse a Quartz cron expression, including the seconds field, the ? no-value marker and the optional year. Day of week is numbered 1-7 from Sunday.',
      intro: [
        'Quartz, used by the Java scheduler of the same name and by several cloud schedulers, takes six or seven fields with seconds first and an optional trailing year.',
        'This page opens in the Quartz dialect, which matters most for day-of-week: Quartz numbers it 1-7 starting at Sunday, so the same digit means a different day than it does in Unix cron.',
      ],
      sections: [
        {
          heading: 'The numbering difference that shifts every weekly job',
          paragraphs: [
            'In Unix cron, 1 in the day-of-week field is Monday. In Quartz, 1 is Sunday. Copying a weekly expression between a crontab and a Quartz scheduler without adjusting shifts the job by a day, and nothing errors - it simply runs on the wrong day.',
          ],
          code: {
            lang: 'text',
            body: 'unix    0 9 * * 1     Monday 09:00\nquartz  0 0 9 ? * 1   Sunday 09:00\nquartz  0 0 9 ? * 2   Monday 09:00',
          },
        },
        {
          heading: 'The ? marker',
          paragraphs: [
            'Quartz resolves the day-field ambiguity explicitly: ? means "no specific value" and is required in whichever of day-of-month or day-of-week you are not using. That is why almost every Quartz expression has a ? in one of the two positions, and why an expression with * in both is usually rejected.',
          ],
        },
        {
          heading: 'The optional year',
          paragraphs: [
            'A seventh field pins the schedule to specific years, which is occasionally useful for a one-off migration window and otherwise best left off. An expression ending in a four-digit number is using it.',
          ],
        },
        {
          heading: 'Extra field syntax',
          paragraphs: [
            'Quartz adds operators the Unix dialect lacks. L means last, so L in day-of-month is the final day of the month and 6L is the last Friday. W finds the nearest weekday to a given date, and # selects an ordinal weekday, so 6#3 is the third Friday.',
            'These cover scheduling rules that plain cron simply cannot express, which is usually the reason a project reaches for Quartz in the first place.',
          ],
        },
      ],
    },
  },
]
