---
toolSlug: box-shadow
locale: en
category: dev
tool: box-shadow
title: CSS Box Shadow Generator Online — Build Realistic UI Drop Shadows
h1: CSS Box Shadow Generator
navName: "Box Shadow Generator"
summary: "Drag the shadow, take the CSS"
description: "Professional online tool to generate custom CSS box-shadows. Adjust horizontal/vertical offsets, blur, spread, and opacity to copy production-ready CSS snippets."
faq:
  - question: What do blur and spread actually do?
    answer: "Blur softens the edge of the shadow. At zero the shadow traces the object exactly, as if cut from paper; the larger the value, the wider the band over which the shadow fades away. Spread changes the size of the shadow before the blur is applied: positive inflates it away from the object in every direction, negative pulls it inwards. A trick worth knowing: a small negative spread together with a large blur gives a shadow gathered underneath the object rather than sprawling around it — which is exactly how the shadow of a card lying on a table looks."
  - question: How do I make a shadow that does not look like a sticker?
    answer: "With layers. A real shadow is sharp right against the object and grows softer and weaker further away — one layer cannot express that, you have to choose between sharp and soft. So you stack several: a near layer with little blur holds the outline, far layers with heavy blur and falling opacity provide the diffusion. What matters is that opacity drops faster than blur grows: give every layer the same opacity and the shadow comes out muddy. The “ready-made soft shadow” button lays down three such layers at once, and they can then be edited like any others."
  - question: Does the order of layers matter?
    answer: "Yes. The first layer in the list is drawn over the rest. With identical black layers it makes no difference, but make them different colours, or mark one as inset, and reordering changes the picture although the numbers stay the same. The order in the code is the same as the order in the list on the page."
  - question: How is an inset shadow different?
    answer: "An ordinary shadow falls outwards, beyond the edges of the element, and makes it look raised. An inset shadow is drawn inside, along its borders, and the object looks pressed in. Inset shadows most often go on input fields and toggles — anything meant to read as a recess. Spread works the other way round on an inset shadow: a positive value makes it thicker towards the inside."
  - question: Why does my shadow disappear or get cut off?
    answer: "Most often because of overflow: hidden on a parent. A shadow takes up no space in the layout — it is painted over its neighbours and does not push them apart, unlike a border — so a parent told to clip anything beyond its bounds will clip the shadow too. The second case is a shadow sliding under a neighbouring element that sits higher in the stacking order. And the third, simplest of all: the shadow is black on a dark background and simply cannot be seen."
  - question: Do shadows slow a page down?
    answer: "Usually not, but a large blur on many elements at once is expensive while scrolling, because the browser recomputes the blur for each of them. It becomes noticeable on lists of hundreds of rows where every card carries a shadow. If that happens, reduce the blur or keep the shadow only on what genuinely needs to look raised."
  - question: Is any data sent anywhere?
    answer: "No. The whole job is assembling a string and letting the browser draw it, all inside the tab. The page makes no network requests at all."
related:
  - css-gradient
  - color-converter
  - color-palette
---

Move the sliders and both the sample and the code change at once. Layers stack up in a list: each shows its own piece of code, and clicking one selects it for editing.

## The backing here is light on purpose

A shadow is nearly always black and semi-transparent. On a dark background it simply cannot be seen, and you would be adjusting it blind. That is why the preview panel is light while the rest of the site is dark: a tool has to show what is being adjusted rather than look uniform at any cost.

## Start with one layer, add the rest later

First get the direction and the size right: a few pixels of downward offset, a blur about twice that, opacity around a third. That already is a decent shadow. Layers are for when you want the object to look genuinely lifted — but adding them to a poor base is pointless, and three bad layers are no better than one.

## Sideways offset is needed less often than you would think

In interfaces the light is almost always taken to come from above, so the shadow goes downwards and sideways barely or not at all. A visible horizontal offset immediately reads as "sun from the side" and demands that every other shadow on the page behave the same way. It is easier to keep the sideways offset at zero and let the downward offset and the blur do the work.
