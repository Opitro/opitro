---
toolSlug: url-encode-decode
locale: en
category: text
tool: url-encode-decode
title: URL Encoder Online — Encode and Decode Percent-Encoding
h1: URL Encode & Decode
navName: URL encoding
description: "Free online tool for URL percent-encoding. Convert spaces, non-Latin letters and special characters into percent codes, or unfold a cryptic link back into readable text."
faq:
  - question: What is URL encoding (percent-encoding)?
    answer: "It is a way of writing characters into a web address that are not allowed there. The standard permits only a limited set of Latin letters, digits and a few symbols in an address; everything else is replaced by a percent sign and the hexadecimal code of the byte. A space becomes %20, the letter “я” becomes %D1%8F. Your browser unfolds this on its own, which is why the address bar shows you normal text."
  - question: What is the difference between encoding a whole link and a single value?
    answer: "Encoding a whole link leaves the structural characters of an address alone — the colon, the slashes, the question mark, the ampersand. Spaces and non-Latin letters do get encoded, and the link keeps working: you can click it. Encoding a single value encodes everything, including “://”. You need that when one address goes inside another as a parameter; without it, a stray ampersand would tear the query in half."
  - question: Which mode do I want if I just need to send a link with non-Latin words?
    answer: "A whole link. The letters and spaces turn into percent codes while the structure of the address stays untouched, giving you a long but fully working link that will not break in any messenger or email client."
  - question: Why does one letter turn into two pairs of characters?
    answer: "Because in UTF-8 a Cyrillic letter takes two bytes, and percent-encoding encodes each byte separately: “я” is %D1%8F. A Latin letter takes one byte, so it would need only one code. This is also why addresses with non-Latin text look so long: every letter costs six characters."
  - question: What does the broken % sequence error mean?
    answer: "It means the string contains a percent sign that is not followed by two hexadecimal digits. That happens when a link was copied incompletely, or when the text contains an ordinary percent — “50% off”, for instance. Such a string cannot be unfolded, because it is unclear what the percent stands for. We say so plainly instead of showing an empty field."
  - question: Why are the characters ! ' ( ) * left unencoded?
    answer: "Because under the current address standard they are structural and need no encoding. That is how the browser's built-in function behaves, and links do not break because of it. Some older systems still ask for them to be encoded, but that is a rare case handled separately rather than by a blanket rule."
  - question: Are my links sent anywhere?
    answer: "No. Everything is computed inside your browser: links, tokens and query parameters go nowhere, are never written down, and do not survive closing the tab."
related:
  - base64-encode-decode
  - transliteration
  - remove-diacritics
---

Pick a direction with the buttons and type a link or some text into the upper field — the result appears below straight away.

## Two scopes when encoding

- **A whole link** — the structural characters stay put and the link remains clickable
- **A single value** — everything is encoded, including “://” and the ampersand

The difference is easiest to see in an example. The address `https://opitro.com/search?q=hello world` encoded as a whole link becomes `https://opitro.com/search?q=hello%20world` — still clickable. Encoded as a single value, the “https://” and the question mark get encoded too: that string can no longer be opened, but it can safely be nested inside another address.

## Decoding is always complete

The reverse pass uses the method that also unfolds `%2F` and `%3F`. The second, more cautious method deliberately leaves those codes alone — with it, a “decoded” link would stay half in percent codes, which looks like a malfunction.

## Why addresses with non-Latin text are so long

In UTF-8 a Cyrillic letter takes two bytes, and each byte is written as three characters: a percent and two digits. That is six characters per letter. The word “привет” becomes thirty-six.
