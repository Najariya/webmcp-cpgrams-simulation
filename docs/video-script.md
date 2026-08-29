# Demo video script — WebMCP Challenge submission (target 2:45)

Word-for-word narration + exact on-screen actions. Timings are guides, not quotas.
Total target: **2:35–2:50** (hard limit 3:00). ~430 words of narration.

---

## Before you hit record (5-minute setup)

1. **Browser:** Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled and relaunched,
   OR ChatGPT's in-app browser (WebMCP is on by default there). Verify: open
   https://webmcp-cpgrams-simulation.vercel.app → Agent Tools → it should say
   "WebMCP active — this is the live registry".
2. **Layout:** two windows side by side — the ChatGPT/agent window left (~40% width), the
   portal right (~60%). Both fully visible at your recording resolution.
3. **Portal prep:** sign in (one tap — demo OTP pre-filled). Open **My Cases** → click
   **Reset demo data** (bottom right). Five seeded cases restored. Stay signed in.
4. **Agent prep:** ChatGPT open with the site loaded in its browser. Prompt box empty.
5. **Recording:** screen + microphone, 10-second sound check first. Speak slowly.
6. Rehearse once with a timer before the real take.

---

## THE SCRIPT

### 0:00–0:15 — Context (portal home, right window)

**Screen:** portal home. One slow scroll top-to-bottom, then rest at the top.

**Say:**
> "India's CPGRAMS portal transformed grievance filing — one site, every ministry, even a
> voice chatbot. But filing is only the beginning. For the next twenty-one days, the citizen
> is largely on their own. This project asks: what if their own browser agent became their
> advocate, all the way through?"

### 0:15–0:30 — The idea (portal home)

**Screen:** expand the "What is a browser agent?" row for two seconds, collapse it.

**Say:**
> "It's a clearly labelled simulation of the CPGRAMS lifecycle, rebuilt as a WebMCP-native
> site. The portal exposes structured tools to the agent right in the browser — and
> everything it can do is on the transparency page. But first, the citizen's everyday
> question."

### 0:30–1:15 — HERO: the ranked answer (agent window, then portal)

**Screen:** in ChatGPT, paste and send: **"Which of my grievances needs attention today?"**
Let the reply sit on screen ~8 seconds. When it names PG-26-03877, switch to the portal,
open My Cases → first row (the same case). Point at the overdue notice with the cursor.

**Say:**
> "One question — and the agent surveys everything. Five cases, one clear answer: start with
> PG dash twenty-six, zero-three-eight-seven-seven. Day twenty-three of a twenty-one-day
> target, and no interim reply on file. The agent didn't dump a table. It ranked the cases
> and led with the one that needs me today, in plain language. And the page shows me exactly
> the same thing. Agent and citizen, one shared truth."

### 1:15–1:45 — The human gate (reminder flow)

**Screen:** in ChatGPT: **"Send a reminder on that case."** The portal pops the confirmation
dialog. Pause on it a beat. Click **Confirm** in the portal. Open the case timeline to show
the reminder entry.

**Say:**
> "Now the agent acts — but watch the portal. Before anything is sent, the page shows me the
> exact payload and waits for my click. Not a chat confirmation — a real one, in the page,
> bound to this precise request. The agent cannot skip it. I approve… and the reminder is on
> the record, visible in the case timeline."

### 1:45–2:15 — Lifecycle intelligence: Poor rating unlocks the appeal

**Screen:** in the portal, open the Consumer Affairs case (feedback pending). In ChatGPT:
**"Rate that disposal Poor."** Confirm the gate in the portal. In ChatGPT:
**"What can you do now?"** — then open the portal's Agent Tools page and point at
**create_appeal_draft** in the registry.

**Say:**
> "When the situation changes, the capabilities change. A Poor rating opens the thirty-day
> appeal window — and the tool registry updates live. Appeal drafting simply did not exist a
> minute ago. Now the agent can prepare the appeal, grounded in the case record — and filing
> it will ask me again. Same gate, exact payload."

### 2:15–2:35 — Transparency + voice (Agent Tools page)

**Screen:** on Agent Tools, click **Call get_sla_status** — show the green ok chip, the
highlighted "What your agent would say" line, the collapsible JSON. Then click the **voice
icon** (header, top right) to turn Voice Mode on, and click **Test voice · English** so the
page speaks aloud.

**Say:**
> "Everything your agent can do is on this page — the same live registry the agent sees, with
> the exact response it receives. And it speaks: for citizens who listen rather than read,
> voice mode narrates the key moments in English or Hindi."

### 2:35–2:45 — Close (portal home)

**Screen:** navigate home. Hold.

**Say:**
> "WebMCP turns a public-service website into a workspace where the citizen and their own
> agent act together — the agent tracks, explains and drafts; the human holds every
> consequential decision. The citizen's advocate, through the whole lifecycle. Try it
> yourself — the link is below."

*(Let the end frame sit 2 seconds before stopping.)*

---

## After recording

1. Trim head/tail silence; confirm ≤ 3:00 (aim 2:45).
2. Watch once at 1× checking the AGENT window text is readable at recording resolution —
   if small, zoom the browser and re-record.
3. Upload to YouTube as **Public**; paste the URL into Devpost.

## Fallback beats (if something misbehaves mid-take)

- Agent slow? Narrate the portal side; cut the wait in edit.
- Gate dialog missing? It opens only on the agent's request — re-send the request.
- One bad beat? Record beats separately and cut together — the beat boundaries above are
  natural cut points.
