# Worklog — Citizen's Advocate (WebMCP Challenge)

Durable project record. Newest entries at the top. Conventional commits reference the `app/` git repo.

---

## 2026-08-29 (early hours) — typography · S3+S4 complete · production redeployed

**Owner feedback:** justify text, premium font (reference-grade), compact-but-neat agent section, complete rollout S3→S5 without waiting.

**Typography (`9631947`)** — IBM Plex Sans / Sans Devanagari / Plex Mono system (coherent premium family with real Devanagari); `.longform` justified hyphenation-safe reading text across all long paragraphs; agent section compacted to one hero prompt + pointer; smoothing defaults. Fonts verified loaded; QA 9/10.

**S3 (`4e2c858`)** — adversarial suite: unknown keys/types, J4 recovery, J5 injection inertness (data + KB), gate-bypass (repeated submits never mutate), declined gate, enum guard, surface-leak test. 28→29 tests green.

**S4 (`e3af1bd`-range)** — 20-prompt eval suite RUN against the live tool surface: **20/20** (E02 caught a real budget bug → object-aware clipping + locale-aware category titles + regression test). docs/evals.md, docs/uat.md (10 cases, 0 critical/high), docs/devpost.md (paste-ready), docs/video-script.md (2:45 storyboard).

**Production** — redeployed and verified: IBM Plex live, justified text, compact agent panel, all journeys on the golden dataset. https://webmcp-cpgrams-simulation.vercel.app

**Remaining (owner-assisted / owner-only)** — real-agent walkthrough in ChatGPT browser (record in qa-log.md), record ≤2:45 video (script ready), paste Devpost copy + video URL, submit by Sep 2 21:00 IST. Feature freeze Sep 1 18:00 IST — build is ahead of schedule; hold to bug-fix-only after freeze.

---

## 2026-08-28 (late night) — de-slop design pass · S2 complete · repo + production live

**Owner feedback:** design was "AI slop" — invest deeply, make it neat/clean/beautiful/professional/premium; don't stop until the goal; repo name authorized ("WebMCP, CP gram simulation"); production deploy authorized via dedicated link.

**Design (c6542d9)** — emoji eliminated in favour of a consistent MUI icon system (StatusChip grammar, timeline kind icons, notice cards); unified icon tiles; normalized radii (12px cards / 6px controls); KV grids; navy agent panel; refined footer. Visual QA via image analysis: 9/10 premium neatness, no blocking defects.

**S2 (eec17ef, 1faa6cc)** — confirm.ts human gate (payload-hash binding, 60s single-use, decline path, replay-window store); write tools 7–13 with full validation + CONFIRMATION_REQUIRED envelopes; registrar activeExecutions race guard; desiredTools state-conditional surface incl. replay windows; ConfirmDialog, DraftReview, AppealReview; window.__advocate dev hook. **In-browser verification: J1 gate→confirm→PG-26-77173→alreadyProcessed replay; J2 reminder + premature-remind PRECONDITION_FAILED + timeline event; J3 Poor→surfaceΔ(+create_appeal_draft −rate_disposal)→appeal filed→replay; J4 NOT_FOUND; J5 injection inert.** Fixes en route: findGrievance rejecting companion keys; needsAttentionToday semantics (interim-explained ≠ attention). Vitest 20/20 (SLA facts C3–C7, engine guards, gate TTL/single-use, envelope budgets).

**Ship (4011b57 + root LICENSE)** — repo restructured to project root with judge-first README; pushed to **github.com/Najariya/webmcp-cpgrams-simulation** (public, MIT at root, topics set). Vercel project `webmcp-cpgrams-simulation` under team naveens-projects-c4a4ab14; **production deployed and verified: https://webmcp-cpgrams-simulation.vercel.app** (HTTP 200, portal renders in-browser).

**Next (S3→S5)** — adversarial/injection test hardening in suite form, ~20 agent evals (docs/evals.md), formal UAT (docs/uat.md), Devpost draft copy, video storyboard → record, freeze Sep 1 18:00 IST, submit by Sep 2 21:00 IST.

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

## 2026-08-28 — UI gap-analysis pass (alignment / spacing / justification / typography)

Vision-model gap analysis on live screenshots (18 defects on Agent Tools page), then:

- **Agent Tools page redesigned**: grouped Read/Action sections with counts and blurbs;
  numbered tool cards (mono name + baseline-aligned tinted chips + human title + clamped
  description) with "Show full contract" expansion incl. parameter table (required `*`,
  types/enums); terminal-style self-test response panel; icon'd Human-control / Privacy
  guarantee cards; app-level alert deduplicated against the page status strip.
- **Site-wide normalization**: navy PageHeader bands share one rhythm (py 2.25, 16.5px
  titles, 12px sublines, 3px saffron bottom rule); Status band search vertically centered;
  table row density comfortable and header/first-row gap normalized; GovHeader control
  cluster aligned (28px A+ button); metadata chips unified at 22–24px / 10.5–11px.
- Verification loop: screenshot → vision model PASS on Agent Tools (×2), Case Detail,
  Home, Status (×2 after fixes: dangling ellipsis, code-chip wrap, subordinate untrusted
  chip, search centering, first-row gap). Build clean, 29/29 tests green.
- Shipped: commit 0264b89 pushed; production redeployed via dedicated project and
  verified live at https://webmcp-cpgrams-simulation.vercel.app.

## 2026-08-28 — Skeptical-judge verdict responses (W1–W3)

An independent browser agent (ChatGPT, WebMCP enabled) attacked the live deployment
(docs/judge-verdict.md): the confirmation gate held everywhere, no bypass succeeded.
Its three critiques, and what shipped:

