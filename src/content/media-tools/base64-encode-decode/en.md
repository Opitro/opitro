---
toolSlug: base64-encode-decode
locale: en
category: dev
tool: base64-encode-decode
title: Base64 Online — Encode and Decode Text Strings
h1: Base64 Encode & Decode
navName: Base64
description: "Free online tool for Base64 encoding and decoding. Convert plain text to Base64 or unfold a ready string back into readable text, with full Unicode support and a URL-safe form."
faq:
  - question: What is Base64 encoding and what is it for?
    answer: "Base64 is a way of writing any data using sixty-four plain characters: Latin letters, digits and a couple of symbols. It is needed wherever a channel understands only plain text and mangles everything else — in email headers, in attachments, in tokens, in images written straight into a page. The data itself does not change; only the way it is written down does."
  - question: Is Base64 encryption? Is it safe to hide a password in it?
    answer: "No, and you must not. Base64 is notation, not a cipher: there is no key, and anyone can unfold the string in a second — including on this very page. Data in Base64 is about as protected as a letter in a glass envelope. If you actually need to hide something, you need encryption, which is a completely different thing."
  - question: Is it safe to decode Base64 on this site?
    answer: "Yes. The string never leaves your device: both encoding and decoding are done by your own browser, inside the tab. We send nothing to a server, log nothing and store nothing. Close the tab and nothing remains."
  - question: Why do other sites throw an error on non-Latin text?
    answer: "Because the browser's built-in function only understands bytes from 0 to 255, and a Cyrillic or Chinese letter does not fit into one — hence the familiar complaint about characters outside the Latin1 range. The way around it is to convert the text to UTF-8 before encoding. We do that the modern way, so Cyrillic, emoji and anything else pass without an error."
  - question: What does the URL-safe switch do?
    answer: "It changes two characters and drops a third: “+” becomes “-”, “/” becomes “_”, and the “=” signs at the end are removed. The reason is that “+” and “/” mean something else inside a web address and break the link. This is exactly how the parts of a JWT token are written. When decoding we accept both forms, plain and URL-safe, so the switch is not needed for that direction."
  - question: Why is the string longer after encoding?
    answer: "That is how the format works: four Base64 characters hold three bytes of data, so the notation grows by roughly a third. It is the price of passing through channels that expect only plain Latin letters. If your string grew by exactly a third, everything is fine and nothing was lost."
  - question: Why does it say the content is binary data instead of showing text?
    answer: "It means the string is valid but what is inside is not letters. Base64 carries more than text: images, fonts and archives travel the same way. Such data decodes without a single error, but it cannot be shown as letters — you would get garbage. Rather than pretending it is text, we say plainly how many bytes are inside."
  - question: Why is there no automatic direction detection?
    answer: "Because it cannot be done honestly. The word “test” is at once an ordinary word and a perfectly valid Base64 string: unfold it and you get three unreadable characters. A site that guesses will sooner or later turn your text into garbage without saying a word. So you pick the direction with a button, and the page only offers a hint when your input looks like the other one."
related:
  - url-encode-decode
  - transliteration
  - text-case-converter
---

Pick a direction with the buttons and type into the upper field — the result appears in the lower one straight away, with no “convert” button to press.

## Two directions

- **Text → Base64** — ordinary text becomes a string of plain Latin letters and digits
- **Base64 → text** — a ready string unfolds back into readable form

## Non-Latin text passes without an error

The browser's built-in encoding function understands only bytes from 0 to 255, and a Cyrillic letter does not fit into one — hence the famous complaint about characters outside the Latin1 range. We convert the text to UTF-8 before encoding, and we do it the modern way rather than through a function long dropped from the language. So “Привет”, emoji and anything else encode properly.

## The URL-safe form

Inside a web address the characters “+” and “/” mean something else entirely and break the link. That is why a second form exists: “+” replaced with “-”, “/” with “_”, and the trailing “=” dropped. This is exactly how the parts of a JWT token are written.

Decoding accepts both forms, plain and URL-safe. The switch matters only when encoding.

## What this tool does not do

Base64 is not encryption. Anyone can unfold the string without a key, so hiding passwords in it is pointless. We do not promise protection the format does not have.
