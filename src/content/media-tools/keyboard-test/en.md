---
toolSlug: keyboard-test
locale: en
category: device-tests
tool: keyboard-test
title: Keyboard test online — check every key for free
h1: Keyboard test
navName: Keyboard test
description: "Press a key and it fills in on the diagram. You can see which one stays silent, which one sticks, and the key code for games. Right in your browser."
faq:
  - question: How do I tell which key is dead?
    answer: "Walk across the keyboard and watch the diagram: everything that responds stays filled in. At the end, the keys left blank are exactly the ones that never reached the browser. The counter at the top shows how many of the 104 you have covered."
  - question: I press a key and nothing happens on the diagram. Is it broken?
    answer: "Check three things first. Fn mode: on most laptops the top row sends volume and brightness by default, not F1–F12. NumLock: with it off the numeric pad sends arrows instead of digits. And combinations like Alt+Tab or the Windows key are taken by the system before the browser — they never reach us at all."
  - question: What does the “held right now” line mean?
    answer: "Those are the keys the browser considers pressed at this very second. Let everything go and look: if one stays on the list, it sticks. On membrane keyboards the usual cause is a crumb or a spill under the key; on mechanical ones, a worn switch."
  - question: Why show “place”, “character” and “code” for one key?
    answer: "They answer three different questions. The place (KeyA, for instance) does not change when you switch language — that is how programs identify a key. The character is what gets typed. The code is the number games and older programs ask for when you assign a key by hand."
  - question: Does it work with a non-English layout?
    answer: Yes, and you do not need to switch anything. Keys are recognised by their position on the keyboard rather than by the letter printed on them, so the result is the same in any layout.
  - question: Why does the diagram show keys my keyboard does not have?
    answer: It draws a standard full-size 104-key keyboard. Laptops have no numeric pad, compact keyboards drop the navigation block too, and Macs have Command where Windows keyboards have the Windows key. Blank spots in those blocks are simply missing keys, not faults.
  - question: Can I test a keyboard connected to a phone?
    answer: Yes. If the keyboard is paired to a phone or tablet over Bluetooth, the page sees the presses exactly as it would on a computer. An on-screen keyboard will not do — it does not send real key presses.
related:
  - mic-test
  - sound-test
  - mic-noise
---

Press the keys one after another — each one that responds fills in on the diagram. A minute later you can see the whole picture: what works, what stays silent and what sticks.

## What the page shows

- **A 104-key diagram** — the key you hold glows, the ones already checked stay marked
- **A counter** — how many keys you have covered, so you are not guessing
- **Held right now** — catches a sticking key: you let go and it stays on the list
- **Place, character and code** of the last key — what you need when setting up games and programs

## If a key does not respond

Before taking the keyboard to a repair shop, check the simple things. **Fn mode**: on most laptops the top row controls volume and brightness by default, and F1–F12 only work with Fn held. **NumLock**: with it off the numeric pad sends arrows instead of digits. **Sticky keys** in the system settings change how Shift and Ctrl behave.

If the key still does not respond, the usual culprit is dirt underneath it or an oxidised contact. Membrane keyboards respond to cleaning; on mechanical ones a single switch can be replaced. On a laptop, check whether the ribbon cable came loose after a repair or a spill.

## Worth knowing

Nothing is sent anywhere: the page simply listens for key presses in your browser. Some combinations never reach it — Cmd+Q, Alt+Tab and the Windows key are claimed by the system first, and that is not a keyboard fault. Next door there are a [microphone test](/en/mic-test) and a [sound test](/en/sound-test) if you are checking the whole computer.
