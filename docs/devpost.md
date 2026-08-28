# Devpost submission copy (draft — owner pastes & finalizes)

> **Note for Naveen:** type the project TITLE yourself in Devpost (rules: AI must not name the project). Everything below is paste-ready body copy.

## Inspiration

Government grievance platforms have dramatically improved access. India's CPGRAMS centralized filing across every ministry, added AI categorization and routing, and even launched a multilingual voice chatbot. But filing is only the beginning — a citizen then faces 21-day clocks, interim replies, disposal quality and 30-day appeal windows, largely alone. The help citizens still lack is on **their side of the system, after filing**.

## What it does

A CPGRAMS-style grievance sandbox (clearly labelled simulation) where the citizen's **own browser agent** is their advocate through the whole lifecycle — File → Track → Understand → Remind → Rate → Appeal. Ask *"Which of my grievances needs attention today?"* and the agent answers with one ranked recommendation first — the case on day 23 of a 21-day target with no interim response — explains it plainly, and offers to send a reminder — which **you** must approve in the page. The agent honours the same sign-in gate the portal shows you, and your data never leaves your browser (one-click export or erase).

## How we built it

WebMCP-first: 13 structured tools (reads, reversible drafts, consequential actions) registered through `document.modelContext`, with **dynamic registration** — the tool surface changes with your situation (appeal drafting appears only inside an open appeal window). Consequential tools return `CONFIRMATION_REQUIRED` and open a payload-hash-bound, 60-second single-use human gate; replays are idempotent (`alreadyProcessed`). Results are compact, one-locale `speakable` envelopes within Chrome's guidance; grievance text is treated as untrusted (injection tests included). No backend — client-side simulation with relative-date golden cases. React + MUI, IBM Plex typography, CPGRAMS-inspired government chrome.

## Challenges we ran into

Designing tool contracts that survive real models (descriptions ARE the contract — no outputSchema in WebMCP); keeping outputs inside ~1.5K chars without losing the answer; dynamic registration races during in-flight tool calls (solved with an execution counter + deferred reconciliation); making "the agent asks first" tamper-proof; bilingual experience without bloating every result.

## Accomplishments we're proud of

The full lifecycle works through the agent, end to end, safely: gated filing with memorable IDs, the hero SLA journey with a single ranked "most urgent today" recommendation, Poor-rating → live tool-registry change → evidence-grounded appeal. We also let an independent skeptical browser agent attack the live build: every bypass of the confirmation gate failed (full log in the repo). 35 unit tests + a 23-prompt eval suite + adversarial tests, all green. A premium government-grade UI that still reads honestly as a simulation.

## What we learned

The hard part of agent-native public services isn't exposing tools — it's designing **state, gates and budgets** so a helpful agent and a safe one are the same thing.

## What's next for the project

Authenticated (consent-based) real integration, more languages, notifications, and the same advocate pattern for other public-service lifecycles. Clearly future work — not in this build.

## Built with

React 19, TypeScript, MUI, WebMCP (`document.modelContext`), zustand, Vite, Vercel.

## Links

- Live: https://webmcp-cpgrams-simulation.vercel.app
- Repo: https://github.com/Najariya/webmcp-cpgrams-simulation (MIT)
- Video: *(owner pastes YouTube URL)*
