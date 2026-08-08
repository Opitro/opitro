---
toolSlug: audio-to-text
locale: en
category: audio
tool: audio-to-text
title: Audio to Text Online — Transcribe and Make Subtitles, Free
h1: Audio to Text
navName: Audio to Text
description: Upload a recording or a video and get the text plus ready-made subtitles. Lectures, interviews, podcasts, YouTube clips. Everything runs in your browser; the file never leaves your device. Free, no sign-up.
faq:
  - question: How does this work?
    answer: "The Whisper speech model is downloaded into your browser and runs on your own device. The recording is never sent to a server — the only thing that travels is the model, towards you. Once it has arrived you can disconnect from the internet entirely and transcription keeps working."
  - question: How long does it take?
    answer: "Measured on this page, on three minutes of Russian speech, on an ordinary computer. The lighter model runs at 0.22 of the recording's length — an hour-long lecture in about 13 minutes. The best one runs at 0.82, so the same hour takes 49 minutes. A phone's processor is roughly four times slower; multiply accordingly. The page prints an estimate for your own file next to the quality setting."
  - question: How accurate is the recognition?
    answer: "Measured on 161 words of Russian speech in three conditions — clean, with noise, and with room echo. The best model: 94, 94 and 97 percent. The lighter one: 78, 85 and 81. So the lighter model makes roughly three times as many mistakes, and you notice. Bear in mind that was a speaker with clear diction. Real speech is harder — an independent Russian benchmark puts a model even larger than ours at about 91% on audiobooks, 79% on YouTube video and 63–68% on phone calls. Which is exactly why the text is editable here."
  - question: Which model should I pick?
    answer: "The best one is the default, for a reason: it makes about three times fewer mistakes. The price is time — an hour of audio takes it around 49 minutes against 13 for the lighter one, and longer still on a phone. Take the lighter one when the recording is long and you only need the gist: what it was about, where a particular moment is. When the text is going to be used, take the best one."
  - question: What is the “setup” on the first run?
    answer: "That is the recogniser itself arriving. It runs in your browser rather than on our server, so it has to be delivered to you once. The lighter one is about 79 MB, the best one about 239 MB. After that it lives in your browser's cache: reload the page, come back tomorrow, and there is no setup again — transcription starts straight away. If you are on mobile data and counting it, take the lighter one."
  - question: Can I speak it instead?
    answer: "There is a separate page for that — [voice typing](/en/voice-typing). Press the button, talk, stop, and the text appears by itself. This page is for recordings you already have: a file or a video you need text or subtitles from."
  - question: What are the subtitle formats and how do they differ?
    answer: "SRT is the common one, understood by YouTube, VLC and every video editor. VTT is the same thing for a video player on a web page. In both, the timings come from the recognised speech; if you correct the text by hand those corrections go into the TXT, while the subtitles keep the original timing."
  - question: Does it tell speakers apart?
    answer: "Yes — tick \"Mark who is speaking\". The text splits into turns labelled Voice 1, Voice 2 and so on, and the names go into the subtitles too. The first time you switch it on, a small extra model of about two megabytes is loaded.\n\nAn honest limit: two clearly different voices separate well — in testing the turn boundaries landed within a tenth of a second of the truth. Two similar ones, say two women in the same register, can be merged into one. It has no idea who anyone is by name, only first, second and so on."
  - question: Can it translate to English at the same time?
    answer: "Yes. Set Result to “Translate to English” and Russian, Ukrainian, Spanish or any other speech comes back as finished English text. The subtitles are English too, on the original timing. English is the only direction — that is how the model itself works."
  - question: Which languages?
    answer: "Ninety-nine — everything the model knows, from English, Russian and Ukrainian through to Hebrew, Hindi, Swahili and Cantonese. The list is written in the language of the page. You can leave it on Automatic: it works the language out in a couple of seconds and tells you what it found. If you already know, saying so is slightly more accurate."
  - question: How long a recording can it handle?
    answer: "Up to an hour at a time. The limit is browser memory rather than the model: an hour of audio is already hundreds of megabytes in RAM, and a phone may not survive it. Split anything longer first — there is [split audio](/en/split-audio) for that."
  - question: Does it work with video?
    answer: "Yes, drop a video file in and the audio track is used. For a big file it can be quicker to pull the sound out first with [video to audio](/en/video-to-audio)."
---

Upload a recording and get text you can copy, correct right here, and download — as a plain file or as ready-made subtitles.

What people use it for:

- **Transcribing a lecture** — recorded on a phone, read as text instead of sitting through two hours
- **Interviews into text** — for journalists and researchers, with timestamps and speakers marked
- **Subtitles for video** — SRT for YouTube and editing, VTT for a website
- **English subtitles for a foreign clip** — translation to English is built in
- **Voice memos** — say the thought, get it into your notes
- **Meeting minutes** — from a call recording

It runs on your device. The model comes to you once and stays in your browser's cache; the recording is never uploaded — you can check that by going offline after the model has loaded.

The text is editable in place: no recogniser is perfect, and fixing two words where they are beats moving everything somewhere else to fix it there.

Nearby: [voice typing](/en/voice-typing), [split audio](/en/split-audio), [video to audio](/en/video-to-audio), [remove noise](/en/denoise-audio), [remove silence](/en/remove-silence), [voice recorder](/en/dictaphone).
