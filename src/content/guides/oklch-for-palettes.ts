import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'Pick a brand colour, hold its hue and saturation, and step lightness from 95% down to 5% in HSL. You will get a shade scale, and it will be bad: washed out at the top, falling off a cliff at the bottom, muddy in the middle. Do the same for a second hue and the two scales will not match each other.',
    'The cause is a single property of HSL that almost nobody is told about: its lightness axis has very little to do with how light a colour looks.',
  ],
  sections: [
    {
      heading: 'HSL lightness is geometry, not perception',
      paragraphs: [
        'HSL is a coordinate transform of RGB. Its L axis is the midpoint between the largest and smallest channel, which is a convenient number to compute and not a measurement of anything the eye does.',
        'Human vision is far more sensitive to green than to blue, and somewhat more sensitive to red than to blue. A pure yellow, which is red and green at full strength, is perceived as very bright. A pure blue is perceived as very dark. HSL assigns both a lightness of 50%.',
      ],
      code: {
        lang: 'text',
        body: 'hsl(60 100% 50%)   yellow  - looks blindingly bright\nhsl(240 100% 50%)  blue    - looks nearly black\n\nsame L value, wildly different perceived lightness',
      },
    },
    {
      heading: 'Why that ruins generated scales',
      paragraphs: [
        'If equal numeric steps are not equal perceptual steps, then a scale built on equal numeric steps has uneven perceptual spacing. Worse, the unevenness differs by hue, so a yellow scale and a blue scale generated identically will not look like siblings.',
        'That is the visible symptom people describe as a palette feeling wrong without being able to say why: the 300 and 400 steps are almost indistinguishable while 700 to 800 is a cliff, and the same numbered steps across two hues do not read as the same weight.',
      ],
    },
    {
      heading: 'What OKLCH fixes',
      paragraphs: [
        'OKLCH is a cylindrical form of the Oklab perceptual colour space. Its three components are L for perceived lightness, C for chroma, and H for hue angle.',
        'The important property is that L tracks perception. oklch(60% 0.15 60) and oklch(60% 0.15 240) genuinely look equally bright despite being different hues. Equal numeric steps in L are equal visual steps.',
        'That makes generating a scale trivially correct: hold hue, step lightness evenly, adjust chroma slightly at the extremes, and the result is even by construction rather than by hand-tuning.',
      ],
    },
    {
      heading: 'Chroma and the gamut problem',
      paragraphs: [
        'The trade-off is that OKLCH can express colours no sRGB display can produce. High chroma at extreme lightness values falls outside the gamut, and the browser clips it to something displayable.',
        'Clipping is not disastrous - it produces the nearest in-gamut colour - but it does mean two OKLCH values that differ on paper can render identically. Keep chroma modest at the very light and very dark ends, which is what a well-generated scale does anyway.',
        'Wide-gamut displays can show more of the space, which is a genuine argument for authoring in OKLCH: the same declaration produces a richer colour on hardware that can render it.',
      ],
    },
    {
      heading: 'Gradients benefit too',
      paragraphs: [
        'Interpolating between two saturated colours in sRGB routes the intermediate values through a desaturated middle. Blue to yellow passes through grey rather than through the greens you expected, because the numeric midpoint of two RGB triples is not the perceptual midpoint.',
        'Modern CSS lets you specify the interpolation space directly, and choosing OKLCH keeps the ramp vivid across its whole length. The traditional workaround - adding an explicit middle stop - becomes unnecessary.',
      ],
    },
    {
      heading: 'Adopting it without rewriting everything',
      bullets: [
        'Browser support is current across the board, so oklch() can go into production CSS directly.',
        'Where older browsers still matter, put a hex fallback declaration before the oklch() one and let the cascade sort it out.',
        'You do not need to convert existing colours by hand. Generate new scales in OKLCH and convert to hex for anywhere that needs it.',
        'Tailwind v4 reads colours from CSS custom properties, so a generated scale drops into a stylesheet as variables with no build configuration.',
      ],
    },
    {
      heading: 'What a perceptual space does not do',
      paragraphs: [
        'It does not guarantee contrast. A perceptually even scale makes contrast predictable, which is a real improvement, but you still have to check the specific text and background pairs you intend to ship.',
        'The rough guide is that steps about 500 apart on a 50-950 scale clear WCAG AA for body text, and adjacent steps never will. Verify rather than assume - an even scale that puts your body copy at 4.3:1 is even and still fails.',
      ],
    },
    {
      heading: 'Semantic colours need scales too',
      paragraphs: [
        'Success, warning and danger deserve the same treatment as the brand hue. Each needs a full range so its backgrounds, borders and text tones stay consistent with everything around them, and generating each from its base in a perceptual space keeps them visually comparable.',
        'That comparability is the part hand-picked semantic colours usually miss. A red and a green chosen independently rarely read as the same weight, so an error state shouts while a success state whispers.',
        'Generating them from the same lightness ramp fixes it without anyone having to eyeball the result.',
      ],
    },
  ],
}
