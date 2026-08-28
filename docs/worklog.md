# Worklog — Citizen's Advocate (WebMCP Challenge)

Durable project record. Newest entries at the top. Conventional commits reference the `app/` git repo.

---

## 2026-08-28 (night) — CPGRAMS-replica rework · commit `3026c4e`

**Owner feedback accepted:** visual quality "substandard" vs the real CPGRAMS — make an almost-replica (colors, tone, login mapped out) and keep going to completion.

**Completed**

- `theme.ts` → GoI/NIC portal language: navy identity band, tricolour rule, saffron primary actions, dense squarer surfaces (radius 6→4 on buttons), government table styling.
- `GovHeader` (bilingual भारत सरकार/DARPG masthead + CPGRAMS wordmark + SIMULATION badge + EN/हिं toggle + large-type + Sign In) and `GovFooter` (simulation credit line, policy links).
- Mapped, simulated citizen auth: `LoginScreen` (mobile + OTP + register toggle; any input works, demo profile one click) with `citizen` session persisted; lodge/status/case views gated.
- Portal home: statutory amber alert strip, action-card trio (Register/Login · Lodge Public Grievance · Your Browser Agent), About CPGRAMS + exclusions, What's New, agent prompt rail.
- Lodge Public Grievance: 3-step CPGRAMS-style form (applicant details, ministry→category cascade, description/relief, declaration) → Tier A confirmation dialog → registration-ID success screen (J1 manual path verified end-to-end: `PG-26-28228`).
- View Status: searchable government case-register table (navy header row, SLA column, status chips).
- FAQs accordion mirroring `get_kb_answer` knowledge.
- Dev aids: render-error boundary in `main.tsx` (caught a blank-page session); debug error-trap removed before commit.

**Verification**

- Build/typecheck/lint green. Browser walk: home (GoI fidelity confirmed via image analysis: "convincingly reads as an Indian government portal", no layout defects), sign-in → register table renders 5 cases correctly, lodge journey full form → confirm dialog (exact payload) → success + case detail at Day 0/21.
- Incident: app blanked after dependency changes — root cause was the long-lived Vite dev server surviving `npm install`; restart fixed it. Dev server now fresh (log `/tmp/vite-dev.log`).

**Open / next**

- S2: write tools 7–13 with confirmation tokens/idempotency; state-driven dynamic registration + activeExecutions guard; Layer-1 tests; agent-drafted review screens reusing the Tier A dialog.
- Case Detail / Transparency screens inherit the new theme but need a CPGRAMS-style header pass for full consistency.
- Bundle 540 kB — code-split MUI icons later (cut-tier concern).

---

## 2026-08-28 (late) — S1 core milestone · commit `d96e419`

**Completed**

- Docs aligned to v4: `00-facts.md` (C1–C12 fact register + deliberate fidelity cuts), `01-PRODUCT.md` (advocate positioning, J1–J3, golden dataset), `03-TOOL-CONTRACTS.md` (13-tool catalog, tiers, envelope), `02-DESIGN.md` case-board-first note; old `00-CPGRAMS-RESEARCH.md` marked superseded.
- Domain layer: `domain/types.ts`, `domain/sla.ts` (21-day clock, interim nuance, reminder cooldown, Poor→appeal window), `domain/engine.ts` (guarded transitions: submit/remind/rate/appeal/close-on-expiry).
- Golden data: `data/catalog.ts` — 6 ministries, 8 categories, G2–G6 seeded relative to load time (hero G3 = day 23, no interim response).
- Store: localStorage persistence (`advocate-demo-v1`), engine-backed actions, derived desired-tool surface, reset-demo.
- UI: Home/My Cases (hero prompt card, "2 need attention today", premium case cards), Case Detail (record + evidence + interim/disposal/appeal cards + actor-coloured movement timeline + next actions), Transparency screen (live-or-sim registry, read/write distinction, human-control + privacy panels). Map + village framing cut; bundle 554→451 kB.
- WebMCP: v4 envelope `{ok, speakable, data, nextActions}`; error taxonomy renamed; read tools 1–6 (+ optional `speak_aloud`) with validators (unknown keys, lengths, ID format, preconditions with hints).

**Verification**

- `tsc -b && vite build` PASS; oxlint 0 errors / 1 benign warning (outer-scope dep array).
- Browser (IAB @ :5173): Home DOM snapshot shows all 5 cases with designed states; Case Detail for G3 correct incl. reminder eligibility; transparency self-test `get_sla_status` returns full 5-case survey **within the 1.4K budget** after slimming survey rows (initial version clipped — fixed same session); visual QA of Home via image analysis: no defects, hierarchy strong.
- Fact-ID leaks ("(C3)" etc.) removed from all user-facing strings.

