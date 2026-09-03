---
toolSlug: bluetooth-test
locale: en
category: device-tests
tool: bluetooth-test
title: "Bluetooth Test Online — Check the Adapter and Devices"
h1: Bluetooth Test
navName: Bluetooth test
description: "Bluetooth diagnostics online. Check whether your computer or phone has a working adapter and try connecting to a wireless device straight from the browser."
faq:
  - question: Why does the page not list the devices around me?
    answer: "Because a site is not allowed to, and rightly so. The list of nearby devices is drawn by the browser in its own dialog, and the page only receives the device you picked. Otherwise any site could quietly map your hardware — headphones, watch, car — and recognise you by that set anywhere else."
  - question: My headphones do not appear in the chooser. Are they broken?
    answer: "Most likely not. The browser sees only Bluetooth Low Energy devices that are advertising at this moment. Headphones, speakers, mice and keyboards use classic Bluetooth — they will never show up in that dialog, even in perfect health. Through a browser you check fitness bands, sensors, tags and smart-home gear."
  - question: What does “adapter not found or switched off” mean?
    answer: "That the module is missing or turned off in the system. Switch Bluetooth on in settings and reload the page. Desktop computers often have no module at all — there you need a separate USB adapter."
  - question: The button does nothing on my iPhone. Why?
    answer: "Safari has no Web Bluetooth at all, and every browser on iPhone runs on Safari’s engine, so none of them helps. Firefox disabled the feature too. Both did it for the same reason: the set of devices you own can identify you unnoticed. The test works in Chrome, Edge and Opera on a computer and on Android."
  - question: Why is the device battery level not shown?
    answer: "The level is visible only on devices that expose it through the standard battery service. Many makers use their own private services — then only their app can read the level, and the browser is never told."
  - question: Does the page get access to my paired devices?
    answer: "No. Neither the pairing list, nor files, nor contacts — that is how the protocol itself is built. The page knows only about the device you picked with your own hands, and all of it is wiped from memory when you close the tab."
related:
  - battery-test
  - phone-sensors-test
  - webcam-test
---

The page shows whether your browser supports Web Bluetooth and whether it can see an adapter. Then comes the button: the browser opens its own dialog with nearby devices, and whatever you pick appears in the table with its id, its state and, if the device offers it, its battery level.

## What gets tested

- **The browser** — whether it has Web Bluetooth at all
- **The adapter** — whether the module is on and visible to the system
- **The connection** — a real link to the device you picked
- **Battery** — for devices exposing the standard battery service

## Why a site cannot see the devices around you

By design. A page physically cannot scan the airwaves: the list is drawn by the browser in its own dialog, and the site receives exactly one device — the one you pointed at.

If it were otherwise, any site could quietly copy down all the hardware around you: headphones, watch, scales, car. Such a set is nearly as unique as a fingerprint, and it would identify you on every other site. That is precisely why Apple and Mozilla closed the feature entirely.

## What you will see in the chooser

Only Bluetooth Low Energy devices advertising right now: fitness bands, sensors, tags, smart bulbs and sockets, scales, thermometers.

Headphones, speakers, mice and keyboards will not be there — they run on classic Bluetooth, which browsers cannot touch. That is the most common source of confusion on pages like this, and it is not a broken adapter.

## Everything stays with you

No files, no contacts, no pairing history reach the page — the protocol itself is built that way. The device you picked lives only in the tab’s memory and disappears along with it.
