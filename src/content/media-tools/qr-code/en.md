---
toolSlug: qr-code
locale: en
category: dev
tool: qr-code
title: QR Code Generator Online — Create Free QR Codes (PNG and SVG)
h1: QR Code Generator
navName: QR code
description: "Create a QR code for a link, text, Wi-Fi network or vCard. Download as PNG or SVG, four error-correction levels. Non-Latin text encoded correctly. Free, all in your browser."
faq:
  - question: How does downloading a PNG differ from an SVG?
    answer: "A PNG is made of dots: it has a fixed size, and blown up far enough the edges of the squares go soft. It suits the screen — a chat, a slide, a web page. An SVG is described by formulas: stretch it to the size of a shop sign and the edges stay perfectly crisp. For print — a sticker, a menu, a banner — take the SVG."
  - question: What is the error correction level for?
    answer: "It is a reserve against damage. Redundant information is built into the code, and a scanner uses it to reconstruct the data even when the picture is creased, scratched or partly covered. At the low level about 7 per cent of loss is recoverable, at the highest about 30 — but the code itself grows larger. For an outdoor sticker take a high level; for a picture on screen medium is enough."
  - question: Why does non-Latin text not turn into mojibake here?
    answer: "Because we convert the string to UTF-8 — the form every scanner expects. Many generators take only the low byte of each character: the code still builds and even scans, but the phone shows nonsense instead of the text. The failure is silent, and the only way to notice it is on a real phone."
  - question: What happens if the Wi-Fi password contains a semicolon?
    answer: "Nothing bad here. In the network string a semicolon separates the fields, so the characters \\ ; , : \" inside the name and password must be escaped with a backslash — and we do it. Without escaping the phone sees the password only up to the first semicolon, silently fails to connect, and the owner blames the router."
  - question: Why is there a white margin around the code?
    answer: "It is part of the code, not decorative padding. The standard requires an empty frame four modules wide: that is how a scanner works out where the code begins and ends. Without it the code reads badly against a busy background. The margin is built into the picture on screen and into both downloads."
  - question: Can I put a business card into the code?
    answer: "Yes — choose vCard. We assemble the record in the vCard format, so the phone offers to save the whole contact: name, organisation, job title, phone, email and website. Commas and semicolons inside the fields are escaped, so a name like “Acme, Ltd” does not break the record apart."
  - question: Is the data sent anywhere?
    answer: "No. The code is built right in your browser. Links, network passwords and vCard details go nowhere and disappear with the tab — which matters here in particular, since the code often carries a home network password."
related:
  - base64-file
  - url-encode-decode
  - mock-data
---

Choose what you are encoding, fill in the fields, and the code appears at once. Download it as a PNG for the screen or an SVG for print.

## Non-Latin text is encoded correctly

Many generators take the low byte of each character and the phone shows nonsense. We convert the string to UTF-8 — the form every scanner expects.

## A Wi-Fi password with a semicolon does not break the code

In the network string a semicolon separates the fields, so inside the name and password it must be escaped. Without that the phone sees the password only up to the first semicolon and silently fails to connect.

## The white margin is part of the code

The standard requires an empty frame four modules wide: that is how the scanner finds the edges. It is built into the picture and into both files.
