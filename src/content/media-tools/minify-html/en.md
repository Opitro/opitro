---
toolSlug: minify-html
locale: en
category: dev
tool: minify-html
title: HTML Minifier Online — Compress HTML Code
h1: HTML Code Minifier
navName: HTML Minifier
description: "Professional online tool to minify and compress HTML source code. Instantly remove white spaces, line breaks, and comments locally in your browser to boost page speed."
faq:
  - question: Why can't you simply strip every line break?
    answer: "Because in markup, whitespace between tags is sometimes empty space and sometimes a real character you can see on screen. Between block elements — <div>, <p>, <li> — it can go entirely and nothing changes. Between inline elements it cannot: “<b>two</b> <i>words</i>” would come out as “twowords”. That is exactly how pages break after being “optimised” by simple tools, and it is not noticed at once but when somebody reads the finished site. Our minifier looks at the tags on both sides of the whitespace and removes it only where both are block-level."
  - question: How much smaller does the file actually get?
    answer: "It depends on how it was written. Markup typed by a person with four-space indents and comments loses 20–40%. Markup produced by a build tool loses a few per cent, because there is barely anything spare in it. We checked on twenty-four finished pages of this site: the range was 1.6% to 4.6%, and that is the honest figure for already-built code. Promises of “up to 50% compression” are usually measured on a deliberately untidy example."
  - question: Can minification break the layout?
    answer: "It can, if the minifier is careless. There are three dangerous places: whitespace between inline elements, the contents of <pre> and <textarea> where every character counts, and conditional comments for old versions of Internet Explorer, which look like ordinary notes but actually instruct the browser. We handle all three. We checked by doing rather than by reasoning: twenty-four pages of the site were minified and rendered side by side in two windows — the on-screen text, the element tree and the computed styles of every node all matched, some 4,700 nodes in total."
  - question: What happens to inline <style> and <script>?
    answer: "With the box ticked, the contents of <style> go through our CSS minifier and the contents of <script> through a real JavaScript parser. Scripts with a foreign type — <script type=\"application/json\"> and templates — are only trimmed at the edges; we do not go inside. That is data rather than code, and a JavaScript parser would reject it."
  - question: Why don't you unquote attribute values or drop closing tags?
    answer: "Because the gain is a handful of bytes and it breaks at the first unusual construct. A value can be unquoted only if it contains no spaces, quotes, equals signs, angle brackets or apostrophes — and checking that reliably costs more than the two characters saved. Optional closing tags are worse: the rules for omitting them run to several pages of the standard, and a mistake there changes the structure of the document. We preferred it to keep working."
  - question: Does my code go to a server?
    answer: "No. Parsing happens in the tab's memory and the page makes not a single network request. That matters more than it sounds: templates for control panels, internal systems and commercial themes are the very work you are paid for, and they have no business ending up in somebody else's logs."
related:
  - minify-css
  - minify-js
  - html-strip
---

Paste your markup and press the button. The row at the top leads to the neighbours: the CSS minifier and the JavaScript minifier.

## What goes and what stays

Removed: comments, surplus whitespace and line breaks, redundant attribute values (`disabled="disabled"` becomes `disabled`), the obsolete `type="text/javascript"` on scripts. Inline styles and scripts are compressed by the same engines that run on the neighbouring pages.

Kept: everything that carries meaning — the contents of `<pre>` and `<textarea>` down to the last space, conditional comments for old versions of Internet Explorer, the quotes around attribute values, and every closing tag.

## The one real subtlety: whitespace between tags

This is where a careful tool and a careless one part ways. The whitespace between `</div>` and `<p>` is not drawn, so it can go. The whitespace between `</b>` and `<i>` is drawn, and without it two words fuse into one. The difference is not in how much whitespace there is but in which tags stand on either side.

We keep a list of inline elements and look at both neighbours. Whitespace disappears only when both are block-level. Everywhere else it collapses to a single space but stays.

## How this was checked

By comparison against the browser, not by argument. Twenty-four finished pages of this site were minified, and then the original and the minified version were rendered side by side in two windows. Three things were compared: the text visible on screen, the element tree, and the computed styles of every node — some 4,700 nodes. Everything matched. And the judge was separately proven awake: fuse two words on purpose and it notices.
