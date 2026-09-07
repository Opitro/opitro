---
toolSlug: jwt-decoder
locale: en
category: dev
tool: jwt-decoder
title: JWT Decoder Online — Verify Signature & Debug JSON Web Tokens
h1: JWT Decoder & Signature Verifier
navName: JWT Decoder
description: "Professional online tool to decode and verify JSON Web Tokens. Instantly parse JWT Header, Payload, and validate cryptographic signatures locally in your browser."
faq:
  - question: Is it safe to enter a secret key on somebody else's site?
    answer: "Here is the honest answer rather than the promotional one. This page makes no network requests at all, and you can check that yourself: open the browser's Network tab, type a key, and nothing will appear. But you are under no obligation to take our word for it, and the real point is not about us. The habit of pasting working keys into web pages is dangerous in itself: most such pages are built differently, and a key pasted once cannot be un-pasted. The rule is simple — test somebody else's tool with a separate, throwaway key, and paste your working key nowhere."
  - question: What does “signature does not match” mean?
    answer: "That the hash of the header and payload computed with your key does not equal the third part of the token. There are usually two reasons: either the key is not the one the server signed with, or the contents were altered after signing. But there is a third that most tools keep quiet about: you may have entered a password for a token signed with RS256 or ES256. Those signatures are verified with a public key rather than a shared secret — and in that case we say plainly “a public key is needed” instead of reporting a bad signature. They are not the same thing."
  - question: Is the data inside a token encrypted?
    answer: "No, and this is the commonest misconception about JWT. The header and the payload sit in the token in the open — merely written as base64url — and anyone can read them without any key at all. That is exactly what the first box on this page does: it decodes the token without asking for a key. The signature protects against tampering, not against reading. So a token is no place for passwords, card numbers or identity documents: anyone who gets hold of it will see them all."
  - question: "What is alg: none, and why does it get its own answer?"
    answer: "It is a token with no signature. The standard permits it, and it once powered a real attack: libraries accepted such tokens as genuine, so rewriting the payload, setting alg: none and deleting the third part was enough to become an administrator. We report it separately rather than alongside “signature does not match”: there is a difference between a broken lock and no lock at all, and the person needs to see it."
  - question: Why does exp show the wrong time?
    answer: "Almost always because exp and nbf are recorded in SECONDS since 1970, while the familiar Date.now() in JavaScript returns milliseconds. Comparing them directly is a thousandfold error: a live token appears to have expired in 1970 or to run until the fifty-eighth millennium. We turn the timestamps into readable dates and say how much time is left — computing in seconds throughout."
  - question: How was the signature checking verified?
    answer: "With somebody else's program. Three hundred tokens were signed by the system's openssl — the same way a server signs them — across three HMAC lengths. For all three hundred the correct key matched and a modified key did not match a single one. On top of that, the well-known token shown on jwt.io is read and verified by our tool, and openssl reproduces it character for character."
related:
  - hash-generator
  - unix-timestamp
  - json-formatter
---

Paste a token and it decodes itself. A key is needed only to check the signature: reading the contents does not require one, and that is the whole point.

## A token reads without a key

The first thing to understand about JWT: it is not encryption. The header and payload are written as base64url — a reversible encoding, not a cipher. Anyone holding the token reads everything inside it in a second, with no key at all.

The signature protects against **tampering**: you cannot alter the payload and go unnoticed. Against **reading** it does not protect at all. Hence the rule: a token is no place for passwords, card numbers, or anything you would not show a stranger.

## Three answers instead of one

Ordinary decoders know two answers: signature valid and signature invalid. That is not enough.

**There is no signature at all.** `alg: none` — a token without one. Reporting that as “invalid signature” is wrong: the difference between a broken lock and no lock matters.

**There is nothing to check it with.** RS256 and ES256 verify with a public key, not a password. Telling someone who entered a password that the signature is invalid would be a lie.

**No key entered.** Also its own answer, not “invalid”.

## Timestamps are in seconds

`exp`, `nbf` and `iat` are recorded in seconds since 1970. The commonest mistake when working with them is comparing against `Date.now()`, which in JavaScript returns milliseconds. That is a thousandfold difference, and the token appears either to have expired in 1970 or to live until the fifty-eighth millennium. We turn the timestamps into dates and state how much is left.

## How this was checked

With somebody else's program rather than our own code: three hundred tokens signed by the system `openssl` across three HMAC lengths. The correct key matched all three hundred; a modified key matched none. Separately verified: tampering with a role in the payload is caught by the signature and, at the same time, is **visible on decoding without any key at all**.
