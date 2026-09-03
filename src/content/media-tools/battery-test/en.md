---
toolSlug: battery-test
locale: en
category: device-tests
tool: battery-test
title: "Battery Test Online — Check Charge, Drain and Battery Health"
h1: Battery Test
navName: Battery test
description: "Battery diagnostics online. Check the charge level and power status, and measure the discharge rate under a controlled load, right in your browser."
faq:
  - question: Can battery wear be measured through a browser?
    answer: "No, and we will not pretend otherwise. A browser is told neither the present capacity, nor the design capacity, nor the number of charge cycles — not one of the figures wear is computed from. Sites showing “87 % health” invent it. Real wear is read in the system: on iPhone it is Settings → Battery → Battery Health, on Windows the command powercfg /batteryreport, on macOS Settings → Battery → Battery Health."
  - question: What does this page measure then?
    answer: "The drain rate under a controlled load. The page loads the processor in separate threads and watches how far the charge falls over the chosen time. From that comes the drain in percent per hour and an estimate of how long a full charge would last at that pace. It is not wear, but it is exactly the number that worsens on a tired battery."
  - question: Why did the charge not move in three minutes?
    answer: "Because the browser rounds the level, and on a large battery one percent takes longer than three minutes. That is not a broken page. Choose a longer run — ten or twenty minutes — and the measurement will come out."
  - question: The page shows nothing on my iPhone. Why?
    answer: "Battery data is closed in Safari, and every browser on iPhone runs on Safari’s engine, so none of them helps. The reason is privacy: sites learned to recognise a visitor across tabs by battery level. Live data is available in Chromium browsers — Chrome, Edge, Opera and Android browsers."
  - question: What drain rate is normal?
    answer: "Under a serious load a fresh phone loses roughly 15–25 percent per hour and a laptop 20–40, depending on the processor and screen brightness. A big number under load means nothing by itself: what is worrying is the charge melting three times faster than usual during ordinary work. That is when to look up the real wear figure in the system."
  - question: Does the measurement drain the battery?
    answer: "Yes, and it cannot be otherwise: to measure drain you have to drain. The page honestly loads the processor for the chosen time — three minutes cost a fraction of a percent, twenty noticeably more. Unplug the charger for the run, or there is nothing to measure."
related:
  - phone-sensors-test
  - vibration-test
  - webcam-test
---

The page shows everything the browser knows about the battery: charge level, whether you are on mains or on battery, time to full and time remaining. Below it is the drain measurement: the page loads the processor and counts how fast the charge falls.

## What gets tested

- **Charge level** — as a number and a bar, updating by itself
- **Power source** — mains or battery, with time estimates
- **Charge graph** — a thin line over time; even a one-percent drop is visible
- **Drain under load** — in percent per hour and in hours of runtime

## About wear — honestly

Battery wear cannot be measured from a web page. The browser is told neither the present capacity, nor the design capacity, nor the cycle count — none of the numbers wear is computed from. All a browser offers is the charge level in percent, a charging flag and rough time estimates.

So there is no “health” row here, and any site that shows one is inventing it.

Real wear is read in the system:

- **iPhone** — Settings → Battery → Battery Health
- **Android** — Settings → Battery; some models need the maker’s service menu
- **Windows** — the command `powercfg /batteryreport`
- **macOS** — Settings → Battery → Battery Health

## What we measure instead

The drain rate. A tired battery gives its charge away faster and drops in jumps, and that shows up in a measurement: the page loads the processor in separate threads, so the window never freezes, and counts how far the charge fell over the chosen time.

A fresh phone under load loses 15–25 percent per hour, a laptop 20–40. A big number under load is normal in itself; what is worrying is the charge melting three times faster than usual during ordinary work.

## Everything stays with you

Battery data lives in the tab’s memory. Nothing is sent anywhere and nothing is stored — this page has neither upload nor storage.
