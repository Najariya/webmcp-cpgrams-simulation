# 01 · Product — The Citizen's Advocate

*Supersedes the earlier CPGRAMS-portal draft. Truth anchor: `00-facts.md`. Execution mandate: v4 (owner-approved 2026-08-28).*

## Positioning (fixed — use verbatim across product/README/video/Devpost)

- **Pitch:** A WebMCP-powered public grievance sandbox where a citizen's own browser agent can help file, track, understand, remind, rate and appeal grievances through structured tools and human-controlled actions.
- **Short line:** *The citizen's advocate throughout the grievance lifecycle.*
- **Thesis:** Government AI (CPGRAMS 7.0, Samadhan Didi) already helps citizens **enter** the grievance system. WebMCP lets the citizen's **own** browser agent remain their advocate **after filing**.
- **NOT:** "AI CPGRAMS", "Voice CPGRAMS", or a filing chatbot. Filing is the beginning, not the product.

## The three golden journeys

**J1 — File.** "Help me file a grievance about this issue." → agent picks category → structured draft shown → citizen edits → explicit confirmation → simulated submission → memorable ID (e.g. `PG-26-04821`) → case on board → lifecycle starts. Replay-safe (idempotent).

**J2 — HERO. "Which of my grievances needs attention today?"** → agent inspects cases + SLA states → identifies the overdue case **without an interim response** (day 23 of 21) → explains in citizen language → offers reminder → confirmation → simulated reminder → timeline updated.

**J3 — Poor disposal → appeal.** "I don't agree with this disposal. What can I do?" → disposed case found → disposal explained → citizen rates Poor → **tool registry visibly changes** (appeal drafting appears) → evidence-grounded appeal draft → citizen reviews → final confirmation → simulated appeal submitted → timeline updated.

Supporting: **J4 safe failure** (bad ID → `NOT_FOUND`, no crash, agent recovers), **J5 injection** (malicious grievance text stays inert text).

## Golden dataset (6 cases, relative dates, fictional)

| ID | Case | State by design | Serves |
|---|---|---|---|
| G1 | — (draft flow) | new draft | J1 |
| G2 | Pending day 9 | healthy SLA | contrast in J2 |
| G3 | Pending day 23, **no interim reply** | overdue, action needed | **J2 hero** |
| G4 | Pending day 26, interim reply recorded | overdue but explained | nuance in J2 |
| G5 | Disposed, rated Satisfactory | completed | J2 contrast |
| G6 | Disposed, unrated/poor-eligible | appeal window open | **J3** |

Fictional citizen; credible Central ministries (Railways, EPFO/Labour, Health, Education, Power, Consumer Affairs); no real officials.

## Screens (compact IA)

1. **Home / My Cases** — positioning, simulation notice, case cards (status, ministry, SLA indicator, next-action), copyable prompts; prominent hero prompt.
2. **Case Detail** — ID, summary, ministry, status, elapsed days, SLA state, interim state, movement timeline, reminders, disposal, feedback, appeal events, next actions.
3. **Grievance Review** — draft fields, editable, simulation label, explicit submit confirmation.
4. **Appeal Review** — original grievance + disposal + objection + evidence + appeal argument, final confirmation.
5. **How Your Agent Works** — live WebMCP availability, current tool registry with read/write + state-dependent availability, confirmation policy, privacy, simulation note.

## Scope discipline

MUST = lifecycle end-to-end, 13 tools, dynamic registration, confirmation gates, tests/evals/UAT, deploy, README, video, submission. SHOULD = duplicate detection, Hindi journey polish, speech, large type, empty states, reset-demo. COULD = map, stats, dark mode. NEVER at the cost of J1–J3 reliability. Cut order per v4 §59.
