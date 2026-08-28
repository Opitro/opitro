---
toolSlug: key-chatter
locale: en
category: device-tests
tool: key-chatter
title: Key types twice — keyboard chatter test online
h1: A key that types twice
navName: Key chatter
description: "One press, two letters? Check the keyboard for chatter: the page catches repeated events and shows how many milliseconds apart they arrived."
faq:
  - question: What is key chatter?
    answer: Under each key sits a switch with two contacts. As it wears out, a single press makes the contacts close and open several times within a fraction of a second — the computer receives two signals instead of one, and an extra letter appears in your text.
  - question: How do you tell chatter from fast typing?
    answer: "By the time between events. A deliberate double tap takes a human 100 milliseconds or more — a finger simply cannot go faster. Anything within forty is impossible to press, and we call it chatter outright. Between forty and eighty we mark it carefully as “looks like chatter”."
  - question: The test finds nothing but letters still double. Why?
    answer: Some keyboards and operating systems filter chatter out before the event reaches the browser — then it looks clean here. Try the same key in a text editor. If it doubles there while the test stays silent, the cause may be the key repeat setting or sticky keys in the system.
  - question: Does a held key count?
    answer: No. When a key is held, the system starts repeating the character on purpose — that is its job, not a fault. The browser marks such repeats separately and we skip them; otherwise any held space bar would look broken.
  - question: What do I do if chatter is found?
    answer: "On membrane keyboards cleaning usually helps: a crumb or dust under the key stops the contact from returning. On mechanical ones a single switch gets replaced, which is far cheaper than a new keyboard. On a laptop it is worth going to a repair shop."
  - question: How many presses does a proper check need?
    answer: Type normally for a minute or two, ideally real text. Chatter does not show on every press, so pressing one key ten times may reveal nothing while live typing catches it.
related:
  - keyboard-test
  - key-rollover
  - mic-test
---

Type the way you normally type. If a key fires twice in a row faster than a human possibly could, the page catches it and shows how many milliseconds apart the second event arrived.

## How to read it

- **Under 40 milliseconds** — chatter for certain: no finger is that fast
- **Between 40 and 80** — looks like chatter, though very fast typing still lands here
- **Empty** — this keyboard has no repeats

A key caught chattering gets marked on the diagram, and the list keeps its name and timing. The newest case always sits on top.

## If chatter is found

On membrane keyboards dirt is usually to blame: a crumb under the key stops the contact from returning. Take it apart and clean it. On mechanical boards the switch itself wears out and gets replaced one at a time — cheaper than a new keyboard. On a laptop, a repair shop is the safer route: the key clips off differently and breaks easily.

## Worth knowing

We only see what reaches the browser. Some keyboards and systems filter chatter out themselves — then it looks clean here even though the switch is already worn. If you need to check whether a key responds at all, there is the [keyboard test](/en/keyboard-test); if you want to know how many keys register at once, try [keys at once](/en/key-rollover).
