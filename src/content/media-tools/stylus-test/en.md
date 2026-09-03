---
toolSlug: stylus-test
locale: en
category: device-tests
tool: stylus-test
title: "Stylus Test Online — Check Apple Pencil & Drawing Tablet Pen"
h1: "Stylus Test — Pressure and Tilt"
navName: Stylus test
description: "Free online drawing test for digital pens. Measure stylus pressure sensitivity, tilt support, line smoothness and pointer precision instantly in your browser."
faq:
  - question: How do I check a stylus’s pressure sensitivity?
    answer: "Pick the marker and draw a line, pressing harder as you go. The line thickness follows the pressure directly, and beside it a bar and a percentage rise with it. If the line stays flat and the number never moves, pressure is not reaching the browser. On Windows that usually means Windows Ink is switched off in the tablet settings."
  - question: Why does the pressure read exactly 50 percent?
    answer: "Because what is drawing is not a pen. For a finger and a mouse the browser always reports 0.5 — that is not “half strength”, it is “there is no real pressure here”. The pressure feature on this page counts only for a pen, and only when the value differs from that half."
  - question: How do I check pen tilt?
    answer: "Switch to the pencil and tilt the pen: the stroke gets wider and paler, as if drawn with the side of the lead, while the arrow in the round gauge leans the same way and shows the angle. The Apple Pencil reports tilt, and on drawing tablets nearly every pen does except the simplest ones."
  - question: What does “points per second” mean?
    answer: "It is how many pen position samples reached the page in a second. We count the samples, not browser events: events arrive in a batch once per frame, so counting them would give exactly 60 for any pen. The figure depends on the pen, the screen and the browser — and line smoothness depends on it. It is not the stylus’s rated report rate, and we will not pass it off as one."
  - question: Why are there a circle, a spiral and a straight line on the canvas?
    answer: "So you have something to compare against. Jitter and edge drift are impossible to spot on a blank sheet — the eye has nothing to hold on to. Trace the circle and the spiral: if the stroke follows the drawing cleanly, the pen and the tablet are fine; if the line veers off or steps along near the edges, you see it at once."
  - question: The eraser and barrel button never light up — is the pen broken?
    answer: "Not necessarily. An unlit feature means “the page has not seen this”, not “this does not exist”. The eraser is the far end of the pen and not every model has one; the barrel button is often remapped in the manufacturer’s software. Twist around the axis is not reported even by the Apple Pencil. Call a pen broken when something it definitely has fails to work."
related:
  - touchscreen-test
  - multi-touch-test
  - mouse-test
---

Trace the faint templates with your pen. The marker tests pressure — line thickness follows how hard you press. The pencil tests tilt — the stroke lies wider and paler, as if drawn with the side of the lead. The gauges above the sheet live with the pen, and the six features below light up once the page has seen each of them for itself.

## What gets tested

- **Pressure sensitivity** — a bar, a percentage and the live thickness of the line
- **Tilt angle** — an arrow in the dial shows which way and how far the pen is leaning
- **Points per second** — how many pen samples reach the page; smoothness depends on it
- **Twist, barrel button, eraser and hover** — each as its own feature
- **Jitter and edge drift** — by tracing the circle, the spiral and the straight line

## About pressure and that half

If the pressure reads exactly fifty percent, what is drawing is not a pen. For a finger and a mouse the browser always reports 0.5, and that means “no real pressure”, not “pressed halfway”. So the pressure feature here counts only for a pen and only when the number departs from that half — otherwise the page would congratulate you on working pressure every time you dragged a finger.

The second common cause of a flat line on a computer is Windows Ink being switched off in the tablet settings. While it is off, pressure simply never reaches the browser, and the pen is not to blame.

## About the rate

“Points per second” is an honest count of the samples that reached the page. The browser delivers them in a batch once per frame, so counting events is pointless: any pen would come out at exactly 60. We open the batch and count what is inside.

A steady 60 usually means samples never arrived any faster. A good tablet with a fast pen gives 120 or more — and the difference is visible: the line stops breaking into segments on quick strokes.

## What this test does not do

It does not state the stylus’s rated report rate or its number of pressure levels: nobody hands those figures to a browser, and we will not invent them. It does not tell an original pen from a copy, and it does not measure latency — latency is made up of the screen, the system and the browser, and pinning it on the pen would be dishonest.
