---
toolSlug: normalize-audio
locale: en
category: audio
tool: normalize
title: Normalize Audio Online, Free — Bring a Quiet Recording Up
h1: Normalize Audio
navName: Normalize
description: Bring a quiet recording up to full loudness without distortion — the tool finds the loudest moment and lifts the whole file to match. Nothing to configure. Free, no sign-up, nothing gets uploaded.
faq:
  - question: What does normalizing actually do?
    answer: It finds the single loudest peak in the file and multiplies the whole recording by whatever factor puts that peak at 97% of maximum. Any louder and it would start clipping. A quiet recording peaking at 30% comes back roughly three times louder.
  - question: Will it even out the quiet and loud parts?
    answer: No, and this is the part worth knowing. The entire recording is multiplied by one number, so the relationship between quiet and loud stays exactly as it was — everything simply gets louder together. To bring quiet passages up towards the loud ones, use the [audio enhancer](/en/audio-enhancer) — it targets a broadcast loudness level rather than just scaling the file.
  - question: How is this different from changing the volume?
    answer: On the volume page you choose the factor, which makes it easy to overshoot and end up with distortion. Here the factor is calculated from the file itself, so it can never overload — but you don't get a say in it either.
  - question: Why did nothing change after normalizing?
    answer: Because the file was already recorded at full level — its peak was already at the ceiling, leaving no headroom to use. That's normal for music from streaming services and store-bought tracks.
  - question: Does it hurt the quality?
    answer: The multiplication itself is lossless. Any loss comes from encoding the result, so take the WAV if the file is heading into an editor next; MP3 here is written at 192 kbps.
  - question: Can I hear it before downloading?
    answer: Yes — the play button plays the normalized version rather than the original, so the difference is obvious straight away.
related:
  - audio-volume
  - remove-silence
  - audio-enhancer
---

Load a file and press play — what you hear is already the processed version. There's nothing to set: the factor is worked out from the recording itself. Then pick a format and download.

## What it's good for

- **Quiet voice recordings** — a lecture or interview captured from too far away
- **Several clips in a row** at different levels that need to match
- **Voice-over for video** that disappears under the music
- **Old transfers** from tape and vinyl, where the recording level was set low

Keep the main limitation in mind: normalizing moves the whole recording together. If one sentence in the file was shouted and the rest is a whisper, that shout hits the ceiling first and everything else stays just as quiet. A recording like that is better served by the [audio enhancer](/en/audio-enhancer).