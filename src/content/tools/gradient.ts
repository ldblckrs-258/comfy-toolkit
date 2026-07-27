import type { ToolContent } from '../types'

export const gradientContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'CSS gradients are generated images, not colours, which is why they behave oddly in places a colour would work and why the syntax has more moving parts than it first appears. Writing one by hand means guessing at angles and stop positions and reloading to see the result.',
    'This tool builds linear, radial and conic gradients visually - drag the stops, watch it update - then exports the result as CSS, SCSS, Tailwind or SVG.',
  ],
  sections: [
    {
      heading: 'The three types',
      bullets: [
        'linear-gradient - colours advance along a straight line at a given angle. 0deg runs bottom to top, 90deg left to right, and the default 180deg is top to bottom.',
        'radial-gradient - colours radiate from a centre point. The shape can be a circle or an ellipse, and the size keyword decides where the final stop lands relative to the box corners.',
        'conic-gradient - colours sweep around a centre point like a clock face. This is what pie charts and colour wheels are made of, and with hard stops it produces the classic checkerboard.',
      ],
    },
    {
      heading: 'Stop order is normalised for you',
      paragraphs: [
        'CSS requires colour stops in ascending position order; a stop placed before its predecessor gets clamped rather than honoured, producing a hard edge you did not ask for.',
        'Dragging stops past each other is the natural way to work, so positions are sorted on output while the editing order you see is left alone. The exported CSS is always ascending regardless of the order you happened to create the stops in.',
      ],
      code: {
        lang: 'css',
        body: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)\nradial-gradient(circle at 50% 50%, #fff 0%, #000 100%)\nconic-gradient(from 0deg at 50% 50%, red, yellow, lime, red)',
      },
    },
    {
      heading: 'The grey dead zone',
      paragraphs: [
        'Interpolating between two saturated colours in sRGB routes the intermediate values through a desaturated middle. Blue to yellow passes through a muddy grey rather than the greens you expected, because the numeric midpoint of two RGB triples is not the perceptual midpoint.',
        'Interpolating in a perceptual space avoids it. Modern CSS supports specifying the interpolation space directly, and choosing OKLCH keeps the transition vivid across the whole ramp. Where you need the old rendering for compatibility, adding an explicit middle stop is the traditional workaround.',
      ],
    },
    {
      heading: 'Fading to transparent',
      paragraphs: [
        'A gradient ending in the keyword transparent fades through grey in browsers that interpolate premultiplied alpha inconsistently, because transparent is shorthand for rgba(0,0,0,0) - transparent black. Fading a blue into transparent therefore fades it toward black as it disappears.',
        'The fix is to end on the same colour at zero alpha rather than on the keyword. Alpha is preserved per stop and rendered in the right form for whichever output format you export to.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why does my gradient look banded?',
      a: 'Smooth ramps across a large area exceed the precision of 8-bit colour, so you see steps. Adding a very subtle noise overlay is the standard fix; shortening the distance the gradient travels also helps.',
    },
    {
      q: 'Can I animate a gradient?',
      a: 'Not the gradient itself - background-image is not interpolable, so transitions between two gradients snap. Animate background-position on an oversized gradient, or cross-fade two stacked layers with opacity.',
    },
    {
      q: 'How do I put a gradient on text?',
      a: 'Apply it as background-image, then set background-clip: text with a transparent text colour. Remember an accessible fallback colour, since the text is invisible if the background fails to paint.',
    },
    {
      q: 'What angle does 0deg mean?',
      a: 'In CSS, 0deg points upward and angles increase clockwise, so 90deg runs left to right. This differs from the convention in several design tools and SVG, which is why a gradient sometimes arrives rotated after an export.',
    },
  ],
  related: [
    { id: 'colors', anchor: 'Convert a stop colour to another notation' },
    { id: 'palette', anchor: 'Generate a scale to pick harmonious stops from' },
    { id: 'contrast', anchor: 'Check text legibility over the gradient' },
    { id: 'code-formatter', anchor: 'Format the exported CSS or SCSS' },
  ],
}
