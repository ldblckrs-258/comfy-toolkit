import type { ToolContent } from '../types'

export const colorsContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'The same colour has a different name in every notation. A designer hands over HEX, a print spec wants CMYK, a CSS variable reads better in HSL, and a modern palette is easier to reason about in OKLCH. Converting between them by hand is tedious and easy to get subtly wrong.',
    'This tool shows every notation at once for whatever you paste or pick, keeping alpha intact, so you can copy the one your stylesheet needs without a round trip.',
  ],
  sections: [
    {
      heading: 'The notations, and what each is good for',
      bullets: [
        'HEX - compact and universal. Accepts 3- and 6-digit forms, plus the 4- and 8-digit variants that carry alpha.',
        'RGB - the same values in decimal. Useful when you need to compute with the channels.',
        'HSL - hue, saturation, lightness. Readable, and the usual choice for CSS custom properties because adjusting one axis is intuitive.',
        'HSV - hue, saturation, value. What colour pickers are built on; the difference from HSL trips people up constantly.',
        'CMYK - subtractive, for print. Any conversion from RGB is an approximation without a colour profile.',
        'HWB - hue with whiteness and blackness. Easy to reason about for tints and shades.',
        'OKLCH and LAB - perceptually uniform spaces where equal numeric steps look like equal visual steps.',
      ],
    },
    {
      heading: 'Why hue survives a round trip',
      paragraphs: [
        'Greys and blacks have no meaningful hue - every hue produces the same RGB when saturation is zero. A naive converter recomputes hue from RGB on every edit, so dragging a colour picker down to black and back up again loses the hue you started from and snaps to red.',
        'This tool carries the previous hue forward when converting back from RGB, so pulling saturation to zero and raising it again returns the colour you had. It sounds like a detail until you have lost a palette to it.',
      ],
    },
    {
      heading: 'OKLCH is worth the switch',
      paragraphs: [
        'HSL lightness is not perceptual. hsl(60 100% 50%) is a blazing yellow and hsl(240 100% 50%) is a dark blue, despite both claiming 50% lightness. Any palette built by holding HSL lightness constant will have wildly uneven steps.',
        'OKLCH fixes this: its L axis tracks perceived lightness, so oklch(60% 0.15 60) and oklch(60% 0.15 240) genuinely look equally bright. This is why generated shade scales and accessible palettes have largely moved to it.',
        'The trade-off is gamut. OKLCH can express colours no sRGB display can show, so high-chroma values get clipped on output.',
      ],
      code: {
        lang: 'text',
        body: '#3b82f6\nrgb(59 130 246)\nhsl(217 91% 60%)\noklch(62% 0.19 260)',
      },
    },
    {
      heading: 'Alpha across notations',
      paragraphs: [
        'Transparency is spelled differently everywhere: an 8-digit hex, a fourth argument in rgb() and hsl(), a slash in the modern CSS syntax, and not at all in CMYK. Alpha is preserved through conversion and rendered in whichever form the target notation uses, so a semi-transparent colour does not silently become opaque when you switch representations.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the difference between HSL and HSV?',
      a: 'In HSL, lightness 100% is always white and 50% is the pure hue. In HSV, value 100% is the pure hue at full brightness and white only appears when saturation drops to zero. Colour pickers usually expose HSV; CSS uses HSL. Feeding one into the other is a common source of wrong colours.',
    },
    {
      q: 'Why does my CMYK conversion not match my printer?',
      a: 'Because accurate conversion needs an ICC profile for the specific paper and press. RGB is additive light and CMYK is subtractive ink, and the gamuts only partly overlap. Treat the values here as a starting point, not a proof.',
    },
    {
      q: 'Should I use OKLCH in production CSS?',
      a: 'Yes for most projects - it is supported across current browsers. If you still support older ones, supply a hex fallback before the oklch() declaration and let the cascade handle it.',
    },
    {
      q: 'Are 3-digit hex codes exactly equivalent to 6-digit?',
      a: 'Each digit is doubled, so #f80 is exactly #ff8800. Only colours whose channel pairs happen to repeat can be written in shorthand; #ff8801 has no 3-digit form.',
    },
  ],
  related: [
    { id: 'palette', anchor: 'Build a full shade scale from this colour' },
    {
      id: 'contrast',
      anchor: 'Check whether this colour is legible on your background',
    },
    { id: 'gradient', anchor: 'Blend this colour into a gradient' },
    { id: 'qr-code', anchor: 'Apply the colour to a generated QR code' },
  ],
}
