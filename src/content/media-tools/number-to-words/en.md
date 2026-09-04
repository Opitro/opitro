---
toolSlug: number-to-words
locale: en
category: text
tool: number-to-words
title: Number to Words Online — Convert Digits to Written Text
h1: Number to Words
navName: Number to words
description: "Free online number-to-words converter and back. Dollars, euros, roubles and hryvnias with correct forms, gender of numerals, cents as digits. Amounts stay in your browser."
faq:
  - question: Why are amounts written out in words on documents?
    answer: "So that they cannot be altered unnoticed. In digits it is enough to add a zero or turn a one into a seven, while the words “one thousand” cannot be changed without a trace. That is why contracts, invoices and powers of attorney repeat the sum in words, and where digits and words disagree the words prevail."
  - question: How does the reverse conversion work?
    answer: "The page breaks the string into numerals and scale words and adds them up: “one thousand four hundred fifty dollars fifty cents” becomes 1450.50. The direction is worked out automatically — digits and letters cannot be confused, so there is nothing to switch. If a word turns up that we do not know, the page names it rather than silently returning a wrong number."
  - question: Why does the Slavic grammar matter here?
    answer: "Because Russian and Ukrainian change the ending of the noun after a number: one rouble, two roubles in one form, five roubles in another. And the numeral itself agrees with the gender of the currency — masculine for the rouble, feminine for the hryvnia. Get it wrong and the sum reads as machine-written at a glance."
  - question: What is odd about eleven?
    answer: "It ends in a one, but Slavic languages use the third word form from eleven to fourteen: “eleven roubles”, never the singular-genitive that a one would suggest. It is a separate rule rather than a remainder after division, and almost every home-made converter misses it."
  - question: Why does the euro not decline?
    answer: "In Russian and Ukrainian it is an indeclinable borrowing: the word stays the same after any number. The rouble, the hryvnia and the dollar behave like ordinary nouns. We take that into account, so the wrong form never appears."
  - question: What does the gender switch do?
    answer: "It changes the form of the numeral in plain text, which matters in Slavic and Spanish when counting objects: one box in the feminine, two buckets in the neuter. In currency mode the gender is not asked — it comes from the currency itself."
  - question: What is the accounting format?
    answer: "A form where the cents stay as digits: “One hundred dollars 00 cents”. That is the convention on invoices and payment orders, where the fractional part is never spelled out. The switch appears as soon as a currency is chosen."
  - question: How large a number can be converted?
    answer: "Up to quadrillions, which is eighteen digits. More importantly, we work from a string of digits rather than a number. An ordinary number in a browser holds integers exactly up to about nine quadrillion and rounds beyond that — the amount on a document would come out wrong. That cannot happen here at any length."
  - question: Are the amounts sent anywhere?
    answer: "No. Everything is computed right in your browser. Neither amounts nor contract wording goes to a server, is stored anywhere, or survives closing the tab."
related:
  - text-case-converter
  - punctuation-remover
  - word-frequency
---

## What it does

- **Five formats** — plain text, roubles, hryvnias, dollars, euros
- **Gender of the numeral** — for counting objects in Slavic languages and Spanish
- **Cents as digits** — the accounting form, “One hundred dollars 00 cents”
- **Reverse parsing** — words back into a number, naming any word it does not know

## The grammar people trip over

In Slavic languages the word after a number changes form three ways, and from eleven to fourteen it is always the third one. The numeral agrees with the gender of the currency. The euro does not decline at all.

Those are exactly the places where a machine-written sum gives itself away, so we tested them separately.

## Why we work from a string of digits

An ordinary number in a browser holds integers exactly up to about nine quadrillion and rounds beyond that. For an amount on a contract that is unacceptable: 9,007,199,254,740,993 would become 9,007,199,254,740,992. We split the string itself into groups of three, so length does not matter.
