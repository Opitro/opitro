---
toolSlug: sound-meter
locale: en
category: tests
tool: sound-meter
title: Sound Level Meter Online — Measure Noise in Decibels
h1: Sound meter
navName: Sound meter
description: "Shows how loud it is around you: a big number in decibels plus a plain-language comparison. Runs in the browser through your microphone, nothing to install."
faq:
  - question: How accurate are these decibels?
    answer: "It is an estimate, roughly ±10 dB. An exact figure needs a microphone of known sensitivity, and a browser cannot find that out, so the calculation assumes an average microphone. That is enough for comparing: you can see the bedroom is quieter than the kitchen, and that closing the window helped."
  - question: Can I use this against noisy neighbours?
    answer: "No. Complaints and workplace limits need a calibrated meter with a certificate — a browser reading will not be accepted as evidence. This tool answers a different question: is it loud or quiet here, and how does it compare."
  - question: Why does the number jump around?
    answer: Because the sound around you is not constant. We smooth the reading so it does not flicker, and show the loudest moment of the session separately — handy for catching rare peaks like a passing car.
  - question: What counts as harmful?
    answer: The usual reference is 85 decibels over long periods. Conversation is around 60, a busy street about 70, a drill or a lawnmower over 90. What harms hearing is not a loud moment but hours next to it.
  - question: Is a phone microphone good enough?
    answer: Yes, and it is handier than a laptop because you can hold it near the source. But phones often apply noise suppression at system level, which makes readings too low. We ask the browser to switch processing off, though not every phone obeys.
---

Press "Start the meter" — the big number shows how many decibels are around you, and the line under it translates that into plain words: quiet room, conversation, busy street.

Next to it you can see the loudest moment of the whole session.
