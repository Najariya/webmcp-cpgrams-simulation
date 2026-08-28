# WebMCP Challenge — Project Plan

**Status (2026-08-28, corrected):** product re-anchored on the **centralized CPGRAMS model** (all ministries/departments/states — NOT a single gram panchayat) per Naveen's direction. Corrected specs: `docs/00-CPGRAMS-RESEARCH.md` (verified fact sheet F1–F22 for external/ChatGPT review) + rewritten `docs/01-PRODUCT.md`. **`02-DESIGN.md` and `03-TOOL-CONTRACTS.md` still reference the old Silpi Gram model and will be aligned after Naveen approves the corrected plan.** App build is paused pending that approval; Day-0 scaffold carries over ~70% (re-target map to India scale, re-seed categories → ministries, rename statuses).
**Hackathon:** https://webmcp.devpost.com/ (OpenAI; supporters: Cloudflare, Vercel, Netlify, Render, Shopify, Google Chrome)
**Deadline:** Submit by **Sep 2, 2026** (hard deadline Sep 3, 1:00 PM PT). No edits to submission/repo/live site after deadline until winners (~Sep 23).

**Full specs (read before building):** `docs/01-PRODUCT.md` (CPGRAMS-modeled problem, personas, journeys, components) · `docs/02-DESIGN.md` (Material 3 "Civic Trust" design system + voice-first pillar) · `docs/03-TOOL-CONTRACTS.md` (18-tool catalog, validation, error taxonomy, sensitivity).

