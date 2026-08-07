---
toolSlug: audiobook-check
locale: en
category: audio
tool: audiobook-check
title: Audiobook Audio Check Online — Loudness, Peak, Noise Floor
h1: Audiobook Check
navName: Audiobook check
description: Check a recording against what audiobook platforms require — average loudness, peak level and noise floor. Three numbers and a plain verdict. Free, no sign-up.
faq:
  - question: Which requirements are checked?
    answer: The three standard ones. Average loudness between -23 and -18 dB, peak no higher than -3 dB, noise floor no louder than -60 dB. Those are ACX's numbers, and other major platforms ask for much the same.
  - question: What is the noise floor and how is it measured?
    answer: It's the level of the background in the gaps — how loudly the room hisses when nobody is talking. The quietest half-second of the recording is taken, because the gaps between sentences are exactly what platforms listen to.
  - question: The loudness fails — what do I do?
    answer: If the swing is wide, [even out the levels](/en/dynamic-compressor) first, then [normalize](/en/normalize-audio). The compressor brings quiet passages up towards loud ones and normalizing lifts the result to the ceiling without overloading.
  - question: The peak is too high — what do I do?
    answer: Normalizing brings the recording down so its loudest moment sits under the ceiling. If it's one isolated click or thump, cutting it out with [trim](/en/trim-audio) is simpler.
  - question: The noise floor is too high — what do I do?
    answer: Run [noise reduction](/en/denoise-audio), but gently — heavy cleaning costs the voice its life. And mind the order, noise first and loudness second. The other way round, the compressor lifts the noise along with the speech.
  - question: Does passing guarantee my book is accepted?
    answer: No. We measure what numbers can measure. Platforms also listen for performance quality — breaths, clicks, consistency of tone between chapters. This checks the technical requirements, it doesn't judge the recording.
---

Load a chapter and the tool measures three things and tells you whether it passes. Each is flagged separately, so it's clear what needs fixing.

What it's good for:

- **Narrating an audiobook** for a platform with technical requirements
- **Checking before you submit** — cheaper than a rejection and a redo
- **Comparing chapters** so the book holds a consistent level
- **Diagnosing a recording** — is it the loudness or the noise?

Check each chapter separately: one quiet chapter spoils a whole book, and an average across everything hides exactly that.

Order of fixes: [remove noise](/en/denoise-audio) → [even out the levels](/en/dynamic-compressor) → [normalize](/en/normalize-audio) → check again.
