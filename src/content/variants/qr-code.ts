import type { ToolVariant } from './types'

export const qrCodeVariants: Array<ToolVariant> = [
  {
    slug: 'text',
    toolId: 'qr-code',
    preset: { tab: 'text' },
    content: {
      updated: '2026-07-27',
      title: 'URL and Text QR Code Generator',
      metaDescription:
        'Generate a QR code for a link or any text online. Export SVG or PNG, choose colours and error correction, with the payload encoded directly.',
      intro: [
        'Turn a link or a block of text into a scannable code. The payload is encoded into the image itself, so there is no redirect service in the middle — the code works forever and reports nothing back to anyone.',
        'This page opens on the text and URL input.',
      ],
      sections: [
        {
          heading: 'Shorter payloads scan better',
          paragraphs: [
            'Capacity is banded. As the payload grows the symbol steps up to a higher version with more and finer modules, which is harder to read at distance or in poor light.',
            'Stripping tracking parameters off a URL frequently drops the code a version or two and visibly improves reliability. Uppercase alphanumeric text also encodes more efficiently than mixed case, which is why some printed codes use an uppercase short link.',
          ],
        },
        {
          heading: 'Error correction against payload size',
          bullets: [
            'L — about 7% recoverable, densest, fine for clean screens.',
            'M — about 15%, the sensible default for print.',
            'Q — about 25%, for surfaces that get handled.',
            'H — about 30%, and required if a logo covers the centre, since a logo is damage as far as the decoder is concerned.',
          ],
        },
        {
          heading: 'Keeping it scannable',
          paragraphs: [
            'The blank margin around the symbol is part of the specification rather than decoration, and cropping it tight is the most common reason a code fails. Keep modules dark on a light background — most scanners will not read an inverted code — and size it at roughly a tenth of the intended scanning distance.',
            'Export SVG for print so it stays sharp at any scale, PNG for screens.',
          ],
        },
        {
          heading: 'Static codes cannot be changed later',
          paragraphs: [
            'Because the payload is inside the image, a printed code points at that URL permanently. If the destination might move, encode a link you control and redirect from there.',
            'That is the one genuine advantage commercial dynamic QR services sell — and the cost is that they see every scan and can disable the code.',
          ],
        },
      ],
    },
  },
  {
    slug: 'wifi',
    toolId: 'qr-code',
    preset: { tab: 'wifi' },
    content: {
      updated: '2026-07-27',
      title: 'Wi-Fi QR Code Generator',
      metaDescription:
        'Create a Wi-Fi QR code online so guests can join a network by scanning. Supports WPA, WEP and open networks, generated entirely in your browser.',
      intro: [
        'Encode network credentials so a phone offers to join on scan. Both iOS and Android recognise the format natively, which is why this is the standard way to put guest Wi-Fi on a card without reading a password out loud.',
        'This page opens on the Wi-Fi form.',
      ],
      sections: [
        {
          heading: 'The payload format',
          paragraphs: [
            'The generated string follows a documented convention rather than being an image-only trick, so you can read it back out of any scanned code.',
          ],
          code: {
            lang: 'text',
            body: 'WIFI:T:WPA;S:NetworkName;P:password;H:false;;\n\nT  security type — WPA, WEP or nopass\nS  network name (SSID)\nP  password, omitted for open networks\nH  true when the SSID is hidden',
          },
        },
        {
          heading: 'The password is in plain sight',
          paragraphs: [
            'The credentials sit inside the code as readable text. Anyone who photographs the code has the password, and no amount of styling changes that — a printed Wi-Fi code is exactly as sensitive as the password written out longhand.',
            'For a venue, that is usually acceptable and is the point. For a network with access to anything internal, put guests on a separate SSID rather than sharing the main one.',
          ],
        },
        {
          heading: 'Details that break the scan',
          bullets: [
            'SSIDs are case-sensitive and must match exactly, including spaces.',
            'Semicolons, commas, colons and backslashes inside a name or password need escaping, which is handled for you here.',
            'Hidden networks need the hidden flag set, or the phone will not find the network after reading the code.',
            'Choosing WPA for an open network makes the join fail; use the no-password type.',
          ],
        },
      ],
    },
  },
]