- **W1 ranked attention** — `rankAttention()` in domain/sla.ts (overdue-no-interim,
  worsening with days over target > closing appeal window > unrated disposal aging
  toward urgency). `get_sla_status` survey sorts by it, flags `mostUrgent`, and leads
  the speakable line with "Start with PG-26-03877…"; `get_app_state` attention is
  ordered with `mostUrgent: true` on the first entry; the case register pins attention
  rows to the top in the same order.
- **W2 authorization parity** — the judge saw tools acting for the demo citizen while
  the page showed a sign-in surface (signOut kept grievances; tools never checked
  `citizen`). Now every citizen-scoped tool (4 reads + 7 writes) gates on sign-in:
  signed out → `PRECONDITION_FAILED` + one-tap sign-in hint, zero case data in the
  envelope. General-knowledge tools (categories, KB, speak_aloud) stay open. Tools stay
  discoverable so the agent learns the precondition instead of losing capabilities.
- **W3 data ownership** — "Export my data" on the case register downloads the full
  browser-local state as JSON (with an honesty note); Privacy card and README updated.

Tests: 29 → 35 (3 ranking + 3 authorization-parity; adversarial suite signs the demo
citizen in per-test). Evals E21–E23 and UAT-11 recorded. README gained an
"Independent skeptical-agent exercise" section; devpost copy, tool-contract doc and
video script updated to match new behaviour.


## 2026-08-28 — Voice layer + legibility/justification polish (owner feedback round)

Owner feedback: "Ask your agent" panel not clearly visible on navy; texts not justified everywhere;
font/style and layout to improve; voice-enabled agents should be first-class.

- **Voice layer**: src/webmcp/voice.ts — Voice Mode preference (persisted, advocate-voice-v1),
  shared speak() helper (locale voice selection incl. Devanagari, cancel-previous, node/embedded-safe),
  announce() store feeding an aria-live polite region in App. Store actions announce filings (with
  registration ID), reminders, ratings, appeals, sign-ins, draft saves; ConfirmDialog announces approval
  prompts. Header RecordVoiceOver toggle. New set_voice_mode tool (tier-C preference, works signed-out,
  always registered → 14th tool). Agent Tools page gained a "Voice-ready by design" section with EN/HI
  test buttons. speak_aloud refactored onto the shared helper.
- **Legibility**: agent panel brightened (eyebrow 100% + saffron icon, card 14%/32% white, 13px prompt,
  caption 85%); footer opacity floor 0.7; header ministry line 100%; band subs 90%.
- **Justification sweep**: .longform added to ~20 blocks (page-band subs, case notices/timeline bodies,
  lodge declaration + alerts + dialog values, login texts, review screens, status captions, transparency
  subs, confirm-dialog payload rows).
- **Typography**: tabular numerals for dates/day-counts (status table, timeline); agent panel padding
  aligned to What's New (2.5).
- Tests 35 → 41 (voice suite). Vision verification PASS on home + Agent Tools (voice section renders in
  page language; aria-live present; set_voice_mode card consistent). Docs updated (README voice section,
  devpost, E24, UAT-12, video beat).

## 2026-08-29 — External 12-point UI/UX fix list + owner copy requests (14 commits)

Owner supplied a ChatGPT-authored 12-item fix prompt plus three own asks (simple-language
browser-agent explainer, remove unnecessary dashes, no comma-before-and). All executed,
one commit per item, tool contracts and simulation labelling untouched:

1. `ff60fea` responsive masthead/nav (collapse below md, short labels, ≤120px header target)
2. `69ccc41` working 3-step A+ text size (html root font-size, full px→rem sweep, persisted)
3. `3f3d056` complete Hindi toggle (src/i18n.ts en/hi table: home/lodge/status/login/FAQ/
   case/reviews/dialogs/footer + Hindi status chips & ministry names; persisted; html lang)
4. `3eb4d3b` registration success banner on case detail (Copy ID, 21-day target, bilingual)
5. `c08915f` sign-in intent preservation (contextual login card, redirect after OTP)
6. `a0362e9` hash routing (#/, #/lodge, #/cases[/:regId], #/agent-tools, #/faqs; back/forward;
   gated routes via intent flow; fixed hash round-trip wiping intent post-verif)
7. `628b33d` one dismissible merged Home banner (WebMCP status + not-affiliated; badge+footer stay)
8. `d52fb88` pretty-printed try-it response (speakable line, ok-chip, collapsible JSON tree, copy)
9. `5030ecf` case table legibility (subject tooltips, wrapping status chips, chevron, keyboard
   rows, stacked cards below md)
10. `28b8180` type scale minimums (≥12px everywhere, footer 12.5px, chip heights)
11. `26bcf9e` one H1 per view (masthead) + per-route document.title + unified tab title
12. `bb85cde` three copyable agent-prompt chips with Copied ✓ feedback (AA on navy)
13. `3381e1b` plain-language "What is a browser agent?" explainer (Home expandable + Agent Tools line, EN/HI)
14. `811687e` copy pass — unnecessary dashes and Oxford commas removed from UI text (contracts untouched)

Journey re-verified live: signed-out Lodge → contextual sign-in → form → Tier-A dialog →
success banner with Copy ID → deep-linkable case (#/cases/PG-26-XXXXX, per-route title) →
Agent Tools try-it (speakable line + JSON tree). 41/41 tests green throughout.
Deviations: 375/768 viewport screenshots not possible in this embedded browser (verified at
native width + breakpoint audit); Lighthouse/axe not runnable here (manual a11y checks:
1×H1, aria-live, keyboard rows, aria-pressed, focus-visible rings).
