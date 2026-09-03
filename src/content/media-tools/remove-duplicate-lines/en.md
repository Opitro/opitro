---
toolSlug: remove-duplicate-lines
locale: en
category: text
tool: remove-duplicate-lines
title: "Remove Duplicate Lines Online — Clean Lists and Delete Repeats"
h1: Remove Duplicate Lines
navName: Duplicate lines
description: "Online tool to remove duplicate lines of text. Instantly clean lists, exports and text files by deleting repeated entries and keeping unique values only."
faq:
  - question: Why are identical-looking lines not removed?
    answer: "Almost always because of an invisible space at the start or the end. “apple” and “apple ” look the same but are different lines to a program. Switch on “ignore spaces at the edges” and they collapse into one. The second common cause is different capitalisation, which has its own switch."
  - question: Does the order of the list change?
    answer: "No. The first occurrence of every line stays, the rest go, and the position of the survivors is untouched. The cleaned list still looks like the same list. If you want it alphabetical, sort it on the neighbouring page — that is a separate action."
  - question: Which line survives when they differ only in case?
    answer: "The one that came first, with its own capitalisation and its own spaces. The switches affect the comparison only: you asked to remove repeats, not to rewrite the list. So if “Apple” came first, “Apple” is what remains — not “apple”."
  - question: What happens to blank lines?
    answer: "By default they count as ordinary lines, so several blanks collapse into one. If you do not want them at all, switch on “remove blank lines” and they vanish entirely, before duplicates are even looked for."
  - question: How many lines can the page handle?
    answer: "Tens of thousands are processed instantly: the comparison runs through a hash table rather than checking every line against every other. A list of a hundred thousand lines will lag noticeably but still finish — and all of it without sending your data anywhere."
  - question: Is my list sent anywhere?
    answer: "No. The cleaning happens inside your browser, on your device. The page sends nothing to a server, stores no history, and remembers not a line once the tab is closed."
related:
  - sort-lines
  - remove-extra-spaces
  - text-case-converter
---

Paste your list into the field — one item per line — and press “remove duplicates”. The row under the field shows how many lines there were, how many unique ones remain and how many repeats went.

## Three switches that decide everything

- **Ignore case** — “Apple” and “apple” count as the same
- **Ignore spaces at the edges** — so do “apple” and “apple ”
- **Remove blank lines** — blanks go entirely instead of collapsing into one

## Why identical lines sometimes survive

This is the most common complaint about such pages, and the cause is nearly always the same: an invisible space. After copying from a spreadsheet or a document, half the lines carry a trailing space or tab. The eye cannot see them, but to a program “apple” and “apple ” are different lines.

That is why “ignore spaces at the edges” is on from the start here. The second cause is capitalisation — “London” and “london”. It has its own switch, also on.

## The order of the list stays

The first occurrence of every line remains, the rest disappear, and everything else keeps its place. The cleaned list looks like the same list, only shorter.

That is a deliberate choice: people most often clean exports where the order means something in itself. Anyone who wants alphabetical order goes to the sorting page — a separate action.

## What exactly survives

The line that came first, with its own case and its own spaces. The switches affect the comparison but never the result: you asked to remove repeats, not to rewrite the list.

## Everything stays with you

The list never leaves your device. No upload, no records — close the tab and nothing of it remains.
