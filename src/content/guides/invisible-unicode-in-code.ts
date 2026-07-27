import type { GuideContent } from '../types'

export const guide: GuideContent = {
  intro: [
    'Some of the most confusing bugs are the ones where the evidence looks correct. Two strings render identically and compare unequal. A code review reads one way and the compiler sees another. A package name matches the one you meant to install, character for character, except that it does not.',
    'All of these come from Unicode characters that are either invisible or deliberately look like something else.',
  ],
  sections: [
    {
      heading: 'The zero-width family',
      paragraphs: [
        'Several code points render as nothing at all. Zero-width space, zero-width non-joiner, zero-width joiner, and the byte-order mark all occupy a position in a string and paint no pixels.',
        'They arrive by copy-paste far more often than by malice. Documentation sites insert them for line-breaking control, word processors add them around formatting boundaries, and chat clients pass them through unchanged. From there they end up in identifiers, configuration keys, passwords and commit messages.',
        'A byte-order mark at the top of a file is the most familiar case: invisible, and enough to make a JSON parser reject character one of an otherwise perfect document, or to attach itself to the first column name of a CSV so every lookup on that column fails.',
      ],
      code: {
        lang: 'text',
        body: 'U+200B  zero-width space\nU+200C  zero-width non-joiner\nU+200D  zero-width joiner\nU+FEFF  byte-order mark',
      },
    },
    {
      heading: 'Bidirectional overrides and Trojan Source',
      paragraphs: [
        'Unicode includes control characters that change text direction mid-string, so that scripts written right to left can be embedded in left-to-right documents. They are legitimate and necessary.',
        'They also mean the order in which characters display is not necessarily the order in which they are stored. A compiler reads the stored order. A human reads the displayed order. Where those differ, a reviewer can approve code whose behaviour is not what the review showed them.',
        'This is the Trojan Source class of attack, published in 2021. A comment can be made to appear to enclose code that is in fact live, or a string literal can appear to end earlier than it does. Most compilers now warn about bidirectional controls in source, and most code hosts render them visibly, but neither is universal.',
      ],
    },
    {
      heading: 'Homoglyphs',
      paragraphs: [
        'Many scripts contain characters that look identical to Latin letters. Cyrillic а is not Latin a. Greek ο is not Latin o. Fullwidth Ａ is not A. There are hundreds of such pairs.',
        'The consequence is that two identifiers can be visually indistinguishable and byte-wise different. That has been used to register lookalike domains, publish lookalike package names, and create user accounts that impersonate others in any interface that displays names without normalisation.',
        'Punycode makes the domain case concrete: an internationalised domain is encoded to ASCII with an xn-- prefix for DNS, so a domain that renders like a familiar brand can be an entirely different string underneath. Browsers apply heuristics to show the punycode form when a name mixes scripts suspiciously, but the heuristics are imperfect.',
      ],
    },
    {
      heading: 'Normalisation, the quieter problem',
      paragraphs: [
        'An accented character can be stored as one composed code point or as a base letter followed by a combining mark. Both render identically. Neither is wrong. They compare unequal.',
        'This is how a user whose name contains an accent finds that their own name fails a lookup, or how a filename copied between macOS and Linux stops matching. macOS historically normalised filenames toward the decomposed form while most other systems use the composed one.',
        'Unicode defines four normalisation forms. NFC composes and is what you want for storage and comparison — it is the form the web platform assumes. NFD decomposes. NFKC and NFKD additionally fold compatibility characters, turning a ligature into its component letters and fullwidth forms into ASCII, which is useful for search indexing and destructive for anything you will display back.',
      ],
    },
    {
      heading: 'Finding them',
      bullets: [
        'Inspect code points rather than reading the string. Any character above the ASCII range in an identifier deserves a second look.',
        'Compare the count of graphemes against the count of code points. A gap means combining marks, joiners or invisible characters are present.',
        'Diff the two values that should be identical. A diff that reports a change where you see none is telling you the difference is invisible, not that it is absent.',
        'Check whether the string is already in NFC before assuming a comparison failure is a data problem.',
      ],
    },
    {
      heading: 'Defending against them',
      paragraphs: [
        'Normalise user input to NFC at the boundary, once, before storage and before comparison. This removes an entire class of mismatch and costs almost nothing.',
        'Reject or strip zero-width and bidirectional control characters in fields where they have no legitimate purpose — usernames, identifiers, package names, filenames. There is no valid reason for a zero-width joiner in a database column name.',
        'Where a field must accept arbitrary international text, do not strip; detect and flag instead. Stripping breaks languages that need those characters, and joiners are essential for many scripts and for emoji sequences.',
        'For source code, enable the compiler warnings that exist and rely on your code host rendering these characters visibly. Do not rely on reviewers noticing something designed to be unnoticeable.',
      ],
    },
  ],
}
