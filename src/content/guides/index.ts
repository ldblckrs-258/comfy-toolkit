export interface GuideMeta {
  slug: string
  title: string
  metaDescription: string
  published: string
  updated: string
  summary: string
  relatedTools: Array<string>
}

export const GUIDES: Array<GuideMeta> = [
  {
    slug: 'uuid-v7-vs-v4',
    title: 'UUID v7 vs v4: why time-ordered keys index better',
    metaDescription:
      'Why random UUID v4 primary keys hurt database write performance, how UUID v7 fixes it with a leading timestamp, and when to still prefer v4.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'Random keys scatter B-tree inserts across the index. Time-ordered keys append. The difference is measurable, and v7 gets it back without giving up offline generation.',
    relatedTools: ['uuid-generator', 'unix-timestamp'],
  },
  {
    slug: 'apca-vs-wcag-contrast',
    title: 'APCA vs WCAG 2.1: why two contrast checkers disagree',
    metaDescription:
      'WCAG 2.1 scores black-on-white and white-on-black identically. APCA does not. Which number to trust, and which one your accessibility audit uses.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'One is a symmetric luminance ratio, the other models perception and is signed by polarity. They disagree most exactly where dark mode lives.',
    relatedTools: ['contrast', 'colors', 'palette'],
  },
  {
    slug: 'invisible-unicode-in-code',
    title: 'Invisible Unicode: zero-width characters and homoglyph attacks',
    metaDescription:
      'Zero-width characters, bidirectional overrides and homoglyphs can make source code read one way and compile another. How to find them.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'Trojan Source, lookalike package names and identifiers that compare unequal while rendering identically. All invisible in an editor.',
    relatedTools: ['string-inspector', 'diff'],
  },
  {
    slug: 'epoch-seconds-vs-milliseconds',
    title: 'Seconds or milliseconds? Reading Unix timestamps correctly',
    metaDescription:
      'How to tell which unit an epoch value uses, why JWT expiry breaks so often, and how to pull creation times out of Snowflake, ObjectId and ULID.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'Nothing in the number states its unit. Digit count is the tell, and getting it wrong is the most common date bug in any codebase.',
    relatedTools: ['unix-timestamp', 'jwt-decoder', 'uuid-generator'],
  },
  {
    slug: 'oklch-for-palettes',
    title: 'Why OKLCH produces better palettes than HSL',
    metaDescription:
      'HSL lightness is not perceptual, so palettes built on it have uneven steps. How OKLCH fixes shade scales and gradient interpolation.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'A yellow and a blue at the same HSL lightness look nothing alike. That single fact explains most bad generated palettes.',
    relatedTools: ['colors', 'palette', 'gradient'],
  },
  {
    slug: 'decoding-jwt-safely',
    title: 'Decoding a JWT is not verifying it',
    metaDescription:
      'What the three segments of a JSON Web Token hold, why decoding proves nothing, and the alg confusion attacks that follow from trusting the header.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'The payload is readable by anyone. Treating a decoded claim as authenticated is the vulnerability, and it is common.',
    relatedTools: ['jwt-decoder', 'hmac', 'base64'],
  },
  {
    slug: 'md5-sha1-sha256-still-safe',
    title: 'MD5, SHA-1, SHA-256: what each is still safe for',
    metaDescription:
      'MD5 and SHA-1 are broken, and still fine for some jobs. Which uses survive, which do not, and why none of them belong near passwords.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'Broken against a deliberate attacker is not the same as useless. The question is always who you are defending against.',
    relatedTools: ['hash', 'hmac', 'secret-generator'],
  },
  {
    slug: 'cron-expressions-explained',
    title: 'Reading and writing cron expressions',
    metaDescription:
      'The five fields, the day-of-month and day-of-week OR trap, dialect differences between Unix, node-cron and Quartz, and daylight saving.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'Terse to the point of being write-only, with two genuinely surprising behaviours that bite almost everyone once.',
    relatedTools: ['cron', 'unix-timestamp', 'clock'],
  },
  {
    slug: 'base64-is-not-encryption',
    title: 'Base64 is not encryption',
    metaDescription:
      'What Base64 is actually for, the 33% size cost, why btoa breaks on emoji, and when to reach for base64url instead.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'A transport encoding that gets mistaken for a security measure roughly once per code review.',
    relatedTools: ['base64', 'url-parser', 'hash'],
  },
  {
    slug: 'choosing-a-config-format',
    title: 'JSON, YAML, TOML or CSV: choosing a config format',
    metaDescription:
      'What each format models, the Norway problem in YAML, why TOML suits config, and the conversion gotchas between all four.',
    published: '2026-07-27',
    updated: '2026-07-27',
    summary:
      'Four formats, four different sets of sharp edges. Picking deliberately saves an afternoon later.',
    relatedTools: ['data-converter', 'json-formatter', 'code-formatter'],
  },
]

export function getGuide(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

export function guidesForTool(toolId: string): Array<GuideMeta> {
  return GUIDES.filter((g) => g.relatedTools.includes(toolId))
}
