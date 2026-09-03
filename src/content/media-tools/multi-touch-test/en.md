---
toolSlug: multi-touch-test
locale: en
category: device-tests
tool: multi-touch-test
title: "Multi-Touch Test Online — How Many Fingers Your Screen Holds"
h1: Multi-Touch Test
navName: Multi-touch test
description: "Test multi-touch on a phone, tablet or touch laptop: how many touches the screen holds at once and whether it drops any. Free and with no sign-up."
faq:
  - question: How many touches should a screen hold?
    answer: "Five touches are held by any modern phone, ten by most tablets and touch laptops. The exact figure for your device is shown in the “claimed by the system” box. If the screen confidently holds as many as it claims, multi-touch is healthy."
  - question: I put down five fingers and only four circles appear — is it broken?
    answer: "First spread your fingers wider. Two touches placed side by side are honestly counted by capacitive glass as one wide blob — that is how the glass works, not a fault. If your fingers are well apart and a circle still never appears, or vanishes under a finger that has not moved, then it is the screen: usually cracked glass or a cable knocked loose."
  - question: What does “claimed by the system” mean?
    answer: "It is the number the operating system reports to the browser — a promise from the driver, not a measurement. It comes from the maxTouchPoints property and says how many touches the panel is rated for on paper. Trust the circles you saw with your own eyes: those are the test, the claim is not."
  - question: Why is there always just one circle on my computer?
    answer: "Because a mouse or a pen is a single pointer; there is never a second one. The page shows them honestly, but multi-touch cannot be tested that way — it needs a touchscreen and fingers. On a touchscreen laptop everything works just like on a tablet."
  - question: The screen drops a finger while I move it — why?
    answer: "Usually because something breaks the contact: wet or very dry hands, a thick or peeling screen protector, gloves, or a case pressing on the edge of the display. Remove those and try again. If a finger always disappears in the same spot, check that spot with the [touchscreen test](/en/touchscreen-test) — it looks like a dead zone."
  - question: Can it test gestures such as pinch and rotate?
    answer: "There is no separate gesture test here, and none is needed: pinch and rotate are the operating system’s work on top of these very touches. If the screen holds two fingers steadily and never drops them while they move, gestures will work. If it drops them, the problem is not the gestures but the touches themselves."
related:
  - touchscreen-test
  - mouse-test
  - dead-pixel-test
---

Put several fingers on the pad at once. Each one gets its own circle with its own number and coordinates. Move your fingers without lifting them: the circles should follow and never disappear.

## What gets tested

- **How many touches the screen holds at once** — a live counter and the record for the session
- **Whether the screen drops fingers** — a circle vanishing under a resting finger shows instantly
- **What the system claims** — the declared number of touches next to the real one
- **Whether the screen confuses touches** — every finger keeps its own number, and it must not change mid-stroke

## How many fingers is normal

Five simultaneous touches are held by any modern phone, ten by most tablets and touch laptops. That is exactly why the measured number sits next to the claimed one: a promise without a test is worth nothing, and a test without a promise leaves you nothing to compare against.

A gap of one or two touches usually means fingers placed too close together rather than a fault: capacitive glass counts two adjacent touches as one wide one. Spread your fingers and try again.

## If the screen drops fingers

First remove whatever breaks the contact: dry your hands, take off the protector and the case, pull off the gloves. A wet hand and a peeling film lose touches just as well as a broken digitiser.

If a circle still vanishes under a motionless finger — and especially if it always happens in the same spot — check that spot with the touchscreen test: it looks like a dead zone, and the usual cause is cracked glass or a cable loosened by a drop.

## What this test does not do

It does not test gestures separately: pinch, rotate and two-finger scrolling are the system’s work on top of the same touches, and if the touches are healthy the gestures will be too. It does not measure pressure or the touch sampling rate either — nobody hands those numbers to a browser, and we will not invent them.
