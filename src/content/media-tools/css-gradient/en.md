---
toolSlug: css-gradient
locale: en
category: dev
tool: css-gradient
title: CSS Gradient Generator Online — Build Linear & Radial CSS Color Gradients
h1: CSS Gradient Generator
navName: "CSS Gradient Generator"
summary: "Build the gradient, take the CSS"
description: "Professional online tool to generate custom CSS gradients. Instantly create linear or radial backgrounds, adjust color stops, and copy production-ready CSS code snippets."
faq:
  - question: What is the difference between a linear and a radial gradient?
    answer: "A linear gradient carries colours along a straight line, and the direction is set by an angle: 0° runs bottom to top, 90° left to right, 180° top to bottom. It suits backgrounds, headers and buttons — anywhere an even transition is wanted. A radial gradient spreads in circles from a centre and does something else: glow, volume, a soft vignette. The rule of thumb is simple: if the transition should be an unnoticed background, go linear; if it is an object in its own right — a pool of light, a highlight — go radial."
  - question: Why put a solid fallback colour in the code?
    answer: "For the case where the gradient does not render at all. That is not only ancient browsers: mail clients strip complex styles, reading modes simplify presentation, some proxies compress code. If the background fails to draw and the text over it is white, the page becomes unreadable. The background-color line insures against that. Which colour goes there matters: we take the colour from the middle of the transition and strip its transparency. Many generators substitute the first colour of the row — but if that one is transparent, the fallback background comes out as nothing, so the insurance fails exactly when it is needed."
  - question: Why does the CSS angle not match the one in my editor?
    answer: "Because they are measured differently. In CSS the angle runs from “up”, clockwise: 0° is bottom to top, 90° left to right. In graphics editors zero usually points right and the angle grows anticlockwise. So a gradient carried over from a mock-up as-is often ends up rotated: the angle has to be recalculated — or, more simply, dialled in by eye here and taken away as a finished line."
  - question: Where does the grey fringe on a gradient come from?
    answer: "From blending transparency the wrong way. When a transition runs from a colour into transparency and the browser or editor blends naively, black gets mixed in towards the transparent end and a dirty grey band appears. The correct way is premultiplied alpha, which is what current browsers do. We compute it the same way, so the fallback colour and the preview match what you will see on your own page. If you actually want that fringe for comparison, set the transparent stop to the same colour as its neighbour rather than to white or black."
  - question: How many stops can I place?
    answer: "As many as you like, but a gradient needs at least two — the last one cannot be removed. Clicking an empty part of the bar adds a stop, and it takes the colour that was already at that point: adding it does not change the picture, and from there you can move it. Stops can be dragged with the mouse; drag one past another and the order in the code rebuilds itself."
  - question: Is any data sent anywhere?
    answer: "No. The whole job is assembling a string and letting the browser display it, all inside the tab. The page makes no network requests at all."
related:
  - color-converter
  - color-palette
  - contrast-checker
---

Drag the stops along the bar, change colour and opacity — the code below updates at once. Clicking an empty part of the bar adds a stop.

## Two lines rather than one

The code comes out as two lines: the solid colour first, then the gradient itself. Paste it that way — the order matters. A browser that understands gradients applies both and shows the upper over the lower. A browser or mail client that does not will skip the line it cannot parse and keep the solid background. One line instead of two works right up until the first email opened in an old client.

## A stop's opacity is not the same as a block's

They are easy to confuse. The `opacity` property makes the whole block translucent — text, border and all. The opacity of a single stop affects only the colour at that point in the gradient: letters over it stay solid. If you want a background that fades towards the edge while the caption stays readable, that is done with a zero-opacity stop, not with block opacity.

## Do not overdo the number of stops

Five or six stops in a gradient nearly always mean the transition has gone banded: the eye catches the joins wherever the rate of colour change jumps. Two or three give a calm transition that does not fight the content. The exception is a deliberately hard edge: put two stops at the very same position and you get not a transition but a clean border, which is a perfectly legitimate trick for stripes and dividers.
