---
toolSlug: text-to-speech
locale: en
category: text
tool: text-to-speech
title: Text to Speech Online — TTS Voice Generator & MP3 Downloader
h1: Text to Speech Converter
navName: Text to speech
description: "Turn text into speech right in your browser: your own device voices, adjustable speed and pitch, download as MP3 or WAV. Free, no sign-up, and the text never leaves your device."
faq:
  - question: How do I download the speech as MP3?
    answer: "Press Download and the browser will ask permission to record sound — that is not a whim of ours. A page has no way to take the synthesiser output straight into a file: no such API exists in any browser. The one honest route is to record the sound of the window, and permission for that is asked by the browser itself. In the picker choose this tab (or the entire screen) and be sure to tick “Also share audio”. The text is then read out loud, the recording runs, and at the end you get a real file."
  - question: Why does Download not work on an iPhone?
    answer: "Safari on iPhone and iPad does not hand tab audio to a page. That is how the system is built, and the limitation is the same for every site, not just ours. Listening still works in full, with every Siri voice. To get a file, open this same page in Chrome or Edge on a computer."
  - question: What does the voice quality depend on?
    answer: "The voices come from your device, not from our server. On iPhone and Mac they are the Siri voices, on Windows the Microsoft ones, and Chrome adds Google network voices on top. That is why the list differs from person to person and the same text sounds different on different machines. The most natural ones are usually those marked “network” in the list — and they are also the ones that record to a file most reliably."
  - question: Is there a length limit?
    answer: "5000 characters at a time. That is not our arithmetic but the behaviour of the systems: the longer the text, the likelier the synthesiser aborts halfway through for reasons of its own. A long article is better voiced in parts, and the resulting files are easier to handle that way too."
  - question: Why is long text read in chunks?
    answer: "Chrome cuts speech off at around fifteen seconds — a long-standing quirk. So we split the text at sentence ends in advance and read the pieces back to back with no gaps. Chunk length is derived from the chosen speed: the slower the speech, the shorter the chunk, because otherwise it would not finish in time."
  - question: Is the text sent anywhere?
    answer: "No. The speech is synthesised by your own operating system; the page only passes it the letters. We store nothing and keep no logs. The recording made during download also stays in the memory of the tab and disappears with it."
  - question: What if the downloaded file turns out silent?
    answer: "You will not get such a file. After recording, the page measures the loudness, and if it is silence the download does not happen — instead you get an explanation of what to change. Usually it helps to pick a voice marked “network”, or to record again choosing the entire screen together with system audio."
related:
  - speech-to-text
  - audio-to-text
  - reading-time
---

Paste the text, pick a voice and press Play. Everything runs on your own device.

## The voices are your own

The list comes from your system: Siri on iPhone and Mac, Microsoft on Windows, plus Google network voices in Chrome. Nothing to install and nothing to pay for — those voices are already on the device.

## Speed and pitch change as it reads

Move a slider while it is reading and the speech restarts from the current sentence with the new setting. No waiting until the end of the paragraph to hear the difference.

## About downloading, honestly

No browser lets a page take the synthesiser output straight into a file — the capability does not exist. So Download asks your permission to record the sound of the window; without it there is no file. In exchange the file is a real one, and an empty one is never handed over: the loudness is checked before the download happens.
