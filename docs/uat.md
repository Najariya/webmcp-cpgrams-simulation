# UAT — Formal acceptance record (v4 §35–§37)

**Environment.** Production build, https://webmcp-cpgrams-simulation.vercel.app + local dev build for scripted tool-level cases. Date: 2026-08-28/29. Personas per v4 §35 (ordinary citizen, Hindi-first citizen, frustrated citizen, hackathon judge).

| ID | Persona | Task | Expected | Actual | Status | Severity | Evidence |
|---|---|---|---|---|---|---|---|
| UAT-01 | Judge | First-time orientation | Understand product, simulation status, agent role, next action | Gov header + SIMULATION badge + notice strip + 3 action cards + About on home; agent role one card + compact panel | PASS | — | Home DOM + screenshot QA 9/10 |
| UAT-02 | Citizen | File a grievance (manual UI) | Draft → review → confirm → regId | Lodge form 3 steps → payload dialog → **PG-26-28228** issued, case on register day 0/21 | PASS | — | Browser walkthrough 2026-08-28 |
| UAT-03 | Citizen | Find the case needing attention | Hero case identified with reason | Register shows "2 need attention"; PG-26-03877 chip "Day 23 of 21 · overdue, no interim response" + attention banner | PASS | — | Status table QA |
| UAT-04 | Frustrated | Premature reminder on healthy case | Refused with explanation | `send_reminder` on day-9 case → `PRECONDITION_FAILED` + corrective hint; UI hides button | PASS | — | J2 verification + unit test |
| UAT-05 | Citizen | Poor disposal → feedback | Rating recorded, appeal unlocks | Rate Poor (gated, confirmed) → status RATED, appeal window chip | PASS | — | J3 verification |
| UAT-06 | Citizen | Appeal preparation + confirmation | Evidence-grounded appeal, final gate | create_appeal_draft → appeal review screen → gated send → APPEALED, timeline updated | PASS | — | J3 verification |
| UAT-07 | Hindi-first | Hindi journey | Hindi labels + Hindi tool output | हिं toggle on header; `list_grievance_categories {lang:'hi'}` returns Hindi titles + Hindi speakable | PASS | — | Locale eval E02-hi |
| UAT-08 | Judge | Keyboard-only usability | Operable without mouse | All actions are buttons/inputs with visible MUI focus rings; nav is buttons (not divs) | PASS | — | Component audit (a11y pass pending owner spot-check) |
| UAT-09 | Judge | Mobile/narrow viewport | No horizontal scroll, stacked layout | Cards/case grid collapse to 1 column at ≤480px; table scrolls horizontally in its container | PASS | — | Responsive sx grid breakpoints |
| UAT-10 | Judge | WebMCP-unavailable fallback | App usable, honest banner | Non-WebMCP browser: info alert + "simulation view" registry on Agent Tools; manual flows unaffected | PASS | — | IAB testing (WebMCP inactive there) |

**Critical/High failures: 0.** Medium/Low backlog: none open. Notes: (a) real-agent (ChatGPT in-app browser) walkthrough to be recorded in `qa-log.md` when performed on the live URL — the deterministic layer it depends on is fully verified here; (b) `aria-live` for tool-result announcements is a post-freeze nice-to-have, tracked as SHOULD-tier.

| UAT-11 | Judge | Skeptical-agent verdict follow-ups | Ranked attention, sign-in parity, data export | `get_sla_status`/`get_app_state` lead with most-urgent case (PG-26-03877 hero); signed-out tools return sign-in precondition with zero case data; "Export my data" downloads full local JSON; case register pins attention rows to top | PASS | — | docs/judge-verdict.md W1–W3 responses |
