---
toolSlug: text-diff
locale: en
category: text
tool: text-diff
title: Text Diff Tool Online — Compare Two Texts and Find Differences
h1: Compare Two Texts
navName: Compare texts
description: "Free online text comparison. Finds changed, removed and added lines or words and shows them in two columns or one flow. Your texts never leave the browser."
faq:
  - question: How does comparing two texts work?
    answer: "The tool looks for the shortest chain of edits that turns the first text into the second: what was removed, what was added, what stayed. The method is called the Myers algorithm and runs in time proportional to the number of edits rather than the length of the texts. That is why two nearly identical documents compare instantly even when they run to thousands of lines."
  - question: What is the difference between comparing by lines and by words?
    answer: "By lines is how you look at code, lists and configuration: you see which line was replaced whole, the same way a version history shows it. By words is for articles, books and contracts: you see the single edit inside a long paragraph. If one word in a sentence was replaced, a line comparison says “this line changed” while a word comparison shows you the word."
  - question: Why does it report differences I cannot see?
    answer: "Usually because of something invisible: a trailing space at the end of a line, a tab instead of spaces, a different capital letter. That is what the two switches at the top are for — ignore letter case and ignore extra spaces. The second is on by default, because trailing spaces are the most common cause of false differences."
  - question: Is it safe to paste a contract or someone else source code?
    answer: "Yes. The whole comparison happens inside your browser: the texts are not sent to a server, not written to any log and not stored. Once the tab is closed nothing remains. That matters precisely for contracts, private correspondence and work code — those must not be handed to an unknown site."
  - question: What do the colours mean?
    answer: "A reddish background marks what was in the first text and is gone from the second. A greenish one marks what was not there and has appeared. Matching parts are not highlighted at all. The highlighting uses the background while the letters stay white: coloured letters on a dark ground read worse and tire the eye over a long text."
  - question: What does the match percentage show?
    answer: "The share of pieces that stayed untouched: lines in a line comparison, words in a word comparison. A hundred per cent means the texts are the same. It is a rough measure of similarity, not a plagiarism score — checking for borrowed text needs a different kind of tool."
  - question: Is there a size limit?
    answer: "There is no hard limit, but there is common sense: two nearly identical books compare quickly, while two completely different texts of several thousand lines each will make the tab think. Every comparison tool works this way: the effort depends on the number of differences, not on the volume."
related:
  - remove-duplicate-lines
  - sort-lines
  - text-case-converter
---

Paste both texts — the differences appear at once, with nothing to press.

## Two ways to compare

- **By lines** — for code, lists and configuration: you see which line was replaced whole
- **By words** — for articles and contracts: you see the single edit inside a paragraph

## Two ways to show it

- **Two columns** — before on the left, after on the right, side by side
- **One flow** — what was removed comes straight before what was added, like a version history

## Why there is no button

The Myers algorithm finds the shortest chain of edits in time proportional to the number of edits. Four thousand lines with three changes take under a millisecond — there is nothing to wait for, and a “find differences” button would just be an extra motion.

## False differences

A trailing space at the end of a line, a tab instead of spaces, a different capital letter — these are the usual reasons a comparison shows a difference where a human sees none. The two switches at the top remove them.

## Your texts stay with you

A contract, a private exchange or work code is compared right in your browser. Nothing is sent to a server, nothing is stored, and nothing survives closing the tab.
