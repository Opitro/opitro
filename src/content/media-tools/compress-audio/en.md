---
toolSlug: compress-audio
locale: en
category: audio
tool: compress
title: Compress Audio Online, Free — Make the File Smaller
h1: Compress Audio File
navName: Compress
description: Shrink an audio file — pick a bitrate and see the resulting size straight away. Ready-made settings for email, messengers and Discord. Free, no sign-up, nothing gets uploaded.
faq:
  - question: Where does the size under the slider come from?
    answer: It's not an estimate but exact arithmetic — bitrate times duration divided by eight. For constant-bitrate MP3 that is the size, give or take a couple of percent of framing overhead. Measured to check — at 40 kbps on a three-second file the promised 15 KB produced a 15,240-byte file.
  - question: Why does the slider skip certain numbers?
    answer: Because MP3 only knows a fixed ladder of bitrates — 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256 and 320. Nothing in between exists. The slider used to let you pick, say, 150, and the encoder quietly wrote 160; now the number on screen is always the one that ends up in the file.
  - question: How much does the sound suffer?
    answer: Down to 128 kbps, speech and podcasts hold up fine. Music noticeably degrades at 96 and below — the highs and the sense of air go first. Below 64 kbps the encoder also drops the sample rate to 24 kHz, so it gets duller as well. Use the play button to hear the result before downloading.
  - question: Can I get the quality back afterwards?
    answer: No. Lossy compression is one-way — what's discarded doesn't come back. If you might need the original, keep a copy before compressing.
  - question: Why can't I choose a format?
    answer: The whole point here is size at a chosen bitrate, and that means MP3. WAV has no bitrate to speak of and OGG uses a different quality scale. If you need a different format, use the [audio converter](/en/audio-converter).
  - question: Is there any point compressing an MP3 that's already compressed?
    answer: There is, if you have a size limit to meet, but the quality drops more than usual because you're stacking loss on loss. Start from a better source where you can.
---

Load a file and move the slider — the resulting size appears underneath as you go. The preset buttons set a bitrate for a specific job: email, messengers, Discord, archive. Have a listen, then download.

## What it's good for

- **An attachment that won't send** — mail services usually cap out at 20–25 MB
- **A long lecture recording** that has to go across in one piece
- **Voice notes for messaging**, where sending speed matters more than studio quality
- **Freeing up space** on a phone or in cloud storage for an archive of recordings

A working rule of thumb: speech at 64–96 kbps, a podcast with music at 128, music for listening at 192 and up. Go below 64 only when size genuinely matters more than sound.

Nearby: [audio converter](/en/audio-converter) to change format, and [remove silence](/en/remove-silence) — which sometimes shrinks a file more than compression does, without any quality loss at all.
