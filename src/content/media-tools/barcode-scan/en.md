---
toolSlug: barcode-scan
locale: en
category: dev
tool: barcode-scan
title: Barcode Scanner Online — Read EAN-13 and UPC from Camera or Photo
h1: Barcode scanner
navName: Barcode scanner
description: "Read a barcode with your camera or from a picture: EAN-13, EAN-8, UPC, Code 128, Code 39, ITF. We verify the check digit and show the country where the number was issued. All in the browser, nothing uploaded."
faq:
  - question: How do I read a barcode that is in a photo or a screenshot?
    answer: "Switch to “File”. You can pick a file, drag an image in with the mouse, or copy a screenshot and press Ctrl+V — Cmd+V on a Mac. The picture stays on screen after it is read, so you can see exactly which file was used. If the code lies sideways in the shot, we try reading it crossways too — no need to take it again."
  - question: Why does the scanner not show the product name and price?
    answer: "It does — on request, and not always. The digits themselves carry no name: thirteen digits hold no words, only the organisation prefix, the company number, the item number and the check digit. The link from number to product lives in databases. The full GS1 one is paid; the free Open Food Facts is compiled by people and covers mostly food — that is the one we query when you press “Look up in the open database”. Not everything is in there, and we say so plainly when a product is missing rather than pasting in a random name from a search engine. Nobody can show you the price: every shop sets its own, and it is not in the code and never could be."
  - question: What do the first digits of a barcode mean — 400, 500, 690?
    answer: "They are the prefix of the GS1 organisation that issued the number. 000–139 is the United States and Canada, 400–440 Germany, 500–509 the United Kingdom, 690–699 China, 840–849 Spain, 890 India. One important catch: the prefix says where the manufacturer REGISTERED, not where the goods were made. A German company with prefix 400 may have everything sewn in China. A barcode cannot tell you the country of manufacture — that is written on the packaging in words."
  - question: What is a check digit and why verify it?
    answer: "The last digit of an EAN-13, EAN-8 or UPC is computed from all the others: reading right to left, digits are multiplied alternately by 3 and 1, and the sum is rounded up to the nearest ten. If it does not match, the code was either misread or mistyped. It is a reliable test — a single transposed digit almost always breaks it. We do not just say “invalid”, we say which digit should be there."
  - question: Why does the live camera not catch barcodes on iPhone?
    answer: "In Chrome and on Android the recogniser is built into the browser itself and reads bars straight from the camera. Safari has no such thing, so its live camera looks for QR codes only. A photo or a file on iPhone is read in full though, with the same set of formats — take a picture with the normal camera app and load it here."
  - question: Which barcode formats does the scanner read?
    answer: "EAN-13 and EAN-8, the retail product codes; UPC-A and UPC-E, their American relatives; Code 128 and Code 39, used in warehousing and logistics; and ITF, found on shipping cartons. Plus QR codes: if a square lands in the frame instead of bars, we will read that too."
  - question: What is a code that starts with 2, or with 20–29?
    answer: "It is an in-store code. The shop itself prints those, usually on loose goods weighed at the counter — cheese, nuts, salad from the deli. Outside that shop it means nothing: in another chain the same digits are a different product. We label such codes explicitly, so that the missing country does not look like a fault."
  - question: The code starts with 978 or 979 — is that a product too?
    answer: "No, that is a book: 978 and 979 are the ISBN prefixes. For codes starting 978 we also show the old ten-digit ISBN-10, which is what library catalogues and older card indexes are searched by. 9790 is not a book but sheet music, a separate standard called ISMN. And 977 marks magazines and newspapers, the ISSN."
related:
  - barcode
  - qr-scan
  - qr-code
---

Point the camera at a code or load an image. We show the digits, verify the check digit, and name the country where the number was issued.

## When the bars will not read

A barcode is fussier than a QR: it is read line by line, and a single scratch across it is enough. **Glare from film** — tilt the phone and the reflection moves off. **A curved surface**: on a bottle or a can the bars smear near the edges, so shoot the flattest part you can find. **Cropped white margins** at each end: they are part of the code, and without them the scanner cannot find where it starts and stops. And keep the bars across the frame rather than running diagonally.

## Check your print run before you print it

If you made the code yourself, scan a proof label here before printing ten thousand. Bars have a minimum width below which a scanner stops telling them apart, and it is very easy to shrink an image past that line while laying out a page. The code itself can be built on the [barcode generator](/en/barcode), which will also work out the check digit.

## One product, one number

An EAN-13 is tied not to a name but to a specific item. The same shampoo in a 400 ml bottle and a 250 ml bottle are two different numbers, and strawberry yoghurt differs from blueberry. That is what makes the code useful for checking a delivery note or a shelf: if all thirteen digits match, the goods are exactly right. If one digit differs, it is another size, another flavour, or another batch.
