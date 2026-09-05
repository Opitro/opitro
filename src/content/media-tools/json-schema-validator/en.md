---
toolSlug: json-schema-validator
locale: en
category: dev
tool: json-schema-validator
title: JSON Schema Validator Online — Validate JSON Against a Schema
h1: JSON Schema Validator
navName: JSON Schema validator
description: "Validate JSON against a schema online: types, required fields, limits and formats. Every mismatch at once, with the path to the field. Draft-07, 2019-09 and 2020-12. Free, all in your browser."
faq:
  - question: What is JSON Schema and why validate against it?
    answer: "A JSON Schema describes what the data is supposed to look like: which fields are required, what type they are, what range the numbers fall in, what pattern the strings match. Validating against it answers the question an ordinary validator never asks — did we get what we were expecting. It is a cheap way to catch a disagreement between two programs before it reaches real users."
  - question: How is this different from ordinary JSON validation?
    answer: "An ordinary validator looks only at syntax — whether the text parses at all. Schema validation looks at meaning. The document {\"age\": \"forty\"} is syntactically flawless and an ordinary validator will call it fine. Against a schema that declares age to be a number it fails, and rightly so."
  - question: Which drafts of the standard are supported?
    answer: "Draft-07, 2019-09 and 2020-12. They are mutually incompatible: the later ones, for instance, replaced array items with prefixItems. The right one is taken from the $schema field of your schema, and with no such field we validate against draft-07, the most widespread. Which one was applied is shown next to the button — staying quiet about it would leave you guessing what rules you were judged by."
  - question: Why are all the errors shown at once?
    answer: "Because fixing them one at a time is slow. Validation runs in the mode that collects every mismatch rather than stopping at the first, and each one carries the path to the field: /user/age, /items/2/id. The whole list of repairs is visible in one go."
  - question: What does an error in the schema, rather than the data, mean?
    answer: "It means what needs fixing is the rules, not the data. It happens with an unknown keyword, a broken $ref, or a typo such as \"type\": \"int\" instead of \"integer\". We report it on its own line, because hunting for the problem in the data would be pointless."
  - question: Are formats like email and date checked?
    answer: "Yes. The format keyword with the usual values — email, date, date-time, uri, uuid, ipv4, ipv6 and others — works here. Worth knowing: the standard itself treats format as a hint, and some tools do not check it at all. We do."
  - question: Is the data sent anywhere?
    answer: "No. The check runs right in your browser. Server responses, configuration and schemas go nowhere, are never stored, and disappear with the tab."
related:
  - json-formatter
  - escape-unescape
  - base64-encode-decode
---

The schema — the rules — is on the left. The data being checked is on the right. Syntax in both boxes is checked as you type; the rules are applied after a short pause, or when you press the button.

## Not the same as checking JSON

An ordinary validator looks at syntax: does the text parse. Here the meaning is checked — the right fields, of the right types, within the right limits.

## Every mismatch at once

Not just the first but the whole list, each with the path to the field: `/user/age`, `/items/2/id`. No fixing them one at a time and rerunning after each.

## An error in the schema is kept apart from an error in the data

An unknown keyword, or a typo like `"type": "int"` instead of `"integer"`, is a fault in the rules rather than the data — and it is reported as such.
