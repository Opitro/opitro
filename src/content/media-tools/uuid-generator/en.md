---
toolSlug: uuid-generator
locale: en
category: dev
tool: uuid-generator
title: UUID / GUID Generator Online — Bulk UUIDv4 Random ID Builder
h1: UUID & GUID Generator
navName: UUID generator
summary: "UUID v4 and v7, a thousand at once"
description: "Professional online tool to generate UUIDs and GUIDs. Instantly build single or bulk cryptographically secure random UUIDv4 identifiers locally in your browser."
faq:
  - question: What is the difference between a UUID and a GUID?
    answer: "Technically none — they are two names for one standard. UUID took hold in the open world: Linux, macOS, Java, Python, Go. GUID is the name Microsoft uses in Windows, MS SQL Server and .NET. The structure is identical: 128 bits written as thirty-two hexadecimal characters and split by hyphens into groups of 8-4-4-4-12. An identifier made here suits both."
  - question: What are the odds of getting two identical identifiers?
    answer: "Practically zero, and that is a calculation rather than a claim. Version four gives 122 of its 128 bits to randomness — the other six carry structural markers. That is about 5.3 × 10³⁶ combinations. For the risk of a collision to reach one half you would have to create a billion identifiers a second for roughly eighty-six years. We verified that figure with the birthday-problem formula instead of copying it out of somebody's article. This is precisely why distributed databases hand out such keys without consulting one another or checking them."
  - question: Why not use Math.random?
    answer: "It produces numbers that look random but come from an internal state by a known rule. Having seen a few in a row you can predict the next — this has been demonstrated in practice for the generators shipped in browsers. For shuffling cards in a game that hardly matters; for a record key it does: guessing somebody else's key gets you where you should not be. We take our bytes from the system's source of randomness — the same one encryption keys are built on."
  - question: What is version 7, and when is it better than version 4?
    answer: "Version seven puts the creation time at the front, so the identifiers come out in ascending order. That matters when the identifier becomes a primary key: a random key forces the database to insert into the middle of its index, splitting pages, while an ascending one lands at the end. On tables of millions of rows the difference shows. The flip side is that such a key reveals when the record was created, to the millisecond. If that is undesirable, take version four — it remains the default here."
  - question: Why strip the hyphens or use upper case?
    answer: "Some databases and languages store the value their own way. Oracle and a number of drivers expect a solid 32-character string with no hyphens, and MongoDB keeps it as a binary field. Upper case is a habit of the Microsoft world: in .NET and MS SQL Server the value is usually printed in capitals. None of this changes the identifier itself: both forms mean the same number, and either can be turned into the other without loss."
  - question: Are the identifiers sent anywhere?
    answer: "No. They are born in the tab's memory, are not written to any log and never travel over the network — the page makes no network requests at all. That is not a trifle: your project's internal keys, once they land in somebody else's log, stop being only yours."
related:
  - json-formatter
  - mock-data
  - base64-encode-decode
---

Choose how many and which version — the identifiers appear as a list. The way they are written changes in place, without issuing new ones: the same list, only in capitals or without hyphens.

## Which version to take

If the identifier merely has to be unique, take version four — that is what people mean by UUID. If it will be a primary key and the rows will number in the millions, look at version seven: it yields ascending values, and the database stops splitting index pages on every insert. If the creation time of a record must stay private, version four only: version seven shows it to anyone who can read the first twelve characters.

## An identifier is not a password

A UUID is unique but not secret: it is neither checked nor signed, and whoever knows it gets whatever it points at. A link of the form "page/uuid" with no permission check is access granted on a guess, and identifiers do leak — into logs, into address bars, into other people's bookmarks. For invitations and one-time links use a separate random token, longer and time-limited, rather than the record's identifier.

## Do not check for uniqueness

The temptation is strong: query the database before inserting, just in case. That is an extra round trip on every single row for an event that will not happen in the lifetime of your system. The calculation above says exactly that: worrying about collisions makes sense where identifiers are few, not where there are 10³⁶ of them.
