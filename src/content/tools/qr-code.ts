import type { ToolContent } from '../types'

export const qrCodeContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'A QR code is a printed data channel. It carries the payload directly - there is no server in the middle unless the payload itself is a link - which means a code you generate here works forever and reports nothing back to anyone.',
    'This tool generates codes for text, links and Wi-Fi credentials, exports SVG or PNG at your chosen size and colours, and can scan an existing image to read a code back.',
  ],
  sections: [
    {
      heading: 'Error correction is why a scuffed code still scans',
      paragraphs: [
        'QR codes use Reed-Solomon coding, so a portion of the symbol can be destroyed and the data still recovered. Four levels are available, and the choice is a direct trade against capacity.',
        'Higher correction means more modules for the same payload, so the code gets visually denser and needs to be printed larger to stay scannable.',
      ],
      bullets: [
        'L - about 7% recoverable. Densest, for clean digital display.',
        'M - about 15%. The sensible default for print.',
        'Q - about 25%. For codes on surfaces that get handled or dirty.',
        'H - about 30%. Required if you intend to put a logo over the centre, since the logo is damage as far as the decoder is concerned.',
      ],
    },
    {
      heading: 'Wi-Fi credentials have their own payload format',
      paragraphs: [
        'Both iOS and Android recognise a specific string format for network credentials and offer to join the network when it is scanned. It is the standard way to put guest Wi-Fi on a card without reading a password aloud.',
        'Note what this implies: the password is in the code as plain text. Anyone who photographs it has the credentials, so a printed code is exactly as sensitive as the password written out.',
      ],
      code: {
        lang: 'text',
        body: 'WIFI:T:WPA;S:NetworkName;P:password;H:false;;\n\nT  security type (WPA, WEP, nopass)\nS  SSID\nP  password\nH  hidden network',
      },
    },
    {
      heading: 'Keeping it scannable',
      bullets: [
        'Quiet zone - the blank margin around the symbol is part of the specification, not padding. Cropping it tight is the most common reason a code fails to scan.',
        'Contrast and polarity - dark modules on a light background. Most scanners will not read an inverted code, so a light-on-dark design is a gamble.',
        'Size - the rough guide for print is a tenth of the scanning distance. A code read from two metres wants to be about twenty centimetres across.',
        'SVG for print, PNG for screens. SVG stays sharp at any size, which matters when the code is placed into a layout at unknown scale.',
      ],
    },
    {
      heading: 'Shorter payloads make better codes',
      paragraphs: [
        'Capacity is banded: as the data grows the symbol steps up to a higher version with more modules, and the pattern becomes finer and harder to read at a distance. Trimming a long tracking query string off a URL can drop the code a version or two and visibly improve reliability.',
        'Uppercase alphanumeric text is stored more efficiently than mixed case, which is why some printed codes use an uppercase short link.',
      ],
    },
  ],
  faq: [
    {
      q: 'Do generated codes expire or get tracked?',
      a: 'Not these. The payload is encoded directly into the image, so there is no redirect service and nothing to expire. Commercial "dynamic" QR services point at their own domain and can change or disable the destination later - and count every scan.',
    },
    {
      q: 'Can I put a logo in the middle?',
      a: 'Yes, at error correction level H, covering no more than about 30% of the area. Test the result on more than one phone: the margin for error is smaller than it looks.',
    },
    {
      q: 'Why will my code not scan from a screen?',
      a: 'Usually contrast or size. Low-contrast colour pairs defeat the decoder even when they look distinct to you, and a code below roughly 200px on screen is unreliable. Keep the modules dark on a light field.',
    },
    {
      q: 'Is it safe to scan a QR code from a poster?',
      a: 'Treat it like an unknown link, because that is what it is. Codes are routinely stickered over with malicious replacements. Check the URL your phone previews before opening it.',
    },
  ],
  related: [
    {
      id: 'url-parser',
      anchor: 'Shorten and clean the URL before encoding it',
    },
    {
      id: 'colors',
      anchor: 'Pick foreground and background colours with enough contrast',
    },
    { id: 'contrast', anchor: 'Verify the colour pair is dark enough to scan' },
    { id: 'base64', anchor: 'Encode binary data for a text payload' },
  ],
}
