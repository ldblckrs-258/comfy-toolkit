import type { CategoryContent } from '../types'

export const generatorsCategory: CategoryContent = {
  updated: '2026-07-27',
  title: 'Generator Tools',
  metaDescription:
    'Free online generators for UUIDs, cryptographic secrets and API keys, cron schedules and QR codes. Produced locally in your browser and never transmitted.',
  intro: [
    'Generators produce something that did not exist before: an identifier, a secret, a schedule, an image. What separates a good one from a dangerous one is where the randomness comes from and whether the output ever leaves your machine.',
    'Everything here draws on the platform cryptographic random number generator rather than Math.random, and nothing generated is transmitted.',
  ],
  sections: [
    {
      heading: 'How these tools chain together',
      paragraphs: [
        'A typical service needs all four. Records get UUID v7 identifiers so they sort by creation time and index well. The service authenticates with keys from the Secret Generator. Its background work runs on a schedule written with the Cron tool. And anything a user has to reach from a physical surface gets a QR code.',
        'The identifier and schedule tools also pair with the date group: a v7 UUID carries a timestamp you can read back, and a cron expression resolves to concrete run times you may want as epoch values.',
      ],
    },
    {
      heading: 'Choosing between them',
      bullets: [
        'UUID v7 Generator — database keys and event identifiers, where time ordering improves index locality.',
        'Secret / Key Generator — API keys, signing secrets, passwords and tokens.',
        'Cron Expression — recurring schedules, in Unix, node-cron or Quartz dialects.',
        'QR Code Generator — links, text and Wi-Fi credentials, exported as SVG or PNG.',
      ],
    },
    {
      heading: 'Randomness is the whole game',
      paragraphs: [
        'A secret is only as strong as the entropy behind it, and a weak one is indistinguishable from a strong one by eye. Math.random is a fast pseudo-random generator whose internal state can be reconstructed from its output; using it for a key is a real vulnerability rather than a theoretical one.',
        'The practical floor is 128 bits for anything long-lived and 256 for keys that protect other keys. Encoding does not change entropy — a 32-byte value is 256 bits whether you write it as hex, Base64 or raw bytes. For a secret a human must type, a machine-chosen passphrase of six words beats a short scramble of punctuation.',
      ],
    },
    {
      heading: 'Identifiers leak more than you expect',
      paragraphs: [
        'Time-ordered identifiers disclose when a record was created, and comparing two of them reveals ordering and volume. That is usually fine internally and occasionally a problem in a public API. Where it matters, keep the time-ordered key internal and expose a separate random identifier.',
      ],
    },
  ],
}
