---
toolSlug: contrast-checker
locale: en
category: dev
tool: contrast-checker
title: Color Contrast Checker Online — WCAG Accessibility Validator
h1: Color Contrast Checker (WCAG)
navName: "Contrast Checker"
summary: "Does the contrast pass WCAG"
description: "Professional online tool to check color contrast ratios between text and background. Instantly validate accessibility standards for WCAG AA and AAA layouts."
faq:
  - question: What is a contrast ratio and how is it calculated?
    answer: "It is the ratio of the lighter colour's luminance to the darker one's in a text-and-background pair. It is not computed by adding up R, G and B but from relative luminance: each channel is first linearised (a screen does not display colour linearly), then weighted — green carries almost three quarters, blue seven hundredths, because that is how sight works. Values run from 1:1, where text and background are identical, to 21:1 for black on white. Our calculation is checked against the numbers in the WCAG documents themselves: grey #777777 on white gives 4.478 and so does NOT clear the 4.5 threshold, while #767676 does."
  - question: What is the difference between level AA and level AAA?
    answer: "Two degrees of strictness. AA is the accepted bar for commercial and government sites: 4.5:1 for normal text, 3:1 for large. AAA is stricter: 7:1 and 4.5:1. There is eyesight behind the numbers: 4.5 is aimed at roughly 20/40 acuity — ordinary age-related decline, not counting spectacles — and 7 at about 20/80. Demanding AAA across a whole site is usually unnecessary and not always possible; it is taken where readers are known to be in worse conditions."
  - question: Which text counts as large?
    answer: "From 18pt, which is about 24 pixels, or from 14pt if the type is bold — roughly 18.7 pixels. Anything smaller counts as normal text, and its threshold is 4.5 rather than 3. It is easy to slip: a 20-pixel heading looks large, but by the rules it is normal text and is held to the higher bar."
  - question: What if the text or the background is partly transparent?
    answer: "You cannot measure a transparent colour — the ratio is defined for two solid ones. First work out what colour actually results over the real backing: a half-transparent white over grey produces a perfectly definite grey, and that is what to check. Feed the transparent colour in directly and the number comes out prettier than the truth, and on the live page the text will be worse than the check promised."
  - question: Can the number be trusted blindly?
    answer: "Not blindly. The rules themselves admit it: the formula copes badly with dark backgrounds, and a pair that passes comfortably can look worse to the eye than a light pair that only just scrapes through. The next edition will compute it differently, by the APCA method. But today 4.5 is what clients ask for and audits check, so that is what we compute — and alongside it we show real text on the real background, so you can judge with your own eyes too."
  - question: Are the colours sent anywhere?
    answer: "No. The check is arithmetic inside the tab; the page makes no network requests at all. Brand colours and mock-ups you are not allowed to show to outsiders are not shown to anyone here."
related:
  - color-converter
  - color-palette
  - favicon-generator
---

Set the text colour and the background colour — the ratio, the levels and the live sample are recomputed at once. The button between the fields swaps the two.

## What to do when it fails

The first instinct — darken the text — is not always the best. It is often cheaper to adjust the background: the surface behind the text usually covers a larger area and changes less noticeably than the letters themselves, especially when the letters are a brand colour. The second route is size: from 24 pixels the threshold drops from 4.5 to 3, so a pair that fails for a caption passes comfortably for a heading.

## Where contrast matters most

Not in headings. Large text is nearly always readable; people stumble on the small stuff — field captions, grey explanatory notes, inactive menu items, text in tables. A category of its own is icons and the outlines of input fields: the 3:1 threshold applies to them too, and it is the most commonly forgotten, even though an invisible field border is no less of an obstacle than a pale caption.

## Check the pair, not the colour

Contrast is a property of a pair, not of a single colour. The same grey can be impeccable on white and useless on the light-grey background of a card. So check every real combination from the mock-up rather than "our main grey" in the abstract: the button on white, the same button on a panel, the same button on hover.
