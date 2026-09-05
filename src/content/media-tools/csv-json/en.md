---
toolSlug: csv-json
locale: en
category: dev
tool: csv-json
title: CSV to JSON Converter Online — Turn Tables Into JSON Arrays
h1: CSV ↔ JSON Converter
navName: CSV and JSON
description: "Convert CSV to JSON and back online. Codes with leading zeros and long IDs survive intact, a comma inside a field does not break the table, nested data flattens into columns. Free, all in your browser."
faq:
  - question: How does CSV differ from JSON?
    answer: "CSV is a flat table: rows and columns separated by a comma or a semicolon. It is the native format of spreadsheets and database exports. JSON is a nested notation: objects inside objects, arrays, key-value pairs. It is the language programs speak to each other. Translating between them comes up constantly: you export a table and need to feed it to a program, or you get a server response and need to look at it as a table."
  - question: Why does the code 00123 not turn into 123 here?
    answer: "Because the usual test — “looks like a number, so it is one” — corrupts data silently. The code 00123 loses its zeros, the identifier 9007199254740993 becomes 9007199254740992, the phone +447700900123 loses its plus, the price 1.50 becomes 1.5. Our rule is different and exact: a value becomes a number only if it converts back digit for digit. Everything else stays a string, intact."
  - question: What does “numbers and true/false as real types” do?
    answer: "In CSV everything is text — the format has no types at all. Converting to JSON, the string \"42\" can stay a string or become the number 42, and the words true and false can become booleans. The checkbox turns that conversion on. Switch it off and everything stays a string, which is sometimes exactly what you want."
  - question: Does a comma inside a field break the table?
    answer: "No. Parsing follows the rules of the format rather than splitting on a character. The address \"London, Baker St 1\" in quotes stays one column, a line break inside quotes does not split the record, and a doubled quote reads as one. This is precisely where naive converters fail: one comma in an address and the whole row shifts by a column."
  - question: What happens to nested JSON when converting to CSV?
    answer: "Nesting is flattened into plain columns with a dot. The object {\"user\":{\"name\":\"Ann\"}} gives a user.name column, an array gives tags.0 and tags.1. Column order follows first appearance rather than the alphabet, so the table looks the way whoever wrote the data intended. There is no other way: a table has no nesting."
  - question: Which delimiter should I pick?
    answer: "By default we work it out ourselves by counting characters outside quotes. English spreadsheets usually use a comma, many European ones a semicolon, and database exports often a tab. If the guess is wrong, choose one by hand — the one in use is shown under the box."
  - question: Is the data sent anywhere?
    answer: "No. Everything runs right in your browser. Exports, customer lists and reports go nowhere, are never stored, and disappear with the tab."
related:
  - json-formatter
  - json-schema-validator
  - case-converter
---

The source is on the left, the result on the right. Direction and delimiter are chosen at the top, and everything recomputes as you type.

## Codes and long numbers survive intact

Ordinary converters go by “looks like a number, so it is one”, and the code `00123` becomes `123` while `9007199254740993` becomes `…992`. Here a value becomes a number only if it converts back digit for digit.

## A comma inside a field does not break the table

Parsing follows the format rules: `"London, Baker St 1"` stays one column, and a line break inside quotes does not split the record.

## Nesting flattens into columns

`{"user":{"name":"Ann"}}` gives a `user.name` column, an array gives `tags.0` and `tags.1`. The order follows first appearance.
