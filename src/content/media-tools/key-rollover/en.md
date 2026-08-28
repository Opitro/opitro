---
toolSlug: key-rollover
locale: en
category: device-tests
tool: key-rollover
title: How many keys at once — keyboard rollover and anti-ghosting test
h1: How many keys at once
navName: Keys at once
description: "Hold several keys down and see how many actually reach the computer. A rollover and anti-ghosting check that matters for games. In your browser, nothing to install."
faq:
  - question: How many keys should register at once?
    answer: "An ordinary USB keyboard tops out at six plus modifiers: that is how the data is transmitted, and it is not a fault. Keyboards with full rollover hold every key at once, so the counter climbs past ten. Fewer than six means presses are being lost inside the keyboard itself."
  - question: What are ghosting and anti-ghosting?
    answer: Inside a keyboard the keys sit at the crossings of a grid. When several on one line are held, the controller may fail to tell them apart and either drop a press or invent a third one — that invented press is a ghost. Anti-ghosting is circuitry that prevents it, though it does not by itself mean the keyboard holds many keys.
  - question: Why do neighbouring keys drop out first?
    answer: Because on cheap boards neighbours tend to share a line. Try holding keys from opposite corners of the keyboard — usually more of them get through than the same number of keys in a row.
  - question: Do modifiers count?
    answer: Yes, and it is worth holding them. Shift, Ctrl and Alt are almost always transmitted separately from the other keys, so they add to the count on top of the limit and work in your favour.
  - question: What if the system swallowed some of the keys?
    answer: "Then they never counted, and that is worth remembering. Alt+Tab, the Windows key, Cmd+Q and similar combinations are claimed by the system before the browser — they never reach us at all. Test with ordinary keys: letters, digits, arrows."
  - question: Does this matter for games?
    answer: For fast ones, yes. Running diagonally while crouching and shooting means three or four keys plus modifiers at the same time. Six is enough almost always; a keyboard that drops out at three will freeze your character at the worst possible moment.
related:
  - keyboard-test
  - mic-test
  - sound-test
---

Hold as many keys at once as you can and keep holding. The large number shows how many of them reach the computer right now; the best result of the attempt stays next to it.

## What this checks

A keyboard does not always pass on everything you press. Ordinary models have a limit beyond which extra presses are simply dropped — better to learn about it before your character freezes mid-run.

- **An ordinary USB keyboard** — six keys plus modifiers
- **Full rollover** — every key at once, the counter climbs past ten
- **Fewer than six** — presses are being lost inside the keyboard

## How to test properly

Hold the **modifiers too** — Shift, Ctrl and Alt travel separately and add to the count on top of the limit. Pick keys **from opposite corners**: neighbours in one row share a line on cheap boards and drop out more often. And avoid combinations the system claims, such as Alt+Tab or the Windows key: those never reach the browser at all, rather than being lost by the keyboard.

## Worth knowing

We show exactly what reached the browser, and nothing more. Which key went missing on the way cannot be determined: the browser receives an already assembled list. If you need to check every key separately, the [keyboard test](/en/keyboard-test) does that — there you can see which one does not respond at all.
