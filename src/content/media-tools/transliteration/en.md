---
toolSlug: transliteration
locale: en
category: text
tool: transliteration
title: "Online Transliteration Tool — Cyrillic to Latin Converter"
h1: Text Transliteration
navName: Transliteration
description: "Online transliteration tool. Instantly convert Cyrillic text to the Latin alphabet and back using ICAO passport rules, ISO 9, or a URL-friendly slug format."
faq:
  - question: How should a name be spelled for an international passport?
    answer: "Choose the “Passport (ICAO)” standard — the rules used to fill passports and air tickets. It produces spellings that look unfamiliar: “Юлия” becomes “Iuliia”, “Сергей” becomes “Sergei”. That is what will be printed in the document, even though “Yulia” is what you usually see online."
  - question: Why does “Юлия” become “Iuliia” and not “Yulia”?
    answer: "Because in the ICAO standard “ю” is written “iu” and “я” is written “ia”. The spelling “Yulia” comes from English usage and is not used in documents. If you are buying a ticket, the name on it must match the passport rather than the familiar spelling."
  - question: How does Ukrainian transliteration differ from Russian?
    answer: "In the rules and in the letters. Ukrainian “г” becomes “h” while “ґ” becomes “g”; “и” becomes “y” and “і” becomes “i”. There is also a subtlety almost every similar page misses: я, ю, є, ї and й are spelled differently at the start of a word than inside it. “Яна” is “Yana”, but “Мар’яна” is “Mariana”. The page detects the language from the letters."
  - question: What is ISO 9 and when do I need it?
    answer: "It is the scholarly system where every Cyrillic letter has exactly one Latin counterpart, sometimes with a diacritic: “ж” is “ž”, “ш” is “š”, “щ” is “ŝ”. Libraries and academic publishing use it. Its key property: it is the only one of the three standards that converts back without loss."
  - question: Why is the reverse conversion inexact?
    answer: "Because different letters produce the same Latin sequences. Is “sh” the letter “ш”, or “с” followed by “х”? Is “zh” the letter “ж”, or “з” plus “х”? Answering needs a dictionary of the language, not a table of letters. Exact reversal is possible only for ISO 9, where every letter has its own sign."
  - question: Why is there a separate mode for page addresses?
    answer: "A URL tolerates neither capitals nor spaces nor punctuation. The “URL” mode converts the text to Latin, lowercases it, turns spaces and punctuation into hyphens, and strips hyphens at the edges and in runs. “Как выбрать ноутбук?” comes out as “kak-vybrat-noutbuk” — a ready address."
related:
  - text-case-converter
  - sort-lines
  - character-counter
---

Type into the upper field and the conversion appears in the lower one at once, on every keystroke. Direction and standard are chosen above; the arrows button swaps the direction and feeds the finished text back into the input.

## Three standards, all of them real

- **Passport (ICAO)** — the rules that fill passports and air tickets
- **ISO 9** — the scholarly system with diacritics, the only reversible one
- **URL** — a page address: lowercase, hyphens instead of spaces, nothing extra

## About names in documents

The most common reason to open a page like this is to check how a name will be printed in a passport or written on a ticket. That calls for the ICAO standard, and it gives spellings the eye does not expect: “Юлия” is “Iuliia”, “Сергей” is “Sergei”, “Дмитрий” is “Dmitrii”.

The familiar “Yulia” and “Dmitry” come from English usage and never appear in documents. If the name on a ticket does not match the passport, that becomes your problem at the check-in desk.

## Ukrainian is counted separately

Ukrainian rules differ: “г” becomes “h”, “ґ” becomes “g”, “и” becomes “y”, “і” becomes “i”. And there is a subtlety nearly every similar page misses: **я, ю, є, ї and й are written differently at the start of a word than inside it**. “Яна” is “Yana”, while the same letter inside a word gives “ia”: “Мар’яна” is “Mariana”.

The page works out the language by itself, from the letters: і, ї, є or ґ switch on the Ukrainian rule.

## Why converting back is approximate

Different letters produce identical Latin sequences. Is “sh” one letter or two? There is no single answer: choosing needs a dictionary of the language, not a table of letters.

So the reverse conversion here is honestly called approximate — everywhere except ISO 9, where every letter has its own sign and the text comes back exactly.

## Everything stays with you

The conversion runs inside your browser. Neither names nor document numbers are stored, sent anywhere, or remembered once the tab is closed.
