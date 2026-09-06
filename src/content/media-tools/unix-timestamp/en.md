---
toolSlug: unix-timestamp
locale: en
category: dev
tool: unix-timestamp
title: Unix Timestamp Converter Online — Epoch Time to Readable Date & Vice Versa
h1: Unix Timestamp Converter
navName: Unix Timestamp
description: "Professional online Epoch time converter. Instantly transform Unix timestamps (seconds/milliseconds) into human-readable date-time strings locally in your browser."
faq:
  - question: What is a Unix timestamp, and when does the count start?
    answer: "It is a way of writing down a moment as a single whole number — the count of seconds since midnight on 1 January 1970, Coordinated Universal Time (UTC). The format depends on no time zone, no language and no national calendar, which is why databases compare and sort by it faster than by anything else: it is simply two numbers being compared. The starting point was not chosen for any astronomical event but for convenience — a round date close to the birth of Unix itself."
  - question: What is the difference between seconds and milliseconds?
    answer: "Traditional Unix counts in seconds — today a ten-digit number, and that is how MySQL, PostgreSQL, PHP and Python measure time. JavaScript (Date.now()) and Java count in milliseconds, which is thirteen digits. There are also microseconds (sixteen digits), handed out by many log formats and by PostgreSQL's internal fields, and nanoseconds (nineteen), which is how Go and the Linux kernel keep time. Our converter reads the number all four ways, takes the reading nearest to today, and writes its guess beside the result — one click overrides it."
  - question: Why not simply count the digits?
    answer: "Because that rule only holds for the present era. The timestamp 999999999 has nine digits, yet it is 9 September 2001 — perfectly ordinary seconds. Zero has one digit, and it is the start of the epoch. Timestamps before 1970 are negative, and the rule says nothing about them at all. Instead of counting digits we read the number every way and see whose answer lands nearest to today; at ten and thirteen digits this gives exactly what the common rule gives, but it does not fall apart at the edges."
  - question: Why must I pick a time zone when converting a date into a timestamp?
    answer: "Because a date without a zone is not a moment in time. “6 September, 12:00” is a different instant in Madrid and in Kyiv, and their timestamps differ by an hour. The browser's date picker carries no zone, so the local/UTC switch sits right next to it. Tools without such a switch silently assume your computer's zone — and lie to everybody else."
  - question: What happens on 19 January 2038?
    answer: "At 03:14:07 UTC the timestamp reaches 2147483647 — the largest number that fits a signed 32-bit integer. The next second overflows it and the time falls back to December 1901. This affects only systems that still keep time in 32 bits: old embedded devices, some networking equipment, certain file formats. Modern systems count in 64 bits, which gives them roughly two hundred and ninety-two billion years of headroom. If a timestamp you enter crosses the 2038 line, we mark it."
  - question: Is the timestamp really the number of seconds elapsed since 1970?
    answer: "No — and that is not our imprecision but the design of the standard. Unix time assumes every day holds exactly 86,400 seconds, whereas in reality a leap second is occasionally added to UTC so that it does not drift away from the Earth's rotation. Twenty-seven such seconds have accumulated. The standard skips them, because otherwise systems around the world would stop agreeing with one another. So a timestamp answers the question “which day and hour is this” honestly, but not the question “exactly how many seconds have passed”."
  - question: Do my timestamps go anywhere?
    answer: "No. Decoding dates is pure arithmetic; it needs neither a server nor a network, and the page makes not a single request. That matters more than it sounds: timestamps from your server logs are traces of how your system runs, and they have no business ending up in somebody else's logs."
related:
  - uuid-generator
  - json-formatter
  - date-to-words
---

Paste a timestamp and the date appears at once, in two time zones and as an ISO 8601 string. The current time runs along the top and can be taken in one click. Below it is the reverse direction: pick a date and get the timestamp.

## Seconds, milliseconds and everything else

We do not ask which unit you mean — we work it out, and we always show what we decided. That guess changes the answer by exactly a thousandfold, so four buttons sit next to the reading: s, ms, µs, ns. If the tool guessed differently from what you needed, press the one you want and it recalculates on the spot.

The unit is not decided by string length. The number is read all four ways, and the reading whose answer lands nearest to today wins. At the ordinary ten and thirteen digits this matches the familiar rule, but it does not stumble on zero or on timestamps from before 1970.

## Local time is your computer's time

The “Local” row is worked out from your own system settings, daylight saving included: a January timestamp in Kyiv reads UTC+02:00 while a September one reads UTC+03:00. Worth remembering that countries change these rules, and for dates from the last century your system may hold rules other than the ones actually in force at the time.

## Checked against the system clock

Date decoding was cross-checked against the system `date` command: nine reference timestamps, negative timestamps from before 1970, and three thousand random ones — every one matched character for character, including the leap year 2000 and the non-leap year 2100, which is divisible by four yet is not a leap year. Time zones were verified in seven countries, including India's half-hour offset and the three-quarter-hour offset of the Chatham Islands.
