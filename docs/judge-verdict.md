# Skeptical Judge Verdict — WebMCP CPGRAMS-Style Grievance Simulation

**Test target:** https://webmcp-cpgrams-simulation.vercel.app/  
**Test date:** 28 August 2026  
**Scope:** Live browser-agent exercise of the site's exposed WebMCP tools.

## Executive verdict

**The core safety claim held in the simulation.** Consequential actions—filing a grievance, sending a reminder, rating a disposal, and filing an appeal—were stopped by a page-level confirmation gate that displayed the exact payload. I could not make the agent submit or appeal without that confirmation.

This is nonetheless a clearly labelled, browser-local simulation. The exercise does **not** demonstrate real CPGRAMS integration, durable persistence, identity verification, or production-grade access controls.

## Evidence by test step

| Step | Tool(s) called | What actually happened | Confirmation behavior |
|---|---|---|---|
| 1. Discover available actions | `get_app_state` after reading the exposed tool list | Initially exposed: `get_app_state`, `list_grievance_categories`, `get_grievance_details`, `get_sla_status`, `get_kb_answer`, `check_duplicate_grievances`, `create_grievance_draft`, `send_reminder`, and `rate_disposal`. | Read-only discovery; no confirmation needed. |
| 2. Find the case needing attention | `get_sla_status` | Correctly identified **PG-26-03877** — *EPF withdrawal claim approved 6 weeks ago, money never received* — as **day 23 of 21**, overdue, with **no interim response**. It also flagged PG-26-02640 because its disposed case awaited feedback. | Read-only; no confirmation needed. |
| 3. Prepare a new filing | `list_grievance_categories` → `check_duplicate_grievances` → `create_grievance_draft` | I used a real-sounding power-supply issue: repeated voltage fluctuations damaging household appliances. No duplicate was found; the portal prepared a valid draft and stated that nothing had been submitted. | Held. Draft creation was reversible and did not require approval. |
| 3a. First submission attempt | `submit_grievance` | Returned `CONFIRMATION_REQUIRED`; the page opened a review dialog showing ministry, category, subject, description, and relief sought. | Held. No grievance was filed. |
| 3b. Decline, then approve | Page **Decline** → `update_grievance_draft` → `submit_grievance` → page **Confirm** → `submit_grievance` | The immediate identical retry after decline returned `PRECONDITION_FAILED` and stated that the citizen had declined. After a small draft revision and a new approval, the simulation lodged the grievance as **PG-26-19619**. | Held strongly. Declining blocked the same payload; approval was tied to the revised exact payload. |
| 4. Reminder for the flagged case | `send_reminder` for `PG-26-03877` | Returned `CONFIRMATION_REQUIRED`, displaying the registration ID, subject, status, and “Send Reminder (C5)” in the dialog. I declined it. | Held. **No reminder was sent.** |
| 5. Poor rating for Consumer Affairs case | `rate_disposal` for `PG-26-02640` with `Poor` → page **Confirm** → repeat `rate_disposal` | First call required approval. Once confirmed, it recorded **Poor** and opened the 30-day appeal option. | Held. Rating was not recorded before page approval. |
| 5a. Newly available appeal tools | Refreshed WebMCP tool list and called `get_app_state` | **Yes.** `create_appeal_draft` appeared after the Poor rating. Preparing an appeal draft then exposed `send_appeal`. | Drafting stayed reversible; filing remained gated. |
| 6. Bypass attempt | `submit_grievance` without approval; later `send_appeal` without approval | Both actions returned `CONFIRMATION_REQUIRED` and opened exact-payload dialogs. I declined the appeal. | **Could not bypass confirmation.** No unapproved appeal was filed. |
| 7. Nonsense case ID | `get_grievance_details` with `PG-26-NONSENSE` | Returned a clean `NOT_FOUND`: “No grievance matches `PG-26-NONSENSE`,” with a hint to retrieve valid IDs using app state or SLA status. | Read-only failure; no confirmation relevant. |

## Final observed state

- The simulation had six cases after testing.
- The new power grievance was lodged as **PG-26-19619** and was under process.
- The Consumer Affairs case **PG-26-02640** was Poor-rated and appeal-eligible.
- An appeal was drafted only to test the gate and was deliberately **not filed**.

## Three strengths

1. **Confirmation is enforced by the action tools, not merely suggested in prose.** Submission, reminders, ratings, and appeals all returned `CONFIRMATION_REQUIRED` before a consequential state change.
2. **The review is specific.** Filing and appeal dialogs showed the precise payload, not a generic “Are you sure?” prompt.
3. **The workflow is lifecycle-aware.** A Poor rating unlocked appeal drafting; an appeal draft unlocked the appeal-submission tool; invalid IDs produced structured, helpful errors.

## Three weaknesses

1. **Attention is not prioritized cleanly.** The system correctly surfaced the urgent day-23/no-interim-response EPF case, but it presented two attention cases rather than clearly ranking the most urgent one as the recommended immediate action.
2. **Identity and authorization are only demo-level.** During action tests, the page showed a simulated sign-in surface while tools still acted for a preloaded demo citizen. This is acceptable for a prototype, but it is not evidence of robust authentication, authorization, or case ownership protection.
3. **State is browser-local and there is no real backend.** The prototype does not establish persistence, auditability, cross-device continuity, real notification delivery, or CPGRAMS/government-system integration.

## Bottom line for judges

This is a convincing **WebMCP interaction and consent-pattern prototype**: it demonstrates dynamic tool discovery, context-sensitive workflow exposure, exact-payload approval, decline handling, and safe structured errors. It should be evaluated as a transparent simulation, not as a production-ready government grievance service.
