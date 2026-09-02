---
toolSlug: hdr-test
locale: en
category: device-tests
tool: hdr-test
title: HDR test online — is HDR supported and switched on
h1: HDR support test
navName: HDR support
description: "Find out whether HDR is working on your screen right now and which HDR video formats your browser can decode: HDR10, HLG, AV1, Dolby Vision. Nothing to install."
faq:
  - question: Does this page show HDR or only ask about it?
    answer: "Only ask — and that is said plainly. A web page cannot show real HDR: that needs a file with an extended range, and ordinary page colours never go brighter than white. What the browser does know for certain is whether the screen is in high dynamic range right now, and which HDR formats it can decode. Those two answers are what you get here."
  - question: It says HDR is off, but my monitor supports HDR. Why?
    answer: "Usually HDR is simply switched off in the system: in Windows that is Settings → System → Display → HDR, with a separate switch per monitor. The second common cause is the cable: HDR needs HDMI 2.0 or newer, or DisplayPort 1.4, and an old cable quietly delivers a picture without the extended range. The third is the browser itself: Firefox went a long time without answering this query, so there you get a dash instead of an answer."
  - question: Why is there no HDR on YouTube when my screen supports it?
    answer: "Almost always the browser, not the screen. YouTube delivers HDR in AV1 or VP9 Profile 2, and if the browser cannot decode those in the extended range you get the ordinary picture. Look at the format list below: if AV1 says no, no monitor in the world will give you HDR on YouTube. Switching browsers helps — Chrome, Safari and Firefox each support a different set."
  - question: Everything looks washed out since I turned HDR on. Is something broken?
    answer: No, that is ordinary Windows behaviour. With HDR on, ordinary content is mapped into the extended range and by default often looks faded. The same display settings have an SDR brightness slider — move it until ordinary content looks right again. A Mac has no such slider; there the mapping usually looks correct straight away.
  - question: What does "colour depth 24 bit" mean?
    answer: "Eight bits for each of the three channels — the ordinary depth. HDR wants more: ten bits per channel, so 30 and up. But treat this figure as a hint rather than a verdict: systems report it inconsistently, and on some builds it stays at 24 even with HDR on. The first row is the real answer, not this one."
  - question: Can I check a TV this way?
    answer: "Yes, if you open the page in the TV's browser. Bear in mind that built-in browsers often answer incompletely: they may not know the dynamic-range query at all, so you get a dash instead of yes or no. For a TV it is more reliable to look at its own picture settings and its incoming-signal information."
  - question: Why does Dolby Vision almost always say no?
    answer: Because browsers almost never have it. Dolby Vision needs a licence and is normally supported only in service apps and in TVs themselves; among browsers only Safari on Apple hardware handles it. A no here says nothing bad about your screen or your system.
related:
  - monitor-color-test
  - refresh-rate
  - screen-burn-in-test
---

The check runs by itself, with nothing to press. At the top is the main answer — whether the extended range is working on this screen right now. Below are two lists: what the browser knows about the screen, and which HDR video formats it can decode.

## The screen and the browser are different things

Half the complaints of "I bought an HDR monitor and there is no HDR anywhere" come down to this. The screen can be in high dynamic range while the browser cannot decode HDR10 or AV1 — and the video arrives ordinary. It also happens the other way round: the browser handles everything but HDR is off in the system. Hence two lists rather than one blanket answer.

## If it says HDR is off

1. **Check the system settings.** In Windows: Settings → System → Display → HDR, with its own switch for each monitor. On a Mac HDR turns itself on for supported screens.
2. **Check the cable.** HDR needs HDMI 2.0 or newer, or DisplayPort 1.4. An old cable delivers a picture without the extended range silently, with no error at all.
3. **Check the browser.** Not every browser answers this question: where there is no answer you get a dash, and that does not mean there is no HDR.

## What this page does not do

It measures nothing. Brightness in nits, real contrast and how well the screen actually renders HDR are beyond any web page — that needs an instrument. Everything here is the browser's own answer, honestly labelled as such. If the picture looks dull or blown out, check [colour](/en/monitor-color-test) separately: that shows whether the screen is clipping detail in shadows and highlights.
