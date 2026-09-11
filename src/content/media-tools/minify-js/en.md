---
toolSlug: minify-js
locale: en
category: dev
tool: minify-js
title: JS Minifier Online — Compress JavaScript Code & Obfuscate Scripts
h1: JavaScript Code Minifier
navName: "JS Minifier"
summary: "Shrink the script, shorten the names"
description: "Professional online tool to minify and compress JavaScript (JS) code. Instantly remove white spaces, comments, and shorten variable names locally in your browser."
faq:
  - question: What is the difference between plain minification and shortening names?
    answer: "Plain minification strips the formatting — surplus whitespace, line breaks, comments. The logic and the names stay as they were. Shortening names, usually called mangling, is a different kind of work: the tool parses the code into a tree, finds the scope of every variable and replaces long readable names with single letters. <code>userAge</code> becomes <code>a</code>. On large files this is where most of the saving comes from, and it also makes the code awkward for outsiders to read — though calling it obfuscation would be too strong: the logic is just as visible, it simply takes longer to follow."
  - question: Why a third-party library for JavaScript when you wrote your own for HTML and CSS?
    answer: "Because the cost of a mistake differs. In markup and stylesheets bad compression is visible to the eye: words fused, spacing gone. In JavaScript it stays invisible until the moment a button stops working for a user. Shortening names requires knowing the exact scope of every variable, otherwise you cannot tell your own name from someone else's. Pattern replacement cannot solve that at all — only a real parse into a tree can. We took Terser, the same one that sits inside the build tools of real projects. It weighs 170 KB and loads only when you press the button: until then the page stays light."
  - question: Can shortening names break working code?
    answer: "Not your own code: parsing into a tree guarantees that only what is declared inside its own scope gets renamed. <code>window.something</code>, <code>document.title</code> and anything arriving from outside stay untouched. It can break in two cases, and both involve code inspecting names itself. First: <code>eval</code>, or reaching for a name assembled from a string — the shortened name will not be found there. Second: checks like <code>fn.name === 'handler'</code> — the name changed, so the check fails. In both cases untick the box: the file comes out larger, but the behaviour is unchanged."
  - question: What happens on a syntax error?
    answer: "The tool stops and names the place: the line and column where parsing stumbled. The tab does not freeze and the output is not corrupted — you get a message rather than half of a broken file. This is not something we improvised: the line number comes from the same parse that builds the tree, so it points at the real place rather than an approximate one."
  - question: Does minification only change formatting, or the code as well?
    answer: "The code as well, and it is worth knowing in advance. The parser folds anything it can compute ahead of time and drops what is unreachable: <code>(price * quantity) * (1 + 0.2)</code> turns into <code>price*quantity*1.2</code>. Behaviour stays the same — Terser's defaults are deliberately cautious and do nothing that could alter how the program runs. But if you compare the output with the source line by line, be ready to see more than removed whitespace."
  - question: Does my code go to a server?
    answer: "No. Parsing happens in the tab's memory and the page makes not a single network request — even the parsing library is served from this very site rather than from somebody else's network. The logic of your applications and the algorithms you would rather not show go nowhere."
related:
  - minify-html
  - minify-css
  - escape-unescape
---

Paste your code and press the button. The row at the top leads to the neighbours: the HTML minifier and the CSS minifier.

## Why a real parser is used here

For markup and stylesheets we wrote our own parser — there, bad compression is visible to the eye. For JavaScript that will not do. Shortening names requires knowing the scope of every variable: which one is declared here and which arrived from outside. Without a tree the two cannot be told apart, and renaming breaks code silently — not while compressing, but later, for the user.

So Terser works here, the same parser that sits inside the build tools of real projects. It loads only when you press the button — 170 KB, once per visit.

## What you get

The example from the brief shows both kinds of work at once:

```
function calculateTotal(price, quantity) {
    // Tax
    let taxRate = 0.2;
    return (price * quantity) * (1 + taxRate);
}
```

becomes

```
function calculateTotal(t,a){return t*a*1.2}
```

Whitespace and the comment are gone, the names are shortened, and along the way the arithmetic that can be worked out in advance has been folded: `1 + 0.2` became `1.2`, and the intermediate variable disappeared as no longer needed. The function's own name stayed: it is declared outward, and renaming it would sever the link with whoever calls it.

## When to switch name shortening off

When the code inspects its own names: reaching through `eval`, assembling a name from a string, or comparing `fn.name`. Untick the box then — the result weighs more, but the behaviour does not change.
