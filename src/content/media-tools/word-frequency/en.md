---
toolSlug: word-frequency
locale: en
category: text
tool: word-frequency
title: Word Frequency Counter Online — Keyword Density Analyzer
h1: Word Frequency Counter
navName: Word frequency
description: "Free online word frequency counter. Builds a frequency list, measures keyword density and repetition, and filters out function words. Your text never leaves the browser."
faq:
  - question: What is keyword density and why look at it?
    answer: "Density is the share of one particular word in the whole text, as a percentage. It is worth a glance for one reason: it shows whether you have slipped into repeating the same word. But it is not a standard to hit — no search engine publishes a threshold above which a text counts as over-optimised, and “keep it under three per cent” is trade folklore rather than a rule. Reading the text aloud is more reliable: if a word grates, there really is too much of it."
  - question: What are stop words and why remove them?
    answer: "They are function words: prepositions, conjunctions, pronouns, particles. They are the most frequent words in any language and say nothing about the content. Without filtering them the top of the list is “the”, “and”, “of”, and there is nothing to analyse. The list is chosen by the language of the text rather than of the page: analyse a Russian article on the English version of the site and the Russian list is applied — and it is named in the summary line."
  - question: What are the two repetition figures?
    answer: "They come from Russian SEO tools. The classic one is the square root of how many times the most frequent word occurs; the academic one is that word share as a percentage. We compute them because people look for them, but plainly: no search engine publishes such a measure or names a threshold. Treat them as a rough signal that one word repeats too often, not as a score."
  - question: Why are “text” and “texts” counted separately?
    answer: "Because exact forms are counted, not dictionary words. Merging forms takes morphological analysis, which needs a dictionary of several megabytes — it would take longer to download than the whole page takes to work. We do not pretend to do it: when studying keywords, add the forms together yourself."
  - question: What happens to hyphenated words and apostrophes?
    answer: "They stay whole. The usual approach — deleting punctuation from a list — turns “state-of-the-art” into one run-on word and “don’t” into “dont”. We do not delete punctuation; we pick out words: letters and digits with an optional hyphen or apostrophe inside."
  - question: What is the minimum word length for?
    answer: "To cut out noise: single letters, symbols, leftovers of markup. The default is three letters, which removes the clutter without losing short meaningful words like “SEO” or “API”. If your text relies on two-letter terms, set it to two."
  - question: Is there a size limit?
    answer: "No sensible limit is imposed: the analysis takes one pass through the text, so even a book is handled quickly. Note something else instead — in a very long text the percentages become tiny, so the bar beside each word is drawn relative to the most frequent word rather than to a hundred per cent. Otherwise every bar would be indistinguishably short."
  - question: Is my text sent anywhere?
    answer: "No. The analysis runs right in your browser. Neither the text nor its frequency list is sent to a server, stored anywhere, or kept once the tab is closed."
related:
  - reading-time
  - remove-duplicate-lines
  - text-diff
---

Paste your text — the frequency list appears at once, with nothing to press.

## What the page shows

- **A frequency list** — every word by descending count, with its share as a percentage
- **Total and unique words** — the size of the text and its vocabulary range
- **Two repetition figures** — measures borrowed from SEO tools

## Stop words follow the language of the text

The list of function words is chosen from the letters and words themselves, not from the language of the page. Analyse a Russian article on the English version of the site and the Russian list applies. Which one was used is printed in the summary line.

## Words stay whole

The usual approach deletes punctuation from a list, and “state-of-the-art” becomes one run-on word while “don’t” becomes “dont”. We do not delete punctuation; we pick out words: letters and digits with an optional hyphen or apostrophe inside.

## What this page cannot do

It counts exact forms, not dictionary words: “text” and “texts” land on separate rows. Only morphological analysis can merge them, and that needs a dictionary of several megabytes. We do not pretend to do it.
