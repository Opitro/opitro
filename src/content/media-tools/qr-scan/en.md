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
    answer: "Switch to “File”. You can choose a file, drag a picture in with the mouse, or simply copy a screenshot and press Ctrl+V — Cmd+V on a Mac. The picture is decoded at once and stays on screen, so you can see which file was actually read."
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
  - barcode-scan
  - qr-code
  - base64-file
  - url-encode-decode
---

Point the camera at a code or load an image. What it reads is shown as text — and nothing opens by itself.

## When a code will not read

Three things usually get in the way. **Glare**: a code behind film or on gloss reflects the light — tilt the phone to one side and the reflection moves off. **Cropped margins**: a code needs a light border about four modules wide around it, or the scanner cannot find its edge. **Too small in frame**: move closer, so the code fills at least a third of the width. A torn or smudged code, on the other hand, often still reads — QR recovers up to a third of its lost cells, that is built into the standard itself.

## How this differs from the phone camera

The stock camera app sees a code and immediately offers to open it, and the finger taps before the eye has read the address. Here the order is reversed: first the full address as text and the real host on its own line, then the jump — a separate press that you make.

## A code on someone else's screen

A code on a monitor or a phone screen photographs worse than one on paper: glare and moiré from the screen's pixels fighting the camera's. It is easier not to photograph it at all — take a screenshot and paste it here with Ctrl+V, Cmd+V on a Mac. The reading is more accurate that way, because the image is perfect.
