---
toolSlug: barcode
locale: en
category: dev
tool: barcode
title: Barcode Generator Online — Create EAN-13 and Code 128 Barcodes Free
h1: Barcode Generator
navName: Barcode
description: "Create an EAN-13, EAN-8, UPC, Code 128, Code 39 or ITF-14 barcode. We work out the check digit and tell you what it is. Download as PNG or SVG. Free, all in your browser."
faq:
  - question: PNG or SVG — which should I download?
    answer: "For print, the SVG. It is described by lines and scales to any size without losing sharpness, and with a barcode edge sharpness decides everything: a blurred edge makes the scanner misread. A PNG is made of dots and suits a document, an invoice or a web page where the code is shown at its original size."
  - question: How does Code 128 differ from EAN-13?
    answer: "Code 128 takes any digits and Latin letters and serves warehouses, logistics and internal tracking: a product code, a batch number, an order number. EAN-13 is the strict retail standard for goods on a shop shelf: exactly thirteen digits, the last of which is a check digit. One important point: you cannot invent your own EAN-13 number — prefixes are issued by GS1, otherwise your code will collide with somebody else's product."
  - question: What is the check digit for?
    answer: "The last digit in EAN and UPC is computed from all the previous ones by a simple rule and guards against misreads: if the scanner gets one digit wrong the sum does not add up and the code is rejected. Type twelve digits and we add the thirteenth and tell you which. Type thirteen with a mistake and we name the digit that belongs there, instead of answering with a blanket “invalid code”."
  - question: Why can I not make a barcode with non-Latin text?
    answer: "Because linear barcodes store only digits, Latin letters and punctuation — other scripts are simply not in their tables. That is a limitation of the standards themselves, not of this tool. If you need non-Latin text, use a QR code: it handles any text. We name the exact character that stopped it."
  - question: Why did Code 39 print in capitals when I typed lower case?
    answer: "That is how the standard is built: its table holds only capital Latin letters, digits and a few signs. We accept lower case and convert it to capitals, but we warn you — so that the label does not end up saying something other than you intended."
  - question: What size should I print the barcode?
    answer: "At the size you made it. Bars have a minimum width below which a scanner cannot tell them apart, and shrinking the picture in a layout crosses that line easily. Before a print run it is worth printing one copy and checking it with a real scanner — there is one on our own scanner page."
  - question: Is the data sent anywhere?
    answer: "No. The code is drawn right in your browser. Product codes, batch numbers and internal references go nowhere, are never stored, and disappear with the tab."
related:
  - barcode-scan
  - qr-code
  - qr-scan
  - mock-data
---

Choose a format, type the data, and the code appears at once. Download it as a PNG for a document or an SVG for print.

## We work out the check digit and name it

Type twelve digits and we add the thirteenth, telling you which. Get the thirteenth wrong and we name the right one, instead of a blanket “invalid code”.

## Non-Latin letters do not fit into a barcode

Linear codes store digits, Latin letters and punctuation — other scripts are not in their tables. We name the exact character that stopped it. For non-Latin text, use a QR code.

## For print, take the SVG

With a barcode, edge sharpness decides everything: a blurred edge makes the scanner misread. An SVG scales without losing it; a PNG does not.
