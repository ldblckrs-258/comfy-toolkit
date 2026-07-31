import type { ToolVariant } from './types'

export const urlParserVariants: Array<ToolVariant> = [
  {
    slug: 'parse',
    toolId: 'url-parser',
    preset: { mode: 'parse' },
    content: {
      updated: '2026-07-27',
      title: 'URL Parser',
      metaDescription:
        'Parse a URL online into scheme, host, port, path, query and fragment, and edit query parameters as a list instead of as text.',
      intro: [
        'Break a URL into its parts and edit the query string as a list of key-value pairs rather than as one long line. Useful when a URL is long enough that finding the parameter you care about by reading is impractical.',
        'This page opens in parse mode.',
      ],
      sections: [
        {
          heading: 'The parts, and which ones travel',
          paragraphs: [
            'Scheme, host, port, path, query and fragment each get their own field. The fragment is worth singling out: everything after # is stripped by the browser before the request is sent, so it never reaches the server. Anything you need server-side belongs in the path or query.',
          ],
          code: {
            lang: 'text',
            body: 'https://api.example.com:8443/v2/items?tag=a&tag=b#top\n└─┬─┘  └──────┬───────┘└┬─┘└──┬──┘└────┬────┘└┬┘\nscheme     host      port  path   query   fragment',
          },
        },
        {
          heading: 'Repeated parameters are preserved',
          paragraphs: [
            'Nothing in the URL spec defines what ?tag=a&tag=b means, and frameworks disagree - some hand you the first value, some the last, some an array. Duplicates are kept visible and in order here rather than silently collapsed, so you can see exactly what a server will receive.',
          ],
        },
        {
          heading: 'Case sensitivity is not uniform',
          paragraphs: [
            'Scheme and host are case-insensitive; path, query and fragment are not. So HTTPS://EXAMPLE.COM/Path and https://example.com/Path are the same URL, while changing Path to path may well be a different resource.',
          ],
        },
        {
          heading: 'Relative URLs need a base',
          paragraphs: [
            'A path on its own is not a URL and cannot be parsed into host and scheme without knowing what it is relative to. Resolution against a base is a separate step, and the rules for how .. and a leading slash behave are less obvious than they look.',
            'Supply the absolute form when you want a full breakdown.',
          ],
        },
      ],
    },
  },
  {
    slug: 'encode',
    toolId: 'url-parser',
    preset: { mode: 'encode' },
    content: {
      updated: '2026-07-27',
      title: 'URL Encoder and Decoder',
      metaDescription:
        'Percent-encode and decode text online for URLs and query strings, with the component and full-URL variants kept separate so delimiters survive.',
      intro: [
        'Percent-encode a value so it can travel inside a URL, or decode one you have received. This page opens in encode mode.',
        'The distinction that matters is whether you are encoding a single value or a whole URL, because the two escape different characters and picking wrong is the classic source of broken redirect links.',
      ],
      sections: [
        {
          heading: 'Component versus whole URL',
          bullets: [
            'Encode component - escapes the delimiters too, including & = ? / and #. This is what a single parameter value needs.',
            'Encode URL - leaves delimiters intact because it is meant for a complete URL. Applying it to a value lets an embedded & split your query string into extra parameters.',
            'Decode component and decode URL - the matching inverses.',
          ],
          paragraphs: [
            'A redirect target is the case that catches everyone: it is a URL, but as a parameter value it must be component-encoded, or its own query string merges into the outer one.',
          ],
        },
        {
          heading: 'Plus signs and spaces',
          paragraphs: [
            'Form encoding writes a space as +, while percent-encoding writes it as %20. Decode with the wrong convention and a literal plus becomes a space, or a space stays a plus. If a value arrived from a submitted HTML form, expect the plus convention.',
          ],
        },
        {
          heading: 'Double encoding',
          paragraphs: [
            'Encoding an already-encoded value escapes its percent signs, so %20 becomes %2520. When you see that pattern, something in the chain is encoding twice - usually a framework that already handled it. Decode back to a clean value and encode exactly once.',
          ],
        },
        {
          heading: 'Reserved characters differ by position',
          paragraphs: [
            'A character can be legal in one part of a URL and reserved in another. A question mark inside a path segment must be escaped; the one introducing the query must not be. A slash separates path segments but is ordinary data inside a parameter value.',
            'This is why one universal escaping rule does not exist, and why the component and whole-URL variants are separate operations.',
          ],
        },
      ],
    },
  },
]
