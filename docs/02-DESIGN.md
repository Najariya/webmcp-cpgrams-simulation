# 02 · Design System — "Civic Trust" (Material 3, premium & clean)

> **v4 note (2026-08-28):** layout authority is now **case-board-first** (Home / My Cases is the primary screen; Case Detail, Review screens, Transparency follow). The earlier map-first layout is deprecated — the Leaflet map is a COULD-tier item and is cut from the build (v4 §11/§59). Typography, tokens, status colors, motion and voice rules below remain authoritative.

Principles: **Material Design 3** component grammar + GOV.UK-style civic clarity, executed with a premium, restrained aesthetic. The screen must feel like a trustworthy public instrument — calm surfaces, one confident accent, generous whitespace, zero visual noise. (Per Naveen's directive: Material Design, neat, clean, premium background, standard premium fonts.)

---

## 1. Typography

- **Family:** [Inter](https://fonts.google.com/specimen/Inter) (variable; `Inter Tight` optional for display) **+ [Noto Sans Devanagari](https://fonts.google.com/specimen/Noto+Sans+Devanagari)** for Hindi labels — Inter has no Devanagari coverage, so the stack is `"Inter", "Noto Sans Devanagari", "SF Pro Text", system-ui, sans-serif` and bilingual labels render cleanly at matched optical sizes. Fallbacks: `"Inter", "SF Pro Text", system-ui, -apple-system, sans-serif`. Code/tool names: `"JetBrains Mono", ui-monospace, Menlo, monospace`.
- **Why Inter:** the current standard for premium product UI — excellent at 12–14px dense info, true italics, tabular numerals (for SLA countdowns), variable weights for a tight scale. Loaded via Google Fonts with `font-display: swap`; metric-override not needed (self-hosted fallback acceptable).
- **M3 type scale (mapped):**

| Token | Size/Line | Weight | Use |
|---|---|---|---|
| `displaySm` | 36/44 | 700 | Landing hero |
| `headlineSm` | 24/32 | 700 | Page titles ("Ward 4 · Open issues") |
| `titleLg` | 18/26 | 600 | Card titles, draft heading |
| `titleSm` | 14/20 | 600 | Section headers, badge labels |
| `bodyMd` | 14/21 | 400 | Body, descriptions |
| `bodySm` | 12/18 | 400 | Meta, timestamps |
| `labelLg` | 14/20 | 500 | Buttons (MUI default) |
| `labelSm` | 11/16 | 500 | Chips, SLA badges (tabular nums) |

## 2. Color (M3 tonal system, light + dark)

Primary **"Civic Teal"** — trustworthy, governmental-but-modern; secondary warm amber for urgency (SLA); tertiary violet reserved *only* for the agent (the agent's actions are always violet — a one-glance "who did this" signal).

| Token | Light | Dark | Use |
|---|---|---|---|
| `primary` | `#0F6B5C` | `#5CD5BF` | Buttons, active states, links |
| `onPrimary` | `#FFFFFF` | `#00382F` | |
| `primaryContainer` | `#D7F2EA` | `#005043` | Selected chips, pin halos |
| `secondary` (amber) | `#8A5A00` | `#FFC24D` | SLA warning, escalation |
| `secondaryContainer` | `#FFEFD6` | `#4A3A00` | Breaching badges |
| `tertiary` (violet) | `#6750A4` | `#CBBEFF` | **Agent-authored UI only** |
| `error` | `#BA1A1A` | `#FFB4AB` | Discard, breach alerts |
| `surface` | `#FBFDFB` | `#101413` | Page background |
| `surfaceVariant` | `#ECF0ED` | `#2A3230` | Cards on background |
| `surfaceDim`/gradients | subtle radial tint | `#141A19` | See §3 |
| `outline` | `#C0C9C4` | `#8A938E` | Hairline borders |

Status colors (map pins + badges, CPGRAMS lifecycle): `registered` gray `#7D8C99` · `routed/under_process` blue `#3B82C4` · `interim_reply_due` amber-outline `#D97706` · `disposed_resolved` green `#2E9E5B` · `disposed_rejected` red `#C4453B` · `appealed_t1/t2` violet `#6750A4` · `reopened` teal `#0F8A6D`. Each status pairs with a **pictogram** (📋 registered → 📤 routed → ⚙️ under process → 🕐 interim due → ✅ resolved → 🚫 rejected → ⚖️ appealed → 🔁 reopened) so state is readable without text.

## 3. Surfaces & background (the "premium" feel)

- Light mode default: `surface #FBFDFB` with an **ultra-subtle layered background** — a fixed radial tint (primary at 3–4% opacity, 1200px, top-right) + a barely-visible 24px grid or topographic dot matrix at 2% — enough to feel crafted, not decorated. Cards float on `surfaceVariant` with M3 **elevation level 1** (no aggressive shadows; `box-shadow: 0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)`).
- Dark mode (auto via `prefers-color-scheme`, toggle in app bar): `#101413` base, same construction, violet/teal glows at 6–8% for agent elements.
- Radii: M3 shapes — cards `16px`, sheets/dialogs `28px`, chips/pills `8px` (M3 "extra-small" for chips), buttons `12px` (rounded, not full-pill — calmer, more instrument-like).
- Motion: 150–250ms `cubic-bezier(0.2, 0, 0, 1)` for all transitions; draft cards and approvals enter with a soft 12px rise + fade (M3 emphasized-decelerate). No bounce, no playful overshoot — **the register is institutional calm**. (GSAP energy lives in the explainer, not here.)
- Iconography: Material Symbols (Rounded, 400 weight, 20/24px), FILL 0.

## 4. Layout

- **App shell:** left app rail (72px collapsed icons: Map, My Reports, Drafts, About/Agent Guide, Transparency) + top app bar (city seal mark "R", "Riverside City Services", search, theme toggle). Content = map-first workspace; lists and details arrive as right-side sheets or cards over the map (never full-page navigation away from the map — the shared canvas persists).
- **Agent presence strip** (bottom or right, collapsible): "For your agent" card with copyable suggested prompts + live tool-count chip. We never embed our own chat — the agent is ChatGPT/Chrome; we make the page legible *to* it and instruct the *human* how to talk to it.
- Grid: 8px baseline; content max-width 1280; card padding 20–24px; touch targets ≥44px (P2 persona).
- **Density:** comfortable, not cozy — this is an information instrument.

## 5. Component inventory (MUI v7 + M3 theme)

App bar & navigation rail · grievance cards (category pictogram, title, mohalla, SLA badge, status chip + 🔊) · chips & filter bar · SLA countdown badge (amber intensifies as due-date approaches; breached = filled amber + clock pictogram) · draft review card (the hero component: two-zone layout — structured bilingual fields left, "agent's reasoning & sources" right in tertiary violet, sticky मंज़ूर/Approve · Edit · Discard bar) · CPGRAMS-style timeline (M3 vertical steps with timestamps + pictograms) · appeal memo composer (paper-like sheet, citation chips linking to grievance IDs) · feedback rating (Satisfactory / Poor — one tap, large targets) · map legend · transparency panel (tool list with annotation badges, live `toolchange` feed, mono font) · onboarding hero (bilingual headline + suggested text/voice prompts) · large-type & high-contrast toggle · confirmation dialogs (M3, always listing exactly what the tool will do) · snackbar confirmations ("SG-26-0482 दर्ज · SLA 72 घंटे").

**Stack:** MUI v7 (`createTheme` with M3 tokens above, Inter via `typography.fontFamily`, CSS vars for status colors), no Tailwind (avoid two systems fighting); Leaflet styled to match (custom pin divs with status halos, muted cartography — use a soft basemap like CARTO Positron/Voyager for the premium look).

## 6. Voice-first & inclusive navigation (India pillar)

India is voice-first — the design treats speech and sight as co-equal input/output channels:

- **Speakable by contract:** every WebMCP tool result carries a `summary` field — one short sentence, English + Hindi — phrased to be read aloud verbatim by the agent (see `03-TOOL-CONTRACTS.md` §2). Numbers and IDs are written the way they are *said* ("SG-26-0482" → summary says "es-gee twentysix oh-four-eight-two").
- **Read-aloud everywhere:** 🔊 affordance on grievance cards, timelines, draft cards, and appeal memos using the local `speechSynthesis` API (hi-IN voice preferred, en-IN fallback) — zero network, zero keys. Highlights the text as it speaks.
- **Icon-led state:** every status, category, and action has a pictogram + color; the map, lists, and cards must parse at arm's length without reading a word.
- **Large-type & high-contrast mode:** a persistent toggle (saved) bumps the type scale ~2 steps, thickens outlines, and raises contrast — designed for Arjun (68, low vision), useful for everyone in bright outdoor light.
- **Bilingual labels:** primary UI strings render Hindi + English together ("मेरी शिकायतें · My Grievances") — not a hidden language switch that requires finding settings. Agent conversation language follows the citizen; the page stays bilingual.
- **Voice conversation** itself happens through the platform agent (ChatGPT voice mode) driving the WebMCP tools — we optimize *for* it (speakable summaries, state-independent tools that don't depend on the citizen reading anything) rather than reimplementing chat in-page.
- **One-tap everything:** approve, rate feedback, send reminder — primary actions are single taps of ≥56px, placed thumb-reach on mobile, and mirrored as the human gates the agent must wait for.

## 7. Accessibility & polish bar

WCAG AA contrast on all badge/text combos; focus-visible rings (2px primary) everywhere; keyboard-complete flows; `aria-live` on tool executions and status changes; tabular numerals on all timers; empty states with instructive copy ("No drafts — ask your agent to report an issue"); skeleton loaders for seed hydration; the demo must look identical at 1280×720 (judge screen) and degrade gracefully to 768px.

## 8. Reference register

The feel: Google's own M3 showcase material (m3.material.io) × GOV.UK's ruthless content clarity × a modern fintech dashboard's surface quality. **Not** playful-consumer, **not** brutalist-gov. Institutional calm with premium finish.
