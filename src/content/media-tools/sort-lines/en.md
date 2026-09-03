---
toolSlug: sort-lines
locale: en
category: text
tool: sort-lines
title: "Line Sorter Online — Sort Lists Alphabetically (A-Z)"
h1: Line Sorter
navName: Line sorter
description: "Online tool to sort lines of text. Instantly sort lists alphabetically (A-Z, Z-A), by line length, shuffle randomly, or sort by numeric values in your browser."
faq:
  - question: Why do accented letters land in the right place instead of at the end?
    answer: "Because the lines are compared by the rules of the language rather than by their numbers in a character table. In the table an accented letter sits far from its plain neighbour, and a naive sort would exile it to the very end. Comparing by language rules puts the letters where a dictionary puts them."
  - question: Why does 10 come before 2 in alphabetical order?
    answer: "That is what alphabetical order is: lines are compared character by character, and “1” comes before “2”. For numbered lists there is a separate “by numbers” button — it reads the number whole and puts 2 before 10. If your list holds house numbers, versions or numbered items, that is the one you want."
  - question: What happens to lines without numbers when sorting by numbers?
    answer: "They move to the bottom of the list and keep their alphabetical order there. Throwing them away is not an option — you did not paste them for nothing. This way you immediately see where the numbered part ends and everything else begins."
  - question: What is the “ignore case” switch for?
    answer: "Without it every capitalised line gathers at the top in a heap of its own and the lower-case ones sit below: that is how the default comparison works. With the switch on, “Apple” and “apple” stand side by side. The lines themselves never change — case only affects the comparison."
  - question: How is “shuffle” different from sorting by a random number?
    answer: "We deal the lines with the Fisher–Yates algorithm: every possible order is equally likely. The popular “sort by a random number” trick does not have that property and noticeably pulls some lines towards the top — the order only looks random."
  - question: Is my list sent anywhere?
    answer: "No. Sorting happens inside your browser, on your device. The page sends nothing to a server, stores no history, and remembers not a line once the tab is closed."
related:
  - remove-extra-spaces
  - text-case-converter
  - character-counter
---

Paste your list into the field — one item per line — and pick an order. The counter under the field shows how many lines the list holds. Take the result with “copy the result”.

## Five orders

- **Alphabetically A-Z** and **Z-A** — ordinary list sorting
- **By numbers** — 2 comes before 10, not after 1
- **By length** — from the shortest lines to the longest
- **Shuffle** — an honest random deal

## Why the alphabet here is a real one

A naive string comparison runs through character codes, not the alphabet. Under it whole scripts drift below Latin, accented letters end up last, and a lower-case “z” outranks a capital “A”.

We compare by the rules of the page’s language. So accented letters keep their proper place, the Spanish “ñ” sits between “n” and “o”, and the list looks the way it would in a dictionary.

## About numbers

Alphabetical order puts 10 before 2 — and that is not a bug: lines are compared sign by sign, and one comes before two. If your list holds house numbers, versions or numbered items, use “by numbers”: it reads the number whole.

Lines with no number at all move to the bottom and stay alphabetical there. That makes the border between the numbered part and everything else obvious at a glance.

## About shuffling

The lines are dealt with the Fisher–Yates algorithm: every possible order is equally likely. The common “sort by a random number” trick lacks that property — it pulls some lines towards the start, and the randomness is only skin-deep.

## Everything stays with you

The list never leaves your device. No upload, no records — close the tab and nothing of it remains.
