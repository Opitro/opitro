---
toolSlug: split-vocal
locale: en
category: audio
tool: split-vocal
title: Separate vocals from music online — split a song into two tracks
h1: Separate vocals from music
navName: Separate vocals
description: "Split a song into voice and music in one pass: both tracks land side by side, listen and download the one you need. Your browser does the work, the file never leaves it."
faq:
  - question: How is this different from “remove the vocals”?
    answer: "That page gives you one track — the backing — and is built around it. Here the same computation gives you both: voice and music sit next to each other, and each can be played and downloaded on its own. Same maths, different thing to walk away with."
  - question: What is the difference between “Standard” and “Best”?
    answer: "“Standard” is a 38 MB model that runs on the processor and works on any device, phones included. “Best” is 64 MB and needs a computer's graphics card: it untangles dense mixes more cleanly, but on a phone it would take hours and break off. You can run both and compare by ear."
  - question: Will the tracks be perfectly clean?
    answer: No, and it would be dishonest to promise it. Voice and instruments were recorded together and live in the same frequencies; separating them without a trace is impossible. A shadow of the backing stays in the vocal, a hint of voice stays in the music. For karaoke, studying an arrangement or rehearsing, that is plenty.
  - question: How long does it take?
    answer: "“Standard” works about three times faster than the song plays: a three-minute track takes roughly a minute on an ordinary laptop. “Best” lands in a similar time on a graphics card. Add the model download the first time — after that it stays in your browser."
  - question: Will a mono recording work?
    answer: No. Separation leans partly on the difference between the left and right channel, and mono has none. The page checks this right after loading and says plainly that there is nothing to split.
  - question: Where does my file go?
    answer: Nowhere. The song opens in your browser, is computed there and stays there. Neither the original nor the result is sent to a server — there is no reason for them to leave your device.
  - question: Why did the tracks disappear after I opened another page?
    answer: Two pairs of tracks are hundreds of megabytes of memory, and a phone needs that memory for the next page. So we release it deliberately when you leave. Download what you liked before moving on.
related:
  - vocal-remover
  - remove-music
  - audio-to-midi
---

Upload a song and press “Split”. The neural network takes the recording apart into two tracks — voice and music — and both appear below: switch between them as they play and download whichever you came for.

## What it is good for

- **Backing and vocal at once** — without pushing one file through two tools
- **Studying an arrangement** — hear what plays under the voice and how it was mixed
- **Rehearsal and karaoke** — sing over the music, or learn a part from the voice
- **A starting point for a remix** — a clean vocal over your own music

## Two methods

- **Standard** — a 38 MB model, runs on the processor. Works everywhere, phones included.
- **Best** — 64 MB, needs a computer's graphics card. Sharper on dense mixes where voice and instruments overlap heavily.

Run both and compare: the pairs stack up on the page one under another, and the difference is audible straight away. Each track downloads separately, as MP3 or WAV.

## About copyright

Splitting a song is not the same as owning it. Both tracks stay derivatives of someone else's recording: the rights to the music, to the performance and to the master do not go anywhere. Listening, studying and rehearsing is free. Publishing, performing for money and releasing a remix need the rights holder's permission.

## Worth knowing

Everything is computed on your device; the song is not uploaded anywhere. The model downloads once and stays in the browser — the second time there is nothing to wait for. If you only need the backing track, [remove the vocals](/en/vocal-remover) is next door; if you only need the voice, use [remove the music](/en/remove-music).
