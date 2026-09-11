---
toolSlug: minify-css
locale: en
category: dev
tool: minify-css
title: CSS Minifier Online — Compress CSS Code & Optimize Stylesheets
h1: CSS Code Minifier
navName: "CSS Minifier"
summary: "Shrink CSS: spaces, zeros, colours"
description: "Professional online tool to minify and compress CSS code. Instantly remove white spaces, comments, and optimize your stylesheets locally in your browser."
faq:
  - question: Why can't you just strip all the whitespace?
    answer: "Because CSS has places where whitespace is part of the grammar. The best known is <code>calc(100% - 10px)</code>. Remove the spaces around the minus and you get <code>calc(100%-10px)</code> — an invalid expression that the browser silently discards along with the whole declaration. The same goes for media queries: <code>@media screen and (min-width:600px)</code> stops working without the space before the bracket. We read the file character by character and know where we are, so those spaces stay put."
  - question: Is it true that #ffffff can always be shortened to #fff?
    answer: "Inside a property value, yes, provided the pairs of characters match. But the same text at the start of a rule is an id selector: <code>#aabbcc { }</code> looks for an element with that identifier, and shortening it would detach the rule from its element. The only difference is where the text sits — which is precisely why pattern replacement will not do here: it sees the string but not the place. We shorten colours only inside values."
  - question: Why does 0px become 0 while 0s stays?
    answer: "Because a unitless zero is only valid for a length. For time it is invalid: the browser will not accept <code>transition: 0</code>, it needs <code>0s</code>. Percentages inside <code>@keyframes</code> must also be left alone — there <code>0%</code> is a step number, not a size. And inside <code>calc</code> the unit has to stay: <code>calc(100% - 0px)</code> works, <code>calc(100% - 0)</code> does not. We drop the unit only from lengths and only outside calculations."
  - question: What happens to custom properties (--name) and var()?
    answer: "We do not touch them at all, and that is necessity rather than caution. The browser keeps a custom property's value verbatim — as a stream of characters — and only parses it where it gets substituted through var(). Shorten “0px” to “0” inside one, and a <code>calc(100% - var(--name))</code> sitting in a completely different file stops working. The failure surfaces far from where the shortening happened, and it takes a long time to find. For the same reason the contents of var() and color-mix() are left alone."
  - question: How much smaller does the file get?
    answer: "We ran all 83 stylesheets of this site through it — real ones, not written for show. Total weight fell from 901 KB to 508 KB, that is 43.6%. This is typical for stylesheets typed by a person with indentation and comments. A file that has already been through a build tool will shrink far less; there is barely anything spare in it."
  - question: How did you satisfy yourselves that nothing broke?
    answer: "The judge is not us but the browser itself. Each of the 83 files was minified, then the original and the minified version were fed to the browser's own parser and the resulting set of rules compared: same selectors, same properties, same values. Every file matched. On top of that, twenty-four finished pages of the site were rendered side by side in two windows with the computed styles of every node compared — by then var() has been substituted, so what is being checked is meaning. And the judge was separately proven awake: break a calc on purpose and the declaration vanishes, which it notices."
related:
  - minify-html
  - minify-js
  - color-converter
---

Paste your stylesheet and press the button. The row at the top leads to the neighbours: the HTML minifier and the JavaScript minifier.

## What the tool does

Removes comments — except those beginning with `/*!`, which by common agreement carry a licence; discarding that would not be optimisation but theft. Collapses whitespace and line breaks. Shortens colours: `#aabbcc` to `#abc`, `rgb(0,0,0)` to `#000`. Drops redundant zeros: `0.50rem` to `.5rem`, `0px` to `0`. Removes the final semicolon in a block.

Each of these can be switched off with a checkbox if you do not want it.

## Four places where others get it wrong

**Whitespace in `calc`.** This is grammar, not arithmetic: `calc(100%-10px)` is invalid and the whole declaration falls away.

**A hash at the start of a rule.** `#aabbcc` there is an id selector, not a colour.

**A unitless zero.** Fine for a length; not for a time, not inside `calc`, and not for a step number in `@keyframes`.

**Custom properties.** The browser stores their value verbatim and parses it only on substitution. Compressing inside them breaks the page far from where the compression happened.

## How this was checked

83 stylesheets from this site were minified and fed to the browser's own parser — the set of rules built from them matched in every case. Separately, twenty-four finished pages were rendered side by side in two windows and the computed styles of every node compared, some 4,700 nodes. By that point `var()` has been substituted and the verbatim storage is behind us, so what is compared is meaning. Everything matched.
