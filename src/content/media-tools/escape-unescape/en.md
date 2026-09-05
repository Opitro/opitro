---
toolSlug: escape-unescape
locale: en
category: dev
tool: escape-unescape
title: Escape and Unescape Online — HTML, JavaScript and CSS String Escaper
h1: String Escape and Unescape
navName: Escape and unescape
description: "Free online escaper and unescaper for HTML, JavaScript and CSS. Unescaping runs in a single pass and never corrupts strings that contain backslashes."
faq:
  - question: What is escaping and why is it needed?
    answer: "It replaces characters that carry a special meaning in a given place with a safe way of writing them. In HTML an angle bracket starts a tag, so the text “<div>” has to be written as “&lt;div&gt;” or the browser will read it as markup. Inside a JavaScript string the quote and the backslash are the special ones. Escaping lets arbitrary text sit where some characters are reserved."
  - question: Why are there three modes rather than one?
    answer: "Because every context has its own special characters and its own rules. A string that is safe in HTML is unsafe inside JavaScript and the other way round: HTML escapes angle brackets and the ampersand, JavaScript escapes quotes and backslashes, CSS writes everything as hexadecimal codes. There is no universal escaping, and promising one would be dishonest."
  - question: Why is unescaping done in a single pass?
    answer: 'Because a chain of replacements corrupts the string. Turn “\n” into a newline first and “\\” into a backslash second, and the sequence “\\n” — a backslash followed by the letter n — becomes a newline. That is different data: in code that is how a file path or a literal backslash is written. We walk the string from left to right and decide at every backslash, so the substitution never happens.'
  - question: Does escaping protect against attacks?
    answer: "No, and claiming otherwise is dangerous. Escaping makes text safe for one particular place of insertion; it validates nothing. Real protection is built on the server — on parsing and checking data, on prepared database statements, on a content security policy. Swapping characters in a browser is not a substitute."
  - question: Why does CSS put a space after the code?
    answer: 'The language requires it. A hexadecimal escape can be up to six digits long, and without a separator the next digit sticks to it: “\41 2” is the letter A followed by a 2, while “\412” is a completely different character. We always add the space and consume exactly one when unescaping.'
  - question: What happens to entities we do not recognise?
    answer: "They come back whole, exactly as they went in. An unfamiliar entity or an unknown backslash pair is not dropped. Losing a piece of somebody else code is worse than leaving it unconverted: a loss can go unnoticed, while something unconverted is visible at once."
  - question: Is my data sent anywhere?
    answer: "No. Everything happens right in your browser. Source code, configuration and protected strings never go to a server, are never stored, and do not survive closing the tab."
related:
  - html-strip
  - url-encode-decode
  - base64-encode-decode
---

Choose where the text is going and which way to convert. The result appears at once.

## Three contexts, three sets of rules

- **HTML** — angle brackets, ampersand and quotes become entities
- **JavaScript and JSON** — quotes, backslashes, newlines and tabs
- **CSS** — characters are written as hexadecimal codes

A string that is safe in HTML is unsafe inside JavaScript. There is no universal escaping.

## Why unescaping runs in a single pass

A chain of replacements corrupts the string. Turn `\n` into a newline first and `\\` into a backslash second, and the sequence `\\n` — a backslash followed by the letter n — becomes a newline. That is different data.

We walk the string once and decide at every backslash. Tested separately: `a\\nb` stays a backslash and a letter instead of turning into a line break.

## What escaping does not do

It does not protect against attacks. The text becomes safe for one particular place of insertion, but nothing is validated. Real protection is built on the server, not by swapping characters in a browser.
