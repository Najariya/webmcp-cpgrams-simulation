# 04 · Master Plan & Sprint Schedule (v2 — reviewed)

*WebMCP Challenge (OpenAI/Devpost) · solo builder: Naveen Agrawal · v2.0, 2026-08-28*
*This document supersedes the planning sections of PLAN.md. Sources: hackathon rules/resources tabs (webmcp.devpost.com), docs/00–03 of this repo.*

---

## 1. Executive summary

We build an **agent-native reimagining of CPGRAMS** — India's centralized public grievance portal — as a client-only web app where the citizen's browser agent (ChatGPT in-app browser / Chrome 149+ with the WebMCP flag) is their advocate across the full grievance lifecycle: file → auto-route → track → remind → rate → appeal. Every capability is an explicit, inspectable **WebMCP tool**; every consequential action waits for a human tap; every tool result carries a **bilingual (Hindi + English) speakable summary** because India is voice-first. The build runs in five one-day sprints (Aug 29 – Sep 2) with a hard buffer on Sep 3 (deadline 1:00 PM PT / 20:00 UTC), daily dual-browser verification, adversarial testing, and a complete submission kit (video, Devpost description, README, public repo with MIT license). This v2 plan incorporates a formal review of v1 (§2) and a corrected, primary-source CPGRAMS model (docs/00).

## 2. Review of v1 plan — findings and fixes

Acting as reviewer, twelve findings were raised against the previous plan; all are addressed in this version.

| ID | Finding (severity) | Fix in v2 |
|---|---|---|
| RV1 | Product was anchored on a single Gram Panchayat, not the centralized CPGRAMS portal the user asked for (critical) | Product re-anchored on the centralized model: 10 ministries/departments + 2 state services; docs 00–01 rewritten from primary sources |
| RV2 | Design & tool-contract docs (02, 03) still described the old village model — build sessions would consume stale specs (high) | 02/03 flagged as pending; alignment scheduled as Sprint 1 task T1.1 before any dependent build work |
| RV3 | No explicit mapping of deliverables to the four equally weighted judging criteria (high) | §10 judging alignment matrix with concrete proof points per criterion |
| RV4 | Submission artifacts (video script, Devpost text, README structure) not planned with definitions of done (high) | §9 submission kit with per-artifact DoD and final checklist |
| RV5 | Scope too large for a solo builder at production polish: 18 tools + case board + map + appeals + monitoring + bilingual UI (high) | MoSCoW cut lines in §4: India map, monitoring dashboard and pension intake demoted to Should/Could; feature freeze Sep 1, 18:00 IST |
| RV6 | Verification cadence mentioned but not operationalized — no scripted protocol for both test browsers and voice mode (medium) | §8 daily verification protocol with scripted journeys J1–J5 and a logged results file |
| RV7 | Adversarial cases (bad enums, gate bypass, replay, prompt injection) specified but never scheduled (medium) | Adversarial suite scheduled in S3 with pass criteria |
| RV8 | Deployment/repo/registration are user-owned single points of failure with no deadlines (high) | §12 owner TODOs with hard dates: Devpost now; `vercel login` by S1; repo name by S2 |
| RV9 | Post-deadline freeze rule not operationalized (medium) | Fork-the-repo workflow documented in §9; freeze checklist |
| RV10 | Risk register was thin (2–3 generic rows) (medium) | §11 risk register: 10 risks with likelihood/impact/mitigation/owner |
| RV11 | Tool description/output budgets were policy but not enforced mechanically (medium) | Budget linter added to CI-ish build gate (S2 task): fails build if any description >500 chars or output >1.5K |
| RV12 | Timeline stated only in PT; builder works in IST (low) | All deadlines dual-stated PT/UTC with IST where useful |

## 3. Hackathon requirements & compliance

