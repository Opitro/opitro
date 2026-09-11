---
toolSlug: hash-generator
locale: en
category: dev
tool: hash-generator
title: Online Hash Generator — Create MD5, SHA-256, SHA-1 Cryptographic Hashes
h1: Cryptographic Hash Generator (MD5, SHA-256)
navName: "Hash Generator"
summary: "MD5, SHA-1, SHA-256 and SHA-512"
description: "Professional online tool to generate cryptographic hashes from text strings. Support for MD5, SHA-1, SHA-256, and SHA-512 outputs processed locally in your browser."
faq:
  - question: What is hashing, and how does it differ from encryption?
    answer: "Hashing turns data of any size into a string of fixed length, and it does so in one direction only: there is no reverse operation. Encryption is a two-way street: what is encrypted can be decrypted with a key — that is the whole point of it. Hence their different jobs. You encrypt what has to be read later: messages, files, a connection. You hash what does not need reading but does need comparing: whether a downloaded file matches the original, whether the right password was typed, whether a record has been tampered with."
  - question: Can the original text be recovered from a hash?
    answer: "The transformation itself is irreversible — no inverse formula exists. But that does not make every hash safe. Short and common strings were computed long ago and sit in public databases: the MD5 of “123456”, “password” or “qwerty” is one ordinary search away. Such databases are called rainbow tables. Irreversibility protects a long, unpredictable string, not any string at all. The shorter and more ordinary the input, the closer its hash is to being a simple note about it."
  - question: Which is safer, MD5 or SHA-256?
    answer: "SHA-256 is the current standard; website certificates and signatures rest on it. MD5 is broken, and that is not a warning about the future: two different files sharing one MD5 can be constructed on an ordinary computer in seconds. Nothing may be signed with it. Yet MD5 retains one honest use: checking that a file downloaded in full and was not damaged on the way. There it is not asked to withstand malice — only accident."
  - question: Is a hash like this suitable for storing passwords?
    answer: "No, and this is the most important thing on the page. MD5 and SHA are computed very fast, and that is exactly the trouble: an ordinary graphics card runs through billions of guesses a second, and a short password falls in minutes. Passwords need deliberately slow methods: bcrypt, scrypt, Argon2. And every record needs its own random addition — a salt — otherwise identical passwords produce identical hashes, and cracking one cracks them all at once. A hash from this page will not do for storing passwords."
  - question: Why does another site give a different hash for the same string?
    answer: "Almost always for one of two reasons. First, the encoding. A hash is taken of bytes, not of letters, and “привет” in UTF-8 and in windows-1251 are different sets of bytes and different hashes. We encode as UTF-8; in Latin script the difference is invisible, in Cyrillic it shows at once. Second, an invisible trailing newline. A command such as echo text | md5 adds one by itself, and the hash comes out different. Here exactly what is in the box is hashed, with nothing added."
  - question: Does my text go to a server?
    answer: "No. Everything is computed in the tab's memory: SHA comes from the browser itself, MD5 is computed by our code right on the page. Not a single network request is made. That is no small thing: people often paste in here what should not be pasted anywhere — passwords, keys, fragments of internal data."
related:
  - uuid-generator
  - base64-encode-decode
  - minify-js
---

Type some text and four hashes compute themselves, with no button to press. The “Upper case” box changes how the value is written, not what it is: the same hash, spelled differently.

## What computes what

SHA-1, SHA-256 and SHA-512 are computed by the browser itself — the same component that connection encryption rests on. There is deliberately no code of ours there: a home-made hash implementation goes wrong rarely and invisibly, and the price of such a mistake is a wrong checksum that somebody then acts on.

MD5 we had to write ourselves: browsers withhold it on purpose, so that it is not used for protection. Ours was checked against the system `md5` command on a thousand random strings and on every length in sequence from zero to two hundred — the 64-byte block boundary is exactly where home-made MD5 implementations usually go wrong.

## Hashing a password is not protecting it

The most common mistake people come here to make. The speed these algorithms are praised for is precisely the problem with passwords: running through billions of guesses a second costs nothing. For storing passwords there are deliberately slow methods — bcrypt, scrypt, Argon2 — with a separate random salt per record.

## Checked against the system

Not against our own code but against the system `md5` and `shasum` commands: twenty-one assorted samples (the empty string, Cyrillic, Japanese, emoji, line breaks, lengths sitting exactly on block boundaries), a thousand random strings, and every length from 0 to 200 in sequence. Everything matched character for character.