**Setting (updated 2026-08-28):** modeled on **CPGRAMS** (India's national grievance system), instantiated in **Silpi Gram, Mirzapur district, UP** — grievance lifecycle, registration IDs, interim replies, reminders, feedback, two-tier appeals (BDO → DM → CPGRAMS anchor). **Voice-first India pillar:** Hindi voice via ChatGPT voice mode, speakable `summary` on every tool result, `speak_aloud` tool, bilingual UI (Inter + Noto Sans Devanagari), icon-led navigation, large-type mode. Clearly-labeled simulation; no real-panchayat claims.

---

## 1. Hackathon essentials (from rules/resources/FAQ tabs)

- **Build:** a WebMCP-powered web app where humans + agents interact/collaborate. Must run live, testable in ChatGPT desktop in-app browser (WebMCP on by default) or Chrome 149+ with `chrome://flags/#enable-webmcp-testing`.
- **Submit:** (1) live URL, (2) text description (WebMCP fit / UX improvement / new human+agent capability / how implemented), (3) <3 min YouTube demo video with audio, (4) public repo with OSS license visible in GitHub About section.
- **Judging (equal weight):** WebMCP Leverage · Execution (complete product, not PoC) · Potential Impact · Creativity & Ambition.
- **Prizes:** 10 winners × ($3,000 cash + Codex Micro + 1yr ChatGPT Pro + swag) + supporter prizes (Cloudflare $10k credits, Vercel $300/mo 12mo + Gateway credits, Netlify $500 cash, Render $300, Shopify gear, Google AI Ultra 3mo).
- **Rules:** pre-existing projects allowed only if meaningfully extended with WebMCP after Aug 25 (timestamped commits). AI-assisted building explicitly OK — but do NOT use AI to name the project, and don't overstate what's running. English materials. Eligibility: OpenAI-API-supported countries.
- **Team:** solo (Naveen). Devpost registration required before submitting (free).

## 2. Research findings that drive strategy

### WebMCP API (spec draft 26 Aug 2026 + Chrome docs)
- `document.modelContext`: `registerTool({name, title?, description, inputSchema, execute, annotations})`, options `{exposedTo, signal}`. AbortSignal unregisters. `getTools({fromOrigins})`, `executeTool(tool, jsonString)`, `toolchange` event.
- Annotations: `readOnlyHint` (default false), `untrustedContentHint` — security signaling to agents.
- Permissions policy `tools`, default `self`; cross-origin iframes need `allow="tools"` + `exposedTo`. (Not needed for our single-origin app.)
- `execute(input, {signal})` returns a plain string/JSON to the agent. Chrome ≥153: unregistering doesn't break in-flight executions.
- Declarative forms API still TODO in spec (Chrome has experimental docs) → **build on the imperative API only** (universally supported).
- Secure-tools guide: ≤500 chars description, ≤150 chars param descriptions, ≤1.5K chars output; label UGC with `untrustedContentHint`; mark readers `readOnlyHint`; gate state changes behind human confirmation; data minimization.
- Dev tools: Chrome DevTools Application→WebMCP panel; "Model Context Tool Inspector" extension; Chrome evals page for pre-ship testing.

### Competition landscape
- OpenAI showcase (10 apps): 3D modeling, notes, crosswords, beats, trip planning, photo editing, meal planning, puzzle game, greeting cards, grocery cart. **No health, no civic tech.**
- Expect a flood of e-commerce storefronts (Vercel/Shopify/Cloudflare templates all push commerce).
- Health/lab-report AI explainers: crowded market (Blody, Sano, Toowit, BloodGPT, Kantesti, AI DiagMe, Labcorp's own app) → weak "novelty vs existing concepts" story + medical-advice caution + fragile PDF parsing. **Rejected.**
- Civic grievance space: documented real pain (poor department routing, weak tracking, fragmented portals, cumbersome flows; GRM literature: "expectation gap"; indie pothole app scaled to 46+ Indian cities = unmet demand). US judges know 311 instantly. **Chosen.**

## 3. Product concept — agent-native civic issue portal ("311 for the agent era")

Codename (repo): `civic-portal`. **Final public name: user must choose personally** (rules forbid AI naming).

Fictional city ("Riverside City") on a real map area, seeded with ~40 issues across 8 categories. Citizens + their browser agent collaborate to report, track, and escalate civic issues — the agent drafts and advocates, the human reviews and approves. Client-only: localStorage, no backend, no accounts.

### Core flows
1. **Report with the agent:** citizen describes problem in chat → agent clarifies, picks category, checks duplicates nearby, drafts the report (category/department/SLA auto-routed, location pinned on map, evidence list) → human reviews the draft card → approves → ticket filed with ID + SLA clock.
2. **Duplicate power:** agent surfaces similar open issues ("4 open pothole complaints within 300m — file yours as a corroborating report to raise priority") — collective awareness, novel mechanic.
3. **Track & advocate:** agent reads SLA policy + status timelines, explains in plain language, and when a complaint breaches SLA, drafts a firm escalation memo citing history — human edits/approves before sending.
4. **Transparency panel:** in-app live view of registered tools via `getTools()` + `toolchange` log — the app demonstrates WebMCP to judges using WebMCP itself.

### Why it wins each criterion
- **Leverage:** ~16 tools, dynamic registration tied to app state (submit only with a validated draft; escalation only when SLA breached; withdraw only on own reports), annotations per security guide, untrusted-content labeling of all UGC, character-budgeted descriptions/outputs, AbortSignal lifecycle.
- **Execution:** complete product loop (report → track → escalate → resolve), polished UI, seeded living city, onboarding for judges. No backend = nothing to break.
- **Impact:** every citizen + every municipality; framed as "311/gram panchayat/municipal portal reimagined for the agent era"; research-backed pain points.
- **Creativity:** civic tech × agent collaboration is untouched in the ecosystem; "agent as civic advocate" + corroborating-report mechanic is fresh.

## 4. Tool inventory (all imperative, single-origin)

**Read-only (`readOnlyHint: true`):**
| Tool | Purpose | Notes |
|---|---|---|
| `get_app_state` | current view, selection, draft status | compact JSON |
| `list_issue_categories` | categories + required fields + routed department + SLA days | |
| `search_issues` | by location/category/status/keyword | `untrustedContentHint` (UGC) |
| `get_issue_details` | full record + timeline + comments | `untrustedContentHint` |
| `get_my_reports` | user's filings + SLA state | |
| `find_duplicate_issues` | near location+category, similarity ranked | `untrustedContentHint` |
| `get_kb_answer` | routing rules, evidence guidance, FAQ | |
| `get_sla_status` | policy + days remaining/breached per issue | |

**State-changing (`readOnlyHint: false`, human-confirmation-gated):**
| Tool | Purpose | Notes |
|---|---|---|
| `create_report_draft` | structured draft → "uncommitted" review card in UI | |
| `update_report_draft` | patch draft fields | only while draft open |
| `attach_evidence` | attach photo/notes to draft | simulated upload |
| `submit_report` | file complaint → ticket ID + SLA clock | modal confirmation |
| `add_comment` | comment on tracked issue | confirmation |
| `create_escalation_draft` | memo citing SLA breach + history | only when eligible |
| `send_escalation` | send approved memo | modal confirmation |
| `withdraw_report` | withdraw own report | confirmation |

Budgets per secure-tools guide: descriptions ≤500 chars, param descriptions ≤150, outputs ≤1.5K chars.

## 5. Architecture

- **Stack:** Vite + React + TypeScript + **MUI v7 with a custom Material 3 theme** (see `docs/02-DESIGN.md` — no Tailwind). Inter via Google Fonts. Leaflet + OpenStreetMap tiles (CARTO Positron/Voyager basemap, free, no key). Zustand with persist (localStorage). No backend, no auth.
- **Deploy:** Vercel or Cloudflare Pages free tier (HTTPS = SecureContext required).
- **WebMCP layer:** `src/webmcp/` — tool definitions colocated with schemas; a registrar module maps app-state → registered toolset, re-registering on state transitions with AbortControllers; transparency panel consumes `getTools()` + `toolchange`.
- **Polyfill:** feature-detect `document.modelContext`; if absent show friendly banner with testing instructions (ChatGPT in-app browser / Chrome flag). Stretch: `@mcp-b/global` polyfill.
- **Data model:** `Issue {id, category, title, description, location, severity, evidence[], status, createdAt, updatedAt, timeline[], comments[], isMine, sla: {filedAt, dueAt, breached}}`; `Department {id, name, categories[]}`; `KB {topic, answer}`; seed file with ~40 issues, 8 departments, 8 categories, ~10 KB articles. Fictional city + fictional officials only (no real-entity defamation).
- **Repo:** public GitHub, MIT license file + About-section license, clean README (setup, testing instructions for judges, security design, architecture, what's new since Aug 25 via commits).

## 6. Timeline (build days)

| Day | Date | Goals |
|---|---|---|
| 0 | Fri Aug 28 | **(today)** Go-ahead → scaffold repo, hello-world tool registered, verify end-to-end in Chrome flag + ChatGPT in-app browser, deploy to Vercel/CF. User: register on Devpost. |
| 1 | Sat Aug 29 | Data model, seed data, core UI: map, list, filters, issue detail, new-report form. |
| 2 | Sun Aug 30 | WebMCP tool layer v1 (all read tools + draft tools), dynamic registrar, transparency panel; agent testing in both browsers. |
| 3 | Mon Aug 31 | Lifecycle: submit/escalate/withdraw + confirmations, SLA engine, KB, duplicate search; My Reports; escalation composer. |
| 4 | Tue Sep 1 | Security pass (annotations, budgets, untrusted handling), onboarding/judge instructions page, README, polish, feature freeze. |
| 5 | Wed Sep 2 | Record ≤3-min video (script below), write Devpost description, final QA on deployed URL, **submit**. |
| — | Thu Sep 3 | Buffer only. After submission: touch nothing until ~Sep 23. |

## 7. Video script outline (~2:40)

1. 0:00–0:30 Problem: civic complaint portals are painful — wrong department, vague forms, black-hole tracking. (Screen: clunky form.)
2. 0:30–1:30 Report-with-agent: chat describes pothole → agent clarifies, checks duplicates, drafts routed report with SLA → human reviews card → approve → ticket + map pin.
3. 1:30–2:15 Advocate: SLA breached → agent drafts escalation memo citing history → human edits/sends. Transparency panel flash (live tool list).
4. 2:15–2:40 How + close: built on WebMCP `registerTool`, dynamic tools, security annotations; "every public service portal could work like this."

## 8. Devpost description outline

- **Fit:** agent+human collaboration on a shared visible canvas; agent drafts, human approves — WebMCP's core thesis.
- **UX improvement:** replaces 12-field guesswork forms with conversation + structured review; auto-routing to the right department.
- **New capability:** citizens get an advocate that knows SLA rules, finds corroborating reports, and escalates — impossible with plain forms or scraping agents.
- **Implementation:** imperative API, 16 tools, dynamic registration + toolchange, annotations per Chrome security guide, client-only privacy.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| ChatGPT in-app browser behaves differently from Chrome flag | Test every tool in BOTH, every day; keep to core imperative API. |
| Agent misuses tool / submits without consent | Confirmation modals on all state changes; submit requires explicit human click. |
| localStorage resets judge's session | "Reset demo data" button + seeded startup; README notes. |
| Scope creep | Feature freeze Sep 1; stretch list (polyfill, evals, iframe demo) only if green. |
| Post-deadline edits | Freeze Sep 2; fork repo if we want to keep hacking. |
| Name rule violation | User names the project/repo personally; AI never names it. |

## 10. User TODOs

1. Register on Devpost + join the hackathon (required to submit; free).
2. Choose the project's public name + GitHub repo name personally (rule: no AI naming).
3. Say "go" to start Day 0.
