---
toolSlug: browser-codecs-test
locale: en
category: device-tests
tool: browser-codecs-test
title: "Browser Codecs Test Online — Check Video and Audio Support"
h1: Browser Codecs Support
navName: Browser codecs
description: "Check which audio and video codecs your browser supports. Instant compatibility test for AV1, HEVC (H.265), AVC (H.264), VP9, FLAC and Opus, with no downloads."
faq:
  - question: What does the “maybe” answer mean?
    answer: "That the browser recognised the container but will not vouch for the codec inside. A file in that format may open, or it may not — the browser does not know in advance. We show that answer as its own badge and do not count it as support: this is exactly where many similar tables mislead, promising compatibility that is not there."
  - question: Why is there a “hardware” tag next to a codec?
    answer: "It means video in that format is decoded by the graphics chip rather than the processor. That matters more than support itself: a codec without a hardware decoder still works, but it heats the device and drains the battery twice as fast. It is usually the case with AV1 on hardware older than a couple of years and with HEVC outside Apple devices."
  - question: Why is HEVC (H.265) unsupported in my browser?
    answer: "The reason is usually licensing rather than technology: the codec has to be paid for, and Google does not build it into Chrome on most systems. HEVC works reliably in Safari and on devices with a hardware decoder. If your HEVC video will not open in Chrome, nothing is broken."
  - question: What is AV1 and why does it matter?
    answer: "It is the newest video codec: at the same quality it takes noticeably less space and bandwidth, which is why streaming services are moving to it. The price is complexity: AV1 decoders appeared only in recent processors and graphics chips, and without the “hardware” tag playback will heat your laptop."
  - question: Does the page download anything to run this check?
    answer: "No. The check is instant and entirely local: the page asks the browser engine in two built-in ways and gets an answer immediately. Not a single file is downloaded, nothing is played and nothing is sent anywhere."
  - question: Why should I know my codecs at all?
    answer: "To understand why a video will not open or stutters. A clip that fails in the browser but plays in a media player is a codec issue. A laptop that heats up on online video is probably decoding with the processor. A file you uploaded that others cannot watch may need a more common format."
related:
  - webcam-test
  - hdr-test
  - bluetooth-test
---

The page asks your browser engine which video and audio formats it can open and shows the answer as a table. The check is instant: nothing is downloaded and nothing is played.

## What gets tested

- **Video** — AV1, HEVC (H.265), AVC (H.264) in two profiles, VP9, VP8, Theora
- **Audio** — AAC, Opus, MP3, FLAC, Vorbis, WAV and ALAC
- **Smoothness** — whether the stream will run without stutter on this device
- **Hardware decoding** — whether the graphics chip handles the format instead of the processor

## Three answers instead of two

A browser does not answer “yes” or “no” but in three ways: no, maybe, and probably. The middle answer means the container was recognised while the codec inside is not vouched for.

Many similar tables count “maybe” as support — and the visitor gets a green tick where the video will not open. Here it is a separate badge and it does not go into the total.

## Why “hardware” matters more than support

A codec decoded by the processor works — but it heats the device and drains the battery twice as fast. The same codec with a hardware decoder costs almost nothing.

So two tags sit beside support: “smooth” means the stream will run without stutter, “hardware” means the graphics chip is doing the work. If AV1 has no “hardware” tag, watching in that format will heat your laptop even though it is formally supported.

## HEVC and AV1 in particular

HEVC (H.265) is a paid codec, and Google does not build it into Chrome on most systems. It works reliably in Safari and wherever a hardware decoder exists. That is a licensing limit, not a broken browser.

AV1 is the newest and the most economical, and streaming services are moving to it. Decoders exist only in recent hardware; on older machines it runs on the processor.

## Everything stays with you

The page asks the browser engine and gets an answer at once. Not a single file is downloaded, no data about your device is collected and nothing is sent anywhere.
