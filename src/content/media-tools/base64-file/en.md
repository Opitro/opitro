---
toolSlug: base64-file
locale: en
category: dev
tool: base64-file
title: Base64 File Encoder Online — Convert Images and Fonts to Data URL
h1: Base64 File Encoder
navName: Base64 from file
description: "Encode files to Base64 and Data URL online: images, fonts, documents. We show the size growth and warn when inlining is not worth it. The file never leaves your browser."
faq:
  - question: What is encoding a file to Base64 and what is it for?
    answer: "Base64 turns the binary contents of a file into a string of safe text characters. It is needed wherever binary data cannot travel but text can: embedding a small icon straight into a stylesheet, putting an image inside a JSON field, sending a file in a request body. The string is long, but it can be pasted anywhere."
  - question: How much heavier does the file get?
    answer: "About a third: three bytes become four characters. That is a property of the method, not a shortcoming of the tool. So we show the original size, the encoded size and the growth in percent side by side — so the decision to inline is made with open eyes rather than blindly."
  - question: When is inlining worth it and when does it hurt?
    answer: "It is worth it for small things: a little icon, a simple SVG, a few kilobytes. The browser saves a separate request, and that shows. It hurts for anything large: the file grows by a third and, more importantly, loses separate caching — the browser fetches it again with every page instead of taking it from its cache. And a large image inlined into CSS also delays rendering, because the stylesheet is parsed as a whole before the first pixel appears."
  - question: How does a Data URL differ from plain Base64?
    answer: "Plain Base64 is the data alone. A Data URL adds a prefix carrying the file type: data:image/png;base64, followed by the data itself. It is the Data URL that browsers understand in an image src and in a CSS url(). Plain Base64 there does nothing — the browser has no idea what it is."
  - question: Why is only part of the string shown in the box?
    answer: "Because what freezes a tab is not the encoding but the drawing: a text box holding several million characters is very hard for a browser to render. So the box gets the start of the string and says so plainly, while the Copy button hands you the whole thing."
  - question: Which files are supported?
    answer: "Any: images, fonts, documents, audio, archives. The method does not care about content, it works with bytes. For images we also show a thumbnail — so you can see at a glance that the right file was encoded — and offer ready-made wrappers for an image tag and a CSS background."
  - question: Is the file sent anywhere?
    answer: "No. It is read right in your browser by built-in means and goes nowhere: neither to our server nor to anyone else's. Graphics, fonts and working documents stay on your device."
related:
  - base64-encode-decode
  - url-encode-decode
  - escape-unescape
---

Drop a file into the frame or pick one from disk. The result appears at once, together with an honest count of the size.

## Base64 makes a file a third heavier

Three bytes become four characters — that is a property of the method. We show the original size, the encoded size and the growth, so the decision is made with open eyes.

## Only small things are worth inlining

A little icon or a simple SVG: yes. A large image: no — it grows, loses separate caching, and inside CSS it delays rendering.

## A Data URL and plain Base64 are different things

An image `src` and a CSS `url()` take a Data URL with the `data:image/png;base64,` prefix. Plain data there is useless.
