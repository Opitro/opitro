---
toolSlug: remove-silence
locale: en
category: audio
tool: remove-silence
title: Remove Silence from Audio Online, Free — Cut the Pauses
h1: Remove Silence
navName: Remove silence
description: Automatically cut the pauses and dead air out of a recording — and see exactly how much came out. Sensitivity is adjustable. Free, no sign-up, nothing gets uploaded.
faq:
  - question: What counts as silence here?
    answer: The recording is scanned in 20-millisecond slices, and a slice is dropped if nothing in it rises above the threshold. The sensitivity slider sets that threshold — from 1 (remove only near-total silence) to 10 (cut aggressively, including quiet breaths and room tone).
  - question: Will it cut quiet words along with the pauses?
    answer: At high sensitivity it can. Start around 3–4 and listen with the play button. The line under the setting reports how much was removed — if eight minutes vanished out of ten, the value is clearly too high.
  - question: Why does it say there was nothing to remove?
    answer: Because at the chosen sensitivity no slice fell below the threshold — typical for music, or for a recording with noticeable background noise. Raise the value and try again.
  - question: Do natural pauses between sentences survive?
    answer: No — all silence goes, short pauses included. Speech gets tighter but also more hurried, which can sound unnatural for a podcast, though it saves real time on a rough transcription pass.
  - question: Can you hear where the cuts are?
    answer: Usually not, because the joins happen at very low volume. On music with long decays a seam can be audible, which is where this tool suits speech far better than it does music.
  - question: How much smaller does the file get?
    answer: By exactly the proportion the duration shrank. The line under the setting shows both at once — what it was, what it became, and how much came out.
related:
  - trim-audio
  - compress-audio
  - audio-speed
---

Load a recording and press play — you'll hear the processed version, and the line under the setting will tell you how much silence went. If it took out too much or too little, move the slider and listen again.

## What it's good for

- **A lecture or call recording** where half the time is pauses
- **Voice memos** with long silences at the start and the end
- **A rough transcription pass** — listen in half the time without speeding up the speech
- **Dictated notes** with thinking gaps between sentences
- **Shrinking a file without quality loss** — removed silence costs nothing in sound, unlike compression

One tip: if there's a steady background hum in the recording, try the [audio enhancer](/en/audio-enhancer) first — the silence threshold works far more accurately on a clean recording.