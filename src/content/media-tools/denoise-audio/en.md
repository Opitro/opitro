---
toolSlug: denoise-audio
locale: en
category: audio
tool: denoise
title: Remove Background Noise from Audio Online, Free — Hiss and Hum
h1: Noise Reduction
navName: Noise reduction
description: Take steady background noise out of a recording — hiss, fan hum, mic static. Three strengths, and you can compare against the original by ear straight away. Free, no sign-up, nothing gets uploaded.
faq:
  - question: What kind of noise does this handle?
    answer: Steady, constant noise — a fan or air conditioner, room hiss, static from a cheap mic, tape background. The algorithm builds a spectral picture of that background and subtracts it from the recording.
  - question: What about sudden noises, a door slam or a dog?
    answer: One-off sounds stay. The tool is built for a background that's present the whole time; a single loud event in the middle of a recording is indistinguishable from wanted signal as far as it's concerned.
  - question: How much does it actually clean up?
    answer: Measured on a recording with hiss about 35 dB below the signal — on "strong" the noise level dropped by nearly half, signal-to-noise went from 34.8 to 39.2 dB, and the wanted sound came through with its level untouched.
  - question: Why did nothing change on my recording?
    answer: Most likely the noise is too loud. When it's comparable in level to the voice, the algorithm treats it as part of the wanted signal. Tested — with noise only 13 dB below the signal, cleaning achieved nothing at all. Recordings like that need re-recording, not processing.
  - question: Why does the voice sound underwater on "strong"?
    answer: That's the price of aggressive cleaning — the quiet detail of speech goes along with the noise. Start on "light", compare against the original with the switch, and only go up while the voice still sounds natural.
  - question: How do I compare before and after?
    answer: Pick a strength and processing starts on its own, then plays the result. The Original / Result switch flips between the two on the fly, from the same point in the recording.
  - question: What format does the result save in?
    answer: MP3, WAV or M4A, your choice. It used to be MP3 only, which meant cleaning up a WAV handed back a lossy file — that's gone now.
---

Load a recording and pick a cleaning strength — processing starts immediately and the result plays. Flip between original and result to judge the difference honestly, then download.

What it's good for:

- **Phone recordings indoors** with air conditioning or street noise underneath
- **Interviews on a cheap mic** with constant static
- **Tape and vinyl transfers** with steady hiss
- **Calls and lectures** recorded next to a computer fan

Straight about the limits: this is spectral subtraction of a background, not neural speech restoration. It handles steady noise well, but the harder it cleans, the more the voice itself suffers. If the noise is louder than the voice, nothing here will save it — no amount of processing will.

Nearby: [enhance audio](/en/audio-enhancer), which combines cleaning with loudness levelling and EQ, plus the [equalizer](/en/audio-equalizer) for cutting a specific hum, and [remove silence](/en/remove-silence).
