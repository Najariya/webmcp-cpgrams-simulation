import { ok, guarded } from "./envelope";
import type { ModelContextTool } from "./types";
import { useAppStore } from "../store";
import { CATEGORIES } from "../data/categories";

/**
 * Day-0 base tools (read-only) — prove the pattern end-to-end.
 * Descriptions stay under Chrome's 500-char budget and state the output shape,
 * because WebMCP has no outputSchema: the description IS the contract.
 */

export const getAppStateTool: ModelContextTool = {
  name: "get_app_state",
  title: "Get app state",
  description:
    "Read the portal's current state: active view, selected grievance id, open draft id, and the simulation clock. Returns JSON {ok, summary, data:{view, selectedGrievanceId, draftId, simNow}}. Read-only.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true },
  execute: async () =>
    guarded("get_app_state", "ऐप की स्थिति मिल गई। Got the app state.", async () => {
      const s = useAppStore.getState();
      return ok(
        "get_app_state",
        `मौजूदा स्क्रीन: ${s.view}. Current view: ${s.view}.`,
        { view: s.view, selectedGrievanceId: s.selectedGrievanceId, draftId: s.draftId, simNow: new Date().toISOString() },
      );
    }),
};

export const listIssueCategoriesTool: ModelContextTool = {
  name: "list_issue_categories",
  title: "List grievance categories",
  description:
    "List the grievance categories this panchayat portal accepts, with bilingual titles, the authority each routes to (GP = Gram Panchayat), the SLA in hours, and whether photo evidence is required. Use before filing so category ids are valid. Returns JSON {ok, summary, data:{categories:[{id,titleEn,titleHi,authority,slaHours,requiresPhoto}]}}. Read-only.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true },
  execute: async () =>
    guarded(
      "list_issue_categories",
      "श्रेणियाँ मिल गईं। Got the categories.",
      async () =>
        ok(
          "list_issue_categories",
          `${CATEGORIES.length} श्रेणियाँ उपलब्ध हैं। ${CATEGORIES.length} categories available.`,
          { categories: CATEGORIES.map(({ id, titleEn, titleHi, authority, slaHours, requiresPhoto }) => ({ id, titleEn, titleHi, authority, slaHours, requiresPhoto })) },
        ),
    ),
};

export const speakAloudTool: ModelContextTool = {
  name: "speak_aloud",
  title: "Speak aloud",
  description:
    "Speak a short message to the citizen through the page (text-to-speech, Hindi voice preferred, English fallback). Use when the user prefers listening — e.g., read a status, a draft, or a summary aloud. Keep text under 300 chars. Returns JSON {ok, summary, data:{spoken,lang}}. Does not change any data.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "The message to speak, under 300 characters." },
      lang: { type: "string", enum: ["hi-IN", "en-IN"], description: "Voice language; default hi-IN." },
    },
    required: ["text"],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: async (input) =>
    guarded("speak_aloud", "आवाज़ से नहीं बोल पाए। Could not speak aloud.", async () => {
      const text = typeof input.text === "string" ? input.text.slice(0, 300) : "";
      const lang = input.lang === "en-IN" ? "en-IN" : "hi-IN";
      if (!("speechSynthesis" in window)) {
        return ok("speak_aloud", "इस ब्राउज़र में आवाज़ उपलब्ध नहीं। Speech not supported here.", { spoken: false, lang });
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
      if (match) utter.voice = match;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      return ok("speak_aloud", `बोल रहे हैं: "${text.slice(0, 60)}…" · Speaking now.`, { spoken: true, lang });
    }),
};

export const BASE_TOOLS: ModelContextTool[] = [getAppStateTool, listIssueCategoriesTool, speakAloudTool];
