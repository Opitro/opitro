---
toolSlug: htaccess-generator
locale: en
category: dev
tool: htaccess-generator
title: .htaccess Generator Online — Apache Configuration & Rewrite Rules Builder
h1: .htaccess Generator
navName: .htaccess Generator
description: "Professional online tool to generate .htaccess files for Apache servers. Instantly build 301 redirects, WWW/HTTPS routing rules, security headers, and caching directives locally."
faq:
  - question: What is .htaccess and which folder does it go in?
    answer: "It is a settings file for the Apache web server that applies to one folder and everything nested inside it. It lets you change how the server behaves without touching the global configuration — which is exactly why it became the main tool wherever the global configuration is out of reach, that is, on almost any ordinary hosting account. It belongs in the site root: the same folder as index.php or index.html. Hosts name that folder differently — public_html, www, httpdocs. The rules apply to it and to everything within."
  - question: Why might a site go down after installing an .htaccess?
    answer: "There are two failures, and both are common. The first is a 500 on every request: the file contains a line Apache does not understand, or the host does not permit that setting to be overridden. The second, more insidious, is an endless redirect loop: the browser reports “too many redirects” and gives up. A loop appears when a rule sends the request back to where it came from. That is why we ask you to keep the previous file before replacing it: there will be nothing to roll back to if the old one is gone. Check immediately after uploading — the home page and an inner page both."
  - question: Why does the “behind a proxy” checkbox matter?
    answer: "Because without it, forcing HTTPS takes down a site that sits behind Cloudflare. The proxy terminates the secure connection itself, and the request reaches your Apache as plain HTTP — the server sees http and dutifully sends the visitor to https. They arrive again, again through the proxy, again as plain HTTP, and so on without end. We do not assume this; we demonstrated it on a real server: the same file without the checkbox answers 301 to a request that already arrived over https. With the checkbox the tool additionally inspects the X-Forwarded-Proto header, and no loop forms."
  - question: Why canonicalise the host, and why with a 301?
    answer: "Search engines treat http://site, https://site, http://www.site and https://www.site as four different addresses carrying identical content. The weight of your pages is spread across them and none ranks as well as it could. A permanent redirect with status 301 tells search that the move is final, and the accumulated weight passes to the address you chose. A temporary redirect (302) does not do that — search leaves the weight on the old address, expecting a return."
  - question: Why are the scheme and the host fixed by one rule rather than two?
    answer: "Two separate rules produce two redirects in a row: http://www.site → https://www.site → https://site. For a person that is extra delay on every visit through an old link; for search it is an extra hop in the chain. We fold both conditions into one rule, and the hop count stays at one. This is measured on a real server rather than argued: the test counts the length of the chain."
  - question: Will hotlink protection block my own visitors?
    answer: "It will not, because we allow an empty referrer. That is not obvious but it matters: the referrer is empty when an image is opened directly by its link, when it is saved to disk, and for everyone who has referrer sending switched off in their browser. A rule that forbids an empty referrer is the most common mistake in these settings, and it hits your own people. We do not shut out image search either: Google, Bing, Yandex and the rest stay on the allowed list, because closing the door on them means losing the traffic they bring."
  - question: How reliable is blocking by IP address?
    answer: "As a remedy against one persistent nuisance, it works. As security, it does not. An address changes when a router is restarted, and through somebody else's node it changes without a second thought. Treat it as a door latch rather than a lock: it stops whoever calls out of habit and does not stop whoever wants in. Incidentally, Apache has two dialects here: version 2.4 wants Require not ip, version 2.2 wants Deny from. We write both, each behind its own module check, so the file works on either."
  - question: Does my configuration go to a server?
    answer: "No. Everything is assembled in the tab's memory and the page makes not a single network request. That is no small thing: your server layout, your folder paths and your block list are a map of how your site is built, and they have no business ending up in somebody else's logs."
related:
  - minify-html
  - unix-timestamp
  - uuid-generator
---

Tick what you need and the file assembles itself. The finished code can be copied or downloaded as a file.

## What it covers

Forced HTTPS, host canonicalisation to www or to non-www, forbidding directory listings, blocking addresses, hotlink protection, response compression, browser cache lifetimes, and your own “old path → new address” redirects.

Every block is wrapped in a module check. That means if your server lacks, say, mod_deflate, the file will not fall over with a 500 — that section simply does not run.

## Three places where ready-made generators get it wrong

**A site behind Cloudflare.** The proxy terminates the secure connection itself, the request reaches Apache as plain HTTP, and the “redirect to https” rule fires every single time. The site spins in an endless loop. Tick “behind a proxy” and we add a look at the `X-Forwarded-Proto` header.

**Two redirects instead of one.** A separate rule for the scheme and another for www produce an extra hop. We fold them into one.

**Hotlink protection that hits your own visitors.** Forbid an empty referrer and opening an image directly or saving it to disk stops working. Here the empty referrer is allowed, and so is image search.

## How this was checked

With a real Apache. The test starts httpd 2.4 with `AllowOverride All`, drops the assembled file into the document root, and issues genuine requests — with a substituted host, with the proxy header, with a foreign referrer. What is compared is not the text of the rules but the status codes and headers the server returns.

Verified, among other things: there is exactly one redirect rather than two; behind a proxy the answer is 200 rather than an endless loop; a foreign site gets 403 for an image while opening it directly gets 200; image search is not shut out; stylesheets are served compressed and images are not; pages carry a zero cache lifetime and images a year. And it is separately demonstrated why the proxy checkbox exists: the same file without it answers 301 to a request that already arrived over https.

## Keep the old file before replacing it

This is the one piece of advice worth all the others. A mistake in `.htaccess` does not spoil the look of a page — it takes the whole site down, and fixing it means file access at a moment when the site itself no longer opens.
