---
toolSlug: remove-empty-lines
locale: en
category: text
tool: remove-empty-lines
title: Remove Empty Lines Online — Delete Blank Lines From Text Free
h1: Remove Empty Lines
navName: Remove empty lines
description: "Free online tool to remove blank lines from text or a list. Lines made of spaces count as blank too, and there is a mode that collapses runs to one. No sign-up, everything runs in your browser."
faq:
  - question: What is the difference between removing and collapsing?
    answer: "Removing leaves no blank line at all: the text becomes a solid list. That is what an export, an address list or any file needs when a blank line breaks the parser. Collapsing leaves exactly one blank line between blocks: the split into paragraphs survives and only the surplus emptiness goes. That is what an article needs. The switch “Collapse to one instead of removing” chooses between the two."
  - question: Why are some blank lines still there?
    answer: "Most likely they are not blank. A line holding spaces or tabs looks exactly like a truly empty one, but by its characters it is not empty. That is why the page carries the switch “Treat a line of spaces as blank”, ticked by default. Untick it and only literally empty lines go — occasionally that is what you want, when the spaces on a line mean something."
  - question: Where do blank lines come from in the first place?
    answer: "Usually from copying. A spreadsheet gives a blank line for every empty cell, a PDF adds a break after every typeset line, and email arrives with double breaks between paragraphs. Database exports produce them too, whenever some fields came back unfilled."
  - question: Are single breaks inside a paragraph safe?
    answer: "Yes. We only touch lines that hold nothing but emptiness. The text itself, the indentation inside lines and the order of the lines stay as they were — no line with content disappears or swaps places with its neighbour."
  - question: Are blank lines at the very start and end removed too?
    answer: "Yes, in collapse mode as well. Emptiness at the edges separates nothing, and in the finished file it shows up as a stray break — an extra line at the top of an email, or an empty record at the end of a list."
  - question: How many lines can I paste?
    answer: "The practical ceiling is hundreds of thousands of lines, and past that it is the text box rather than the processing that slows down: browsers struggle to draw very long text. Ordinary lists of a few thousand lines are handled instantly, as you type."
  - question: Is the text sent anywhere?
    answer: "No. Everything happens right in your browser. Lists, addresses, exports and source code never leave the page, are never stored, and do not survive closing the tab."
related:
  - remove-extra-spaces
  - remove-duplicate-lines
  - sort-lines
---

Paste the text — the cleaned version appears on the right straight away, as you type.

## Two different jobs

**Remove** — not one blank line is left and the text becomes a solid list. That is what exports and lists need, where a blank line breaks the parser.

**Collapse** — several blank lines in a row become one. The split into paragraphs survives and only the surplus emptiness goes. That is what an article needs.

## The line made of spaces

It looks blank, but by its characters it is not: spaces or tabs sit inside where nothing shows them. That line is the reason for “I removed the blank lines and they are still there”. By default we count it as blank, because a person judges by eye rather than by character codes.

## The counter shows what happened

Under the fields you can see how many lines there were, how many are left and how many went. The number removed turns white the moment something is found: it is the figure the page is about.
