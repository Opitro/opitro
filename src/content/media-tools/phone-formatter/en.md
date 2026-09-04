---
toolSlug: phone-formatter
locale: en
category: text
tool: phone-formatter
title: Phone Number Formatter Online — Bulk E.164 Standardisation
h1: Phone Number Formatter
navName: Phone formatter
description: "Free online bulk phone formatter. Convert a list to international E.164, digits only, or a readable national form. Trunk prefixes are handled correctly."
faq:
  - question: What is the E.164 international format?
    answer: "It is the standard of the International Telecommunication Union: the number starts with a plus and continues with digits only — country code, network code and subscriber number. No spaces, brackets or dashes, and no more than fifteen digits in total. That is the shape almost every CRM and ad platform expects."
  - question: Why can the country code not simply be prefixed?
    answer: "Because a leading trunk digit is not part of the number. The British 0 and the Russian 8 are prefixes for dialling long distance. Prefix the country code to 07911 123456 and you get +4407911123456 — an extra digit and a number that does not exist. The trunk digit has to be dropped first, and that is what this page does."
  - question: What happens to lines that cannot be parsed?
    answer: "They come out exactly as they went in, marked, and are counted separately. Silently dropping a line from a customer list is the worst thing such a tool could do — you would never learn the contact went missing. So the unparsed stay visible, with a note saying what is wrong: letters, length, or no digits at all."
  - question: Why are lines with letters left alone?
    answer: "Because pulling the digits out of them is dangerous. In “+1 415 555-2671 ext. 12” the extension would stick to the main number and produce a contact that does not exist. Names, column headings and notes all go to the unparsed pile so that you decide."
  - question: Why clean numbers before importing into a CRM?
    answer: "Because there the number acts as the identifier of a person. Brackets, dashes, spaces or a missing country code make the system fail to recognise a contact: it creates a duplicate record, loses the match when uploading an audience, or rejects the row outright. One consistent shape removes all three problems."
  - question: Do you check that the number exists?
    answer: "No, and we say so plainly: that would need directories of operator ranges, which are large and change constantly. Here only the shape is checked — country code, length, and no stray characters. A number can be perfectly formatted and still belong to nobody."
  - question: Why does the readable form differ by country?
    answer: "Because that is how each country writes it. An American number reads +1 (415) 555-2671, a Spanish one +34 612 34 56 78, a Russian one +7 (999) 123-45-67. One mask for all would produce a wrong shape for half the list, so the mask follows the country code."
  - question: Are the numbers sent anywhere?
    answer: "No. Everything happens right in your browser. Customer lists and contacts never go to a server, are never stored, and do not survive closing the tab."
related:
  - remove-duplicate-lines
  - punctuation-remover
  - sort-lines
---

Paste a list — one number per line. The result appears at once.

## Three shapes

- **International** — +14155552671, what CRMs and ad platforms expect
- **Digits only** — 14155552671, for loading into a database
- **Readable** — +1 (415) 555-2671, for a letter or a business card

## A trunk digit is not part of the number

The British 0 and the Russian 8 exist to dial long distance. Prefixing the country code to 07911 123456 gives an extra digit and a number that does not exist. The right result is **+44 7911 123456**.

## Nothing disappears

Lines that could not be parsed come out as they went in, marked, and are counted separately. Silently dropping a line from a customer list is the worst thing this tool could do.

## What we do not do

We do not check whether a number exists. That needs directories of operator ranges, which are large and change constantly. Only the shape is checked here.
