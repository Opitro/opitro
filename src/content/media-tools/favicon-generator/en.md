---
toolSlug: favicon-generator
locale: en
category: dev
tool: favicon-generator
title: Favicon Generator Online — Convert Image to ICO & Web App Icons
h1: Favicon Generator
navName: Favicon generator
description: "Professional online favicon generator. Instantly convert PNG, JPG, or SVG images into standard .ICO files and complete modern web icon packages locally in your browser."
faq:
  - question: Why does a site still need favicon.ico when modern browsers support PNG?
    answer: "Modern browsers do read .png and even vector .svg perfectly well. But browsers and search crawlers also request /favicon.ico from the site root entirely on their own, even when the page markup says nothing about it — behaviour left over from the nineties. If the file is not there, every one of those requests becomes another 404 in the server log. It does not measurably slow the site down, but the noise makes real failures harder to spot, and some older programs and utilities understand nothing but .ico. We put three layers into a single .ico: 16, 32 and 48 pixels."
  - question: Is it safe to upload a logo I am not allowed to show to outsiders?
    answer: "It is safe here, and here is exactly why. Most converters work like this: the file goes to their server, gets resized there, and you are handed a link to the result — which means your logo has sat on someone else's disk. This one is different: the picture is read inside the tab itself, resized by the browser's own canvas, and the archive is assembled in the same place. No network request is made at all — you can watch the Network tab in the developer tools and see for yourself. The page keeps working with the internet switched off, once it has loaded."
  - question: What size should the source image be?
    answer: "Square, and ideally at least 512×512 pixels: shrinking a large picture gives a cleaner result than enlarging a small one. SVG works too — it scales without loss — but it must carry a size or a viewBox, or the browser has nothing to scale from. If the source is smaller than 180 pixels, the iOS icon has to be stretched and its edges will go soft."
  - question: What if the logo is not square but wide?
    answer: "Then you get a choice of two. “Crop to centre” takes a square out of the middle — right when the central shape is what matters and the edges can go. “Fit whole image” shrinks the picture until it fits inside the square and leaves the spare room transparent — the whole logo survives, but smaller. We will not stretch a picture into a square under either choice: a distorted logo is worse than a cropped one."
  - question: What is actually inside the .ico, and why not PNG?
    answer: "An .ico is a container rather than an image: several pictures of different sizes live inside and the system takes the one it needs. Ours holds three layers — 16, 32 and 48 pixels. Since Windows Vista you have been allowed to drop PNG straight in, and many generators do, which makes a smaller file. But the whole point of .ico today is compatibility with old software; modern browsers are perfectly happy with .svg. Putting a format that old software cannot read inside a file made for old software is wasted work. So inside is plain uncompressed BMP, as in the original description of the format."
  - question: Why does the iPhone icon come out on a white background?
    answer: "Because apple-touch-icon does not support transparency: iOS puts black behind any transparent area. A logo with a transparent background becomes a black square with a picture in the middle on the phone screen. We fill that one file with white in advance. The other three keep their transparency, which works properly in a browser tab."
related:
  - qr-code
  - barcode
  - base64-file
---

Drag a picture in — the icon, four ready files and the markup to paste appear at once. Nothing is uploaded anywhere.

## What makes a good icon

The usual mistake is to take the logo as it is. At sixteen pixels all that survives is a smudge: thin lines merge, lettering becomes unreadable, a gradient turns to mud. That is why a site icon is nearly always simpler than the logo — one recognisable shape, one or two solid colours, no text shorter than three letters can survive. Judge it by the real-size preview, not the large one: the small one is what decides.

## When the icon will not change after you upload it

Browsers hold on to icons longer than to anything else, and an ordinary page refresh does not clear them. Open the file's address directly — `yoursite.com/favicon.ico` — and reload that page with Ctrl+F5, Cmd+Shift+R on a Mac. If the new icon shows at the direct address but the tab still shows the old one, wait: the browser catches up sooner or later. A private window is the fastest way to check.

## Dark themes and transparent backgrounds

Transparency in an icon cuts both ways. A dark logo on a transparent background looks excellent on a light tab and vanishes on a dark one; a light logo does the opposite. If your readers might be running either theme, an opaque plate in a contrasting colour is safer, or a shape that carries both light and dark within it. Checking is easy: the preview sits on a chequered backing, and you can see straight through wherever your image is empty.
