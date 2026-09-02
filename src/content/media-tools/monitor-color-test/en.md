---
toolSlug: monitor-color-test
locale: en
category: device-tests
tool: monitor-color-test
title: Monitor colour test online — check colour accuracy and greyscale
h1: Monitor colour test
navName: Monitor colours
description: "Seven charts: greyscale, shadow and highlight detail, gradients without banding, pure colours and sRGB against display-p3. Nothing to install."
faq:
  - question: What exactly do these charts check?
    answer: "Three things. First, whether the screen separates close shades: the grey steps, shadows and highlights show if it is crushing dark detail or blowing out light detail. Second, how even the ramps are: bands across a smooth ramp give away a cheap panel or bad driver settings. Third, the colours themselves: whether red leans orange, or grey drifts towards green or blue."
  - question: How many shadow steps should I see?
    answer: "On a well set-up screen in a dark room you can tell apart almost all eighteen, bar the first pair. If the first five or six merge, the screen is crushing shadow detail: lower the black level or contrast in the monitor menu. But first get rid of light falling on the screen — under a lamp no monitor can separate the dark steps."
  - question: Where do the bands on the smooth ramp come from?
    answer: "Most often from a six-bit panel pretending to be eight by flickering between neighbouring shades: bands on a ramp are its usual signature, especially on cheap laptops. Less often it is the settings — crushed contrast, driver 'enhancements' or a picture mode on a TV. Start by switching all processing off and looking again."
  - question: Can I calibrate my monitor with this?
    answer: "No. Calibration means measuring colour with an instrument and building a profile; no chart can do it by eye. What charts genuinely catch are the gross faults: crushed shadows, blown highlights, a colour cast on grey. Those are cured in the monitor menu, not by by-eye calibration tools, which only shift the curve in the driver."
  - question: What does "wider than sRGB" mean and do I need it?
    answer: "sRGB is the ordinary gamut nearly everything on the web is made for. Wide-gamut screens (display-p3, DCI-P3) show richer reds and greens. That is a plus for photos and film but a minus for accuracy: on such a screen ordinary images look oversaturated unless the system converts colours. The last chart shows which one you have — if the right half is visibly brighter, the gamut is wider."
  - question: Does this work on a TV or a phone?
    answer: "Yes, open the page in the device's browser. On a TV make sure to switch picture processing off — vivid and dynamic modes, noise reduction, contrast enhancement: they change the image beyond recognition, and you would be testing them rather than the screen. On a phone turn off auto-brightness and night mode."
  - question: Grey looks tinted — is the screen faulty?
    answer: "Not necessarily. Usually it is the colour temperature: monitor menus often ship set to 'cool', which pushes grey towards blue. Set 6500 K or 'standard' and look again. If the tint stays and is uneven — one edge of the screen yellower than the other — that is backlight non-uniformity, and no setting will fix it."
related:
  - dead-pixel-test
  - screen-burn-in-test
  - refresh-rate
---

Press any chart and it opens full screen; pressing again moves to the next, and the arrow keys step both ways. Start with the grey steps: if those look right, the screen is in good shape and you can check the rest selectively.

## Before you start

1. **Get rid of the light.** Draw the curtain or at least turn away from the lamp: under direct light no monitor separates the dark steps.
2. **Switch processing off.** Night mode, auto-brightness, driver "enhancements", TV picture modes. Otherwise you are testing those.
3. **Look straight on.** At an angle a panel shifts brightness and hue by itself — laptops most of all.

## What counts as normal

All sixteen grey steps are distinct and the progression is even. In the shadows only the first pair merges. In the highlights every step is visible. The smooth ramp has no bands across it. Red does not lean orange, blue does not lean purple, and grey stays grey with no blue or green in it.

## What this page does not do

It does not calibrate a monitor and it does not measure gamut — neither is possible in a browser. Calibration means measuring with an instrument, and gamut is a quantity you cannot learn by looking at a screen with that same screen. The one honest thing here about gamut is the last chart: the reddest colour sRGB can show sits next to the reddest display-p3 can show, and your own eye settles it.
