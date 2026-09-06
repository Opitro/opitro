---
toolSlug: color-converter
locale: en
category: dev
tool: color-converter
title: Color Converter HEX ↔ RGB ↔ HSL Online — Web CSS Color Code Tool
h1: HEX, RGB & HSL Color Converter
navName: Color converter
description: "Professional online tool to convert colors between HEX, RGB, RGBA, HSL, and HSLA formats. Instantly generate web-ready CSS color codes locally in your browser."
faq:
  - question: What is the difference between the RGB, HEX and HSL colour spaces?
    answer: "RGB describes a colour as three amounts of light — red, green and blue, each from 0 to 255; that is how every screen works. HEX is the very same model written in hexadecimal: #00ff00 and rgb(0, 255, 0) are one colour, only the notation differs. HSL is built differently and much closer to how people think about colour: hue in degrees around a circle from 0 to 360, saturation as a percentage, lightness as a percentage. Hence its usefulness — to make a colour darker in HSL you lower a single number, whereas in RGB you would have to recompute all three."
  - question: How is transparency encoded in HEX and in RGBA?
    answer: "In rgba() it is the fourth number, a fraction from 0 (fully transparent) to 1 (solid): rgba(0, 255, 0, 0.5). In HEX two more characters are appended: #00ff0080. Hexadecimal 80 is 128, exactly half of 255, which is why that code means a half-transparent green. Every current browser understands the eight-character form; if you need to cover very old ones, use rgba()."
  - question: Why does a colour sometimes change by one after a round trip through HSL?
    answer: "Because hsl() is written with whole degrees and percentages, and there are more colours than there are such combinations. Silver #c0c0c0 has a lightness of 75.29% and orange #ffa500 a hue of 38.8°: neither fits in whole numbers. We measured how visible this is: the difference never exceeds 5 steps out of 255, and roughly one colour in ten comes back exactly. Inside this page the colour does not drift — everything is computed from RGB and never sent round in circles. But if you need precisely that shade, take the HEX or the RGB rather than the HSL."
  - question: Why is the hue of a grey always zero?
    answer: "Grey has no hue at all. Once saturation is zero the degree stops meaning anything: hsl(0, 0%, 50%), hsl(120, 0%, 50%) and hsl(300, 0%, 50%) are the same grey. We show zero instead of inventing a pleasant-looking number: black, white and every shade of grey simply have no hue."
  - question: Which colour notations can I paste into the field?
    answer: "All the common ones. Besides #1a2b3c it takes the short #abc and #abcd, the eight-character #1a2b3cff, rgb(26, 43, 60), rgba(26, 43, 60, 0.5), percentages such as rgb(100%, 0%, 0%), hsl(210, 40%, 17%), the newer slash notation hsl(210deg 40% 17% / 0.5), and even three plain numbers separated by commas. That matters when you are copying a colour out of somebody else's code as it stands."
  - question: Are the colours sent anywhere?
    answer: "No. The whole conversion is arithmetic, it happens inside the tab, and the page makes no network requests at all. Brand colours and palettes you are not allowed to show to outsiders are not shown to anyone here: close the tab and nothing remains."
related:
  - favicon-generator
  - qr-code
  - base64-file
---

Change any field and the rest are recomputed at once. The sliders are painted with the colour itself, so you can see where a move leads before you make it.

## When HSL suits better, and when HEX does

HSL is at its best while you are still choosing. Need a darker variant for hover? Drop the lightness by ten per cent and everything else stays put. Need a neighbouring shade for a second button? Nudge the hue a few degrees. Doing the same in RGB means guessing at all three numbers. For carrying a finished colour into code, though, HEX is better: it is shorter, exact down to the last step, and free of any rounding.

## Transparency: two ways, both correct

`rgba(0, 255, 0, 0.5)` and `#00ff0080` are the same half-transparent green. The first reads plainly; the second is shorter and sits well in a variable. Choose by what you will be editing later: the fraction in rgba() is easier to adjust by hand, while the eight-character HEX is tidier when the colour lives as a single line in a theme.

## The chequerboard is not decoration

There is a fine chequerboard behind the colour, and it earns its place. A half-transparent colour on a dark background simply looks like a darker colour: by eye you cannot tell "50% transparent" from "dark but solid". The chequerboard shows through the transparency and reveals at once how much of it there really is.
