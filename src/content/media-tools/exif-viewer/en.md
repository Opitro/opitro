---
toolSlug: exif-viewer
locale: en
category: images
tool: exif-viewer
title: "Photo metadata online — see EXIF, tags and image properties"
h1: "Photo metadata"
navName: "Photo metadata"
summary: "See the EXIF, tags and properties of a photo"
description: "See the metadata of a photo: the camera, the date, the shutter speed and the coordinates of the place. Free, no sign-up. The file is read in your browser and goes nowhere."
faq:
  - question: "How do I see a photo's metadata?"
    answer: "Press “Choose photos” or drop files into the black window — up to twenty at once. Each photo becomes a tile with its file name and a large number of tags found. Click a tile and the details appear below: camera, lens, date taken, shutter, aperture, ISO, the coordinates of the place. Nothing is sent anywhere: the file is read in your browser."
  - question: "Which formats does it take?"
    answer: "JPEG, PNG, WebP, HEIC and AVIF — everything phones and cameras shoot. HEIC (how an iPhone saves photos by default) is not understood by the browser itself, so the page loads a HEIC reader — but only at the moment you choose such a photo. Up to twenty files at a time: each one is held in memory whole."
  - question: "What do the numbers on the tile and in the green line mean?"
    answer: "The number on a tile is how many tags were found in that photo. The green line under the window counts across everything loaded: “Loaded: 3 · tags found: 214”. It is counted by a reader that goes through EXIF, GPS, XMP, IPTC, the colour profile and maker notes."
  - question: "What do the icons do?"
    answer: "The cross on a tile removes that photo from the strip. “Show every tag” at the bottom opens the full list — everything in the file, service tags included. The coordinates have two buttons: “Open the map” (opens in a new tab, only when you press it) and “Copy the coordinates”."
  - question: "How do I remove this data from a photo?"
    answer: "Right here: under the details there is a “Remove this data” button — it carries your photo over to the [removal page](/en/remove-exif) together with the file, so you do not choose it again. There you can drop every tag at once or one by one with the bin, and download the clean file. The picture is not re-encoded: the pixels stay the same byte for byte."
  - question: "Where does my photo go?"
    answer: "Nowhere. The file is read right here in the browser, on your device: this page has no server of its own. The coordinates stay with you too — the map opens only when you press the button yourself."
  - question: "Why is there nothing in my photo?"
    answer: "Most likely the tags were stripped before you. Social networks and messengers remove them on upload — that is why a picture from a chat arrives “clean”. Screenshots never had any, and neither do pictures drawn on a computer."
  - question: "Is it true that a photo carries the address where I took it?"
    answer: "If the phone is allowed to use your location — yes, the coordinates are written silently, accurate to a few metres. The page shows them as numbers and, next to them, the nearest town and the country, so it is clear without a map."
related:
  - qr-scan
  - barcode-scan
  - datamatrix-scan
---

Choose a photo and you will see everything the camera wrote into it: the camera, the date, the shutter speed and the coordinates of the place. The file stays with you — it is read right here in the browser.

## What is inside a photo

Besides the picture, a camera puts service tags into the file. The body and the lens, date and time, shutter speed, aperture, ISO, whether the flash fired, which way the frame was turned. A phone adds coordinates to that — if you once let it use your location.

## Why look at it

A photographer looks to remember how a good frame was taken. Everyone else looks to know what travels with the picture. Coordinates inside a photo give away a home and a daily routine more precisely than any caption, and people usually have no idea. Once you have seen it with your own eyes, the decision is yours.

## Why the tags are often gone

Social networks and messengers strip them on upload — by design, and it is the one thing worth praising them for here. A screenshot never had any. Re-saving in an editor usually drops them too. So an empty answer on this page is common and perfectly normal.
