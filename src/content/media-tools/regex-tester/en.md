---
toolSlug: regex-tester
locale: en
category: dev
tool: regex-tester
title: RegEx Tester Online — JavaScript Regular Expression Debugger
h1: RegEx Tester & Debugger
navName: RegEx tester
summary: "Try a pattern against your own text"
description: "Professional online tool to test and debug regular expressions. Instantly validate your RegEx syntax, match test strings, and capture groups locally in your browser."
faq:
  - question: What are regular expressions and where are they used?
    answer: "They are a terse language for describing patterns in text. Instead of \"a string with letters, then an at sign, then a dot and more letters\" you write a handful of characters, and the engine finds every such fragment in any amount of text. They are used to sift server logs, pull numbers and dates out of exports, replace by pattern across whole directories, and validate what people type into forms. Their strength is brevity; their weakness is the same thing — twenty characters of pattern are harder to read than a page of ordinary code, which is why a pattern has to be tried on real text rather than in your head."
  - question: What do the g, i and m flags do?
    answer: "The g flag finds every match; without it the search stops at the first. The i flag drops the distinction between upper and lower case. The m flag moves the anchors: ^ and $ come to mean the start and end of each line rather than of the whole text. There is a quirk of g that people learn late: an expression carrying that flag remembers where it stopped, so the same expression applied twice in a row will not start from the beginning the second time. In code that is a common cause of \"it works every other time\"."
  - question: Why does a heavy pattern not freeze the page?
    answer: "Because the search does not run where the page lives. An expression like (a+)+$ against a string of thirty letter \"a\"s takes years: there is no error in it, the engine is simply trying every way of splitting the string, and there are far too many. Such a computation cannot be stopped from the thread running it — the usual try/catch does not help, because no exception occurs. We send the search to a separate thread and wait a second and a half; if no answer comes, the thread is killed and you are told plainly that the expression has looped. Which is exactly why such traps are better found here than on your own server."
  - question: What do the groups show?
    answer: "Parts of the pattern in round brackets are captured separately and can be referred to later when replacing. Under each match we list all of them in order, and by name where the group is named. A group that did not take part in a match is shown as a dash: that is not an error but the normal state of an optional part."
  - question: Why does my expression match nothing at all?
    answer: "Because you asked it to. A pattern such as a* or ^ matches the empty string, which means it matches at every position in the text. We mark such finds with a thin tick — otherwise it looks as if nothing was found, when in fact too much was. Incidentally, a naive search loop hangs forever on such a pattern: an empty match does not advance the pointer. We advance it ourselves."
  - question: Are the expressions and texts sent anywhere?
    answer: "No. Everything is computed inside the tab; the page makes no network requests at all. Server logs and exports you are not allowed to show to outsiders are not shown to anyone here."
related:
  - markdown-html
  - text-diff
  - json-formatter
---

Write the expression at the top and the text below — matches are highlighted at once. A heavy expression will not freeze the page: the search runs in a separate thread that can be cut off.

## Test on real text, not on convenient text

The commonest mistake is to try a pattern on three tidy lines and ship it. Take a real chunk instead: with blank lines, double spaces, a truncated last record, unfamiliar characters. That is where patterns break, not on textbook examples.

## Greediness explains most of the surprises

`+` and `*` grab as much as they can by default. The pattern `<.+>` against `<b>text</b>` captures the whole string rather than one tag, because the dot matches angle brackets too. The cure is a question mark after the repeat — `<.+?>` — or forbidding the excess outright: `<[^>]+>`. The second is usually both faster and clearer.

## Brackets are not only for grouping

Round brackets do not merely group: they remember what fell inside them, and on large texts that costs something. If a group exists only so that a repeat applies to several characters, and you do not need its contents, write `(?:…)`. The engine will then keep nothing extra, and the list of groups will not contain entries you later puzzle over.
