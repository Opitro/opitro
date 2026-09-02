---
toolSlug: audio-delay-test
locale: en
category: device-tests
tool: audio-delay-test
title: Audio latency test online — check Bluetooth audio delay (ms)
h1: Audio delay test
navName: Audio delay
description: "Measure audio delay in milliseconds: a flash on the radar and a click, and a slider brings them together. For Bluetooth headphones, headsets, speakers and TVs."
faq:
  - question: How does it work?
    answer: "A beam sweeps around a circle and flashes at the top mark, with a click at the same instant. With wireless headphones the click arrives later than the flash: the sound needs time to travel over the radio link. The slider moves the click forward, sending it earlier. When the flash and the click coincide for you, the slider value is the delay of your headphones."
  - question: Why can a browser not measure this by itself?
    answer: "Because it does not know when the sound physically reached your ear. The page hands the audio to the operating system; from there it goes through a driver, a radio link and the earphone itself, and every step adds time that nobody reports back. The figure at the top of the page is the latency of its own path only, up to the device output. Everything beyond that can be caught only by a person."
  - question: What counts as a normal delay?
    answer: "Wired headphones give 5–40 milliseconds, below the threshold of noticing. Ordinary Bluetooth on SBC and AAC runs 120 to 300. aptX Low Latency and LE Audio bring it down to 40–80, but both devices have to support them, the phone and the headphones alike. Anything above 150 shows on people's lips in films and gets in the way in games."
  - question: Why does the delay not bother me in films but does in games?
    answer: "Because a video player knows about it and shifts the audio track itself — the system reports the output latency and the player lines the picture up with the sound. A game cannot do that: a shot has to be heard when you pressed the button, and it cannot be sent earlier because the event has not happened yet. So the same headphones are fine with a film and a nuisance in a shooter."
  - question: How do I reduce the delay?
    answer: A cable is the most effective answer — it removes the question entirely. Among wireless options, a low-latency codec helps, but both devices must speak it. On Android the codec can sometimes be chosen in developer settings; on an iPhone there is no such control. On a TV, look for game mode and a manual audio offset, usually given in milliseconds.
  - question: The delay differs between left and right. What is that?
    answer: That is the earbuds drifting out of sync with each other rather than a fault of the source. In fully wireless models the two halves sync between themselves, and that link sometimes slips. Test each ear separately with the left and right buttons; a reset and re-pairing usually fixes it.
  - question: How accurate is this measurement?
    answer: Accurate enough to tell wired from Bluetooth and a good codec from a bad one, but it is not a laboratory measurement. Your visual reaction time is part of the result, and so is the way your screen renders the flash. A spread of 20–30 milliseconds between attempts is normal, so measure a few times and take the average.
related:
  - tone-generator
  - sound-test
  - hearing-test
---

Put your headphones on and press “Start the radar”. The beam sweeps round and flashes at the top mark together with a click. Move the slider until the flash and the click feel simultaneous — the number on the slider is your delay.

## Why a beam rather than a plain flash

The beam shows **when** the flash is coming, so your eye has time to prepare. Against a sudden blink the coincidence is caught about half as well, because you are comparing two events you did not expect. A full turn takes 1200 milliseconds, with marks every hundred.

## What the numbers mean

- **under 50 ms** — wired sound. Unnoticeable even in games.
- **50–150 ms** — good Bluetooth. Invisible in films, already a problem for shooting.
- **over 150 ms** — a cheap codec or an old version of Bluetooth. Visible on the lips.

## What this page does not do

It does not measure the delay by itself — that is impossible from a browser, which has no way of knowing when the sound reached your ear. The number at the top is the latency of its own path, from the page to the device output; everything after that, in the radio link and the earphone, is not included. So the measuring is done by you, and your reaction time is part of the result. Measure a few times and take the average.
