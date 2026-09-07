---
toolSlug: url-parser
locale: en
category: dev
tool: url-parser
title: URL Parser Online — Split URL into Query Parameters
h1: URL Parser
navName: URL Parser
description: "Online URL parser. Instantly split links into query parameters, host, path, and protocol layouts locally in your browser."
faq:
  - question: What parts does a web address consist of?
    answer: "A scheme (https:, for instance), a host (the domain name or server address), a port, a path to a section or file, a query string after the question mark — “name=value” pairs joined by ampersands — and a fragment after the hash. A username and password can also be written before the host: hardly anyone uses that, but such links do turn up, and our parser flags them separately, because they are a leak."
  - question: Why do some of my parameters disappear?
    answer: "Most likely because the names repeat. In a link like ?a=1&a=2 ordinary parsing returns only the first value and the second vanishes silently — nearly every simple parser makes this mistake. We show every value in the original order and mark the repeats. It comes up especially often in links from advertising systems, where repeated tags are routine."
  - question: Why does a parameter arrive different from what was sent?
    answer: "Usually the plus sign is to blame. In a query string a plus means a space; in the path it means a plus — the same character with different meanings on either side of the question mark. The second most common cause is the percent sign: %2F in a path is an encoded slash INSIDE a segment, not a separator. The path /a%2Fb/c consists of two segments, not three, and we deliberately leave that slash encoded — showing “/a/b/c” would misrepresent the structure of the link."
  - question: Why did the host turn into letters beginning with xn--?
    answer: "That is punycode. The browser converts host names written in Cyrillic or any other non-Latin script into that form before sending: “пример.рф” becomes “xn--e1afmkfd.xn--p1ai”. That form is what reaches the server and lands in its logs, so we show it as the primary value with the familiar spelling beside it, allowing one to be recognised in the other."
  - question: Does the fragment after the hash reach the server?
    answer: "No. Everything after the hash is kept by the browser and never included in the request. That part will never appear in server logs. Two consequences follow: you cannot pass anything to the server through a fragment, and hiding something secret there is pointless — it sits in the address bar and is stored in browser history."
  - question: Is it safe to parse links containing tokens on this site?
    answer: "This page makes no network requests at all — you can see that in your browser's Network tab, and nothing stops you from checking us. But the main point is not about us. A link carrying a token is dangerous in itself: it lands whole in the logs of every server along the way, in browser history, in bookmarks, and in the Referer header when you follow a link onward. A URL is a poor place for a token, no matter where you parse it."
related:
  - jwt-decoder
  - url-encode-decode
  - hash-generator
---

Paste a link and it parses at once, with no button to press. The parsing is done by the browser itself, with the same code it uses to follow links.

## What is shown beyond the usual

**Every repeated parameter.** Ordinary parsing of `?a=1&a=2` returns only the first value. Here both are visible, in the original order, with repeats marked.

**Two forms instead of one.** Beside the percent-encoded form stands a readable one — but only where decoding is safe. Characters that carry structure are left as they are.

**The host in punycode and as typed.** The first is what reaches the server; the second is what you recognise.

**A username and password in the link**, if present. Said plainly: such links leak into bookmarks, into history and into other people's logs.

## Why %2F is not decoded

It is an encoded slash **inside** a path segment. `/a%2Fb/c` is two segments, not three. Decode it and the screen would read `/a/b/c`, misrepresenting the structure of the link. We leave it as it is and say so on its own line.

The same applies to an ampersand inside a query value: decoded, it would look like a separator.

## How this was checked

Against `python3 urllib.parse` — a different program and different code: nine assorted links agreed on scheme, host, port, path and every parameter pair. The reverse punycode conversion was checked on five foreign examples, Arabic and Chinese among them.

That very comparison found a fault in our own layer: at first we decoded `%2F` along with everything else and displayed `/a/b/c` where there were two segments.
