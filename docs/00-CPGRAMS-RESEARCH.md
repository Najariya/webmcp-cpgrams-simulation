# 00 · CPGRAMS Deep Research — Verified Fact Sheet

> **SUPERSEDED (2026-08-28):** the build now uses `00-facts.md` (fact register with implementation implications and deliberate fidelity cuts). This file is kept as research history; its claims F1–F22 remain the source pool.

*Compiled 2026-08-28 from primary sources: [pgportal.gov.in](https://pgportal.gov.in/) (the portal itself), DARPG guidelines (F.No. S-15/21/2021-(PG), "Comprehensive Guidelines for Handling the Public Grievances" 2024; "Strengthening of Machinery for Redressal of Public Grievances" 2022), and PIB press releases (PRID 2296724, 2266985, 2088830).*
*Each claim is numbered so it can be independently verified (e.g., cross-checked with ChatGPT or the source links).*

## 1. What CPGRAMS is

- **F1.** CPGRAMS = **Centralised Public Grievance Redress and Monitoring System**, run under the **Ministry of Personnel, Public Grievances & Pensions (DARPG)** — an online platform available 24×7 for citizens to lodge grievances related to **service delivery**. *(pgportal.gov.in home)*
- **F2.** It is a **single centralized portal linked to ALL Ministries/Departments of the Government of India AND all States/UTs**, with role-based access for each Ministry and State. *(pgportal.gov.in home)*
- **F3.** Two intake paths: **"Lodge Public Grievance"** and **"Lodge Pension Grievance."** Email submissions are explicitly not entertained. *(pgportal.gov.in home)*
- **F4.** Filing requires registration/login; a **unique registration ID** is issued at filing. Grievance status **and** appeal status are tracked via "View Status" using that ID. *(pgportal.gov.in home)*
- **F5.** A **"Reminder / Clarification"** feature lets complainants follow up on pending grievances. *(pgportal.gov.in home)*
- **F6.** After closure, citizens **"Rate Grievance"**; **if the rating is "Poor," the option to file an appeal is enabled.** *(pgportal.gov.in home, verbatim behavior)*
- **F7.** An official **"Nodal Authority for Appeal"** directory exists per ministry. For bodies under the **Directorate of Public Grievances (DPG, Cabinet Secretariat)**, citizens may seek DPG's help when redress is delayed. *(pgportal.gov.in home)*
- **F8.** **Not taken up on CPGRAMS:** RTI matters, court/sub-judice matters, religious matters, and government employees' service matters (unless prescribed channels are exhausted, DoPT OM 31.08.2015). *(pgportal.gov.in home)*
- **F9.** No government fee for filing. Mobile apps (Android/iOS) and **UMANG** integration; available in **English, Hindi, and ~20 regional languages**. *(pgportal.gov.in home)*

## 2. Lifecycle, movement & timelines

- **F10.** Movement lifecycle: grievance is **Received → Under Process** at the concerned ministry/department (Nodal Officer / Grievance Officer level) → **Disposed/Closed**. *(DARPG guidelines; portal status vocabulary)*
- **F11.** **Interim reply is mandatory when resolution will be delayed** — it must explain reasons for the delay ("interim action-taken status"). *(DARPG Comprehensive Guidelines §3.5)*
- **F12.** Grievances can be **remanded** back to ministries/departments (e.g., by appellate authorities or between units) — "remand" is an official movement type. *(DARPG guidelines)*
- **F13.** A disposed grievance is **treated as closed only after disposal of any appeal** filed against it — the appeal keeps the case alive. *(DARPG Comprehensive Guidelines)*
- **F14.** Disposal timeline: the **CPGRAMS Reform Programme 2022 (10-Step Reforms)** tightened redressal (60→45→30 days historically; DARPG's current "Myth vs Fact" communication cites a **21-day** redressal expectation, with **appeals to be disposed within a maximum of 30 days**). Sensitive ministries (Defence, External Affairs) have longer SLAs (45–60 days). *(DARPG O.M. F.No. S-15/21/2021-(PG); DARPG communications; righttoinformation.wiki guides)*
- **F15.** The 10-Step Reforms (2022) drove **~70 lakh grievances resolved 2022–2024**; daily disposal currently runs **~10,000–12,000 grievances and ~800–1,300 appeals per day** (DARPG daily updates, July–Aug 2026). *(DARPG/PIB)*
- **F16.** False/malicious complaints are closed per specific provisions; from the citizen's viewpoint some complaints may be **closed with an interim reply**. *(DARPG Comprehensive Guidelines §3.5)*

## 3. Appeals (two-tier)

- **F17.** A citizen **dissatisfied with disposal** may file an **appeal** — generally **within 30 days of closure**, via the portal, tracked on the same registration ID. *(CPGRAMS FAQ; righttoinformation.wiki)*
- **F18.** **First appeal → Nodal Appellate Authority** (an officer of **Additional Secretary / Joint Secretary rank** in the same ministry). **Second appeal / final escalation → Secretary of the concerned Ministry/Department.** *(CPGRAMS FAQ & Nodal Authority directory)*
- **F19.** Appeals must be **disposed within 30 days** of receipt (comments from the original handling unit may be sought within 15 days). *(DARPG guidelines)*

## 4. CPGRAMS 7.0 / 10.0 — the AI layer (our product thesis)

- **F20.** CPGRAMS 7.0 introduced **AI-based grievance categorisation and intelligent routing** directly to the appropriate last-mile nodal officer, **state-portal integration**, and a module that **auto-detects spam, bulk, and repetitive grievances**. *(PIB PRID 2296724; pgportal.gov.in)*
- **F21.** **Voice-enabled grievance registration and chatbot support** are live CPGRAMS features; the AI voice chatbot **"Samadhan Didi"** (launched 30 May 2026) lets citizens lodge complaints **by voice in multiple Indian languages**. *(PIB PRID 2296724 & 2266985)*
- **F22.** 2026 coverage references an AI-powered **CPGRAMS Version 10.0** automating sorting/tagging/routing and reducing average resolution time; the **Intelligent Grievance Monitoring System (IGMS  2.0)** applies AI/ML to grievance handling. *(PIB/news coverage)*

**Product thesis this supports:** India's grievance system is already centralized, AI-routed, multilingual, and voice-enabled *on the government side*. What does not exist is the **citizen's side**: a personal agent that helps them file well-formed grievances, watches the 21/30-day clocks, sends reminders, drafts evidence-backed appeals, and reads status aloud — in their language, in their browser, with no backend holding their data. That is exactly what WebMCP enables, and exactly what we build.

## 5. Verification checklist (for external review)

Paste claims F1–F22 into ChatGPT/any search and confirm against: pgportal.gov.in (home, FAQ, Redress Process Flow, Nodal Authority for Appeal), DARPG O.M. F.No. S-15/21/2021-(PG), PIB releases PRID 2296724 / 2266985 / 2088830, and DARPG daily disposal updates. Flag any claim that cannot be confirmed — the plan will be corrected before build.
