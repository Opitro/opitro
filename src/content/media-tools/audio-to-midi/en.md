---
toolSlug: audio-to-midi
locale: en
category: audio
tool: audio-to-midi
title: Audio to MIDI Online — Convert a Recording to Notes, Free
h1: Audio to MIDI
navName: Audio to MIDI
description: Upload a recording and get the notes out of it — MIDI, sheet music for MuseScore, or a plain table. Piano roll, chords, tempo and key. Everything runs in your browser; the file never leaves your device. Free, no sign-up.
faq:
  - question: How does this actually work?
    answer: A note-recognition model is downloaded into your browser — about one megabyte, once, then it stays cached. It runs on your device; the recording is never sent to a server. The model is Basic Pitch, released by Spotify under an open licence, and it is the best thing that can honestly be run straight in a browser today.
  - question: How accurate is it?
    answer: On a test piece whose answer was written down in advance — a 28-note piano passage with room reverb, noise and uneven touch — it found all 28 and invented none. But that is a clean example with one instrument. Real music comes out worse, and the result is best treated as a strong first draft you will correct, not as a finished score.
  - question: Why does a normal song come out as mush?
    answer: Because a song has drums, bass, guitar and a voice all sounding at once, and the model is trying to hear individual notes in that. This tool is built for one source at a time — piano, guitar, saxophone, a hummed or whistled melody. If you must work from a song, try [removing the vocal](/en/vocal-remover) first and transcribing the parts separately.
  - question: What does the sensitivity slider do?
    answer: It moves the threshold below which a note is treated as too uncertain to keep. Left keeps only the obvious ones; right lets everything through, junk included. There is no single correct value — a clean recording wants one setting and a live one wants another, which is why this is a slider and not a constant buried in the code. Moving it is instant; the model is not run again.
  - question: How long does it take?
    answer: Eight and a half seconds of audio take about 0.7 seconds, so a three-minute recording is around fifteen seconds. Add a little the first time for the model download. On an older machine with no real graphics card it is noticeably slower, because the work falls to the processor.
  - question: Where do the tempo and key come from?
    answer: From separate algorithms — the same ones behind [detect tempo](/en/change-tempo) and [detect key](/en/detect-key). Tempo is found from rises in loudness, with an explicit check of the doubled reading, which is the mistake that makes 140 read as 70. Key comes from which notes carry the weight. Both numbers are worth a glance before you trust them, especially on music without a steady beat.
  - question: Why are there so few chords compared with other sites?
    answer: Because chords here land on the beat and hold for at least half a bar. Estimate every frame independently and the chord changes three times a second — technically closer to the audio and impossible to play. Here an extra chord change costs more than a small inaccuracy, so the chart comes out the way a person would have written it.
  - question: What opens the downloaded files?
    answer: MIDI opens in any music program — GarageBand, FL Studio, Ableton, Logic, Reaper. The tempo and key are written into the file, so the track lands on the grid straight away. MusicXML is sheet music, read by MuseScore, Sibelius and Finale; MuseScore is free and prints to PDF from there. CSV is a plain table for a spreadsheet or your own script.
  - question: Can I get a PDF of the sheet music?
    answer: "Yes. The Sheet music tab draws the score on the page, and the print button opens your browser's ordinary print dialog, where you choose Save as PDF. No other program needed. If you want to edit the notation rather than just print it, take the MusicXML and open it in MuseScore."
  - question: What does transpose mean?
    answer: Shifting every note up or down without changing anything else. Useful when a melody does not sit in your voice, or your instrument is tuned differently. A semitone is the next key along; an octave is twelve semitones. The shift applies both to what you download and to the chord chart.
  - question: Is my recording uploaded anywhere?
    answer: No. The only thing downloaded is the model — nothing leaves your device, not the file and not the result. You can disconnect from the internet once the model has arrived and everything keeps working.
---

Upload a recording and get the notes: a piano roll, a list with the exact timing of every note, a chord chart, and a MIDI file that opens in any music program.

## What people use it for

- **Working a melody out by ear** — hum or play it, then see what the notes actually are
- **Getting a live take into a sequencer** — play it on a piano, edit it as MIDI afterwards
- **Reading someone else's part** — see what was played instead of guessing
- **Getting a chord chart** — one tied to the beat, not changing three times a second
- **Printing sheet music** — the score is drawn on the page; print or save a PDF in one click

It works on a recording of one instrument or one voice. A full song with drums and vocals comes out as mush — that is a limit of the approach, not a setting waiting to be adjusted.

Notes are lined up on a grid of sixteenths, and notes played together are written as one chord per staff — a readable draft rather than an engraved edition.

Nearby: [detect key](/en/detect-key), [detect tempo](/en/change-tempo), [vocal range](/en/vocal-range), [remove vocals](/en/vocal-remover), [change pitch](/en/audio-pitch).
