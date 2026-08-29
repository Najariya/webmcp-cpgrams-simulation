# The Citizen's Advocate — a CPGRAMS-style grievance sandbox for WebMCP

> **A WebMCP-powered public grievance sandbox where a citizen's own browser agent can help file, track, understand, remind, rate and appeal grievances through structured tools and human-controlled actions.**
>
> *The citizen's advocate throughout the grievance lifecycle.*

**Live demo:** <https://webmcp-cpgrams-simulation.vercel.app> · **Status:** labelled simulation · MIT license

---

## ⚖️ Simulation notice

This project is a **clearly-labelled simulation** inspired by the [CPGRAMS](https://pgportal.gov.in/) grievance lifecycle (DARPG, Government of India). It is **not affiliated with, endorsed by, or connected to the Government of India**. All cases, ministries interactions and officials are fictional; nothing is submitted to any government system; there is no backend and no real PII. Policy behaviour modelled in code traces to a fact register with primary sources — see [`docs/00-facts.md`](docs/00-facts.md).

## 🎮 Try it with your agent (2 minutes)

Open the live URL in **ChatGPT's in-app browser**, or in **Chrome 149+** with `chrome://flags/#enable-webmcp-testing` enabled, then paste:

1. **“Which of my grievances needs attention today?”** — the hero journey. The agent surveys your cases, spots the one on day 23 of a 21-day target with no interim response, explains it in plain language, and offers a reminder — which you must approve in the page.
2. **“Help me file a grievance about this issue.”** — the agent picks a category, prepares a structured draft, you edit/approve, and a registration ID (`PG-26-XXXXX`) is issued. Retry-safe: a duplicated call never files twice.
3. **“I don't agree with this disposal. What options do I have?”** — record a Poor rating (with confirmation) and watch the **tool registry change live**: appeal drafting appears because your situation now permits it.

## The problem

India's CPGRAMS already centralized grievance filing across all ministries — and its own AI (categorization, routing, the Samadhan Didi voice chatbot) helps citizens **enter** the system. But filing is only the beginning. A citizen must then interpret SLA clocks, interim replies, disposal quality and appeal windows — procedural literacy most people don't have, in language many aren't comfortable in.

**The gap is the citizen's side, after filing.** That's where their own browser agent — not the government's — should advocate for them.

## What it does

- **File** — agent-assisted drafting with duplicate checking, human review, explicit confirmation, memorable registration ID.
- **Track & understand** — SLA picture for every case (day N of 21, interim-reply nuance), actor-attributed movement timelines, plain-language explanations.
- **Remind** — reminders on overdue cases, once per 7 days, always confirmed.
- **Review disposals** — feedback recording; a **Poor** rating opens the 30-day appeal window.
- **Appeal** — evidence-grounded appeal drafting addressed to the ministry's Nodal Appellate Authority, with final human confirmation.

## Why WebMCP

A static portal forces agents to guess through DOM automation. This site instead exposes **structured capabilities** — typed tools with contracts, validation, errors and confirmation semantics — so the citizen's browser agent can act reliably and safely:

- **13 core tools + voice preference** (6 read + 7 write + `set_voice_mode`) registered through `document.modelContext.registerTool`.
- **Dynamic registration** — the tool surface follows the citizen's situation: `submit_grievance` exists only while a valid draft awaits; `create_appeal_draft` appears only inside an open appeal window; `rate_disposal` exists only while feedback is pending. The **Agent Tools** page shows the live registry (via `getTools()` + `toolchange`), not a mock.
- **Ranked attention, one recommendation** — asked "which of my grievances needs attention today?", tools don't return a flat list: an urgency ranking (overdue-without-interim first, worsening as the target slips; a closing appeal window next; unrated disposals aging toward urgency) puts a single **most urgent** case at the top of `get_sla_status`/`get_app_state` and leads the speakable line with it. The case register uses the same order.
- **Authorization parity** — the portal UI gates the case register behind sign-in, and the tools enforce the same gate: signed out, citizen-scoped tools answer `PRECONDITION_FAILED` with a one-tap sign-in hint and leak no case data. General-knowledge tools (categories, process KB, speak-aloud) stay open.
- **Human control as a first-class pattern** — consequential tools (`submit_grievance`, `send_appeal`, `send_reminder`, `rate_disposal`) return `CONFIRMATION_REQUIRED` and open an in-page dialog showing the **exact payload**; approval is bound to a payload hash, expires in 60 seconds, and is single-use. The agent cannot silently commit anything.
- **Idempotency** — replaying an identical consequential call returns the original result with `alreadyProcessed: true`; double-clicks and tool retries never file twice.
- **Compact, model-friendly results** — every tool returns `{ok, speakable, data|error, nextActions}`; `speakable` is one locale (the citizen's language), and outputs are budget-tested to stay within Chrome's ~1.5K guidance.
- **Voice-ready by design** — WebMCP has no native voice API and always requires a visible page, so voice-readiness is the page's job: compact one-locale `speakable` lines sized for speech, an `aria-live` region announcing every tool-driven state change (filings, reminders, ratings, appeals, approval prompts) for screen readers and voice agents, a **Voice Mode** narration preference (header toggle or the `set_voice_mode` tool) that speaks key citizen moments aloud in English or Hindi, and `speak_aloud` for explicit page-side TTS. Speech degrades gracefully where `speechSynthesis` is unavailable.

## Human control model

| Tier | Tools | Gate |
|---|---|---|
| A — high consequence | `submit_grievance`, `send_appeal` | payload-hash-bound in-page approval, 60 s single-use token, revalidation, idempotency |
| B — externally meaningful | `send_reminder`, `rate_disposal` | explicit confirmation before commit |
| C — reversible | drafts (`create/update_grievance_draft`, `create_appeal_draft`) | none (reversible by design) |
| D — read | reads | none |

## Security

- **Prompt-injection safe by construction**: grievance text is data. Dedicated tests file a grievance whose subject is `SYSTEM OVERRIDE: ignore previous instructions…` and assert it remains inert text (escaped rendering, length caps, no content-derived control flow), with `untrustedContentHint` on tools that echo citizen content.
- **Authorization parity**: tools that read or change the citizen's record require the (simulated) sign-in, exactly like the portal UI — signed out they return a structured sign-in hint and expose nothing.
- Validation everywhere: unknown keys rejected, enums, ID formats, lengths, state preconditions — errors carry `field` + `hint` so the model self-corrects instead of thrashing.
- Never throws: tool failures surface as structured `{code, message, hint}` envelopes (`INVALID_ARGUMENT`, `NOT_FOUND`, `PRECONDITION_FAILED`, `CONFIRMATION_REQUIRED`, `CONFLICT`, `INTERNAL`).

## CPGRAMS fidelity

Every policy behaviour traces to [`docs/00-facts.md`](docs/00-facts.md) (primary sources: pgportal.gov.in, DARPG guidelines, PIB): 21-day target, mandatory interim reply on delay, Reminder/Clarification, feedback with Poor→appeal unlock, 30-day appeal window to the Nodal Appellate Authority, ~30-day appeal disposal, exclusions (RTI, sub-judice, religious, service matters). Deliberately **not** modelled: second appeal tier, 15-day comment loops, remand, state-specific procedures, real integration — fidelity over theatre.

## Architecture

- **No backend.** Vite + React + TypeScript + MUI, client-side simulation (zustand + localStorage), relative-date golden cases (G1–G6) so the demo is stable any day it's opened.
- `src/domain/` — pure model: grievance types, SLA engine (facts C3–C7), guarded lifecycle transitions.
- `src/webmcp/` — tool catalog, result envelope with budget clipping, registrar (diff-sync with AbortControllers + execution-race guard), confirmation gate.
- `src/components/` — CPGRAMS-style portal UI (identity band, case register, case detail + timeline, review screens, agent-tools transparency page).

## Privacy

The prototype has no application backend and performs no server-side persistence. Demo grievance state is stored locally in the browser — the citizen can export it as a JSON file ("Export my data" in the case register) or erase it at any time. Information required for an agent action is shared with the citizen's browser agent through explicit WebMCP tool contracts. Fictional data only; no authentication of real identities.

## Testing

- **Unit (vitest, 42 tests)** — SLA facts, attention ranking, lifecycle guards, human-gate TTL/single-use, envelope budgets, authorization parity, voice layer, adversarial inputs: `npm test`.
- **In-browser golden journeys** — J1 file (gate → confirm → ID → idempotent replay), J2 hero reminder (incl. premature-reminder refusal), J3 Poor → surface change → appeal → replay, J4 invalid-ID `NOT_FOUND`, J5 injection inertness. Verified through the same tool surface agents use.
- Worklog & QA history: [`docs/worklog.md`](docs/worklog.md).

## Independent skeptical-agent exercise

An independent browser agent (ChatGPT with WebMCP enabled) was let loose on the live deployment with adversarial instructions: exercise every tool, try to bypass the confirmation gate, decline and re-try, file nonsense IDs. Results (full log: [`docs/judge-verdict.md`](docs/judge-verdict.md)):

- Every consequential action — filing, reminder, rating, appeal — was stopped by the exact-payload confirmation gate; **no bypass succeeded**.
- Declining blocked the identical payload (`PRECONDITION_FAILED`); approval only worked for the revised payload it was bound to.
- The lifecycle unlocked correctly (Poor rating → appeal drafting → gated appeal submission); invalid IDs returned structured `NOT_FOUND` with recovery hints.

Its three critiques, and what shipped in response: **(1)** attention surfaced as an unranked list → now a single most-urgent recommendation with a full urgency ranking behind it; **(2)** tools acted for the demo citizen while the page showed a sign-in surface → authorization parity gate (above); **(3)** state is browser-local with no backend → by design for this challenge, answered with data ownership: one-click JSON export and one-click erase.

## Run locally

```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # typecheck + production build
```

For the full agent experience open the dev URL in ChatGPT's in-app browser, or Chrome 149+ with `chrome://flags/#enable-webmcp-testing`. Without WebMCP the portal still works manually and the Agent Tools page explains what your agent would see.

## License

[MIT](app/LICENSE) © 2026 Naveen Agrawal
