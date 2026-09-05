---
toolSlug: case-converter
locale: en
category: dev
tool: case-converter
title: CamelCase to snake_case Converter Online — Naming Style Transformer
h1: CamelCase and snake_case Converter
navName: Case converter
description: "Free online converter between camelCase, PascalCase, snake_case, kebab-case and UPPER_CASE. Works on lists, splits acronyms correctly and keeps edge underscores."
faq:
  - question: What is the difference between camelCase and snake_case?
    answer: "They are conventions for writing compound names in code. camelCase joins the words and marks the boundaries with capitals: myVariableName. snake_case lowercases everything and separates words with underscores: my_variable_name. Different languages have different habits — JavaScript prefers camelCase, Python prefers snake_case — so porting code from one to the other means rewriting names in bulk."
  - question: What are kebab-case and UPPER_CASE for?
    answer: "kebab-case separates words with hyphens: my-variable-name. It is the convention for CSS class names and parts of page addresses, where underscores read badly and capitals are not allowed at all. UPPER_CASE writes everything in capitals with underscores: MY_VARIABLE_NAME, traditionally for constants whose value never changes while the program runs."
  - question: Why do acronyms not fall apart into letters?
    answer: "Because the rule “a capital starts a word” does not hold for them. Under that rule parseHTTPResponse would become parse_h_t_t_p_response. In fact the last capital of a run belongs to the next word: HTTPResponse is HTTP and Response, so the result is parse_http_response, as it should be."
  - question: What happens to the digit in a name like user2Name?
    answer: "It stays with the word on its left, giving user2_name rather than user_2_name. That is how the name was written: the 2 is part of user2, not a separate piece. The same applies to parseX509, which becomes parse_x509."
  - question: What happens to underscores at the edges?
    answer: "They are kept exactly as they were. In Python __init__ and init are different names, and turning one into the other breaks the code. A single leading underscore is meaningful too — it marks an internal field. So the edges are never touched, whatever the target style."
  - question: Can I paste a whole line of code?
    answer: "Better not: the tool works on lists of names, one per line. We do not try to parse whole lines of code, because keywords and string literals get mangled that way, and silently corrupting somebody else source is worse than not touching it. Indentation and trailing commas are preserved, so a converted list can go straight back into the file."
  - question: Are the names sent anywhere?
    answer: "No. Everything happens right in your browser. Function, field and table names never go to a server, are never stored, and do not survive closing the tab."
related:
  - text-case-converter
  - escape-unescape
  - sort-lines
---

Paste a list of names, one per line. The result appears at once.

## Five styles

- **camelCase** — `userFirstName`, the JavaScript convention
- **PascalCase** — `UserFirstName`, for classes and types
- **snake_case** — `user_first_name`, the Python and database convention
- **kebab-case** — `user-first-name`, for CSS classes and page addresses
- **UPPER_CASE** — `USER_FIRST_NAME`, for constants

## Three places where the naive rule breaks

**Acronyms.** Under “a capital starts a word”, `parseHTTPResponse` would become `parse_h_t_t_p_response`. In fact the last capital of a run belongs to the next word, giving `parse_http_response`.

**Digits.** `user2Name` is `user2` and `Name`, not three pieces. The result is `user2_name`.

**Edge underscores.** In Python `__init__` and `init` are different names. The edges survive in every style.

## The list comes back ready to paste

Indentation and trailing commas are preserved: a line reading `  userName,` comes back as `  user_name,`.
