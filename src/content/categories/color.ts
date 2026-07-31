import type { CategoryContent } from '../types'

export const colorCategory: CategoryContent = {
  updated: '2026-07-27',
  title: 'Color Tools',
  metaDescription:
    'Free online color tools: convert between HEX, RGB, HSL, OKLCH and LAB, build shade scales and CSS gradients, and check WCAG and APCA contrast.',
  intro: [
    'Four tools covering the path from a single colour to a shippable palette: convert it, expand it into a scale, blend it into a gradient, and prove the result is legible.',
    'The thread running through all of them is that sRGB and HSL are not perceptually uniform, and most colour problems in interfaces trace back to treating them as if they were.',
  ],
  sections: [
    {
      heading: 'How these tools chain together',
      paragraphs: [
        'The usual order is Color Converter to get a base colour into whatever notation you need, Palette Generator to expand it into a 50-950 scale, then Contrast Checker to confirm the text and background pairs you actually intend to ship. The Gradient Generator slots in when a surface needs a blend rather than a flat fill.',
        'Contrast is the gate at the end. A perceptually even scale makes contrast predictable but does not guarantee it - verify the specific pairs rather than trusting the spacing.',
      ],
    },
    {
      heading: 'Choosing between them',
      bullets: [
        'Color Converter - you have a colour in one notation and need it in another, with alpha preserved.',
        'Palette Generator - you have one brand colour and need the whole shade scale.',
        'Gradient Generator - linear, radial or conic blends, exported as CSS, Tailwind or SVG.',
        'Contrast Checker - WCAG 2.1 ratios and APCA lightness contrast for a foreground and background pair.',
      ],
    },
    {
      heading: 'Why HSL lightness misleads',
      paragraphs: [
        'A yellow at 50% HSL lightness and a blue at 50% look nothing alike in brightness, because the L axis is a geometric construct rather than a perceptual one. Any palette built by holding HSL lightness constant will have uneven steps, and the unevenness varies by hue.',
        'OKLCH fixes this - its lightness axis tracks perceived lightness, so equal numeric steps are equal visual steps. That is why generated scales and modern design tokens have largely moved to it, and why gradients interpolated in a perceptual space avoid the grey dead zone in the middle.',
      ],
    },
    {
      heading: 'Two contrast standards that disagree',
      paragraphs: [
        'WCAG 2.1 computes a symmetric luminance ratio, so black-on-white and white-on-black both score 21:1. APCA models perception and signs its result by polarity, scoring those same pairs around Lc 106 and Lc -108.',
        'If you have an accessibility obligation it is almost certainly written against WCAG 2.1, so that is the number that must pass. APCA is the better guide when a pair is borderline or when you are tuning a dark theme, where WCAG-passing combinations can still read poorly.',
      ],
    },
  ],
}
