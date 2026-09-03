---
toolSlug: gamepad-test
locale: en
category: device-tests
tool: gamepad-test
title: "Gamepad Tester Online — Check Controller Drift & Input Lag"
h1: Online Gamepad & Controller Tester
navName: Gamepad test
description: "Online tool to test Xbox, PlayStation, Nintendo Switch and PC controllers. Check joystick drift, axis precision, buttons, triggers and vibration right in your browser."
faq:
  - question: The page says no gamepad is visible. Is it broken?
    answer: "Almost certainly not. Browsers deliberately hide gamepads from pages until you press a button on the pad yourself — it is a privacy protection, not a fault. Press any button and the pad appears. If nothing changes after that, check the cable, the battery, and that the pad is paired with this computer rather than with a console or phone nearby."
  - question: What is stick drift and how do I test it?
    answer: "Drift is when a released stick keeps sending movement: the character walks off, the aim slides, menus scroll by themselves. Let go of both sticks, put the pad on a table and press “test stick drift” — the page watches the numbers for five seconds. A deviation of a few hundredths exists on almost every stick and does not affect play; closer to a tenth it is real drift."
  - question: Why are the buttons called “bottom” and “right” instead of A and B?
    answer: "Because the letters printed on the body differ between pads: where one has A, another has a cross and a third has nothing at all. The browser reports the button’s place in the standard layout, not its letter, so we name it by place. If your pad uses a non-standard layout, the page honestly shows plain numbers."
  - question: The triggers show percentages — is that normal?
    answer: "Yes, and it is a good sign. Triggers on most pads are analogue: they report how hard you press rather than just pressed or not, and the bar should fill smoothly from zero to a hundred. Steps and jumps in the bar are a sure sign of a worn trigger. A trigger that snaps straight to a hundred percent is simply a digital one."
  - question: Vibration does not work. Is it the gamepad?
    answer: "Usually not. Not every combination supports vibration from a browser: Safari has none for any pad, over Bluetooth it does not always work, and some pads only offer it to the manufacturer’s own software. Check the pad in a game: if vibration works there but not here, the browser is the limit, not the device."
  - question: Can input lag and the polling rate be measured?
    answer: "The honest answer is no. The browser hands over the pad’s state exactly once per screen frame, so any milliseconds or hertz printed here would describe your monitor rather than the gamepad: a 60 Hz screen gives 60, a 240 Hz gaming screen gives 240, whichever pad you plug in. We show that figure on its own line and label it “the browser’s rate”. The 125, 250 or 1000 Hz on the box can only be verified with the manufacturer’s own software."
  - question: Why are the axis values shown to five decimal places?
    answer: "Because drift lives in the thousandths. A resting stick almost never reads a clean zero: a healthy one sits at something like 0.00312, and that is normal. At two decimals such a deviation would round to zero, and you could not tell a healthy stick from one that is starting to wander."
related:
  - keyboard-test
  - mouse-test
  - click-speed
---

Connect a gamepad by cable or Bluetooth and press any button on it — until you do, the browser will not reveal it. After that everything is visible at once: a pressed button turns white, a button already tried keeps its outline, the dot tracks the stick across its target, and the triggers fill vertical bars. Telemetry runs down the left: model, mapping and axis values to five decimal places.

## What gets tested

- **Every button** — including the d-pad, the bumpers and the stick clicks
- **Both sticks** — a dot in a circle plus exact numbers on each axis
- **Triggers** — as bars, because they have values in between
- **Stick drift** — as its own five-second test
- **Vibration** — wherever the browser offers it

## About drift, the classic gamepad fault

Drift looks like this: you are not touching the stick, yet the character walks, the aim slides, menus scroll on their own. The cause is inside: the stick’s sensor wears out and starts lying about its position, and the pad honestly forwards that lie to the game.

You cannot catch drift by pressing anything — only by not touching. Let go of both sticks, put the pad on a table and run the test: for five seconds the page watches the numbers and remembers the largest departure from zero.

A few hundredths of deviation exist on almost every stick, even a new one, and they do not affect play. Closer to a tenth it is the very drift that gets sticks — or whole pads — replaced.

## Why you have to press a button first

That is neither a fault nor a whim of ours. Browsers deliberately hide gamepads from pages until a person presses a button: otherwise any site could quietly learn what hardware you have attached and recognise you by it. One press, and the pad appears.

## About input lag and polling rate — honestly

Input lag in milliseconds and a pad’s polling rate cannot be measured from a web page. The browser reports the state exactly once per screen frame: sixty times a second on an ordinary monitor, a hundred and twenty or two hundred and forty on a gaming one — and the number stays the same whichever gamepad you plug in. We show it on its own line labelled “the browser’s rate” so nobody mistakes it for a property of the device.

The 125, 250 or 1000 Hz printed on the box can only be verified with the manufacturer’s own software, which talks to the pad directly and bypasses the browser.

## What this test does not do

It does not measure input lag or the polling rate, for the reason above. It does not test the gyroscope, the touchpad or the lighting either — the browser has no access to those; they live in the manufacturers’ own software.
