import type { ToolContent } from '../types'

export const clockContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'Three things that are usually three separate tabs: what time is it for the people I work with, how long has this been running, and tell me when the time is up. This page holds all three.',
    'The world clock tracks several timezones at once, the stopwatch records laps, and the countdown timer can raise a notification when it finishes - including after you have switched to another tab.',
  ],
  sections: [
    {
      heading: 'Timezones are not fixed offsets',
      paragraphs: [
        'Storing "UTC+1" for a colleague in Berlin is wrong for roughly half the year. An offset is a value at an instant; a timezone is a rule set that says which offset applies when, and those rules change by legislation with little notice.',
        'That is why the correct identifier is a region name such as Europe/Berlin rather than an offset or an abbreviation. Abbreviations are worse than they look - IST means Indian, Irish or Israel Standard Time depending on context, and CST is used for both North American Central and China Standard Time.',
        'Zones here are IANA identifiers resolved through the browser, so daylight saving transitions are applied according to the current rule set rather than a hardcoded offset.',
      ],
    },
    {
      heading: 'What the stopwatch measures',
      paragraphs: [
        'Elapsed time is computed from timestamp differences rather than by counting interval ticks. That distinction matters: browsers throttle timers in background tabs to save power, so a stopwatch that increments a counter every 100ms falls progressively behind while you are looking at something else.',
        'Reading the clock instead means the elapsed value is correct when you return regardless of how long the tab was backgrounded, and laps record the true split rather than an accumulated drift.',
      ],
    },
    {
      heading: 'Countdown notifications',
      paragraphs: [
        'A timer is only useful if it can interrupt you, which requires browser notification permission - the prompt appears the first time you arm one. Without permission the timer still runs and still shows a finished state, it simply cannot get your attention while the tab is hidden.',
        'Clicking the resulting notification focuses an existing tab if one is open rather than spawning a duplicate.',
      ],
    },
    {
      heading: 'Practical scheduling across zones',
      bullets: [
        'Agree meetings in UTC when the participants span more than two zones, and let each person convert.',
        'Watch the transition weeks. The US and Europe change clocks on different dates, so a call that is normally 09:00 to 15:00 drifts by an hour for two or three weeks each spring and autumn.',
        'Some zones use 30- and 45-minute offsets - India at +05:30, Nepal at +05:45. Assuming whole hours breaks arithmetic for a lot of people.',
        'Half the world does not observe daylight saving at all, so a fixed difference to a colleague is only fixed if neither of you changes.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does the stopwatch keep running if I close the tab?',
      a: 'No. Closing the tab ends the session. Switching to another tab or another application is fine - elapsed time is derived from wall-clock timestamps, so backgrounding does not cause drift.',
    },
    {
      q: 'Why did my timer notification not appear?',
      a: 'Either notification permission was declined, or the operating system is suppressing them - macOS Focus modes and Windows Focus Assist both hold browser notifications silently. Check the OS setting before the browser one.',
    },
    {
      q: 'What is the difference between UTC and GMT?',
      a: 'For everyday purposes nothing; they name the same instant. UTC is the modern atomic standard and the one to use in writing. GMT is also a civil timezone in the UK, which observes British Summer Time in summer, so "GMT" in a calendar invite is ambiguous in a way UTC is not.',
    },
    {
      q: 'How should I store a timestamp in a database?',
      a: 'As UTC, and separately store the timezone if the local wall-clock time carries meaning - a recurring 09:00 alarm has to survive a daylight saving change, which a stored UTC instant will not do on its own.',
    },
  ],
  related: [
    {
      id: 'unix-timestamp',
      anchor: 'Convert a displayed time to an epoch value',
    },
    { id: 'cron', anchor: 'Schedule a recurring job at one of these times' },
    { id: 'uuid-generator', anchor: 'Generate a time-ordered identifier' },
    { id: 'diff', anchor: 'Compare two logs recorded in different zones' },
  ],
}
