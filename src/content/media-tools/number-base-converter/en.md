---
toolSlug: number-base-converter
locale: en
category: dev
tool: number-base-converter
title: Number Base Converter Online — Convert Binary, Octal, Decimal, Hex
h1: Number Base Converter
navName: "Number Base Converter"
summary: "Base 2, 8, 10, 16 — all at once"
description: "Professional online tool to convert numbers between different numeral systems: Binary, Octal, Decimal, and Hexadecimal. Instant mathematical conversions processed locally in your browser."
faq:
  - question: How does conversion between binary and hexadecimal actually work?
    answer: "It barely involves arithmetic. The binary form splits into groups of four digits from the right, and each group is exactly one hexadecimal character: 1010 is A, 0010 1010 is 2A. The match is no accident — sixteen is two to the fourth power, so four bits exhaust one character precisely. Hence the habit of writing memory addresses and bit masks in hex: 64 bits shrink to 16 characters and nothing is lost."
  - question: Why not just use parseInt and toString?
    answer: "Because an ordinary JavaScript number holds integers exactly only up to 2 to the 53rd, and hexadecimal is needed precisely past that line. Check it yourself: parseInt('FFFFFFFFFFFFFFFF', 16).toString(16) returns 10000000000000000 — a one followed by zeros instead of sixteen F characters. The number was rounded on the way in. We compute with BigInt, whose precision does not run out, and checked the answers against python3, where integers are unbounded too."
  - question: Why are there no fractions?
    answer: "Because there is no honest answer for them. A fractional part in binary is almost always infinite: decimal 0.1 is 0.000110011001100… repeating forever. Any displayed result would have to be cut short, which means presenting an approximation as exact. We would rather not accept the dot into the fields at all than silently drop the fraction."
  - question: Where are octal and hexadecimal actually used?
    answer: "Hexadecimal is colour codes on the web, addresses in memory, bit masks, hashes and character codes. Octal has retreated almost entirely into Linux and Unix file permissions: permissions are written as triples of bits (read, write, execute), and a triple of bits is exactly one octal digit. That is why 0755 reads straight off: 7 is rwx for the owner, 5 is r-x for everyone else."
  - question: How many bits does my number take?
    answer: "Below the fields two things are shown: how many binary digits the number occupies, and which ordinary size it fits into — 8, 16, 32 or 64 bits. That is usually what you need to know: 255 still fits in a byte, 256 does not; 65535 takes exactly 16 bits. For negative numbers no size is shown: it depends on how they are encoded, and there is no single correct answer."
  - question: Do my numbers go to a server?
    answer: "No. Converting between bases is a few lines of arithmetic; it needs neither a server nor a network. The page makes no network requests at all — everything is computed in the tab's memory. It works offline too, once the page is open."
related:
  - hash-generator
  - unix-timestamp
  - color-converter
---

Type a number into any of the four fields and the other three update as you go. Impossible characters simply never appear: a 2 will not enter the binary field, 8 and 9 will not enter the octal one, letters past F will not enter the hexadecimal one.

## Four bits, one hex character

Sixteen is two to the fourth power, so four binary digits exhaust one hexadecimal character exactly. That is where the convenient mental arithmetic comes from: `1010` = A, `0010 1010` = 2A. Octal works the same way in triples: three bits, one digit.

## Why BigInt and not an ordinary number

An ordinary JavaScript number holds integers exactly only up to 2⁵³. Hexadecimal is needed precisely where that line has already been crossed: a memory address, a mask, a slice of a hash — those are 64 bits. The commonly recommended `parseInt` route returns `10000000000000000` for `FFFFFFFFFFFFFFFF` — a one followed by zeros. That cannot happen here.

## No fractions, and that is not an omission

Decimal 0.1 is infinite in binary. It cannot be shown exactly, and cutting it short would mean passing an approximation off as exact. The dot is not accepted into the fields.

## How this was checked

Against `python3`: its integers are unbounded too, and `format(x, 'b')`, `'o'` and `'X'` were written by other people. Seventy-five numbers were run — round ones, boundary ones (255, 256, 65535, 2⁵³, 2⁶⁴−1) and random ones up to 128 bits, in both directions and across all four bases. Separately verified is the thing this was built for: past 2⁵³ the textbook approach gives a wrong answer and this one gives the right one.
