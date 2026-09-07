---
toolSlug: code-diff
locale: en
category: dev
tool: code-diff
title: "Diff Checker Online — Compare Two Code Files and Find Differences"
h1: "Online Code Diff Checker"
navName: "Code Diff Checker"
description: "Compare two pieces of code online: line numbers, collapsed identical stretches, copy as a unified-diff patch. Names the invisible causes — CRLF, tabs, trailing spaces. The code never leaves your browser."
faq:
  - question: Why does the code look identical while the comparison reports differences?
    answer: "Almost always because of a character you cannot see: a tab where the other side has spaces, a space at the end of a line, a non-breaking space picked up from an editor, or a byte order mark at the start of the file. This page names the cause outright, in the panel above the result, and the switches beside it let you disregard it. Line endings deserve a separate word: the browser input field levels the Windows form to the Unix one by itself, so they produce no differences here. We still report them, but as a property of your files rather than the cause of what you are looking at: in git and in your editor such a file shows up as changed in full."
  - question: What is a non-breaking space and how does it get into code?
    answer: "It is the character U+00A0. It looks like an ordinary space but is a different character, and neither a comparison nor the programming language itself treats it as a space. It almost always arrives the same way: the code was copied from a web page, a document or a messenger, where an ordinary space had been turned into a non-breaking one during layout. We count them and show the number."
  - question: How is this page different from the text comparison?
    answer: "In what it is for. Here you get line numbers, collapsed identical stretches and copy-as-a-patch — what you need when working with code files. There is no word-level or character-level comparison and no “ignore case” switch: in code Value and value are different things, and such a switch would only do harm. All of that lives instead on the text comparison page, where contracts and articles are checked."
  - question: What kind of patch does the button copy, and what do I do with it?
    answer: "An ordinary unified diff — the same shape git diff produces and the patch and git apply commands understand. Lines with a minus were removed, lines with a plus were added, lines with a space are context. Headers like @@ -12,7 +12,8 @@ say which line each hunk starts at and how many lines it covers. Such a patch can be attached to an email, pasted into an issue, or applied with the patch command."
  - question: Why collapse the identical stretches?
    answer: "For the same reason git does: in a thousand-line file with one edit there is no point scrolling past nine hundred and ninety-nine identical lines. Three lines are kept around each edit — enough to see where you are — and the gaps fold into a single button showing how many lines are hidden. Clicking it expands the gap, and it stays expanded."
  - question: Does my code go to a server?
    answer: "No. Comparing is arithmetic over strings; it needs neither a server nor a network. The page makes no network requests at all: someone else's source, a private repository or a config file with keys are all processed in the tab's memory and are gone once you close it."
related:
  - text-diff
  - minify-js
  - json-formatter
---

Paste two pieces of code — the differences appear at once, with no button to press.

## The invisible causes come first

Above the result there is a panel of findings. It answers the question that comes up first: “the lines are the same, why are they different?” We look for tab indentation against spaces, trailing spaces, a byte order mark at the start of the file, and non-breaking spaces. Separately, from the pasted text, mismatched line endings: they cause no differences here because the input field levels them, but they are worth knowing about. If nothing turns up, it says so.

## Line numbers and folded stretches

Numbers run in two columns: before on the left, after on the right. A removed line has a number only on the left, an added line only on the right, exactly as in an ordinary diff. Identical stretches longer than seven lines fold away, with three lines kept around each edit.

## Copying as a patch

The button gives you an ordinary unified diff — the same one `git diff` produces. Verified rather than assumed: forty random patches were run through the real system `patch` command, and all forty produced exactly the expected file.

## What is deliberately missing

Word-level and character-level comparison, and the “ignore case” and “ignore punctuation” switches. In code letter case always matters, and a word in the middle of a line is useless without the line number. All of that is on the [text comparison page](/en/text-diff) — that one is for contracts and articles, this one for code files.

## How this was checked

The difference-finding itself is the Myers algorithm, the same one the text comparison uses. It was checked against a slow but certainly correct method on five thousand random pairs: the edit chain comes out minimal and genuinely turns the first text into the second. The patch output was checked with the system `patch` command.
