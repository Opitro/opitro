---
toolSlug: webcam-test
locale: en
category: device-tests
tool: webcam-test
title: "Webcam Test Online — Check Camera on Laptop, PC or Phone"
h1: Webcam Test
navName: Webcam test
description: "Diagnostics tool to test your webcam online. Measure real frame rate, resolution and aspect ratio, and preview camera picture quality instantly in your browser."
faq:
  - question: The browser says the camera is busy. What can I do?
    answer: "Close everything that might be holding it: video calls, the camera app, streaming software. Most cameras serve only one program at a time, and a minimised video call holds the camera just as firmly as an open one. After closing them, reload the page and turn the camera on again."
  - question: Why is the resolution lower than the camera’s specification?
    answer: "We ask the camera for its maximum — 1920 by 1080 — but it gives what it can and what the system allows. If the row reads 1280 by 720, that is your camera’s real limit in a browser. Laptops are often lower still: makers fit modest sensors."
  - question: The frame rate jumps and falls. Is the camera broken?
    answer: "Most likely not. Almost any webcam halves its frame rate in dim light so each frame gathers more light and the picture does not go dark. We count real frames, so the number honestly falls with the lighting. Turn a light on and it returns. Constant stuttering in bright light is a different matter."
  - question: Why is no codec shown?
    answer: "Because a live stream has none. The browser receives ready-made frames from the camera, and nothing is compressed between the camera and the page — a codec appears later, when video is written to a file or sent into a call. Naming a codec here would be invention."
  - question: Where does the camera picture go?
    answer: "Nowhere. The stream lives in your browser tab’s memory; the snapshot is produced by the browser and saved to your own disk. No frame is uploaded or stored anywhere — this page has neither upload nor recording."
  - question: How do I check the second camera on a phone?
    answer: "When there is more than one camera, an “other camera” button appears under the picture and switches between front and rear. Check both: on phones the front camera fails more often, because it sits next to the earpiece where dust and moisture get in."
related:
  - phone-sensors-test
  - mic-test
  - touchscreen-test
---

Press “turn the camera on” and allow access. On the left you get a live picture with no frames or effects — haze, coloured blotches and banding show up at once. On the right the numbers run: resolution, aspect ratio and the real frame rate, changing before your eyes.

## What gets tested

- **The picture** — sharpness, colour, smudges on the glass and banding on the sensor
- **Resolution and aspect ratio** — what the camera actually delivers
- **The real frame rate** — camera frames are counted, not screen frames
- **The claimed rate** — right beside it, for comparison
- **Mirror and snapshot** — flip the picture and save it as a file

## Why the real frame rate matters more than the claimed one

A camera whose box says “thirty frames” gives fifteen to twenty in a room lit by an ordinary lamp. That is neither a lie nor a fault: in dim light the camera lengthens each frame’s exposure, otherwise the picture would be dark. The price is smoothness.

That is why two numbers sit side by side: the one the camera claims and the one we count. When the real one is clearly lower, the page says “dropping” — a hint to add light rather than to take the camera in for repair. Cover half the lens with your hand and watch the number fall within seconds.

## If the camera will not start

Three causes cover almost every case. Access denied — clear the block with the camera icon in the address bar. The camera is busy — close video calls completely; a minimised window holds it just as well. There is no camera at all — on a laptop, check the privacy shutter and the system settings.

## The picture stays with you

The stream lives only in the tab’s memory. The snapshot is made by the browser and lands on your own disk. There is no upload, no recording and no server storage on this page.
