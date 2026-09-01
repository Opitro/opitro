---
toolSlug: refresh-rate
locale: en
category: device-tests
tool: refresh-rate
title: Screen refresh rate test — check your monitor Hz online
h1: Screen refresh rate
navName: Refresh rate
description: "Find your screen’s real refresh rate — 60, 120, 144 or 240 Hz — and the frames per second your browser draws. Measured from real frames, nothing to install."
faq:
  - question: How does the page work out the refresh rate?
    answer: "A screen tells the page nothing about itself, but the browser draws frames at exactly the rate the screen refreshes. We time the gaps between frames: 8.3 milliseconds means 120 Hz, 16.7 means 60."
  - question: Why do I get 60 when my monitor is 144?
    answer: "Most often the rate is simply not switched on in the system settings: the monitor can do 144 but is running at 60. On a laptop the rate is often dropped on battery to save power. Cables matter too: 144 Hz needs a proper DisplayPort or HDMI 2.0 and above."
  - question: Which screen is measured if I have several?
    answer: "The one the browser window is on. Drag the window to another monitor and press “Measure again” — the numbers will differ, and that is correct."
  - question: What does “steadiness” mean?
    answer: "How similar the gaps between frames are. On a healthy screen they are almost identical and steadiness is close to a hundred. Dips mean frames come unevenly, usually because the computer is busy rather than because of the screen."
  - question: What are dropped frames?
    answer: "Frames the browser failed to deliver on time: the gap came out half again longer than usual. Occasional drops happen to everyone."
  - question: Is this a refresh rate test or an FPS test?
    answer: "Both at once. The browser draws frames at exactly the rate of the screen and cannot go faster, so the frames per second here equal the refresh rate. This is not the same as frames in a game: a game may render more or fewer, but the screen can never show more than its refresh rate."
  - question: Why does the number keep moving slightly?
    answer: "On variable refresh rate screens that is normal: they adapt the rate to the load. On an ordinary screen the number should sit almost still."
related:
  - dead-pixel-test
  - polling-rate
  - mouse-test
---

Nothing to press: the measurement starts by itself and takes a couple of seconds. Stay on this tab — in the background the browser slows frames down and the number would be wrong.

## What the test shows

- **Hertz** — the headline number, how many times per second your screen refreshes. It is also frames per second: the browser draws at exactly the screen rate, so FPS here equals the refresh rate
- **Peak** — the best value of the run
- **Frame, ms** — how long one frame lasts: 60 Hz is 16.7 ms, 120 Hz is 8.3
- **Steadiness** — how similar the gaps between frames are
- **Dropped frames** — how many times the browser missed its slot

The slider under the number crosses its track in exactly one second. It tells your eye what a number cannot: whether the picture really moves smoothly.

## What counts as normal

| Rate | Where you find it |
|---|---|
| 60 Hz | Ordinary monitors, most laptops, budget phones |
| 90–120 Hz | Modern phones and tablets |
| 144–165 Hz | Gaming monitors |
| 240 Hz and above | Competitive gaming monitors |

## If the number is lower than it should be

Check the system settings first: very often a monitor that can do 144 Hz is running at 60 because nobody switched it on. On a laptop, unplug from battery power — saving mode almost always drops the rate.

The third cause is the cable. High rates need a proper DisplayPort or HDMI 2.0 and above; an old or overly long cable will quietly cut the rate.

## Worth knowing

The measurement is for the screen the window is on. With two monitors, drag the window across and measure again.

Next door you can [check the screen for dead pixels](/en/dead-pixel-test), or, if it is the mouse you care about, [measure its polling rate](/en/polling-rate).
