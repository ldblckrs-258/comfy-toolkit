import type { ToolContent } from '../types'

export const contrastContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'Text that a designer can read on a calibrated monitor is not necessarily text a user can read on a phone in daylight. Contrast checking replaces that judgement call with a number, and this tool reports two of them: the WCAG 2.1 ratio you are probably required to meet, and the APCA lightness contrast that models perception more accurately.',
    'Both are computed in the browser from any CSS colour you paste, with alpha composited against the background first so a semi-transparent foreground is scored on what it actually looks like.',
  ],
  sections: [
    {
      heading: 'How the WCAG ratio works',
      paragraphs: [
        'WCAG 2.1 computes relative luminance for each colour - 0 for black, 1 for white - then divides the lighter by the darker after adding 0.05 to both. The result runs from 1:1 for identical colours to 21:1 for black on white.',
        "It is symmetric: swapping foreground and background gives the same number. That is convenient arithmetic and also the formula's central weakness, because dark text on a light background and light text on a dark background do not read as equally legible to a human eye.",
      ],
      code: {
        lang: 'text',
        body: 'black on white   21.0:1   passes everything\n#777 on #fff      4.48:1  fails AA normal (needs 4.5)\nidentical colors   1.0:1   no contrast',
      },
    },
    {
      heading: 'The thresholds, and the boundaries that catch people',
      bullets: [
        '4.5:1 - AA for normal text. This is the one most audits check.',
        '3:1 - AA for large text (18pt, or 14pt bold) and for UI components and graphical objects.',
        '7:1 - AAA for normal text.',
        '4.5:1 - also AAA for large text, which is why a pair sitting exactly at 4.5 passes AA normal and AAA large simultaneously.',
      ],
      paragraphs: [
        'The boundaries are inclusive, and #777 on white at 4.48:1 is the classic near-miss: it looks fine, it is the grey everyone reaches for, and it fails AA normal by two hundredths.',
      ],
    },
    {
      heading: 'Why APCA disagrees',
      paragraphs: [
        'APCA, developed for the draft WCAG 3 guidelines, models how contrast is actually perceived rather than treating it as a luminance quotient. Its output, Lc, runs from roughly -108 to 106 and is signed by polarity: dark text on a light background is positive, light text on a dark background is negative.',
        'Black on white is about Lc 106; white on black is about Lc -108. WCAG 2.1 scores both as exactly 21:1. That asymmetry is the point - APCA captures that light-on-dark needs different treatment, which is why dark-mode palettes that pass WCAG can still read poorly.',
        'Very low contrast pairs clip to 0 rather than reporting a misleadingly small non-zero value.',
      ],
    },
    {
      heading: 'Which to follow',
      paragraphs: [
        'If you have a legal or contractual accessibility obligation, it is almost certainly written against WCAG 2.1, and that is the number that has to pass. Treat APCA as the better guide when the ratio is borderline or when you are tuning a dark theme - a pair that passes 4.5:1 but reads badly usually shows up clearly in the Lc value.',
        'When a pair fails, the tool suggests the nearest passing variant rather than leaving you to nudge hex digits, adjusting lightness while holding hue so the suggestion stays inside your palette.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does contrast apply to icons and borders?',
      a: 'Yes. WCAG 2.1 requires 3:1 for user interface components and meaningful graphics - input borders, focus rings, icon buttons. Decorative imagery is exempt, but anything a user must perceive to operate the interface is not.',
    },
    {
      q: 'How is a semi-transparent colour handled?',
      a: 'It is composited over the background before scoring, because that is what the eye sees. Checking the raw rgba value against the background without compositing gives a number that does not correspond to anything on screen.',
    },
    {
      q: 'Is large text really exempt from 4.5:1?',
      a: 'It has a lower bar of 3:1, not an exemption, and the definition is specific: at least 18pt, or 14pt when bold. Note those are points, not pixels - roughly 24px and 18.66px at a standard rendering.',
    },
    {
      q: 'Placeholder text keeps failing. Is that avoidable?',
      a: 'Only by making it darker. Placeholders are real text and are covered by the same 4.5:1 requirement, and the light greys that look right almost never pass. The usual fix is a visible label above the field and a placeholder that is genuinely optional.',
    },
  ],
  related: [
    { id: 'colors', anchor: 'Convert the failing colour to another notation' },
    { id: 'palette', anchor: 'Generate a shade scale with accessible steps' },
    { id: 'gradient', anchor: 'Check text sitting on a gradient background' },
    {
      id: 'string-inspector',
      anchor: 'Audit the text content itself rather than its colour',
    },
  ],
}
