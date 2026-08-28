# 00 · Fact Register — CPGRAMS policy assumptions behind the simulation

Every material CPGRAMS policy behaviour implemented in code traces to a numbered fact below with its primary source. If a behaviour is not here, it must not be coded.

Sources: **pgportal.gov.in** (portal home, FAQ, process flow), **DARPG O.M. F.No. S-15/21/2021-(PG)** and Comprehensive Guidelines for Handling Public Grievances, **PIB releases PRID 2296724 / 2266985**. Compiled 2026-08-28; this register supersedes `00-CPGRAMS-RESEARCH.md` (kept for history).

## Facts that are implemented

| ID | Claim | Source | Implementation implication |
|---|---|---|---|
| C1 | CPGRAMS is the Centralized Public Grievance Redress and Monitoring System under DARPG (Ministry of Personnel, PG & Pensions), a single centralized portal linked to all Union Ministries/Departments and States/UTs. | pgportal.gov.in home | Grievances route to credible Central Ministries/Departments (Ministry of Railways, EPFO/Labour, Health, Education, Consumer Affairs, Power…). No village/panchayat layer. |
| C2 | Filing issues a **unique registration ID**; status and appeal are tracked under the same ID. | pgportal.gov.in home | Every simulated case gets a memorable fictional ID (`PG-26-xxxxx`); all tools key on it. |
| C3 | Redressal target tightened by the CPGRAMS reforms to a **21-day** expectation (longer for sensitive ministries). | DARPG O.M. F.No. S-15/21/2021-(PG); DARPG "Myth vs Fact" | SLA clock = 21 days from filing; elapsed-days and on-track/overdue states drive J2. |
| C4 | An **interim reply is mandatory when resolution will be delayed**, explaining the reason. | Comprehensive Guidelines §3.5 | Pending case > 21 days splits into two honest states: "overdue WITH interim reply recorded" vs "overdue WITHOUT interim response" — the hero distinction of journey J2. |
| C5 | A **Reminder / Clarification** feature lets complainants follow up on pending grievances. | pgportal.gov.in home | `send_reminder` tool (Tier B consequential write) with confirmation; appends a timestamped reminder event to the case timeline. |
| C6 | After closure the citizen can **rate the grievance**; a **"Poor" rating enables the appeal option**. | pgportal.gov.in home | `rate_disposal` (Tier B); rating Poor flips case into APPEAL_ELIGIBLE and dynamically registers the appeal-drafting tool — the J3 unlock. |
| C7 | A dissatisfied citizen may file an **appeal, generally within 30 days of closure**, via the portal, under the same registration ID. | CPGRAMS FAQ | Appeal window = 30 days from disposal in the simulation; expiry returns the case to CLOSED with a clear explanation. |
| C8 | The appeal goes to the **Nodal Appellate Authority** (Additional Secretary / Joint Secretary rank in the same ministry). | CPGRAMS FAQ & Nodal Authority directory | Single appeal tier modelled; appellate officer is a fictional AS/JS-rank role for the chosen ministry. |
| C9 | Appeals are to be **disposed within ~30 days** of receipt. | DARPG guidelines | Appeal SLA clock = 30 days; appeal-pending state shows its own day counter. |
| C10 | **Not taken up:** RTI matters, sub-judice matters, religious matters, service matters of government employees. | pgportal.gov.in home; DoPT OM 31.08.2015 | `get_kb_answer` and filing guidance include the exclusion list so the agent can politely refuse out-of-scope requests (J4-adjacent behaviour). |
| C11 | CPGRAMS 7.0 added **AI categorisation/routing**, state integration, spam/duplicate detection; **voice intake and the "Samadhan Didi" voice chatbot** (30 May 2026) are live. | PIB PRID 2296724, 2266985 | Positioning fact only: government-side AI intake exists — our thesis is the citizen-side advocate after filing. Voice is a comfort feature (speak_aloud), not the innovation. |
| C12 | Lifecycle vocabulary: Received → Under Process → Disposed/Closed, with feedback and appeal as citizen-side steps. | DARPG guidelines; portal status vocabulary | Status set: `DRAFT → SUBMITTED → UNDER_PROCESS → DISPOSED → RATED → APPEALED → CLOSED` (appeal window expiry or appeal disposal). |

## Explicitly NOT modelled (deliberate fidelity cuts)

| Cut | Reason |
|---|---|
| Second appeal / Secretary-tier escalation | Single verified tier (C8) keeps the demo honest and small; second tier adds no new WebMCP behaviour. |
| 15-day comment loop inside appeals | Internal process detail, not citizen-visible; omitted. |
| Remand movement between units | Internal movement type; the citizen-side timeline does not need it. |
| State-portal specific procedures | Out of scope; Central ministries only. |
| Real CPGRAMS API / real submission / authentication / PII | The product is an explicit simulation; no government connectivity. |

## Simulation honesty label (UI copy, everywhere)

> Simulation for demonstration — fictional cases, ministries and officials; inspired by the CPGRAMS lifecycle; not affiliated with or connected to the Government of India.
