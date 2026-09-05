---
toolSlug: json-formatter
locale: en
category: dev
tool: json-formatter
title: JSON Formatter Online — Free JSON Validator and Prettifier
h1: JSON Formatter & Validator
navName: JSON formatter
description: "Format and validate JSON online: exact error position, minify to one line, 2 or 4 space indent. Long numbers are never corrupted. Free, and everything runs in your browser."
faq:
  - question: What is JSON and why format it?
    answer: "JSON is the text format almost every API speaks. When it travels over the network all the spaces and line breaks are stripped out to make it smaller, and what a person sees is one solid line several screens long. Formatting puts the indentation and breaks back: the nesting becomes visible and you can find the field you need by eye instead of hunting through a search box."
  - question: Why are long numbers safe here when other sites corrupt them?
    answer: "Because the usual recipe — running the text through JSON.parse and JSON.stringify — turns every number into a floating-point value, and whole numbers only fit there up to about 9 quadrillion. The identifier 9007199254740993 comes back as 9007199254740992, and 12345678901234567890 as 12345678901234567000. The failure is silent: the text looks fine and the value is already different. Our parsing is written from scratch, so numbers come out with exactly the digits they went in with."
  - question: How is the error position worked out?
    answer: "We count the line and column ourselves rather than relaying the browser message. That matters because Chrome, Firefox and Safari word the same error differently, and Safari often gives no position at all. Here the position is the same everywhere, with a plain-language explanation next to it: a trailing comma, single quotes instead of double, an unterminated string."
  - question: What does the duplicate keys warning mean?
    answer: "The same key appears twice in one object. The format permits it, but on reading only the last value survives and the earlier ones vanish without a word. It is not an error, so validation still passes — but in a config file that typo can live for months and cost you dearly one day. We name the key and the line where it repeats."
  - question: Why does my JSON fail even though it looks right?
    answer: "Usually one of three things. Single quotes: JSON allows double quotes only, though JavaScript takes both. A trailing comma after the last element: JavaScript tolerates it, JSON does not. Comments: JSON has none at all. We check strictly, exactly as any program that later reads your file will do."
  - question: How large a file can I paste?
    answer: "A few megabytes are handled in a fraction of a second. Past that it is the text box rather than the parsing that struggles: browsers find very long text hard to draw and the page starts responding with a lag. For files of tens of megabytes a desktop program is the better tool."
  - question: Is the data sent anywhere?
    answer: "No. Everything runs right in your browser. Keys, tokens, server responses and pieces of configuration go nowhere, are never stored, and disappear with the tab. That matters here more than almost anywhere: a developer's clipboard keeps filling up with things that must not be shown."
related:
  - escape-unescape
  - base64-encode-decode
  - case-converter
---

Paste your JSON — it is checked as you type. The indent is chosen at the top: two spaces, four, a tab, or none at all.

## Long numbers stay intact

The usual way to format — run the text through `JSON.parse` and `JSON.stringify` — quietly breaks large identifiers: `9007199254740993` comes back as `…992`. Here the parsing is our own, and a number comes out exactly as it came in.

## The error position is the same in every browser

The line and column are counted by us, not taken from the browser's message — Chrome, Firefox and Safari all word it differently. A plain-language explanation sits next to the coordinates.

## Duplicate keys get named

The standard permits them, but on reading only the last value survives. Validation still passes, so we do not call it an error — we warn and show the line.
