---
toolSlug: polling-rate
locale: en
category: device-tests
tool: polling-rate
title: Mouse polling rate test — check your hertz online
h1: Mouse polling rate
navName: Polling rate
description: "Check how many times per second your mouse reports its position. The measurement uses the real events, not the frames of your screen. Free, no sign-up."
faq:
  - question: What is a mouse polling rate?
    answer: "It is how many times per second the mouse tells the computer where it is, measured in hertz. Ordinary office mice run at 125 Hz — a report every eight milliseconds. Gaming mice do 500 or 1000, and some recent models 4000 or 8000."
  - question: Why do I get less than the advertised number?
    answer: "Usually one of three things: the mouse is plugged into a USB hub, a wireless connection has gone into power saving, or the processor is too busy to keep up. Some laptops also cut the rate on battery. Before blaming the mouse, plug it straight into the computer and measure again."
  - question: Why do other sites show 60 or 120 Hz for every mouse?
    answer: "Because they count the wrong thing. Browsers merge movement events and hand them over once per frame — count those batches and everyone gets the refresh rate of their screen. The real events sit inside the batch, and we unpack it."
  - question: How should I take the measurement?
    answer: "Move the mouse across the area smoothly, without lifting it and without pauses, for several seconds. During pauses no events arrive and the average drops. Sudden jerks do not help either."
  - question: Does it work with a trackpad or a finger?
    answer: "No, deliberately. A trackpad and a touchscreen have their own rate, but it works differently and does not compare with a mouse."
  - question: Does the polling rate matter for gaming?
    answer: "It does, but less than people think. The step from 125 to 500 Hz is real: latency drops from eight milliseconds to two. The step from 1000 to 4000 is a fraction of a millisecond, and few people can feel it."
related:
  - mouse-test
  - click-speed
  - keyboard-test
---

Move the mouse across the area for a few seconds and the page will show how many times per second it reports its position.

## What the test shows

- **Hertz now** — the rate over the last fraction of a second
- **Peak** — the best value of the whole run
- **Average** — across every event; this is your mouse's real rate
- **Samples** — how many movement events were collected; more means a firmer number

The chart shows whether the rate is steady. On a healthy mouse the line is almost flat; dips mean events are being lost on the way.

## What to expect

| Rate | What it means |
|---|---|
| 125 Hz | An ordinary office mouse, about 8 ms of latency |
| 250–500 Hz | An inexpensive gaming mouse, 2–4 ms |
| 1000 Hz | The gaming standard, about 1 ms |
| 2000–8000 Hz | Expensive recent models |

## Why our number is fairer

Browsers **merge** mouse movement events and hand them to the page in a batch, once per frame. Count the batches and every mouse comes out at 60 or 120 Hz — the refresh rate of the monitor. That is exactly why so many of these tests show everyone the same figure.

The real events sit inside the batch. We unpack it and get what the mouse actually sent.

## Worth knowing

Move smoothly and without stopping: during pauses no events arrive and the average falls. A number below the advertised one does not always mean a fault — a USB hub, wireless power saving or a busy processor are the usual causes.

Next door you can [check the buttons and wheel](/en/mouse-test) and [measure your click speed](/en/click-speed).
