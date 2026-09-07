---
toolSlug: html-entities
locale: en
category: dev
tool: html-entities
title: HTML Entities Encoder & Decoder Online — Convert Special Characters to Web Code
h1: HTML Entity Encoder / Decoder
navName: HTML Entity Encoder
description: "Professional online tool to escape or unescape special characters into secure HTML entities. Instantly convert HTML tags, quotes, and ampersands locally in your browser."
faq:
  - question: Why turn special characters into entities?
    answer: "Because the browser does not see letters in the less-than sign, the greater-than sign and the ampersand — it sees markup. Show a code example on a page as it is and the browser will try to execute it: the layout breaks, and in the worst case somebody else's script, carried in your own text, runs on your page. Replacing those characters with entities tells the browser: these are just letters, display them."
  - question: Why must the ampersand be replaced first?
    answer: "This is the main trap of hand-rolled escaping. Turn the less-than sign into an entity first and then go after the ampersands, and the ampersand you just wrote inside that very entity gets replaced too. The result is double escaping, and the reader sees the entity spelled out in letters instead of the character. We walk through the string in a single pass, replacing each character exactly once — that way spoiling your own work is impossible in principle."
  - question: Why is the apostrophe encoded as a number rather than &apos;?
    answer: "Because that entity did not exist in HTML 4 — it arrived with XML and later HTML5. Old browsers and some mail programs displayed it literally instead of an apostrophe. The numeric form &#39; is understood everywhere and always, so that is what we use. This is a case where the shorter form is worse than the older one."
  - question: Do non-Latin letters need encoding?
    answer: "Usually not. Pages have long been UTF-8, and any script lives in them without encoding; turning it into entities inflates the text fourfold for no benefit. The non-ASCII checkbox is kept for the two cases where it is still needed: mail travelling through older systems, and pasting text into fields whose encoding is neither declared nor controllable."
  - question: Does escaping protect against XSS by itself?
    answer: "Not by itself, and this matters. It works reliably where text lands in the content of a page — between tags. Inside an attribute value you also need the quotes, or the value can be cut short. Inside a script tag the rules are different altogether: entities are not expanded there at all. And in a link's address escaping does not help in the slightest — javascript: remains functional even escaped. The rule is simple: escape in the manner that suits the place the text is going into."
  - question: Does my code go to a server?
    answer: "No. Encoding is a plain substitution of characters; it needs neither a server nor a network, and the page makes no requests. Decoding we do through a textarea rather than an ordinary node's innerHTML: in the latter case the markup really is parsed, nodes are created from the string, and an image with onerror already starts loading. Inside a textarea the content is read as plain text."
related:
  - escape-unescape
  - url-encode-decode
  - minify-html
---

Type or paste text and the conversion happens at once, with no button. The arrows button in the result window swaps the two: the result becomes the source and the mode flips. That is how you check that what was encoded decodes back into exactly the same thing.

## Five characters, not everything

Only five carry markup: the ampersand, less-than, greater-than, the double quote and the apostrophe. Escaping those is enough. Escaping everything does no harm but inflates the text fourfold and improves nothing.

## The order of replacements

The ampersand goes first — otherwise it corrupts every entity written before it. We walk the string in a single pass and replace each character exactly once: double escaping then cannot happen in principle, rather than “almost never”.

## What to decode with

The usual trick is to put the string into an ordinary node's `innerHTML` and read `textContent`. That must not be done: the markup really is parsed, nodes are created from the string, and an image with `onerror` already starts loading, even if the node is never inserted anywhere.

We put the string into a `<textarea>`. Inside one, the content is read as plain text: tags never become nodes, while entities are expanded — all of them, as the browser knows them, including the rare ones.

## How this was checked

Against `python3` — its `html.escape` and `html.unescape` were written by other people and carry the full HTML5 entity table. Separately verified is the thing the page exists for: double escaping does not occur, and what is encoded decodes back into the original, character for character, on texts containing Cyrillic, emoji and markup.
