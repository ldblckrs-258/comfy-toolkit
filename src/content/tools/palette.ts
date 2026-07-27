import type { ToolContent } from '../types'

export const paletteContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'Design systems do not use one blue, they use eleven - a scale from a barely-tinted background through to a near-black text colour, all recognisably the same hue. Building that scale by hand means guessing at lightness values and usually produces steps that bunch up at one end.',
    'This tool takes a single colour and generates the whole 50-950 scale, spacing the steps by perceived lightness so the progression looks even rather than merely being numerically even.',
  ],
  sections: [
    {
      heading: 'Why the naive approach fails',
      paragraphs: [
        'The obvious method is to hold hue and saturation fixed and step lightness from 95% down to 5% in HSL. It reliably produces a bad scale: the light end is washed out and indistinguishable step to step, the dark end drops off a cliff, and the middle is muddy.',
        'The cause is that HSL lightness is not perceptual. Equal numeric steps are not equal visual steps, and the mismatch varies by hue - a yellow scale and a blue scale built the same way look nothing alike in their spacing.',
        'Generating in a perceptual space instead makes each step a genuine equal-sized visual increment, which is what makes a scale usable as a design token set.',
      ],
    },
    {
      heading: 'Reading the numbers',
      paragraphs: [
        'The 50-950 convention comes from Tailwind and has become the default vocabulary. Lower numbers are lighter. The rough division of labour holds across most design systems:',
      ],
      bullets: [
        '50-100 - page and surface backgrounds, subtle fills.',
        '200-300 - borders, dividers, disabled states.',
        '400-500 - the colour at full strength; 500 is usually the input colour.',
        '600-700 - primary buttons and links, and hover states for them.',
        '800-950 - text on light backgrounds, and high-emphasis surfaces in dark mode.',
      ],
    },
    {
      heading: 'Contrast is not automatic',
      paragraphs: [
        'A perceptually even scale makes contrast predictable but does not guarantee it. The useful rule of thumb is that steps roughly 500 apart clear WCAG AA for normal text - 700 on 100, or 800 on 200 - while neighbouring steps never will.',
        'Verify the specific pairs you intend to ship rather than trusting the spacing. A scale that looks even can still put your body text at 4.3:1.',
      ],
      code: {
        lang: 'text',
        body: 'text-900 on bg-50    high contrast, safe\ntext-700 on bg-100   usually clears AA\ntext-500 on bg-400   fails, always',
      },
    },
    {
      heading: 'Dark mode is not an inversion',
      paragraphs: [
        'Reusing the scale backwards for dark mode - swapping 50 for 950 and so on - rarely works. Saturated colours read as louder against dark backgrounds, so the mid tones that look confident on white look garish on near-black, and pure white text on a saturated surface produces uncomfortable glare.',
        'The usual correction is to shift one or two steps toward the middle and reduce chroma slightly for dark surfaces, rather than mirroring the scale exactly.',
      ],
    },
  ],
  faq: [
    {
      q: 'Which step should my brand colour land on?',
      a: 'Usually 500, and the scale is generated on that assumption. If your brand colour is unusually light or dark it may sit more honestly at 400 or 600 - anchor it where it looks like the full-strength version of the hue rather than forcing it into the middle slot.',
    },
    {
      q: 'Why do some steps look almost identical?',
      a: 'At the extremes there is genuinely less perceptual room: everything near white converges toward white. If 50 and 100 are hard to tell apart that is expected, and it is why those steps are used for backgrounds rather than anything that needs to be distinguished.',
    },
    {
      q: 'Can I use this for semantic colours too?',
      a: 'Yes, and you should - success, warning and danger each want a full scale so their backgrounds, borders and text tones stay consistent with the rest of the system. Generate each from its base hue.',
    },
    {
      q: 'How do I get these into Tailwind?',
      a: 'Paste the generated steps into your theme configuration under a named colour. Tailwind v4 reads colours from CSS custom properties, so the scale can go straight into your stylesheet as variables.',
    },
  ],
  related: [
    { id: 'colors', anchor: 'Convert a step to another colour notation' },
    {
      id: 'contrast',
      anchor: 'Verify a text and background pair from the scale',
    },
    { id: 'gradient', anchor: 'Blend two steps of the scale into a gradient' },
    { id: 'code-formatter', anchor: 'Format the exported theme configuration' },
  ],
}
