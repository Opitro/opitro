---
toolSlug: vocal-remover
locale: en
category: audio
tool: vocal-remover
title: Remove Vocals from a Song Online — Free Karaoke Track
h1: Remove Vocals from a Song
navName: Remove vocals
description: Take the voice out of a track and get a karaoke version. Runs in your browser, no sign-up, nothing uploaded to a server. Hear the result before you download it.
faq:
  - question: How does this work with no AI?
    answer: In most studio recordings the vocal sits dead centre — identical in the left and right channels. Subtract one channel from the other and anything centred cancels itself out. No model is needed for that; it's arithmetic on two tracks.
  - question: Why did it come out badly on my track?
    answer: The method doesn't work on everything, and it's better to know that upfront. If the vocal is spread even slightly across the stereo field, treated with a wide reverb, or the track has a modern wide mix, subtraction won't remove it — it'll just degrade the sound. It works well on tidy studio recordings, older ones especially.
  - question: What else disappears along with the voice?
    answer: Everything that sits centred, which usually means the bass and the kick. That's why "keep the bass" is on by default — the low end is taken from the summed channels and the subtraction only applies above 200 Hz. If the result sounds muddy, try full subtraction.
  - question: Can I keep only the vocal instead?
    answer: No, and we won't pretend otherwise. Isolating a clean vocal this way isn't possible — that needs neural stem separation, which doesn't run in a browser. Removal is the honest half.
  - question: Why is the result mono?
    answer: Because subtracting the channels leaves you with one signal. That's a consequence of the method, not a shortcut. For karaoke and practice it makes no difference.
  - question: Will a file from my phone or a messenger work?
    answer: Only if it's stereo. Voice messages and many phone recordings are mono, so there's nothing to subtract — the tool says so directly once you load one.
---

Load a track and press play — you'll hear the result immediately. The method doesn't work on every song, so listening first isn't optional here.

## What it's good for

- **A karaoke backing track** from a song you like
- **Practising along** — singing or playing over it without the original voice
- **Study** — picking an arrangement apart, hearing what sits behind the vocal
- **A starting point for a remix**

Straight about the method: this is channel subtraction, not neural separation. On tidy studio recordings it does a decent job; on modern wide mixes it often does nothing useful. There's no telling in advance, which is why you listen.

Nearby: [change pitch](/en/audio-pitch) if the backing track is in the wrong key, [change speed](/en/audio-speed) for learning a part, and [trim audio](/en/trim-audio).
