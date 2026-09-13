---
toolSlug: remove-exif
locale: en
category: images
tool: remove-exif
title: "Remove EXIF from photos online free — strip GPS and camera data"
h1: "Remove EXIF data"
navName: "Remove EXIF"
summary: "Strip coordinates and camera data from a photo"
description: "Remove metadata from a photo: coordinates, date and camera data — right in the browser, with no re-encoding and no loss of quality. Free, no sign-up, the file goes nowhere."
faq:
  - question: "How do I remove metadata from a photo?"
    answer: "Press “Choose photos” or drop files into the black window — up to twenty at once. Each photo becomes a tile with a large number on it: how many tags were found inside. From there two ways: “Remove all tags” under the window cleans every loaded photo in one go, or, if you would rather pick, press the bin next to the tags that must go and then “Remove the chosen tags”. The button is then replaced by “Save”, and a download arrow appears on the tile itself."
  - question: "Which formats does it take?"
    answer: "JPEG, PNG, WebP, HEIC and AVIF — everything phones and cameras shoot. From JPEG the EXIF, XMP, IPTC blocks and comments go; from PNG the service chunks with tags and captions; from WebP the EXIF and XMP chunks; in HEIC the block is edited in place, without shifting the rest of the file."
  - question: "What do the icons do?"
    answer: "The bin in a tag's row crosses it out of the file to be; the back arrow puts it in again — nothing is final until you save. The pencil by the name changes what the file will be called on disk (`no-exif_` plus your name by default). The down arrow on a tile downloads that photo, the cross drops it from the strip. With several photos there is “Download ZIP” at the bottom — all of them in one archive."
  - question: "Does the picture lose quality?"
    answer: "No. The tool does not re-compress the photo or convert it to another format. It works on the file itself: it finds the service block where the tags live, cuts out only that, and leaves the pixels untouched — byte for byte. The common advice “open it and re-save” cannot do that: every JPEG re-save eats quality."
  - question: "Where does my photo go?"
    answer: "Nowhere. The file is read and cleaned right here in the browser, on your device: this page has no server of its own, so there is nowhere to send it. The clean copy is built here too, and downloads only when you press the button."
  - question: "Why do the rotation and the colour profile stay?"
    answer: "Those two tags say nothing about you — they describe the picture. Rotation is what makes the frame stand upright; without it some programs show the photo on its side. The colour profile keeps the colours as you see them. So “Remove all tags” leaves them alone, but you can drop them with their own bin."
  - question: "How do I check the data is really gone?"
    answer: "Open [photo metadata](/en/exif-viewer) and choose the downloaded file — it shows what is left inside. It is the neighbouring page of this site and works the same way: in your browser."
  - question: "Why remove this before publishing a photo?"
    answer: "A phone writes the coordinates of the place into the photo, accurate to a few metres, along with the date, the time and the camera model. One picture from a classifieds site leads to a home, another to a child's school. Big social networks do strip tags on upload, but photos often travel elsewhere: by email, as a file in a messenger, into a shared cloud folder — and there they arrive as they are."
related:
  - exif-viewer
  - color-scan
  - qr-scan
---

Choose your photos — up to twenty at a time — drop the tags with one button or pick them off with the bins, then download the clean files. The picture itself is not re-compressed: the pixels stay as they were, only the service part of the file changes.

## What exactly is removed

The camera and lens model, the date and time, the shooting settings, the author and rights, and above all the coordinates of the place. A phone writes them silently once you have let it use your location, and they travel with the picture: a photo on a classifieds board points straight to a home.

## Why there is no loss of quality

We do not open and re-save the photo — we work on the file. Inside it the pixels sit apart from the service tags, and only the latter can be cut out. That is why the cleaned copy matches the original picture byte for byte while weighing less.

## How to check the result

Open the downloaded file with the [photo metadata page](/en/exif-viewer) — it shows everything that is left inside. Both pages work in the browser and send nothing anywhere.
