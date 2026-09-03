---
toolSlug: phone-sensors-test
locale: en
category: device-tests
tool: phone-sensors-test
title: "Phone Sensors Test Online — Check Gyroscope & Accelerometer"
h1: Smartphone Sensors Tester
navName: Sensors test
description: "Online tool to test mobile web sensors. Check smartphone accelerometer, gyroscope, ambient light sensor and magnetometer (compass) telemetry in real time."
faq:
  - question: Why do I have to press an access button first?
    answer: "A browser will not hand motion sensors to a page without your consent. On iPhone it is an explicit rule: until you press a button yourself, the page receives no tilt or acceleration data at all. It is protection against tracking — a phone’s movement says a lot about its owner. One press, one system prompt, and the gauges come alive."
  - question: How do I know the accelerometer is healthy?
    answer: "Lay the phone flat on a table, screen up. The Z axis should read about 9.8 metres per second squared — that is the Earth’s gravity, and it is the best check there is. X and Y should sit near zero. If the numbers are markedly different, or they jump while the phone is still, the sensor is lying."
  - question: The tilt dot is off centre although the phone lies flat. Is it broken?
    answer: "Usually not. Most often the gyroscope’s calibration has drifted, and the phone itself fixes that: lay it on a flat surface and open the compass or maps; some models ask you to trace a figure of eight in the air. If the dot still wanders after calibration, then it is the sensor."
  - question: The light sensor shows a dash — is it broken?
    answer: "No, it is simply closed to websites. Browsers deliberately blocked access to the lux meter: the light around you hints at where you are and what you are doing. No popular browser currently exposes ambient light to a page — only the phone’s own apps still have it. That is a browser limit, not a fault."
  - question: The compass shows no heading. What can I do?
    answer: "First check that the compass is enabled in the phone’s settings and wave the phone in a figure of eight — that is how a magnetometer calibrates. Note also that browsers do not offer the heading everywhere: on iPhone it arrives as a separate field, on Android as a separate event, and magnetic field strength in microteslas is exposed almost nowhere. Near metal and speakers every compass lies."
  - question: Nothing works on my computer. Why?
    answer: "Because most computers have no motion sensors at all — phones, tablets and some convertible laptops do. The page honestly prints “no such sensor” instead of pretending to wait for something. Open it on a phone."
related:
  - touchscreen-test
  - multi-touch-test
  - gamepad-test
---

Press the access button — the phone asks for consent and four gauges come alive: acceleration on three axes, orientation in space, the compass and ambient light. Everything is computed on the phone itself; nothing is sent anywhere.

## What gets tested

- **Accelerometer** — acceleration on X, Y and Z with bars and a peak value
- **Gyroscope** — pitch, roll and yaw; a dot on the target shows how the phone is held
- **Compass** — heading as a needle and a number
- **Ambient light** — in lux, wherever the browser still offers it

## The gravity check

The most reliable accelerometer check needs nothing but a table. Lay the phone screen up: the Z axis should read about 9.8 — the acceleration of free fall, the Earth’s gravity, which the sensor must always see. X and Y should be near zero at the same time.

Turn the phone screen down and Z becomes about minus 9.8. Stand it on its side and the 9.8 moves into X or Y. If the numbers do not add up, or they jump while the phone lies still, the sensor is faulty and no calibration will help.

## About the gyroscope and calibration

With the phone flat on a level surface, the dot on the target must sit exactly in the centre. Off to one side is almost always drifted calibration rather than a fault: the phone recalibrates itself if you lay it flat and open the compass or maps, and some models ask you to trace a figure of eight in the air.

## What a browser cannot do

Browsers blocked ambient light in lux on purpose: the light around a person hints at where they are and what they are doing. Magnetic field strength in microteslas is withheld almost everywhere for the same reason. A dash in those rows is a browser limit, not a broken phone — and the page says so in words rather than in silence.

The barometer, the step counter and the proximity sensor are not available to a browser at all; they live only inside the phone’s own apps.
