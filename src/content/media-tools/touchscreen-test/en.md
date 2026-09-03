---
toolSlug: touchscreen-test
locale: en
category: device-tests
tool: touchscreen-test
title: "Touchscreen Test Online — Find Dead Zones and Ghost Touches"
h1: Touchscreen Test
navName: Touchscreen test
description: "Test the touchscreen of a phone, tablet or laptop in the browser: dead zones, broken lines and ghost touches. Free, no sign-up and no app to install."
faq:
  - question: How do I know the screen has a dead zone?
    answer: "Drag your finger across the pad a few times without lifting it and watch the cells. A cell you definitely crossed that stays dark is a dead zone. One or two misses during a fast swipe mean nothing — what matters is an area that refuses to fill no matter how often you go over it."
  - question: The screen ignores touches in one spot — what should I do?
    answer: "Rule out the false causes first: take off the case and the screen protector, wipe the screen and your hands dry, unplug the charger. A wet finger, a thick film and a cheap charger produce exactly the same picture as a real fault. If the area still stays silent after that, it is the digitiser, and it is fixed by replacing the glass-and-digitiser assembly, not by any setting."
  - question: What are ghost touches and where do they come from?
    answer: "They are taps nobody made: the screen opens apps on its own, types letters, scrolls by itself. The usual culprits are cracked glass, a cable knocked loose in a drop, or a cheap charger — the screen honestly reads its interference as a finger. Checking is simple: switch to the ghost-touch mode, put the device on a table and leave it alone for fifteen seconds. Anything counted in that time was not done by a human."
  - question: Why does the test need full screen?
    answer: "Dead zones almost always live right at the edges — that is where a drop lands and where the ribbon cable runs. Inside a browser window you cannot reach the edge of the display: the address bar is above and the buttons are below. That is what the full-screen button is for — the pad covers the whole window and the edges finally become reachable."
  - question: Does this work on a touchscreen laptop and with a stylus?
    answer: "Yes. The page listens for any pointing device rather than for a finger specifically: finger, stylus, pen and an ordinary mouse all work. One test therefore covers a laptop touchscreen, a tablet and a drawing pen. A mouse is handy for checking that the page itself works, but it will not reveal dead zones — those are found with a finger."
  - question: Can it measure the touch sampling rate?
    answer: "No, and we will not pretend otherwise. The browser hands over touches already processed by the operating system, so the real sampling rate of a digitiser cannot be measured from a web page — any number we printed would be invented. What is tested here is what genuinely can be tested: where the screen feels you, where it does not, and whether it fires on its own."
related:
  - mouse-test
  - dead-pixel-test
  - keyboard-test
---

Drag your finger across the pad without lifting it and cover it completely. Cells fill in under your finger and a trail is drawn on top — so you see not only where the screen feels you, but how: a smooth line or a stuttering one.

## What gets tested

- **Dead zones** — areas where a touch never arrives at all
- **Breaks and stutters in the line** — the sensor catches your finger but loses it mid-stroke
- **Ghost touches** — the screen firing on its own, with no finger
- **How many fingers the screen holds at once** — the counter shows the largest number of simultaneous touches

## About dead zones

A dead zone is an area that does not answer touch. It appears after a drop, after a cheap glass replacement, or simply with age, when the contact between the glass and the touch grid works loose. Such zones almost always sit near the edges — that is where the impact is hardest and the cable is closest.

That is exactly why the test needs full screen. In a normal browser window the address bar is above and the buttons are below, so a finger never reaches the true edge — and the fault sits precisely there. The full-screen button lets the pad cover the whole window.

Before carrying the phone to a repair shop, rule out the false causes: a case pressing on the edge of the display, a thick or peeling protector, damp hands and a cheap charger all produce exactly the same picture as a broken digitiser.

## About ghost touches

The opposite trouble: the screen taps by itself. Apps open without you, letters appear in text fields, lists scroll on their own. You cannot catch this by touching — only by not touching, so it lives in its own mode: put the device on a table, take your hands away and wait fifteen seconds. Everything counted during that time was not done by you.

The most common and most annoying cause is a cheap charger: the screen reads its interference as a finger. Unplug it and run the watch again before thinking about repairs.

## What this test does not do

It does not measure the touch sampling rate. The browser hands over touches already processed by the system, so the real figure is simply unavailable to a web page — we would rather print no number than an invented one. It does not measure pressure either, and it cannot tell an original screen from a replacement: the browser does not know that.