**Open / next (S1 remainder → S2)**

- Review screens (draft review, appeal review) are placeholders — build with write tools in S2.
- Write tools 7–13 + confirmation infra (payload-hash tokens, idempotency) + registrar activeExecutions guard + dynamic sync on state change — S2.
- Unit tests (Layer 1) for sla/engine/envelope budgets — S2 start.
- Deployment: preview deploy via Vercel CLI (auth done); **production promote is owner-reserved**.
- GitHub remote awaiting owner's repo name; repo root restructure (docs into repo) at push time.

---

## 2026-08-28 (evening) — S0 baseline + v4 mandate accepted

**Mandate:** Master Execution Prompt v4.0 received from owner (post external review). Positioning corrected: this is NOT "AI CPGRAMS"/voice intake — CPGRAMS already has AI multilingual voice intake. Thesis: **the citizen's own browser agent remains their advocate after filing** (WebMCP). Hero journey J2: "Which of my grievances needs attention today?"

### Baseline QA (Day-0 scaffold, commit a77f094)

| Check | Result |
|---|---|
| `npm run lint` (oxlint) | 0 errors, 1 warning (outer-scope dep array in App.tsx useEffect) |
| `npm run build` (tsc -b + vite) | PASS — 554 kB min / 174 kB gzip (Leaflet+MUI; will shrink when map is cut) |
| Dev server :5173 | Running, serves app |
| Browser inspection (IAB) | Renders: app bar, nav rail, Leaflet map (CARTO), transparency panel with 3 simulated tools + self-test + voice test |
| Tests | None exist yet (Layer 1–4 test strategy begins S2) |
| WebMCP in IAB | Not active → panel correctly shows simulation view + fallback alert |

### Keep / Rework / Cut matrix (v4 vs current state)

| Asset | Verdict |
|---|---|
| `webmcp/registrar.ts` (diff-sync, AbortControllers, intended-registry sim, subscribe) | **KEEP** + extend (activeExecutions guard for unregister races, v4 §23) |
| `webmcp/envelope.ts` (budgetClip 1400, guarded) | **REWORK** → v4 shape `{ok, speakable, data, nextActions}`; locale-aware single-language `speakable`; error codes → INVALID_ARGUMENT / NOT_FOUND / PRECONDITION_FAILED / CONFIRMATION_REQUIRED / CONFLICT / INTERNAL |
| `webmcp/tools.ts` (3 read tools) | **KEEP pattern, RENAME** `list_issue_categories`→`list_grievance_categories`; descriptions re-targeted to Central ministries; `speak_aloud` demoted to optional tier |
| `webmcp/types.ts` (local ModelContext typings) | **KEEP** |
| `theme.ts` (M3 Civic Trust, Inter + Noto Sans Devanagari, status tokens) | **KEEP** (v4 design system §18 extends it) |
| `App.tsx` shell (Silpi Gram app bar, map-first nav) | **REWORK** → Home/My Cases first; map cut (v4 §11/§59) |
| `MapWorkspace.tsx` + leaflet deps | **CUT** (first cut rule; removes ~300 kB) |
| `data/categories.ts` (8 village categories, GP→Block routing, slaHours) | **REWORK** → Central ministry/department catalogue, SLA in days (21-day norm) |
| `store.ts`, `WebMcpPanel.tsx` | **KEEP/EXTEND** (panel becomes Screen 5 transparency page) |
| `docs/00-CPGRAMS-RESEARCH.md` (F1–F22) | **REWORK** → `docs/00-facts.md` fact register with implementation implications; REMOVE unverified items (second appeal tier, 15-day comment loop, state procedures, remand) |
| `docs/01-PRODUCT.md` | **REWORK** → advocate positioning, J1/J2/J3 golden journeys |
| `docs/02-DESIGN.md` | **KEEP mostly** (map-first section obsolete) |
| `docs/03-TOOL-CONTRACTS.md` | **REWORK** → 13-tool catalog, 4-tier confirmation, locale speakable |
| `docs/04-MASTER-PLAN.md` | Superseded by v4 mandate (kept as history) |

### Owner-dependent actions (logged, not blocking)

1. GitHub remote repo — awaiting owner's chosen name (rules forbid AI naming). Push checkpoints deferred; local commits continue.
2. Production deployment — owner explicitly reserved production deploys; agent will stage preview deploys only and hand off promote.
3. Devpost registration + YouTube publication (S5).

### Next (S1, Aug 29)

Docs alignment → grievance model + lifecycle engine + SLA → 6 golden cases (G1–G6, relative dates) → premium Home/My Cases + Case Detail + timeline → preview deploy.
