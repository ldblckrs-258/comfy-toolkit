import type { ToolContent } from '../types'

export const urlParserContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'A URL packs seven distinct components into one string, and the delimiters between them are also legal characters inside them. That tension is where the bugs live: a query parameter containing an ampersand, a redirect target containing a question mark, a path segment containing a slash.',
    'This tool breaks a URL into its parts, lets you edit the query parameters as a list rather than as text, and percent-encodes or decodes any string you give it.',
  ],
  sections: [
    {
      heading: 'The components',
      code: {
        lang: 'text',
        body: 'https://user@api.example.com:8443/v2/items?tag=a&tag=b#top\n└─┬─┘  └┬─┘ └──────┬───────┘└┬─┘└──┬──┘└────┬────┘└┬┘\nscheme user     host        port  path    query   fragment',
      },
      paragraphs: [
        'The fragment never reaches the server - browsers strip it before sending the request. Anything after # is purely client-side, which is why putting a token there is different from putting it in the query string, and why analytics that read fragments have to run in the browser.',
      ],
    },
    {
      heading: 'Three different encodings, and picking the wrong one',
      bullets: [
        'encodeURIComponent - escapes the delimiters too, including & = ? / #. This is what you want for a single parameter value.',
        'encodeURI - leaves the delimiters alone because it is meant for whole URLs. Using it on a value lets an embedded & split your query string into extra parameters.',
        'Form encoding - as used by application/x-www-form-urlencoded, which additionally encodes a space as + rather than %20.',
      ],
      paragraphs: [
        'The classic failure is encoding a redirect URL with encodeURI and watching its query parameters merge into the outer URL. The classic decoding failure is the mirror image: a literal + in a decoded value that should have been a space, or a space that should have been a plus.',
      ],
    },
    {
      heading: 'Repeated parameters have no standard meaning',
      paragraphs: [
        'Nothing in the URL specification says what ?tag=a&tag=b means. Frameworks disagree: some give you the first value, some the last, some an array. PHP historically wanted tag[]=a&tag[]=b; Rails uses the same bracket convention; Express returns an array.',
        'Editing parameters as a list here keeps duplicates visible and in order instead of silently collapsing them, so you can see exactly what the server will receive and decide what your own parser should do with it.',
      ],
    },
    {
      heading: 'Why query strings leak',
      paragraphs: [
        'The full URL, query string included, is written to server access logs, sent in the Referer header to third-party origins, stored in browser history, and often captured by analytics. That makes the query string a poor place for a session token, a password reset code or a personal identifier - none of which are protected by HTTPS once logged at either end.',
        'Sensitive values belong in a request body or a header. If a one-time code must travel in a URL, make it single-use and short-lived, and expect it to appear in a log somewhere.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is there a maximum URL length?',
      a: 'Not in the specification, but there is in practice. Browsers and servers impose their own limits and roughly 2,000 characters is the widely used safe ceiling. Beyond that, use a POST body.',
    },
    {
      q: 'Why does my URL show percent signs after encoding twice?',
      a: 'Double encoding. The % of an existing escape sequence is itself escaped to %25, so %20 becomes %2520. Decode back to a clean value and encode exactly once - usually the fix is removing an encode step that a framework was already doing.',
    },
    {
      q: 'Are URLs case-sensitive?',
      a: 'Partly. Scheme and host are case-insensitive; path, query and fragment are case-sensitive. So HTTPS://EXAMPLE.COM/Path and https://example.com/Path are the same URL, but changing Path to path may not be.',
    },
    {
      q: 'What are punycode domains?',
      a: 'An ASCII encoding of internationalised domain names, prefixed xn--. It is how non-Latin domains travel through DNS, and it is also how homograph attacks work - a domain that renders like a familiar brand can be an entirely different punycode string underneath.',
    },
  ],
  related: [
    {
      id: 'base64',
      anchor: 'Base64-encode a value before putting it in a URL',
    },
    {
      id: 'string-inspector',
      anchor: 'Check a decoded value for hidden characters',
    },
    { id: 'qr-code', anchor: 'Turn the finished URL into a QR code' },
    { id: 'jwt-decoder', anchor: 'Decode a token found in a query parameter' },
  ],
}
