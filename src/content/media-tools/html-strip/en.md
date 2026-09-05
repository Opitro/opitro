---
toolSlug: html-strip
locale: en
category: dev
tool: html-strip
title: HTML Strip Tags Online — Clean HTML Code from Text
h1: HTML Strip Tags
navName: HTML strip tags
description: "Free online HTML stripper. Removes tags, attributes, styles and scripts, decodes entities, and keeps paragraphs apart instead of running words together."
faq:
  - question: Why is this better than the usual way of stripping?
    answer: "Because the markup is parsed by the browser itself rather than by a home-made rule that deletes everything between angle brackets. That rule falls apart on real markup: in a tag with an attribute like title=\"price < 5\" the first bracket inside the quotes ends the tag in the wrong place, so part of the real text disappears while part of the junk stays."
  - question: Are the contents of script and style removed?
    answer: "Yes, entirely, code and all. This matters: if you cut only the tags themselves, lines of program and styling rules end up mixed into the clean text. You can see that happen on many stripper sites, where the output contains fragments like “function” and “margin: 0 auto”."
  - question: What happens to entities such as &nbsp;?
    answer: "They are turned back into ordinary characters: &nbsp; becomes a space, &lt; an angle bracket, &amp; an ampersand. The same parsing pass does it; no separate step is needed. A non-breaking space is additionally replaced with a normal one, since otherwise it would sit invisibly in the text and break line wrapping."
  - question: Why do words not run together between paragraphs?
    answer: "Because before the text is taken out, line breaks are inserted where paragraphs, headings, list items and break tags were. Without that, “<p>first</p><p>second</p>” would come out as “firstsecond” — the classic failure of simple strippers."
  - question: Is it safe to paste someone else's markup here?
    answer: "Yes. The markup is parsed into a separate document that is not connected to this page: programs inside do not run, images are not fetched, and no requests go out. Even if the pasted code contains a script, it stays dead text and is then removed."
  - question: What does the link-addresses switch do?
    answer: "It keeps the address next to the link text, in brackets. That is useful when you need to take not just the words out of an email or a page but also where they lead. It is off by default, because in ordinary cleaning the addresses only get in the way."
  - question: Is my markup sent anywhere?
    answer: "No. Everything happens in your browser. Neither the source code nor the resulting text is sent anywhere or stored — commercial markup stays with you."
related:
  - remove-extra-spaces
  - text-case-converter
  - lorem-ipsum
---

Paste your markup into the upper field and the clean text appears below at once.

## What gets removed

- **Tags and attributes** — the whole markup
- **The contents of script and style** — code included, not just the tags
- **Entities** — &nbsp; becomes a space, &lt; an angle bracket, &amp; an ampersand
- **Comments** — the working notes left in markup

## Why the browser parses it, not a rule

The rule “delete everything between angle brackets” looks obvious and falls apart on the first real page. In a tag with an attribute like `title="price < 5"` the bracket inside the quotes ends the tag in the wrong place: part of the real text disappears, part of the junk stays.

The browser parses markup by the actual rules of the language. It happens in a separate document unconnected to this page, so code from anywhere is safe: scripts do not run, images are not fetched, no requests go out.

## Words do not run together

Simply taking the text turns `<p>first</p><p>second</p>` into “firstsecond”. Here paragraphs, headings, list items and break tags become line breaks — that is what the switch above controls.
