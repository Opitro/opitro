---
toolSlug: remove-music
locale: en
category: audio
tool: remove-music
title: Remove music from a song online — extract the acapella free
h1: Remove the music from a song
navName: Remove music
description: "Keep the vocal only: an acapella for a remix, a sample or studying a part. Three methods, from instant to neural. Your browser does the work, the file never leaves it."
faq:
  - question: Will the acapella be truly clean?
    answer: Close, but not without caveats. Reverb and delay added to the voice during mixing live in the same frequencies as the music, so part of those tails leaves with the backing and the voice can sound drier than the original. On sparse recordings the result is near-studio; on dense ones traces of the arrangement remain.
  - question: What happens to the backing vocals?
    answer: "They stay with the lead — to the network they are voice as well. Separating a soloist from the harmonies is not possible: they were recorded as one layer and sit in the same range. If the harmonies get in the way, pick a passage where the soloist sings alone."
  - question: Can I release a remix with this acapella?
    answer: Technically yes; legally it is someone else's vocal. The rights to the performance and to the master stay with the rights holder, and extracting the voice does not change that. For yourself, for study, for a sketch — go ahead. For release, streaming or sale you need permission or a licence.
  - question: Why does the voice have a metallic edge?
    answer: "That is how frequency work shows up: where music and voice share a band, separation leaves small gaps and the ear reads them as glassiness. “Best” shows much less of it — it takes the recording apart in more detail. Choosing a passage with a simpler arrangement helps too."
  - question: Is the acapella usable as a sample in a beat?
    answer: Yes, that is the most common reason people pull one. Cut the phrase you need in [trim audio](/en/trim-audio), and if it does not sit in your key, shift it in [change the pitch](/en/audio-pitch). The tempo stays where it was.
  - question: Can I extract just one singer from a duet?
    answer: No. Separation tells voice from instruments, not one singer from another — both voices land on the same track. The only thing that helps is picking a section where one of them sings alone.
  - question: What is the strength slider for on “Fast”?
    answer: It decides how hard the middle of the stereo image is pulled out. At full strength the voice comes through louder, but everything else panned to the centre comes with it — bass and kick. Turn it down if the backing is too present; the neural methods do not need it and it stays dimmed there.
related:
  - split-vocal
  - vocal-remover
  - trim-audio
---

Upload a song and press “Remove the music” — “Standard” starts straight away and the voice appears below as its own row. Each new attempt lands on top, so you can play them one after another and keep the most intelligible one.

## What an acapella is for

- **A remix or a mashup** — your own beat under the original vocal
- **A sample** — cut a phrase and drop it into a track
- **Studying a part** — hear the delivery, the breaths, the harmonies
- **Practice** — sing along to the voice and check your own intonation
- **Audio for video** — a voice without music does not fight your own bed

## Three methods

- **Fast** — instant, nothing to download. Pulls out the middle of the stereo image; a slider sets the strength.
- **Standard** — the neural network; this is where to start. The model is 38 MB, downloads once and then lives in your browser.
- **Best** — the cleanest acapella. Runs on a computer only.

Backing vocals stay with the lead — to the separation they are the same voice. “Fast” has a quirk of its own: along with the vocal it pulls out bass and kick, which are panned to the centre too.

## About copyright

Extracting a voice is not the same as owning it. An acapella is still part of someone else's recording: the rights to the performance and to the master do not go anywhere. Listening, studying and sketching for yourself is fine. Releasing a remix, publishing a sample or selling a track with this vocal needs the rights holder's permission.

## Worth knowing

Everything is computed on your device: neither the song nor the voice is sent anywhere. Each row plays and downloads on its own, as MP3 or WAV. Need the backing instead, [remove the vocals](/en/vocal-remover) is next door; need both tracks at once, [separate vocals from music](/en/split-vocal) hands them over in one pass. The song and every result already computed come along, so nothing gets recomputed.
