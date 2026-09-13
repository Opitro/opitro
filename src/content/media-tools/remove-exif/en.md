---
toolSlug: remove-exif
locale: en
category: images
tool: remove-exif
title: "Remove EXIF from photos online free — strip GPS and camera data"
h1: "Remove EXIF data"
navName: "Remove EXIF"
summary: "Strip coordinates and camera data from a photo"
description: "Strip the coordinates, date and camera data from a photo right in the browser, with no re-encoding and no loss of quality. Free, no sign-up, the file goes nowhere."
faq:
  - question: "Does the photo lose quality when EXIF is removed?"
    answer: "No. The tool does not re-encode the picture or convert it to another format. It works on the file itself: it finds the service block where the fields are written, cuts out only that, and leaves the pixels untouched — byte for byte. The common advice “open it and save it again” cannot do that: every JPEG re-save eats quality."
  - question: "Why remove this data before publishing a photo?"
    answer: "A phone writes into the file the coordinates of the place, accurate to a few metres, along with the date, the time and the model of the device. One photo from a classifieds board points to a home, another to a child’s school. With the fields gone, you hand people a picture and nothing else."
  - question: "Where does my photo go?"
    answer: "Nowhere. The file is read and cleaned right here in the browser, on your device: this page has no server of its own. The cleaned copy is assembled here and downloaded straight away."
  - question: "Why does the rotation stay?"
    answer: "A phone photo often lies sideways inside the file, and one service field is what tells it to stand upright. It says nothing about you, so it stays by default — otherwise the picture would appear rotated in some programs and you would think we had ruined it. You can untick the box and drop it together with everything else."
  - question: "Which formats are supported?"
    answer: "JPEG, PNG and WebP — the ones that carry fields. In JPEG the EXIF, XMP and IPTC blocks go; in PNG the service chunks with fields and captions; in WebP the EXIF and XMP chunks. The colour profile is left alone: without it the colours would shift, and it holds nothing about a person."
  - question: "What about a photo from an iPhone?"
    answer: "By default an iPhone saves photos as HEIC, and the browser cannot take such files apart — that is a limit of the browser. Shoot it again as JPEG: Settings → Camera → Formats → “Most Compatible”."
  - question: "How do I check that the data is really gone?"
    answer: "Open the [EXIF viewer](/en/exif-viewer) and choose the downloaded file — it shows what is left. It is a neighbouring page on this site and works the same way: in your browser."
  - question: "Don’t social networks strip metadata themselves?"
    answer: "The big ones do, on upload. But photos often travel elsewhere: by email, as a file in a messenger, to a classifieds board, into a shared folder. There they arrive exactly as they are, with every field."
related:
  - exif-viewer
  - color-scan
  - qr-scan
---

Choose a photo — the fields go and the file downloads straight away. The picture itself is not re-encoded: the pixels stay the same, only the service part of the file changes.

## What exactly is removed

The camera and lens model, the date and time, the shooting settings, the author and rights, and above all the coordinates of the place. A phone writes them silently once you have let it use your location, and they travel with the picture: a photo on a classifieds board points straight to a home.

## Why there is no loss of quality

We do not open and re-save the photo — we work on the file. Inside it the pixels sit apart from the service fields, and only the latter can be cut out. That is why the cleaned copy matches the original picture byte for byte while weighing less.

## How to check the result

Open the downloaded file with the [EXIF viewer](/en/exif-viewer) — it shows everything that is left inside. Both pages work in the browser and send nothing anywhere.
