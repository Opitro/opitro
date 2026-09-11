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
  - question: Is it free, and do I need to sign up?
    answer: "It is free, it runs online and there is no sign-up: no account, no payment, no cap on the number of files. There is simply nothing for us to charge for — the speech is computed inside your own browser, on your own device, with no paid servers behind it. The only limit is 5000 characters at a time, and that one is technical: it keeps the work visible instead of leaving you waiting."
  - question: Which model should I pick?
    answer: "Look at the job, not the weight — the two are unrelated. Piper is 60–109 megabytes per voice (most often 60–73) and knows all four site languages: take it if data costs you or the device is weak. Kokoro is 93 megabytes and gives the liveliest voice, but speaks English only. Supertonic is 380 megabytes and still computes twice as fast as Piper; it is also the only one that reads numbers, dates and abbreviations with no preparation. The size is written right in the list — that is your data allowance, and you should know it before you press, not after."
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
    answer: "Once — but the three do it differently. Piper keeps a separate file per voice: 60–109 megabytes, most often 60–73, so changing the voice means a new download. Kokoro (93 megabytes) and Supertonic (380) have a single file covering all of their voices — download it once and switch voices as often as you like for free. What you download stays in the browser's storage, so next time the reading starts straight away."
related:
  - speech-to-text
  - audio-to-text
  - reading-time
---

Paste your text, pick a model and a voice, then press Generate. Online, free and with no sign-up: everything is computed on your own device.

## Your text stays with you

The computing happens in your browser. There is nowhere to send the text — the model is already downloaded and works here. We store nothing and keep no logs.

The only thing that comes over the network is the model itself, once. After that it sits on the device and the next reading starts immediately, even offline.

## You get a file on any device

Downloading used to require permission to record the window's sound: the voices came from the system, and no browser hands those to a page as a file. Now the sound is born right here — which means it already is a file. On an iPhone it works exactly as on a computer.

## Long text is read in pieces

We cut at the ends of sentences, never in the middle of a word: a join there would give a click and a chopped syllable. The pieces are computed in turn and glued into one file — you hear the beginning while the rest is still being worked out.

## How this was checked

Every number here was measured in a live browser rather than taken from a description. Model weights are verified against the actual files on every build: if one of them is swapped tomorrow, we find out before you do. Along the way three figures from widely circulated write-ups turned out to be wrong — which is precisely why we measure.
