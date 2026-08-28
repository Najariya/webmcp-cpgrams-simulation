# Gram Panchayat Grievance Portal (working title TBD)

An agent-native public grievance portal modelled on **CPGRAMS** (India's national
grievance redress system), instantiated in **Silpi Gram, Mirzapur district, UP** —
a clearly-labeled simulation with fictional officials and data.

Humans and AI agents collaborate through **WebMCP**: the page registers structured
tools (`document.modelContext.registerTool`) that a browser agent (ChatGPT's
in-app browser, or Chrome 149+ with `chrome://flags/#enable-webmcp-testing`)
can discover and call. Voice-first by design: every tool returns a short
bilingual (Hindi + English) `summary` meant to be spoken aloud, and the page can
talk via `speechSynthesis`.

> ⚠️ Simulation notice: this demo is not affiliated with the actual Gram
> Panchayat of Shilpi/Silpi village. All officials, grievances, and outcomes
> are fictional.

## Status

Day 0 scaffold (Aug 28, 2026): M3-themed React shell, Silpi Gram map workspace,
WebMCP tool layer with 3 read-only tools, transparency panel with self-test.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

To exercise the WebMCP layer, open the dev URL in ChatGPT's in-app browser, or
in Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled.
