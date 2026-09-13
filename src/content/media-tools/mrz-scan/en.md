---
toolSlug: mrz-scan
locale: en
category: scanners
tool: mrz-scan
title: "MRZ scanner online — read a passport's machine-readable zone"
h1: "MRZ scanner"
navName: "MRZ scanner"
summary: "Read the machine-readable zone of a document"
description: "Point the camera at the two bottom lines of a passport and get the fields plus a recount of every check digit. Free, no sign-up, the photo goes nowhere."
faq:
  - question: "How do I read the MRZ of a passport?"
    answer: "Press “Camera” and hold the document so the two bottom lines sit inside the frame. There is nothing to press: the page grabs frames several times a second, and the moment the lines are read it freezes the picture and shows the breakdown underneath. With no camera, press “File” and choose a photo of the page with the portrait."
  - question: "What are check digits and why verify them?"
    answer: "In an MRZ each important field — the document number, the date of birth, the expiry date — is followed by one digit computed from that field with the weights 7-3-1. We recompute it and compare. It adds up: the field was read correctly, and that is arithmetic, not a guess. It does not: a pink cross appears next to the field, and we say plainly that either the photo was misread or the document has a mistake."
  - question: "Which documents does it understand?"
    answer: "Passports (two lines of 44 characters), visas, ID cards and residence permits (three lines of 30), older ID documents (two lines of 36). The type is worked out on its own — you will see it in the heading. Photos can be JPEG, PNG, WebP or HEIC, everything phones shoot."
  - question: "What do the marks next to the fields mean?"
    answer: "A green tick means the check digit adds up. A pink cross means it does not. A yellow tick means the spelling was recovered from the check digit: the reader confused a zero with the letter O, and the arithmetic pointed at the only spelling that works. The button at the top copies the whole lines."
  - question: "Where does the photo of my passport go?"
    answer: "Nowhere. Both the reading and the arithmetic happen right here in the browser, on your device: this page has no server of its own, so there is nothing to send. For a page people bring a passport to, that is not a polite phrase but the condition without which it should not exist."
  - question: "Why does it download something the first time?"
    answer: "The character reader is a program a few megabytes in size, and it arrives once — when you press the camera or choose a file. After that the browser keeps it, and the next time starts instantly. We deliberately do not fetch it on arrival: people often open a page just to look."
  - question: "Can I type the lines myself?"
    answer: "Yes, there is a field for that under the window. Paste the two (or three) lines and the breakdown and the digit checks run at once — no reader needed at all. Handy for verifying something typed by hand, or lines somebody sent you as text."
  - question: "Does this prove a document is genuine?"
    answer: "No, and nothing in a browser could. Check digits catch a misreading and a typo, not a forgery: whoever forges a document computes those digits the same way we do. Real verification means the chip, the security features and closed databases."
related:
  - qr-scan
  - barcode-scan
  - exif-viewer
---

Point the camera at the two bottom lines of a passport or ID card — the page reads them itself, splits them into fields and recounts every check digit. The photo stays with you: the reading happens in the browser.

## What an MRZ is

It is the machine-readable zone: two or three lines at the very bottom of a document, set in a special typeface called OCR-B. It was invented for border desks — a person lays down the passport, the machine reads the lines in an instant, and nobody types anything. The lines hold what the page holds: surname and given names, document number, nationality, date of birth, sex, expiry date.

## Why the answer here can be verified

Each important field is followed by a check digit computed from that field with the weights 7-3-1 — simple arithmetic anyone can repeat. We repeat it: every field carries a mark, and the overall verdict sits underneath. So the answer is not “it seems to say this”, it is “the number was read correctly, the digit adds up”.

The same arithmetic lets us repair the reading. A reader sometimes confuses a zero with the letter O — in an MRZ they look nearly identical. We try the disputed spellings and, when the check digit adds up for exactly one of them, we show it and mark it honestly as recovered. Inside dates that repair is forbidden: the standard allows digits only there, and a “fix” would mask a real error.

## What the page cannot do

It cannot prove a document is genuine. Check digits catch a misreading and a typo, not a forgery: whoever forges a document computes them the same way. Real verification is the chip, the security features and closed databases. Promising more would be a lie.
