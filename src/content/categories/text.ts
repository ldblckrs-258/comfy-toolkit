import type { CategoryContent } from '../types'

export const textCategory: CategoryContent = {
  updated: '2026-07-27',
  title: 'Text Tools',
  metaDescription:
    'Free online text tools: regex tester with live match highlighting, diff checker, Unicode and character inspector, and a live Markdown preview.',
  intro: [
    'These tools answer questions about text that you cannot answer by reading it. What exactly changed between two versions. Whether a pattern matches what you think it matches. Why two strings that look identical are not.',
    'They come into their own when the problem is invisible — and text problems usually are.',
  ],
  sections: [
    {
      heading: 'How these tools chain together',
      paragraphs: [
        'The three diagnostic tools form a natural escalation. Start with the Diff Checker when two things should be the same and are not. If the diff insists two visually identical lines differ, the String Inspector tells you why: a zero-width character, a tab where a space should be, a decomposed accent, a stray byte-order mark.',
        'The Regex Tester enters when the fix is a bulk edit rather than a manual one, and the String Inspector is also where you go when a pattern refuses to match text that clearly contains what you are searching for.',
      ],
    },
    {
      heading: 'Choosing between them',
      bullets: [
        'Diff Checker — two versions of something, and you need to know precisely what changed, by line or by character.',
        'String Inspector — counts that disagree, invisible characters, homoglyphs, or normalisation mismatches.',
        'Regex Tester — building or debugging a pattern, with live highlighting, capture groups and a replace preview.',
        'Markdown Preview — writing prose and wanting to see the rendered output as you type.',
      ],
    },
    {
      heading: 'Why character counts disagree',
      paragraphs: [
        'There is no single answer to how long a string is. A family emoji is one grapheme, several code points, and more bytes still. JavaScript reports UTF-16 units, Python reports code points, Go reports UTF-8 bytes, and a database column limit measures bytes.',
        'This is why a username that looks twenty characters long overflows a twenty-character column, and why truncating by index can split a character in half. The String Inspector reports all four counts side by side so you can see which one your constraint is actually about.',
      ],
    },
    {
      heading: 'Invisible characters are a security problem',
      paragraphs: [
        'Zero-width characters survive copy-paste into identifiers and configuration. Bidirectional control characters reorder how source code displays without changing what it compiles to, which is the basis of the Trojan Source attack. Homoglyphs let a package or domain name render identically to a trusted one while being entirely different bytes.',
        'None of these are visible in an editor. Inspecting the code points is the only reliable way to find them.',
      ],
    },
  ],
}
