---
toolSlug: text-to-speech
locale: en
category: text
tool: text-to-speech
title: Text to Speech Online — Read Text Aloud and Download MP3
h1: Text to Speech
navName: "Text to Speech"
summary: "Read the text aloud and save the recording"
description: "Turn text into speech right in your browser: three models to choose from, download as MP3 or WAV. Your text goes nowhere — the computing happens on your own device."
faq:
  - question: Which model should I pick?
    answer: "Look at the job, not the weight — the two are unrelated. Piper is 20–60 megabytes and knows all four site languages: take it if data costs you or the device is weak. Kokoro is 93 megabytes and gives the liveliest voice, but speaks English only. Supertonic is 380 megabytes and still computes twice as fast as Piper; it is also the only one that reads numbers, dates and abbreviations with no preparation. The weight is printed on the button — that is your data allowance, and you should know it before you press, not after."
  - question: Is the heavier model really slower?
    answer: "No, and that is the most surprising part of the choice. We measured it: on the same phrase Supertonic (380 MB) takes 2.6 seconds while Kokoro (93 MB) takes 6.5. Weight only tells you how much downloads once; speed depends on how the model is built, not on its size. Choosing by weight is therefore a good way to end up with the slowest option."
  - question: Where does my text go?
    answer: "Nowhere. It is processed right inside your browser — there is simply nowhere to send it, all the computing happens on your device. We store nothing and keep no logs. The only thing that arrives over the network is the model itself, once: it then stays with you, and the next reading starts immediately, even with no internet."
  - question: Can I download the audio on an iPhone?
    answer: "Yes, and without a single permission. It used to be that getting a file meant asking permission to record the window's sound — because the voices came from the system, and a browser will not hand those to a page as a file. Now the sound is born on the page itself, so it already is a file. It works the same on an iPhone, on Android and on a computer."
  - question: Does it support languages other than English?
    answer: "Yes, in two models out of three. Piper knows English, Spanish, Russian and Ukrainian, with several voices each. Supertonic knows 31 languages. Kokoro, contrary to what is widely written, speaks English only: Spanish and French voices do sit in its repository, but the library it runs through in the browser does not know them — we checked."
  - question: Why is long text read in pieces?
    answer: "Because a model computes the whole text at once, and on a long article that would be tens of seconds with no sign of life. We cut at the ends of sentences — never in the middle of a word, or the join would give a click and a chopped syllable — compute the pieces in turn and glue them into one file. You hear the beginning while the rest is still being computed."
  - question: How big is a model and does it download every time?
    answer: "Once. Piper is 20–60 megabytes per voice, Kokoro 93, Supertonic 380. What you download stays in the browser's storage, so next time the reading starts straight away. If you no longer need a model, you can remove it from the device with the button beside the voice list."
related:
  - speech-to-text
  - audio-to-text
  - reading-time
---

Paste your text, pick a model and press Play. Everything is computed on your own device.

## Three models, and weight says nothing about speed

**Piper — 20–60 MB.** The lightest, and the only one that knows all four site languages. Take it if data costs you or the device is weak.

**Kokoro — 93 MB.** The liveliest voice of the three, but English only. Spanish voices do exist in its repository, yet the library it runs through in the browser does not know them — we checked.

**Supertonic — 380 MB.** The heaviest and, at the same time, the fastest: 2.6 seconds against Kokoro's 6.5 on the same phrase. It knows 31 languages and reads numbers, dates and abbreviations without any preparation.

The weight is printed on the button. That is your data allowance, and you should know it before pressing.

## Your text stays with you

The computing happens in your browser. There is nowhere to send the text — the model is already downloaded and works here. We store nothing and keep no logs.

The only thing that comes over the network is the model itself, once. After that it sits on the device and the next reading starts immediately, even offline.

## You get a file on any device

Downloading used to require permission to record the window's sound: the voices came from the system, and no browser hands those to a page as a file. Now the sound is born right here — which means it already is a file. On an iPhone it works exactly as on a computer.

## Long text is read in pieces

We cut at the ends of sentences, never in the middle of a word: a join there would give a click and a chopped syllable. The pieces are computed in turn and glued into one file — you hear the beginning while the rest is still being worked out.

## How this was checked

Every number here was measured in a live browser rather than taken from a description. Model weights are verified against the actual files on every build: if one of them is swapped tomorrow, we find out before you do. Along the way three figures from widely circulated write-ups turned out to be wrong — which is precisely why we measure.
