---
toolSlug: rot13
locale: en
category: text
tool: rot13
title: ROT13 Cipher Online — Encode and Decode Text Strings
h1: ROT13 Cipher
navName: ROT13 cipher
description: "Free online ROT13 tool. Encode text or read a ready ROT13 string with the classic 13-letter Caesar shift, with optional Cyrillic support — no registration."
faq:
  - question: What is the ROT13 cipher and how does it work?
    answer: "ROT13 — short for “rotate by 13 places” — is a special case of the ancient Caesar cipher. Every Latin letter moves 13 positions forward around the alphabet ring: A becomes N, B becomes O. There are 26 Latin letters and 13 is exactly half of them, so a second identical shift brings each letter back. That is why encoding and decoding are the very same action here."
  - question: Does the cipher affect digits and punctuation?
    answer: "No. Classic ROT13 touches letters only. Spaces, digits, full stops, commas and any other characters are left alone, so the shape of the sentences survives and the encoded text still reads as text — just made of meaningless words."
  - question: Why does Cyrillic shift by 16 rather than 13?
    answer: "Because a shift that undoes itself is only possible for an alphabet with an even number of letters: you need exactly half. Latin has 26, so half is 13. The Russian alphabet has 33 letters and has no half at all — shift twice by 16 and “привет” comes back as “опзбдс”. So the common count of 32 letters is used, without “ё”. Half of that is exactly 16, and everything works out: А turns into Р, and a second pass brings А back."
  - question: What happens to the letter “ё”?
    answer: "It is left as it is, along with digits and punctuation. This is not an oversight but the condition for reversibility: include “ё” in the ring and you have 33 letters, so text would come back distorted after two shifts. Better to leave one letter untouched than to break the round trip for the whole text."
  - question: What about the Ukrainian letters і, ї, є, ґ?
    answer: "They are left untouched too. The Ukrainian alphabet has 33 letters — an odd number — so a self-inverse shift does not exist for it at all. Any shift applied twice would return damaged text. We would rather say so plainly than pretend everything works."
  - question: How secure is ROT13? Can it protect anything?
    answer: "No, and it was never meant to. ROT13 hides nothing: it has no key, and anyone can unfold a string in a second — including on this page. It was invented for something else: to cover the answer to a riddle, the ending of a film or a rude word so that they cannot be read by accident while glancing at the screen."
  - question: How is ROT13 different from the Caesar cipher?
    answer: "ROT13 is the Caesar cipher with one specific shift, thirteen. Caesar's shift can be anything: 1, 5, 20. Thirteen earned its own name because of a convenient property: only at that shift do encoding and decoding coincide, so no second key is needed."
  - question: Is my text sent anywhere?
    answer: "No. Everything is computed right in your browser, on your device. The page sends nothing to a server, keeps no history, and remembers not a single line once the tab is closed."
related:
  - base64-encode-decode
  - transliteration
  - text-case-converter
---

Type into the upper field and the result appears below straight away. There is no separate “decode” button, because none is needed.

## One action both ways

There are twenty-six Latin letters, and thirteen is exactly half. So a shift of 13 turns A into N, and N back into A. Apply it to text and you get the cipher; apply it to the cipher and you get the text.

## What stays unchanged

- **Digits** — 2026 stays 2026
- **Spaces and punctuation** — the shape of the sentence survives
- **Case** — “Hello” keeps its capital letter
- **The letter “ё”** and the Ukrainian **і, ї, є, ґ** — the reason is below

## Why Cyrillic shifts by 16

A shift that undoes itself is only possible for an alphabet with an even number of letters — you need exactly half. The Russian alphabet has 33 letters and no half: shift twice by 16 and “привет” comes back as “опзбдс”.

So the common count of 32 letters is used, without “ё”. Half of that is exactly 16, and it works out: **А turns into Р**, and the second pass brings А back.

## What this cipher does not do

ROT13 protects nothing. It has no key and anyone can unfold it. It exists to hide an answer from a casual glance, not from other people.
