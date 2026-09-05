---
toolSlug: qr-scan
locale: en
category: dev
tool: qr-scan
title: QR Code Scanner Online — Read a QR Code by Camera or Image
h1: QR Code Scanner
navName: QR scanner
description: "Read a QR code with your camera, from a picture or a screenshot. We show the full address and warn about deceptive links. Nothing opens by itself. All in your browser."
faq:
  - question: How do I read a QR code saved as a picture or screenshot?
    answer: "Switch to “File or screenshot”. You can choose a file, drag a picture in with the mouse, or simply copy a screenshot and press Ctrl+V — Cmd+V on a Mac. The picture is decoded at once and stays on screen, so you can see which file was actually read."
  - question: Is it safe to give access to the camera?
    answer: "The camera image is decoded right in the browser: it never goes to the network and is never stored. But something else matters more, and it is usually left unsaid: the real danger of a QR code is not the camera but what is written inside it."
  - question: What is the danger of the code itself?
    answer: "A code cannot be read by eye: you learn where it leads only after following it. Whole families of scams are built on that — somebody else's sticker pasted over the real one on a parking meter, in a café, on a bill. That is why our scanner never opens anything by itself: it shows the full address as text, and the decision to follow it is yours."
  - question: What does the warning about the “@” sign mean?
    answer: "In an address like https://bank.example@evil.example, everything before the “@” is not the site but a user name. The browser goes to evil.example while the reader sees a familiar name at the start. We flag such addresses and show the host the browser will really visit on its own line."
  - question: And the warning about “xn--”?
    answer: "That is how a browser displays host names written in non-Latin letters. It gets exploited: “аpple.com” with a Cyrillic “а” looks exactly like the real name but is a different site. Whenever “xn--” appears in the name, we say so plainly."
  - question: Why is the Wi-Fi password shown without stray slashes?
    answer: "Because we remove the escaping. In the network string special characters are written with a backslash, and a scanner that leaves it in shows a password like “Pa\\;ss” instead of “Pa;ss”. Typed in by hand, that password would not work. Here it can simply be copied."
  - question: What else can be read besides links?
    answer: "Everything that goes into QR codes: plain text, a Wi-Fi network (we show the name, password and security type on separate lines), a vCard (name, organisation, phone, email), a phone number and an email address. The format is recognised automatically."
related:
  - qr-code
  - base64-file
  - url-encode-decode
---

Point the camera at the code or load a picture. What it holds is shown as text — and nothing opens by itself.

## The scanner never opens anything by itself

A QR code cannot be read by eye, and scams are built on that: somebody else's sticker over the real one. We show the full address; the decision to follow it is yours.

## Where the link really leads

In `https://bank.example@evil.example` the browser goes to `evil.example`. We flag such addresses and show the real host on its own line.

## The Wi-Fi password comes out usable

The escaping is removed, so the password can simply be copied and typed without stray slashes.
