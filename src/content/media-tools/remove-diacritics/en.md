---
toolSlug: remove-diacritics
locale: en
category: text
tool: remove-diacritics
title: "Remove Diacritics Online — Strip Accents and Tildes from Text"
h1: Remove Diacritics
navName: Remove diacritics
description: "Online tool to strip diacritics and accents from text. Convert accented characters (á, é, ñ, ü) to standard Latin letters instantly in your browser."
faq:
  - question: Why remove diacritics at all?
    answer: "Usually to prepare text for a URL, a database, or an older system that understands plain Latin only. Characters such as á or ü turn into garbage there, or break the link outright. It also helps when matching lists: “José” and “Jose” are different strings to a program but the same José to a human."
  - question: How does the tool treat the Spanish “ñ”?
    answer: "By default it turns it into “n”, which is the convention for URLs. But “ñ” is a letter of the Spanish alphabet in its own right, not “n with a squiggle”: “año” means year, while “ano” means something quite different. So if you are doing linguistic work rather than building a link, switch that option off: only the accents will go and the “ñ” will stay."
  - question: Why are “ø” and “ł” not removed?
    answer: "Because they are not diacritics. In Unicode “á” is “a” plus a separate accent mark, and the mark can be stripped. But “ø”, “ł”, “ß” and “æ” are independent letters with nothing detachable about them, so ordinary cleaning leaves them alone. In URL mode we replace them by hand: ø → o, ł → l, ß → ss, æ → ae. In normal mode they stay: they are letters, not accents."
  - question: What does URL mode do?
    answer: "More than stripping marks: it lowercases the text, turns spaces and punctuation into hyphens, and trims hyphens at the edges and in runs. “Peñalara — la Sierra” comes out as “penalara-la-sierra” — an address that will not break in any system."
  - question: Does it work with French, German, Polish?
    answer: "Yes, and with any language that writes marks above letters: é, è, ê, ë, ü, ö, ä, ç, ą, ę, ż. We do not walk through a table of letters but decompose the text by Unicode rules, so it works for languages we never looked at. The single exception is independent letters such as ø and ł, described above."
  - question: Is my text sent anywhere?
    answer: "No. The cleaning happens inside your browser, on your device. The page sends nothing to a server, stores no history, and remembers not a line once the tab is closed."
related:
  - transliteration
  - text-case-converter
  - remove-extra-spaces
---

Type into the upper field and the cleaned text appears below at once. Two switches at the top decide what happens to the Spanish “ñ” and whether you want a ready-made URL.

## What gets stripped

- **Accents** — á, é, í, ó, ú and every other mark above a letter
- **Umlauts** — ü, ö, ä
- **Cedilla, ogonek, ring** — ç, ą, å and their kin
- **Ñ** — your choice: turn it into n or keep it

## Why decomposition instead of a lookup table

In Unicode “á” is built as “a” plus a separate accent mark. Decompose the text and the marks come off with a single rule — and that works for a language we never considered: Czech, Polish, Vietnamese.

A table of letters cannot do that: it holds exactly what its author wrote down, and it falls silent at the first unfamiliar letter.

## About “ñ” — it is not a diacritic

“Ñ” is a letter of the Spanish alphabet with its own place in the dictionary. The difference is not cosmetic: “año” means year, “ano” means something else entirely. That is why the switch sits at the top rather than hidden away.

## About letters that cannot be stripped at all

Some letters have nothing to detach: “ø”, “ł”, “ß”, “æ”, “đ”. In Unicode they are independent characters, and ordinary cleaning walks straight past them. Many pages like this quietly stumble here, and “Malmø” keeps its “ø” inside the link.

We replace them by hand, but only in URL mode. In normal mode they stay as they were — they are letters, not accents, and deleting them unasked would be wrong.

## Everything stays with you

The text never leaves your device. No upload, no records — close the tab and nothing of it remains.
