---
toolSlug: mouse-test
locale: en
category: device-tests
tool: mouse-test
title: Mouse test online — check the buttons, wheel and double click
h1: Mouse test
navName: Mouse test
description: "Check the mouse buttons, the wheel and the double click. The page catches the unintended double click — the classic failure of a worn button."
faq:
  - question: My mouse double-clicks on its own — what is that?
    answer: "A worn micro-switch under the button fires twice on a single press. Telling it apart from your own double click is easy by timing: a human takes 100–500 milliseconds, while a bouncing switch fits into forty or less. The page counts those separately, in the “unintended doubles” line."
  - question: Why does the right button not open a menu on the drawing?
    answer: For the duration of the test we take the right button over — otherwise the menu would cover the drawing on every press. Same with the middle button, which normally starts autoscroll. Outside the drawing both behave as usual.
  - question: The side buttons never light up. Are they broken?
    answer: Most likely they simply are not there. “Back” and “forward” are far from universal, and on some mice they only work through the maker's own software. If the button physically exists and stays silent, check whether it has been remapped in that software.
  - question: Does it work with a laptop trackpad?
    answer: "Yes. A trackpad sends the same events as a mouse: a press is the left button, a two-finger press is the right one, and two-finger scrolling counts as the wheel. Trackpads usually have no middle button."
  - question: What do I do about a worn button?
    answer: "The micro-switch is replaced on its own and costs pennies — far cheaper than a new mouse and about half an hour with a soldering iron. Sometimes the cause is simpler: dust under the button blocking the contact, and blowing it out helps. Gaming mice often ship with spare switches."
  - question: Can this measure accuracy or polling rate?
    answer: No, and we will not pretend otherwise. The browser sees mouse events already processed by the system, so measuring the real polling rate or sensor resolution from a page is impossible. What is checked here is buttons, wheel and double click — the parts that actually fail.
related:
  - keyboard-test
  - dead-pixel-test
  - key-chatter
---

Press the buttons and spin the wheel right on the drawing of the mouse. A pressed button lights up, a checked one stays marked — so you can see what is done and what is left.

## What gets checked

- **Five buttons** — left, right, middle (pressing the wheel), back and forward
- **The wheel** — both directions, up and down counted separately
- **Double click** — we show the gap between the presses in milliseconds
- **Unintended doubles** — the classic failure of a worn button

## About the unintended double click

This is the most common complaint about a mouse: you press once and it registers twice. The culprit is the micro-switch under the button — it wears out and starts bouncing. Timing tells them apart: a human double click takes 100–500 milliseconds, while bouncing fits into forty or less. Pressing that fast is physically impossible, so those cases are counted separately.

The cure is replacing the switch — pennies for the part, about half an hour of work. Sometimes blowing the dust out of the button is enough.

## Worth knowing

On the drawing the right and middle buttons behave differently on purpose: the menu and autoscroll are switched off for the test, otherwise they would cover the drawing. Outside the drawing everything works as usual. Next door there are a [keyboard test](/en/keyboard-test) and a [dead pixel test](/en/dead-pixel-test).
