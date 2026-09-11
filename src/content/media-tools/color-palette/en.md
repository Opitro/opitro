---
toolSlug: color-palette
locale: en
category: dev
tool: color-palette
title: Color Palette Generator Online — Build Harmonious CSS Color Schemes
h1: Color Palette Generator
navName: "Palette Generator"
summary: "A palette built from one colour"
description: "Professional online tool to generate cohesive color palettes. Create monochromatic, analog, and complementary web color schemes with instant CSS/JSON export layout."
faq:
  - question: How do colour-harmony rules help when designing an interface?
    answer: "Each rule solves a different problem. Complementary takes the opposite point on the wheel — that is the button that stands out against the main tone, the one people are meant to press. Analogous picks neighbours: a soft run for backgrounds, panels and gentle transitions, where contrast would only get in the way. A triad gives three independent colours that do not argue with one another, which suits places with many elements to tell apart: chart bars, tags, task states. Monochromatic is one hue at different lightnesses: a restrained look, and a convenient source of shades for hover, pressed and disabled states."
  - question: Which export format is better?
    answer: "CSS variables are the most direct route: paste the block into :root and the colours of the whole page are steered from one place. JSON is what you need when the palette is picked up not by the browser but by a build: a Tailwind theme, a theme object in a React or Vue app, a design-system config. We give both in one press, and the JSON also carries the base colour and the rule name, so that later it is clear where the palette came from."
  - question: Why five swatches if a complementary pair is two colours?
    answer: "Because five is more workable, and two colours are not yet a palette. But passing tints off as a rule would be dishonest, so every swatch says what it is: “base”, “opposite, 180°”, “lighter”, “darker”. The actual rule yields two colours in a complementary scheme and three in a triad; the rest are shades of the same hue. That way you can see where the computation ends and the padding begins."
  - question: Why is the label on a swatch sometimes black and sometimes white?
    answer: "It is chosen by calculation, not by eye: we compute relative luminance the way the accessibility rules define it, where the green component carries almost three quarters of the weight and blue seven hundredths, because that is how sight works. The common trick of adding R, G and B and comparing with the middle goes wrong on saturated colours. We checked the choice on 60,000 random colours: the label is always the more contrasting one, and even in the worst case its contrast is 4.58 against a threshold of 4.5."
  - question: What does the Space key do?
    answer: "It produces a random palette — a habit designers know from other pickers. The random colour is not entirely random: saturation stays between 45% and 95%, lightness between 35% and 65%. That is not about prettiness but about meaning: with a nearly grey colour a hue shift changes nothing and all five swatches come out the same, while with a very dark one the lightness ladder disappears into black."
  - question: Are the colours sent anywhere?
    answer: "No. The whole job is arithmetic around a colour wheel, it happens inside the tab, and the page makes no network requests at all. Brand colours you are not allowed to show to outsiders are not shown to anyone here."
related:
  - color-converter
  - favicon-generator
  - qr-code
---

Set a base — with the picker or by typing a code — and choose a rule. Space gives you a random palette. Under each swatch it says how that colour relates to the base.

## Where to start

Start not with a colour you like but with the one you already have: the logo colour, the link colour from the old version of the site, a shade lifted from a photograph. Paste it into the field and the palette is built around it, with the base staying in the row exactly as you entered it. From there it is easier to cycle through rules than through shades: the same value in four schemes gives four different moods.

## What the arithmetic will not do for you

A rule tells you where on the wheel the second colour sits; it does not tell you how much of it to use. The usual proportion is that the main tone occupies most of the surface while the second appears in spots: a button, an underline, an icon. Split the two evenly and even a pair that is flawless on paper starts arguing with itself.

## Check it on real text

Swatches look convincing because they are large. Before carrying a palette into a mockup, look at the colour where it will actually live: a hairline rule, a twelve-pixel caption, an icon on white. A colour that is magnificent as a full-height band is often unreadable in small text — that is not a fault of the palette but the difference between a fill and letterforms.