| Requirement (rules/resources tabs) | How we comply |
|---|---|
| Working live URL testable in ChatGPT in-app browser or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` | Vercel deploy from S1 (hello-tool verified) through submission; app feature-detects WebMCP and degrades gracefully with instructions |
| Text description: WebMCP fit / UX improvement / new human+agent capability / implementation | Drafted in §9.3, pasted into Devpost form in S5 |
| Demo video < 3 min, public YouTube, with audio | Script in §9.2; recorded S5 morning with retake buffer |
| Public repo (GitHub/GitLab/Bitbucket) with OSS license visible in About section | Repo created S2 under Naveen's chosen name (AI must not name it — rules), MIT LICENSE committed Day 0, license set in repo About |
| New work after Aug 25, documented (timestamped commits) | Repo born Aug 28; conventional commits daily; worklog section in README |
| No post-deadline edits to submission/repo/site until winners (~Sep 23) | Freeze at submission; fork for continued work (§9.5) |
| Stage 1 pass/fail: viability, theme fit, required API use | README §WebMCP usage + video opening 20s show `registerTool` live |
| Stage 2: Leverage / Execution / Impact / Creativity, equal weight | §10 alignment matrix |
| Eligibility: OpenAI-API-supported country, age of majority, one submission per entrant | Confirmed for solo builder in India |

## 4. Product definition (summary of docs/00–01)

**Problem.** CPGRAMS solved access — one centralized portal for every ministry, department and state, now with AI routing, ~20 languages and a government-side voice assistant ("Samadhan Didi", May 2026). But the citizen still fights alone: knowing which ministry owns the problem, watching 21/30-day clocks, understanding that a "Poor" rating unlocks appeals, and drafting evidence-backed appeals — on a login-gated, typing-first portal. 

**Product.** The citizen's own agent on the other side of that backbone: it interviews in spoken Hindi, structures grievances with correct ministry routing and evidence, watches SLA clocks and interim-reply obligations, sends reminders, records feedback, and drafts two-tier appeals (Nodal Appellate Authority → Secretary) with citations — through inspectable WebMCP tools with human approval gates. Client-only: localStorage, no backend, no accounts; data never leaves the browser.

**Model fidelity** (verifiable claims F1–F22 in docs/00): unique registration ID (ours speakable, e.g. `PG-26-04821`); auto-routing to ministry + nodal officer; 21/30-day disposal norms; mandatory interim replies when delayed; Reminder/Clarification facility; Poor rating unlocks appeal; appeal ≤30 days, disposal ≤30 days with 15-day comment loop; remand movement; closed-only-after-appeal; exclusions guidance (RTI, sub-judice, service matters); ~10–12K grievances/day national context for impact framing.

**Scope (MoSCoW after review RV5):**
- **Must** — case board home; grievance data model + simulation engine (clocks, movements, interim replies, remand); 18-tool WebMCP layer with dynamic registration + human gates + bilingual summaries; draft review card; case detail timeline; feedback & rating → appeal unlock; appeal composer; agent guide; transparency panel; onboarding for judges; Hindi voice via platform agent + `speak_aloud`; large-type mode; deploy; README; video; Devpost submission.
- **Should** — India map (secondary view); monitoring mini-dashboard (receipts/disposals/pendency); duplicate/corroboration flow polish.
- **Could (only if green by Sep 1)** — pension-intake flag; `@mcp-b/global` polyfill; Chrome evals run; dark mode polish.

## 5. Architecture

- **Stack:** Vite + React 19 + TypeScript; MUI v9 with custom Material 3 "Civic Trust" theme (Inter + Noto Sans Devanagari; teal primary, amber urgency, violet reserved for agent-authored UI); Leaflet + OSM/CARTO (map view, secondary); Zustand + persist (localStorage); speechSynthesis for `speak_aloud`. No backend, no auth.
- **WebMCP layer:** typed `document.modelContext` bindings; universal result envelope `{ok, summary, data|error, meta}` where `summary` is a ≤160-char Hindi+English sentence written to be spoken verbatim; per-tool validators (unknown keys rejected, enum/range/length checks, safe coercions); 8-code error taxonomy (`INVALID_ARG`, `PRECONDITION`, `PENDING_CONFIRMATION`, `CONFLICT`, `NOT_FOUND`, `RATE_LIMITED`, `ABORTED`, `INTERNAL`) — never throw, always actionable hints so the model self-corrects; idempotency keys on submit/appeal; token-bucket rate limits; AbortSignal lifecycle; output budget 1.4K chars with array-trimming.
- **Registrar:** maps app state → desired tool set, diffs, registers/unregisters via AbortControllers; panel and agent guide consume `getTools()` + `toolchange` (the app demonstrates WebMCP with WebMCP).
- **Security & sensitivity:** human gates for `submit_grievance` / `send_appeal` (payload-hash-bound, 60 s, single-use, re-validated at tap); `readOnlyHint` on all readers; `untrustedContentHint` on all UGC-bearing outputs; UGC treated as prompt-injection carrier (React-escaped, JSON-quoted, length-capped); data minimization (no personal data beyond what the form needs); simulation clearly labeled everywhere.

## 6. Tool catalog (18 tools — full schemas in docs/03 after S1 alignment)

| # | Tool | Type | Gate |
|---|---|---|---|
| 1 | `get_app_state` | read | — |
| 2 | `list_grievance_categories` (ministries, SLAs, evidence) | read | — |
| 3 | `search_grievances` (ministry/status/state/since) | read (untrusted-out) | — |
| 4 | `check_duplicate_grievances` | read (untrusted-out) | — |
| 5 | `get_grievance_details` (movement timeline) | read (untrusted-out) | — |
| 6 | `get_my_grievances` | read (untrusted-out) | — |
| 7 | `get_sla_status` (clock, interim-reply due, appeal eligibility) | read | — |
| 8 | `get_kb_answer` (rules, statuses, exclusions, how-to) | read | — |
| 9 | `speak_aloud` (hi-IN TTS) | read | — |
| 10 | `create_grievance_draft` | write | — |
| 11 | `update_grievance_draft` | write | — |
| 12 | `attach_evidence` | write | — |
| 13 | `submit_grievance` | write | human gate + idempotency |
| 14 | `send_reminder` | write | rate-limited 1/24 h |
| 15 | `rate_disposal` (Satisfactory / Poor → unlock) | write | one per disposed case |
| 16 | `create_appeal_draft` (T1 JS/AS authority) | write | eligibility-gated |
| 17 | `send_appeal` (T1/T2, remand-aware) | write | human gate + idempotency |
| 18 | `get_monitoring_stats` (receipts/disposals/pendency) | read | — |

Dynamic registration: base 1–9 always; 10–12 while a draft is open; 13 only while a validated draft awaits human approval; 14–15 on owned pending/disposed cases; 16–17 when appeal-eligible.

## 7. Sprint schedule (Aug 28 – Sep 3)

**S0 — Aug 28 (done).** Scaffold, M3 theme, map workspace, WebMCP layer foundation (3 tools live), transparency panel with self-test, MIT license, README stub, Day-0 commit. Verified: typecheck/build pass; self-test returns 8 categories untruncated (1,470-char envelope); registrar sim-mode bug and budget-overflow bug found and fixed.

**S1 — Aug 29 · Data & simulation core.** T1.1 align docs 02/03 to centralized model (RV2). T1.2 grievance data model + ~40 seeded cases across all lifecycle stages and ministries (realistic dates/movements). T1.3 simulation engine: SLA clocks (21/30-day norms), scripted transitions, interim-reply events, remand. T1.4 case board UI (cards: ministry, category icon, status chip, SLA countdown). T1.5 case detail with movement timeline. T1.6 `vercel login` + first deploy (hello-tool verified on public HTTPS). **DoD:** seeded board renders with 40 cases; clocks tick; deploy live; commit `feat(sim): …`.

**S2 — Aug 30 · Full tool layer.** T2.1 all read tools + validators + budget linter (fails on >500-char descriptions / >1.5K outputs). T2.2 draft tools + draft review card (bilingual, icon-led) + human-gate mechanism. T2.3 `submit_grievance` with speakable ID + idempotency + map/board update. T2.4 dynamic registration wired to store. T2.5 GitHub repo created under Naveen's chosen name; license in About; push. **DoD:** J1 (file-by-voice happy path) passes end-to-end in ChatGPT in-app browser and Chrome-flag; gate blocks ungated submit (`PENDING_CONFIRMATION`); commit `feat(webmcp): …`.

**S3 — Aug 31 · Appeals, feedback, adversarial.** T3.1 `rate_disposal` + Poor→appeal unlock UI. T3.2 `create_appeal_draft`/`send_appeal` (T1/T2, remand movement). T3.3 `send_reminder`, `get_monitoring_stats` + mini-dashboard (Should-scope). T3.4 agent guide page + onboarding hero with copyable prompts. T3.5 adversarial suite: bad enum → `INVALID_ARG` + self-correction; ungated submit → `PENDING_CONFIRMATION`; replayed submit → same registration ID; "SYSTEM OVERRIDE" injected in title → inert quoting; hallucinated ID → `NOT_FOUND` + hint. **DoD:** all adversarial cases pass in both browsers; J2 (clock-watcher → appeal) passes; commit `feat(appeals): …`.

**S4 — Sep 1 · Polish, security, freeze.** T4.1 security pass per docs/03 §6 (annotations audit, gate re-validation, budgets). T4.2 accessibility pass (keyboard-complete, focus rings, aria-live, contrast, 56px targets). T4.3 large-type + bilingual labels audit; empty states; reset-demo. T4.4 README full draft (setup, judge testing instructions, model fidelity F1–F22, security design, worklog). T4.5 feature freeze 18:00 IST; stretch items only if explicitly green. **DoD:** lint/type/build clean; README reviewed; frozen build deployed; commit `chore(freeze): …`.

**S5 — Sep 2 · Submission.** T5.1 final QA on deployed URL (both browsers, voice mode once in Hindi). T5.2 record video (script §9.2), retakes allowed. T5.3 upload YouTube (public, audio). T5.4 paste Devpost description (§9.3), attach video + repo + live URL. T5.5 submit before 21:00 IST. T5.6 fork repo for any continued work. **DoD:** submission confirmed on Devpost; freeze everything.

**Buffer — Sep 3.** Emergencies only until 1:00 PM PT (20:00 UTC). After submission: no edits to submission, repo, or live site until winners (~Sep 23).

## 8. Daily verification protocol (S1–S5, ~20 min)

1. `npm run build` clean. 2. Deploy preview loads; console error-free. 3. Chrome+flag: J1 text-mode pass; transparency panel lists expected dynamic tools. 4. ChatGPT in-app browser: J1 pass; one voice-mode Hindi run (S2 onward). 5. Adversarial quick-set (bad enum, ungated submit). 6. Log results to `docs/qa-log.md` (date, browser, pass/fail, notes). Any fail = first task next morning.

## 9. Submission kit

**9.1 README outline.** What it is (1 paragraph + simulation notice) · 60-second judge path (URL → suggested prompts) · WebMCP implementation (tools table, dynamic registration, envelope, security) · CPGRAMS model fidelity (F1–F22 table) · setup/run · testing instructions for both browsers · privacy & data minimization · worklog (daily commits) · MIT license.

**9.2 Video script (2:45).** 0:00–0:25 problem: centralized CPGRAMS is powerful but citizen-side is lonely (screen: dense portal form). 0:25–1:15 J1 file-by-voice in Hindi: chat → draft card → approve → speakable ID, clock starts. 1:15–1:50 J2 clock-watcher: breach + missing interim reply → reminder → Poor rating → appeal draft with citations → approve. 1:50–2:15 transparency panel: live tool registry changing with state; one security beat (gate blocking an ungated submit). 2:15–2:45 how it's built (registerTool, dynamic tools, bilingual summaries, client-only privacy) + close: "the citizen's own Samadhan Didi."

**9.3 Devpost description outline.** Inspiration (CPGRAMS scale + citizen-side gap) · What it does (lifecycle + voice) · How we built it (WebMCP imperative API, 18 tools, dynamic registration, simulation engine, MUI/M3) · WebMCP fit (shared visible canvas, human gates, no backend) · Challenges (non-standardized LLM outputs → validation + structured errors; budgets; voice-first summaries) · Accomplishments + what we learned · What's next (real-state integration, more languages).

**9.4 Final checklist.** Live URL loads · video public with audio <3:00 · repo public, MIT in About · description complete · no credentials needed · simulation labeled · submit ≤ Sep 2 21:00 IST.

**9.5 Post-submission.** Freeze; fork to continue; do not touch original until ~Sep 23.

## 10. Judging alignment matrix

| Criterion (25% each) | Proof points |
|---|---|
| WebMCP Leverage | 18 tools, dynamic registration reacting to app state (`toolchange`-visible), annotations per Chrome secure-tools guide, bilingual speakable envelope, `getTools()`-powered transparency panel, agent guide page |
| Execution | Complete product loop (file→track→remind→rate→appeal incl. remand), M3 design system, seeded living system, zero-backend robustness, graceful non-WebMCP fallback |
| Potential Impact | CPGRAMS context (70 lakh grievances 2022–24; ~10–12K/day), voice-first India thesis, works for low-literacy/low-vision users, extensible to any grievance system |
| Creativity & Ambition | "Citizen's agent vs government-side AI" framing, human-gate safety pattern, speakable IDs, CPGRAMS-faithful simulation incl. remand — nothing similar exists in the WebMCP showcase |

## 11. Risk register

| # | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| 1 | ChatGPT in-app browser behaves differently (tools truncated/ignored) | M | H | Daily dual-browser protocol from S1; keep descriptions ≤500 chars; agent guide + suggested prompts; budget linter | ZCode |
| 2 | Scope overrun (solo, 5 days) | M | H | MoSCoW cut lines; freeze Sep 1 18:00 IST; Should/Could only if green | ZCode |
| 3 | `vercel login` / repo name delayed (user-owned) | M | H | Deadlines in §12; deploy on Netlify/Cloudflare as fallback (free tiers) | Naveen |
| 4 | Hindi TTS voice unavailable on judge machines | M | M | en-IN fallback; voice moments also mirrored as on-screen text | ZCode |
| 5 | Judges don't enable WebMCP | L | H | Graceful banner with exact instructions; video shows the full loop regardless | ZCode |
| 6 | Simulation mistaken for real government data | L | M | Labels in footer/README/video; fictional officials; no DARPG branding | ZCode |
| 7 | Model misuses tools / injects via UGC | M | M | Gates, validation, untrusted-content quoting; adversarial suite S3 | ZCode |
| 8 | Last-day deploy breakage | L | H | Deploy from S1; freeze build; no day-of infra changes | ZCode |
| 9 | Video/audio quality or upload issues | M | M | Record morning with buffer; checklist includes audio test; local backup copy | Naveen |
| 10 | Accidental post-deadline edit | L | H | Freeze checklist; fork workflow | Naveen |

## 12. Owner TODOs (Naveen) with deadlines

1. **Now:** Register on Devpost and join the hackathon (required to submit).
2. **Now:** Review this plan + docs/00 fact sheet with ChatGPT (external verification); report corrections.
3. **By S1 (Aug 29):** run `vercel login` on the Mac.
4. **By S2 (Aug 30):** choose the project/repo name personally (rules forbid AI naming) — ZCode then creates and pushes the repo.
5. **S5 (Sep 2):** be available ~30 min for video review/approval before upload.
