# 03 · Tool Contracts — 13 tools, dynamic surface, human control

*Aligned to v4 §21–§30. Truth anchor: `00-facts.md`.*

## 1. Catalog (MUST)

| # | Tool | Class | Tier |
|---|---|---|---|
| 1 | `get_app_state` | Read | D |
| 2 | `list_grievance_categories` | Read | D |
| 3 | `get_grievance_details` | Read | D |
| 4 | `get_sla_status` | Read | D |
| 5 | `get_kb_answer` | Read | D |
| 6 | `check_duplicate_grievances` | Read | D |
| 7 | `create_grievance_draft` | Reversible write | C |
| 8 | `update_grievance_draft` | Reversible write | C |
| 9 | `submit_grievance` | Consequential | **A** |
| 10 | `send_reminder` | Consequential | B |
| 11 | `rate_disposal` | Consequential | B |
| 12 | `create_appeal_draft` | Reversible write | C |
| 13 | `send_appeal` | Consequential | **A** |

Optional after core stability: `speak_aloud` (already prototyped Day-0).

## 2. Dynamic registration (state → surface)

| State | Exposes |
|---|---|
| always | 1–6 |
| no draft | `create_grievance_draft` |
| draft active | `update_grievance_draft` |
| draft valid | `submit_grievance` |
| reminder-eligible pending case (overdue) | `send_reminder` |
| disposed + unrated | `rate_disposal` |
| rated Poor + within appeal window | `create_appeal_draft` |
| valid appeal draft | `send_appeal` |

Registrar safety: defer reconciliation while `activeExecutions > 0`; reconcile after invocation completes (complete execution → update store → compute desired → sync → update transparency).

## 3. Result envelope (locale-aware)

```json
{ "ok": true,  "speakable": "Your grievance is on day 23 and no interim response has been recorded.",
  "data": {}, "nextActions": ["send_reminder"] }
```
```json
{ "ok": false, "speakable": "This grievance is not currently eligible for a reminder.",
  "error": { "code": "PRECONDITION_FAILED", "message": "…", "hint": "Check the current SLA status first." } }
```

- `speakable` = ONE language, chosen by current interaction locale (`en` default, `hi` when user's Hindi) — never bilingual concatenation. UI labels may stay bilingual.
- Codes: `INVALID_ARGUMENT · NOT_FOUND · PRECONDITION_FAILED · CONFIRMATION_REQUIRED · CONFLICT · INTERNAL`. (`RATE_LIMITED` only if limiting is real.) Never throw; never leak stack traces.

## 4. Confirmation tiers

- **A (submit_grievance, send_appeal):** visible payload + explicit citizen confirmation in UI → short-lived (60 s) single-use token bound to payload hash; tool revalidates state before commit; idempotency key dedupes replays (`alreadyProcessed: true`).
- **B (send_reminder, rate_disposal):** clear confirmation before commit (UI confirm dialog bound to the same request).
- **C (drafts):** no gate — reversible by design.
- **D (reads):** none.

## 5. Validation (every tool)

Required fields · object shape · unknown keys rejected (`additionalProperties: false`) · enums · ID format (`PG-26-\d{5}`) · lengths · numeric ranges · state preconditions. Errors carry `field` + `hint` so the model self-corrects. Budgets: description ≤ ~500 chars, results ≤ ~1.5 K chars — automated tests enforce.

## 6. Untrusted content

Grievance/appeal text is data: escaped rendering, length caps, no HTML execution, no content-derived control flow; `untrustedContentHint` on tools that echo citizen text. Adversarial suite: injection titles must remain inert (J5).
