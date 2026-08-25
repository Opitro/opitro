---
toolSlug: remove-music
locale: en
category: audio
tool: remove-music
title: "Remove Music From a Song Online — Keep the Vocals Only"
h1: Remove music from a song
navName: Remove music
description: "Keep just the voice from a song: three methods, from instant to a neural network. Everything runs in your browser, the file is never uploaded."
faq:
  - question: How do the three methods differ?
    answer: "“Fast” is instant and downloads nothing: it pulls out the middle of the stereo image, where the voice usually sits. “Standard” genuinely separates voice from music — the model downloads once, 38 MB, and stays in your browser. “Best” does the same but cleaner; it is heavy and runs on a computer."
  - question: What is the strength slider?
    answer: It belongs to “Fast” only and decides how hard to subtract. At full strength the music goes along with part of the voice; lower down the voice stays intact but the backing is more audible. The neural methods have nothing to tune, so the slider is hidden there.
  - question: Where does my file go?
    answer: Nowhere. The work happens inside your browser, on your device. The model is downloaded from an open repository and stays with you — you will not download it twice.
  - question: Can I remove the vocals instead afterwards?
    answer: Yes — the “Remove the vocals” button sits next to the download. Your file travels with you, no need to upload it again, and if the separation already ran, the other page opens with the result ready.
  - question: Why does “Best” refuse to run on my phone?
    answer: "It is built for a computer: on a phone the same work would take hours and would almost certainly be cut off. The button stays visible, says so plainly and points you to plain “Standard”, which works everywhere."
  - question: Will I get a clean a cappella?
    answer: On modern recordings — close to it. On dense mixes, and where the voice is drenched in effects, traces of music remain. That is an honest limit of any separation, not a fault.
---

Upload a song and press “Remove the music” — “Standard” starts straight away and the voice appears below as its own row. Not what you wanted? Pick another method: the newest result goes on top and the earlier ones stay below, so you can compare them by ear.

## Three methods

- **Fast** — instant, nothing to download. Pulls out the middle of the stereo image, where the voice usually sits; a slider sets the strength.
- **Standard** — the neural network, the usual choice. A 38 MB model downloads once and stays in your browser.
- **Best** — the best result there is. Runs on a computer only.

## Worth knowing

Everything is computed on your device: neither the song nor the result is sent anywhere. Every finished track has its own play button and its own download button — MP3 or WAV. Need the backing instead of the voice, [remove the vocals](/en/vocal-remover) is next door; if you need both tracks at once, [separate vocals from music](/en/split-vocal) does it in one pass. Your file and everything already computed travel with you.
