---
toolSlug: list-generator
locale: en
category: text
tool: list-generator
title: Online List Generator — Number and Letter Sequence Builder
h1: List Generator
navName: List generator
description: "Free online list generator. Number ranges with any step, letter sequences in four alphabets, prefix, suffix and numbering — including for a list of your own."
faq:
  - question: What is a list generator for?
    answer: "It takes the drudgery out of typing sequences. A developer gets seed data, a warehouse keeper gets storage-bay numbers and batch codes, an organiser gets ticket numbers and forms, a front-end developer gets ready-made list items with tags. All of that used to be typed by hand or assembled with spreadsheet formulas."
  - question: How does the step work?
    answer: "The step is the distance between neighbouring numbers. By default it is one: 1, 2, 3. For even numbers start at 2 with a step of 2. For a countdown start at a hundred, end at zero and set the step to minus ten. Fractional steps work too: from 0 to 0.3 in steps of 0.1 gives exactly four lines."
  - question: Why is a step of zero refused?
    answer: "Because such a range would never end: the number neither grows nor shrinks while lines keep being added until the tab hangs. We catch it before any work starts and say what is wrong."
  - question: What if the step points the wrong way?
    answer: "We say so rather than handing back an empty list. A range “from 1 to 100 in steps of minus one” will never reach the end — the number only decreases. That combination almost always means a typo in the sign, and returning nothing silently would leave you guessing."
  - question: Do fractional steps really go wrong elsewhere?
    answer: "In most such tools, yes, and the program is not at fault — binary arithmetic is. In it 0.3 divided by 0.1 comes to 2.9999999999999996, so the last line of the range disappears. Adding 0.1 three times gives 0.30000000000000004 instead of 0.3. We scale everything by a power of ten and count in whole numbers, so the range comes out clean."
  - question: Which alphabets does the letter range support?
    answer: "Four: Latin, Spanish with Ñ, Russian with Ё and Ukrainian with Ґ, Є, І, Ї. The alphabet follows the language of the page and can be switched by hand. Case is chosen separately."
  - question: Why does the list include letters that documents leave out?
    answer: "Because we give the alphabet in full. Official style rules for lettered lists drop the letters that are easily confused with digits or with one another. But the rule is not universal, and had we removed letters silently you would be left wondering why one is missing. Deleting a line is easier than guessing."
  - question: Can I format a list of my own instead of generating one?
    answer: "Yes, that is the third mode. Paste a column from a spreadsheet and the prefix, suffix and numbering apply to your lines. A bare list becomes ready-made HTML items, lines of code or a numbered list. Blank lines stay blank and get no numbers."
related:
  - sort-lines
  - remove-duplicate-lines
  - case-converter
---

Choose what to build, set the options, and the list appears at once.

## Three modes

- **Number range** — from and to with any step, fractional and negative included
- **Letter range** — Latin, Spanish with Ñ, Russian, Ukrainian
- **My own list** — prefix, suffix and numbering applied to your lines

## Caught before anything runs

**A step of zero** — such a range never ends and the tab hangs.

**A step pointing the wrong way** — “from 1 to 100 in steps of minus one” never reaches the end. That is usually a typo in the sign, so we say so instead of handing back nothing.

## Fractional steps are counted in whole numbers

In binary arithmetic 0.3 divided by 0.1 comes to 2.9999999999999996, and the last line of the range disappears. Adding 0.1 three times gives 0.30000000000000004.

We scale by a power of ten and count in integers, so a range from 0 to 0.3 in steps of 0.1 comes out clean: four lines.

## About lettered lists in documents

Official style rules drop the letters that are easily confused with digits or with each other. We give the alphabet in full: deleting a line by eye is easier than wondering why a letter is missing.
