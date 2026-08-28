---
toolSlug: mic-noise
locale: en
category: device-tests
tool: mic-noise
title: Microphone Noise Test — How Quiet Is Your Room
h1: Microphone noise
navName: Microphone noise
description: Measure background noise in ten seconds and find out whether your room is quiet enough to record in. Runs in the browser, audio stays with you.
faq:
  - question: Why no decibels like a sound level meter?
    answer: "Because that number would be made up. Real noise decibels are measured from air pressure, and a browser only sees the numbers a microphone sends — with no idea how sensitive that microphone is. The same room gives different figures on different microphones. So we show the level relative to your own microphone and draw the conclusion that does not depend on sensitivity: quiet enough to record, or not."
  - question: What if the result says "noisy"?
    answer: "Start with the obvious: computer fan, air conditioning, an open window. Then move the microphone closer to your mouth — twice as close means four times less background relative to your voice. A headset is almost always quieter than a laptop's built-in microphone."
  - question: Why does the measurement take ten seconds?
    answer: Long enough to catch both the steady hum and the occasional car going past. We use the typical level rather than the loudest moment, so one creaking chair does not spoil the result.
  - question: Can I measure with noise suppression on?
    answer: We switch it off for the measurement — otherwise the browser cleans the background itself and shows a silence that is not there. That is exactly why it is worth measuring here rather than inside a call app.
---

Press "Measure background noise" and stay quiet for ten seconds. No typing, no mouse — that counts as noise too.

At the end you get the verdict — quiet, fair or noisy — and the background level as a number.
