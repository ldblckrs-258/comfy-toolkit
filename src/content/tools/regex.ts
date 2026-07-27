import type { ToolContent } from '../types'

export const regexContent: ToolContent = {
  updated: '2026-07-27',
  intro: [
    'Regular expressions fail quietly. A pattern that matches your three test strings can miss a fourth, match something it should not, or hang the page on a long input - and reading the pattern rarely tells you which.',
    'This tool highlights every match live as you type, breaks out the capture groups, and previews replacements. Matching runs in a Web Worker, so a pattern that backtracks catastrophically stalls the worker rather than freezing the tab.',
  ],
  sections: [
    {
      heading: 'Flags change the meaning more than the syntax does',
      bullets: [
        'g - find every match rather than stopping at the first. Required for replace-all.',
        'i - case-insensitive.',
        'm - makes ^ and $ match at line boundaries instead of only at the start and end of the whole string.',
        's - makes . match newlines, which it otherwise does not. This is the reason a pattern works on one line and fails across two.',
        'u - enables full Unicode handling, so astral characters and \\p{...} property escapes work correctly.',
      ],
    },
    {
      heading: 'Greedy, lazy, and the tag-matching trap',
      paragraphs: [
        'Quantifiers are greedy by default: they consume as much as possible and give back only when the match would otherwise fail. Applied to <.+> against a line containing two tags, that means one match spanning from the first < to the last >.',
        'Adding ? makes a quantifier lazy, so <.+?> stops at the first closing bracket and matches each tag separately. Often the better answer is neither, but a negated character class - <[^>]+> says what you mean directly and does not backtrack.',
      ],
      code: {
        lang: 'text',
        body: 'input   <b>bold</b> and <i>italic</i>\n<.+>    → one match: <b>bold</b> and <i>italic</i>\n<.+?>   → four matches: <b> </b> <i> </i>\n<[^>]+> → four matches, no backtracking',
      },
    },
    {
      heading: 'Catastrophic backtracking',
      paragraphs: [
        'Nested quantifiers over overlapping character sets - the classic (a+)+ shape - can force the engine to try an exponential number of ways to split the input before concluding there is no match. Twenty characters can take longer than the heat death of the universe.',
        'This is a live denial-of-service class, ReDoS, whenever a user-supplied string meets a vulnerable pattern on a server. The defences are to avoid nesting quantifiers, prefer explicit negated classes over . , and anchor patterns so failure is detected early. Running matches off the main thread, as this tool does, contains the symptom locally but is not a fix for a pattern you ship.',
      ],
    },
    {
      heading: 'Named groups and lookaround',
      paragraphs: [
        '(?<year>\\d{4}) captures into a name rather than a number, so reordering the pattern does not silently break the code reading groups[3]. Replacements can reference it as $<year>.',
        'Lookahead (?=...) and lookbehind (?<=...) assert that something does or does not follow or precede the match without consuming it. They are how you match a word only when it is not inside quotes, or a number only when it is followed by a unit.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why does my pattern work here but not in my language?',
      a: "Dialects differ. This tool uses the JavaScript engine. PCRE, Python and Go all diverge on lookbehind support, named-group syntax and Unicode property escapes - Go's RE2 deliberately omits backreferences and lookaround entirely in exchange for guaranteed linear time.",
    },
    {
      q: 'Should I validate email addresses with a regex?',
      a: 'Only loosely. The grammar in RFC 5322 permits far more than people expect, and the fully correct pattern is thousands of characters and still accepts undeliverable addresses. Check for an @ with something either side, then send a confirmation email - that is the only real validation.',
    },
    {
      q: 'How do I match across multiple lines?',
      a: 'Two different flags, commonly confused. The s flag lets . match newline characters. The m flag changes what ^ and $ anchor to. If a pattern stops at the end of the first line you probably want s, not m.',
    },
    {
      q: 'Can I parse HTML with this?',
      a: 'For a narrow, known-shape extraction from output you control, sometimes. For general HTML, no - nesting and optional closing tags are not a regular language. Use a parser.',
    },
  ],
  related: [
    {
      id: 'string-inspector',
      anchor: 'Find the invisible character breaking your match',
    },
    { id: 'diff', anchor: 'Compare the text before and after a replace' },
    { id: 'json-formatter', anchor: 'Format the JSON you are extracting from' },
    {
      id: 'markdown',
      anchor: 'Preview the Markdown your replacement produced',
    },
  ],
}
