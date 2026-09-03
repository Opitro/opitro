---
toolSlug: vibration-test
locale: en
category: device-tests
tool: vibration-test
title: "Phone Vibration Test Online — Check the Vibration Motor"
h1: Phone Vibration Test
navName: Vibration test
description: "Diagnostics tool for a smartphone vibration motor. Check whether vibration works, try different haptic patterns and tap in your own rhythm, right in the browser."
faq:
  - question: Why does nothing vibrate on my iPhone?
    answer: "Because Apple closed vibration to websites: Safari gives no access to the motor, and every browser on iPhone runs on Safari’s engine, so none of them helps. That is a system limit, not a broken phone and not a broken page. On an iPhone the motor can only be checked from an app or a service menu."
  - question: The vibration feels weak. Is the motor dying?
    answer: "Check the obvious first: vibration strength is a phone setting, and a case or a soft surface damps it enough to feel half as strong. Put the phone on a table and try again. If it is still barely there, and the short patterns come out silent, the weight is worn or the mount has loosened."
  - question: Why is there no vibration strength in numbers?
    answer: "Because the browser does not know it. All it can do is send the motor a command — “run for so many milliseconds” — and that is it. Neither the strength nor whether the motor actually ran is reported back to the page. Any “response strength” figure would be invented, so we do not show one."
  - question: What does the square-wave tape show?
    answer: "The rhythm of the command sent to the motor: high means a pulse, low means a pause. It helps when the phone lies on something soft and the vibration is hard to feel — you can see where it should be. The tape is not a measurement of the motor: a browser cannot hear it, and we say so right underneath."
  - question: Why test short pulses separately?
    answer: "It is the fairest test of a worn motor. The weight inside has to spin up and stop within forty to a hundred milliseconds; a worn one does it more slowly and simply swallows the clicks — instead of a crisp triple click you get a faint hum. Under continuous vibration such a motor still feels fine."
  - question: The vibration stops by itself. What is wrong?
    answer: "Most likely nothing. Browsers cancel vibration when the page goes into the background, during an incoming call and in battery saver mode. Duration is capped too — a very long vibration is shortened by the system. Return to the page and start again."
related:
  - phone-sensors-test
  - touchscreen-test
  - sound-test
---

Press “start continuous vibration” — that tests the motor itself. Then try the ready-made patterns: a call, a notification, a triple click and an explosion. A worn motor swallows short pulses, and you notice it at once. You can also tap your own rhythm on the pad and the page will replay it through the motor.

## What gets tested

- **Whether the motor runs at all** — with continuous vibration
- **How it handles short pulses** — with four ready-made patterns
- **Your own rhythm** — tap it out and the phone repeats it
- **The pattern tape** — shows where the vibration should be, even on a soft surface

## About a worn motor

Inside the motor a weight spins on a shaft. Over time the shaft loosens and the weight wears, so the motor needs longer to spin up. On a long vibration that is barely noticeable, which is why short pulses are the real test: a healthy motor delivers a forty-millisecond click crisply, a worn one turns it into a faint hum or skips it entirely.

Rattling or buzzing under continuous vibration usually means a loose mount or dust inside. Total silence while the command is running means a broken cable or a dead motor; both are fixed by replacing the unit.

## What this test does not do

It does not measure vibration strength. A browser can do exactly one thing: send the motor a command for so many milliseconds. It does not hear the motor, does not know its power, and cannot check whether it ran at all. So there is no “response strength” number here and there will not be one — inventing it would be dishonest.

It does not work on iPhone: Apple closed vibration to websites across every browser on the system.

## Everything stays with you

The tool is free and needs no sign-up. The command goes to the motor straight from your browser; nothing is sent anywhere and nothing is stored.
