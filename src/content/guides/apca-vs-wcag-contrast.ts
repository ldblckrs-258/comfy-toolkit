import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'Run the same two colours through two contrast checkers and you can get answers that disagree about whether the pair is usable. That is not a bug in either tool. WCAG 2.1 and APCA measure different things, and understanding which is which decides whether you argue with your audit or fix your palette.',
    'The practical summary: WCAG 2.1 is what you are almost certainly required to pass, and APCA is the better description of what a person can actually read.',
  ],
  sections: [
    {
      heading: 'What WCAG 2.1 computes',
      paragraphs: [
        'Take the relative luminance of each colour - a weighted sum of its linearised red, green and blue channels, running from 0 for black to 1 for white. Add 0.05 to each, divide the larger by the smaller. The result runs from 1:1 for identical colours to 21:1 for black on white.',
        'The 0.05 offset models ambient light reflecting off the screen, which is why the scale tops out at 21 rather than infinity.',
        'The formula is symmetric. Swap foreground and background and the number does not change.',
      ],
      code: {
        lang: 'text',
        body: 'black on white   21.0:1\nwhite on black   21.0:1   ← identical score\n#777 on white     4.48:1  ← fails AA normal by 0.02',
      },
    },
    {
      heading: 'The thresholds you are measured against',
      bullets: [
        '4.5:1 - AA for normal text. The one nearly every audit checks.',
        '3:1 - AA for large text, defined as 18pt, or 14pt bold. Those are points, roughly 24px and 18.7px.',
        '3:1 - also the requirement for user interface components and meaningful graphics: input borders, focus rings, icon buttons.',
        '7:1 - AAA for normal text, 4.5:1 for large.',
      ],
      paragraphs: [
        'The near-misses are what catch teams out. Mid grey on white sits at 4.48:1, which looks entirely fine and fails by two hundredths. Placeholder text fails constantly for the same reason, and placeholders are real text covered by the same rule.',
      ],
    },
    {
      heading: 'Where the symmetry breaks down',
      paragraphs: [
        'Human vision does not treat light-on-dark and dark-on-light equivalently. Light text on a dark background tends to bloom - the glyphs appear to spread slightly, thinning apparent stroke weight and reducing legibility at the same measured ratio.',
        'WCAG 2.1 cannot express this, because its formula is symmetric by construction. So a dark-mode palette can pass every threshold and still read poorly, and designers who trust the number end up shipping something uncomfortable.',
        'The formula also ignores font size and weight beyond the coarse large-text cutoff, though thin 12px text and bold 24px text at the same ratio are not remotely equally readable.',
      ],
    },
    {
      heading: 'What APCA does differently',
      paragraphs: [
        'APCA, developed for the draft WCAG 3 guidelines, estimates perceived lightness contrast rather than computing a luminance quotient. Its output, Lc, runs from about -108 to 106.',
        'The sign carries polarity: positive means dark text on a light background, negative means light on dark. Black on white is roughly Lc 106; white on black is roughly Lc -108. The magnitudes differ because the perceptual reality differs, which is exactly the information WCAG 2.1 discards.',
        'Very low contrast pairs clip to zero rather than reporting a small misleading number, so there is no false comfort at the bottom of the scale.',
      ],
    },
    {
      heading: 'Reading Lc values',
      bullets: [
        'Lc 90 and above - suitable for body text at any reasonable size.',
        'Lc 75 - a reasonable floor for normal body text.',
        'Lc 60 - acceptable for larger or heavier text, headlines and the like.',
        'Lc 45 - about the limit for large headings and non-text elements.',
        'Lc 30 and below - treat as decorative; do not rely on it being perceived.',
      ],
      paragraphs: [
        'APCA is explicitly font-aware in a way WCAG is not: its published guidance ties the required Lc to size and weight together, rather than to a single large-text cutoff.',
      ],
    },
    {
      heading: 'Which to follow',
      paragraphs: [
        'If you have a legal, contractual or procurement obligation, it is written against WCAG 2.1. That is the number that has to pass, and no amount of APCA evidence changes the requirement. Meet it first.',
        'Then use APCA as the tiebreaker. When a pair scrapes past 4.5:1 and still looks weak, the Lc value usually explains why and points at which direction to push. When you are building a dark theme, check both, because that is where the two standards diverge most.',
        'The two are not in conflict for most palettes. They disagree at the margins, and the margins are where the arguments happen.',
      ],
    },
    {
      heading: 'Practical habits',
      paragraphs: [
        'Test the actual pairs you ship, not the palette in the abstract. A perceptually even shade scale makes contrast predictable but guarantees nothing; the useful rule of thumb is that steps around 500 apart on a 50-950 scale clear AA for body text, and adjacent steps never will.',
        'Composite transparency before measuring. A semi-transparent foreground scored against the background without compositing produces a number that corresponds to nothing on screen.',
        'And remember that contrast is a floor rather than a goal. Meeting 4.5:1 exactly is a pass, not a design target.',
      ],
    },
  ],
}
