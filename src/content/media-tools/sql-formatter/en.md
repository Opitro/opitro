---
toolSlug: sql-formatter
locale: en
category: dev
tool: sql-formatter
title: SQL Formatter Online — Free SQL Code Prettifier and Beautifier
h1: SQL Formatter
navName: SQL formatter
description: "Format SQL online: indentation, line breaks, keyword case, twelve dialects. Minifying to one line never breaks strings, comments or optimiser hints. Free, all in your browser."
faq:
  - question: Why format SQL queries?
    answer: "A query built by a program or typed in a hurry often arrives as one solid line half a screen long. It cannot be read, let alone debugged. Formatting puts a break before every clause, indents subqueries and brings the keywords to one style. After that you can see at a glance where a condition ends, how many joins there are and what is actually being selected."
  - question: Why choose a dialect if SQL is one language?
    answer: "Only the skeleton is shared. PostgreSQL dollar quoting, MySQL backticks, T-SQL square brackets, PL/SQL blocks — a generic parser gets each of these wrong and can mangle the query. The chosen dialect sets both the keyword list and the escaping rules."
  - question: What is wrong with ordinary SQL minification?
    answer: "It breaks the query in three places at once, and all three silently. The two spaces inside 'London,  Baker St' are data rather than indentation, so collapsing them changes what reaches the database. Everything after a double dash is a comment to the end of the line; joining the lines comments out the whole rest of the query. And an optimiser hint like /*+ INDEX(t idx) */ looks like a comment but decides the execution plan — drop it and the query quietly runs at a different speed. We walk the query character by character and keep all of it."
  - question: Which keyword case should I pick?
    answer: "It is a matter of taste and team convention. Upper case is what the textbooks use and it marks out the skeleton of the query among the table names. Lower case sits more quietly in modern code that already has syntax colouring. There is also “leave as is”, for projects that have settled on their own style."
  - question: What does the break before AND and OR do?
    answer: "It puts the connective at the start of a line rather than the end of the previous one. In a long condition of five or six checks that makes it obvious how many there are and where each one ends; with the connective dangling at the end of a line the eye has to read to the edge to find out."
  - question: How large a query can I paste?
    answer: "Ordinary queries, even hundreds of lines long, are handled instantly. On very long scripts — thousand-line migrations — it is the text box rather than the parsing that struggles: browsers find very long text hard to draw."
  - question: Is the query sent anywhere?
    answer: "No. Everything runs right in your browser. Table schemas, production queries and analytics go nowhere, are never stored, and disappear with the tab."
related:
  - json-formatter
  - csv-json
  - json-schema-validator
---

Paste a query — it is formatted as you type. Dialect, indent and keyword case are chosen at the top.

## Minifying to one line does not break the query

The ordinary trick of replacing every run of whitespace with a single space ruins three things at once: the data inside string literals, the comments after `--`, and the optimiser hints `/*+ ... */`. We walk the query character by character and keep all of it.

## The dialect matters

PostgreSQL dollar quoting, MySQL backticks, T-SQL square brackets, PL/SQL blocks — a generic parser gets every one of them wrong. Twelve engines to choose from.

## Case and breaks the way your team writes them

Upper case, lower case or “leave as is”. A break before AND and OR puts the connective at the start of the line, so a long condition shows how many checks it holds.
