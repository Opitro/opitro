---
toolSlug: mock-data
locale: en
category: dev
tool: mock-data
title: Mock Data Generator Online — Build Fake JSON, CSV and SQL Datasets
h1: Mock Data Generator
navName: Mock data
description: "Generate mock data online: names, emails, phones, dates and UUIDs in four languages. Output as JSON, CSV or SQL INSERT. Emails only at example.com. Everything runs in your browser."
faq:
  - question: What is mock data and what is it for?
    answer: "It is invented records that look real: names, email addresses, phone numbers, dates, identifiers. You need them when the interface is being built and the database is still empty, when you want to see how a list behaves with a thousand rows, or when the documentation needs an example. Above all, they let you keep real people's data out of development."
  - question: Why are the names in the page's language rather than English?
    answer: "Because testing a Russian or Spanish application on “John Smith” tells you nothing. English names do not show whether a long surname fits the column or whether sorting survives an accented letter. The dictionaries here are our own and cover four languages, which is why this page weighs kilobytes rather than the half a megabyte a ready-made library costs."
  - question: Why are the email addresses at example.com?
    answer: "Those domains are reserved for examples by a standard of their own (RFC 2606): mail sent there physically reaches nobody. Generators often use test.com instead — a real registered domain with a real owner, who one day receives somebody else's test run. We do not do that."
  - question: Can I call the generated phone numbers?
    answer: "No, and this matters. No reserved “fictional” range of numbers exists anywhere except the United States, so a number we produce may coincide with a real one. For English we use the 555-01xx range, set aside for exactly this purpose; for the other languages we produce a plausible shape, which must not be called or texted."
  - question: What about escaping in SQL?
    answer: "Values are escaped: a single quote is doubled. Without that the name O'Brien tears the statement in half, and instead of test data you get a demonstration of how databases are broken. Numbers and booleans go unquoted, and the table name is checked — anything other than letters, digits and underscores falls back to users."
  - question: How many rows can I generate?
    answer: "Up to 5000 at a time. The limit is not the computation, which is fast, but the output box: browsers find very long text hard to draw and the page starts responding with a lag. For larger volumes, generate several batches."
  - question: Is the data sent anywhere?
    answer: "No. Everything runs right in your browser. The structure of your future tables and the data itself go nowhere, are never stored, and disappear with the tab."
related:
  - json-formatter
  - csv-json
  - sql-formatter
---

Build the schema: the field name on the left, the type on the right. Choose a format and a count, then press Generate.

## Data in the language of the page

An application in Russian needs Russian names: “John Smith” shows you nothing about long surnames or how the layout copes with Cyrillic. Our own dictionaries, four languages.

## Email only at example.com

Those domains are reserved for examples by a standard of their own, and mail sent there reaches nobody. Generators often use `test.com` — a real domain with a real owner.

## SQL values are escaped

The name `O'Brien` would otherwise tear the statement in half. The apostrophe is doubled, numbers and booleans go unquoted, and the table name is checked.
