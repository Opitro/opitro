---
toolSlug: border-radius
locale: en
category: dev
tool: border-radius
title: CSS Border Radius Generator Online — Interactive Corner Preview Tool
h1: CSS Border Radius Generator
navName: "Border Radius Generator"
summary: "Drag the corners, take the CSS"
description: "Professional online tool to visualize and generate CSS border-radius properties. Create simple corners or complex elliptical organic shapes with instant CSS export layout."
faq:
  - question: What does the slash in border-radius mean?
    answer: "It separates two sets of radii. Every corner actually has two: one across, one along. Before the slash come the horizontal radii of all four corners, after it the vertical ones. While they match, the second set is left out and the line stays short. Separate them and the corner stops being part of a circle and becomes part of an ellipse. Those pairs are what “blob” shapes for avatars and decorative panels are made of: eight numbers instead of four."
  - question: Pixels or percentages?
    answer: "Pixels give the same corner regardless of the element's size: eight pixels stay eight on a small button and on a wide banner alike. Percentages are measured against the element itself — horizontal radii against its width, vertical against its height. That is why border-radius: 50% turns a square into a circle and an oblong into an oval. Buttons and cards usually take pixels so the corner does not change as they stretch; avatars and decorative shapes take percentages."
  - question: Why does the shape stop changing at large values?
    answer: "Because the browser scales the radii down itself when they do not fit. The rule is simple: if the two radii along any side add up to more than that side's length, EVERY radius is multiplied by one and the same factor so that they do fit. Hence the effect that catches people out: set all corners to 100% and you get not “very round corners” but a plain oval, after which the sliders barely change anything. We say so outright and show by how much the browser has squeezed your values."
  - question: In what order do the corners go?
    answer: "Clockwise from the top left: top left, top right, bottom right, bottom left. It is easy to get wrong because other CSS properties use a different order. Padding and borders count from the top side — top, right, bottom, left — that is, from sides rather than corners. Here it is corners, and the first is the top left."
  - question: How do I make a perfect circle?
    answer: "Set 50% on all four corners and make sure the element is square. If the width and height differ, the same line gives an oval — not a bug but that very recalculation against the element's size. For a circle whose dimensions are not known in advance, the usual approach is to force equal width and height rather than rely on the radius."
  - question: Is any data sent anywhere?
    answer: "No. The whole job is assembling a string and letting the browser draw it, all inside the tab. The page makes no network requests at all."
related:
  - box-shadow
  - css-gradient
  - color-converter
---

Move the sliders and both the shape and the code change at once. In advanced mode each corner gains a second axis, turning four numbers into eight.

## Start with the corners linked

The "all corners alike" checkbox is ticked for a reason: nine times out of ten you want the same radius everywhere, and it is easier to find it with one slider. Separating the corners is worth it when it means something — rounding only the top two on a card header, say, or only the left ones on a tab that butts against its neighbour.

## Advanced mode is not for buttons

Eight different radii make a blob, and on a button that reads as an accident. Its place is where the shape is itself decoration: a panel behind an illustration, an avatar, a patch behind a heading. The random-shape button produces a ready one — picking eight numbers blind is hopeless, and it is easier to take something decent and adjust it.

## Check it at the real size

A radius in percentages changes along with the element, and a shape that looks fine in the preview can look different where it actually lives — especially in a block that stretches across the screen. If the shape must stay the same at any size, use pixels; if it should stretch with the block, use percentages. That is the one decision on this page you cannot make by eye.
