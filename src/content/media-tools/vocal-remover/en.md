---
toolSlug: vocal-remover
locale: en
category: audio
tool: vocal-remover
title: Remove Vocals from a Song Online — Free Karaoke Track
h1: Remove Vocals from a Song
navName: Remove vocals
description: "Remove the vocals from a song and keep the backing track: three methods, from instant to a neural network. Everything runs in your browser, nothing is uploaded."
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
related:
  - audio-pitch
  - audio-speed
  - trim-audio
---

Upload a song and press “Remove the vocals” — “Standard” starts straight away and the backing track appears below as its own row. Not what you wanted? Pick another method: the newest result goes on top and the earlier ones stay below, so you can compare them by ear.

## Three methods

- **Fast** — instant, nothing to download. Cancels the middle of the stereo image, where the voice usually sits; a slider sets the subtraction strength.
- **Standard** — the neural network, the usual choice. A 38 MB model downloads once and stays in your browser.
- **Best** — the best result there is. Runs on a computer only.

## Worth knowing

Everything is computed on your device: neither the song nor the result is sent anywhere. Every finished track has its own play button and its own download button — MP3 or WAV. Need the voice instead of the backing, [remove the music](/en/remove-music) is next door; if you need both tracks at once, [separate vocals from music](/en/split-vocal) does it in one pass. Your file and everything already computed travel with you.
