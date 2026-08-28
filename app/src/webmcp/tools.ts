import { err, guarded, ok } from "./envelope";
import type { ModelContextTool } from "./types";
import { checkGate, consumeApproval, hashPayload, useConfirmStore } from "./confirm";
import { useAppStore } from "../store";
import { CATEGORIES, categoryOf, ministryOf } from "../data/catalog";
import { appealEligible, rateEligible, reminderEligible, slaStatus } from "../domain/sla";
import { REG_ID_RE, draftIsValid, type Grievance, type Satisfaction } from "../domain/types";

/**
 * Tool catalog (v4 §21) — read tools 1–6 + optional speak_aloud.
 * Write tools (7–13) join in S2 with the confirmation infrastructure.
 * Descriptions stay ≤ ~500 chars and state the output shape: no outputSchema in
 * WebMCP, so the description IS the contract.
 */

// ---------- shared validators (docs/03 §5) ----------

type Input = Record<string, unknown>;

function rejectUnknownKeys(tool: string, input: Input, allowed: string[]): string | null {
  const unknown = Object.keys(input).filter((k) => !allowed.includes(k));
  if (unknown.length) {
    return err(tool, `Unexpected field: ${unknown[0]}.`, {
      code: "INVALID_ARGUMENT",
      message: `Unknown key "${unknown[0]}".`,
      field: unknown[0],
      hint: `Accepted fields: ${allowed.join(", ") || "(none)"}.`,
    });
  }
  return null;
}

function requireString(tool: string, input: Input, field: string, min = 1, max = 500): string | null {
  const v = input[field];
  if (typeof v !== "string" || !v.trim()) {
    return err(tool, `The field ${field} is required.`, {
      code: "INVALID_ARGUMENT",
      message: `Missing or empty "${field}".`,
      field,
      hint: `Provide "${field}" as a non-empty string.`,
    });
  }
  if (v.length > max || v.trim().length < min) {
    return err(tool, `The field ${field} has an invalid length.`, {
      code: "INVALID_ARGUMENT",
      message: `"${field}" must be ${min}–${max} characters.`,
      field,
      hint: `Trim to ${min}–${max} characters.`,
    });
  }
  return null;
}

function findGrievance(tool: string, s: { grievances: Grievance[] }, idKey: string, input: Input, extraAllowed: string[] = []): Grievance | string {
  const rej = rejectUnknownKeys(tool, input, [idKey, ...extraAllowed]) ?? requireString(tool, input, idKey, 6, 40);
  if (rej) return rej;
  const raw = String(input[idKey]).trim();
  const g = s.grievances.find((x) => x.regId === raw || x.id === raw);
  if (!g) {
    return err(tool, `No grievance found for ${raw}.`, {
      code: "NOT_FOUND",
      message: `No grievance matches "${raw}".`,
      hint: "Call get_app_state or list cases from get_sla_status to see valid registration IDs (format PG-26-XXXXX).",
    });
  }
  return g;
}

// ---------- tools 1–6 ----------

export const getAppStateTool: ModelContextTool = {
  name: "get_app_state",
  title: "Get app state",
  description:
    "Snapshot of the citizen's case workspace: current screen, language, case counts by status, which cases need attention today (SLA overdue / unrated / appeal-eligible), and which write actions are currently available. Start here. Returns JSON {ok, speakable, data:{view, lang, counts, attention:[{regId,subject,why}], can:{...}}, nextActions}. Read-only.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true },
  execute: async () =>
    guarded("get_app_state", "Could not read the app state. Please retry.", async () => {
      const s = useAppStore.getState();
      const attention = s.attentionCases().map((g) => ({
        regId: g.regId,
        subject: g.subject.slice(0, 80),
        why: slaStatus(g, s.simNow).attentionReason ?? "Action available (rate or appeal).",
      }));
      const counts = s.grievances.reduce<Record<string, number>>((acc, g) => {
        acc[g.status] = (acc[g.status] ?? 0) + 1;
        return acc;
      }, {});
      const surf = s.surface();
      return ok(
        "get_app_state",
        attention.length
          ? `${attention.length} of your ${s.grievances.length} grievances need attention today.`
          : `You have ${s.grievances.length} grievances; none need action right now.`,
        {
          view: s.view,
          lang: s.lang,
          counts,
          attention,
          can: {
            create_grievance_draft: surf.noDraft,
            update_grievance_draft: surf.draftActive || surf.draftValid,
            submit_grievance: surf.draftValid,
            send_reminder: surf.reminderEligibleIds.length > 0,
            rate_disposal: surf.rateEligibleIds.length > 0,
            create_appeal_draft: surf.appealEligibleIds.length > 0,
            send_appeal: surf.appealDraftValid,
          },
        },
        attention.length ? ["get_sla_status", "get_grievance_details"] : ["get_sla_status"],
      );
    }),
};

export const listGrievanceCategoriesTool: ModelContextTool = {
  name: "list_grievance_categories",
  title: "List grievance categories",
  description:
    "Categories this simulation accepts, routed to Central Ministries/Departments (Railways, EPFO, Health, Education, Power, Consumer Affairs) with a 21-day redressal target. Use before filing so category and ministry ids are valid. Returns JSON {ok, speakable, data:{categories:[{id,titleEn,titleHi,ministry,requiresEvidence}]}, nextActions}. Read-only.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true },
  execute: async () =>
    guarded("list_grievance_categories", "Could not list categories. Please retry.", async () =>
      ok(
        "list_grievance_categories",
        `${CATEGORIES.length} grievance categories are accepted, routed to six Central ministries.`,
        {
          categories: CATEGORIES.map((c) => ({
            id: c.id,
            titleEn: c.titleEn,
            titleHi: c.titleHi,
            ministry: ministryOf(c.ministryId)?.nameEn ?? c.ministryId,
            requiresEvidence: c.requiresEvidence,
          })),
          redressalTargetDays: 21,
        },
        ["create_grievance_draft"],
      ),
    ),
};

export const getGrievanceDetailsTool: ModelContextTool = {
  name: "get_grievance_details",
  title: "Get grievance details",
  description:
    "Full record of one grievance by registration ID (e.g. PG-26-03877): subject, description, relief requested, ministry, status, evidence list, interim reply, reminders, disposal, rating, appeal, and the movement timeline. Input: {grievanceId}. Returns JSON {ok, speakable, data:{grievance}, nextActions}. Read-only.",
  inputSchema: {
    type: "object",
    properties: { grievanceId: { type: "string", description: "Registration ID (PG-26-XXXXX) or internal id." } },
    required: ["grievanceId"],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: async (input) =>
    guarded("get_grievance_details", "Could not read that grievance.", async () => {
      const s = useAppStore.getState();
      const found = findGrievance("get_grievance_details", s, "grievanceId", input as Input);
      if (typeof found === "string") return found;
      const g = found;
      return ok(
        "get_grievance_details",
        `${g.regId}: ${g.subject.slice(0, 90)} — status ${g.status.replace("_", " ").toLowerCase()}.`,
        {
          grievance: {
            regId: g.regId,
            subject: g.subject,
            ministry: ministryOf(g.ministryId)?.nameEn,
            status: g.status,
            filedAt: g.filedAt,
            reliefRequested: g.reliefRequested,
            interimReply: g.interimReply ? g.interimReply.text.slice(0, 200) : undefined,
            reminders: g.reminders.length,
            disposal: g.disposal?.summary.slice(0, 200),
            rating: g.rating,
            appeal: g.appeal ? { status: g.appeal.status, filedAt: g.appeal.filedAt } : undefined,
            timeline: g.timeline.map((e) => ({ at: e.at, kind: e.kind, actor: e.actor, title: e.title })),
          },
        },
        ["get_sla_status"],
      );
    }),
};

export const getSlaStatusTool: ModelContextTool = {
  name: "get_sla_status",
  title: "Get SLA status",
  description:
    "SLA picture for one grievance (input {grievanceId}) or ALL of the citizen's cases (no input): days elapsed vs the 21-day target, whether an interim reply exists, and the honest next action (wait / remind / rate / appeal). This answers 'which grievance needs attention today?'. Returns JSON {ok, speakable, data:{cases:[{regId,subject,phase,daysElapsed,target,needsAttention,reason,eligibleActions}]}}. Read-only.",
  inputSchema: {
    type: "object",
    properties: { grievanceId: { type: "string", description: "Optional: one registration ID; omit to survey all cases." } },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: async (input) =>
    guarded("get_sla_status", "Could not read SLA status.", async () => {
      const s = useAppStore.getState();
      const i = input as Input;
      const rej = rejectUnknownKeys("get_sla_status", i, ["grievanceId"]);
      if (rej) return rej;
      const list = i.grievanceId ? s.grievances.filter((g) => g.regId === i.grievanceId || g.id === i.grievanceId) : s.grievances;
      if (i.grievanceId && list.length === 0) {
        return err("get_sla_status", `No grievance found for ${String(i.grievanceId)}.`, {
          code: "NOT_FOUND",
          message: `No grievance matches "${String(i.grievanceId)}".`,
          hint: `Check the ID format (${REG_ID_RE.source}) or list all cases by omitting grievanceId.`,
        });
      }
      const single = Boolean(i.grievanceId);
      const cases = list.map((g) => {
        const sla = slaStatus(g, s.simNow);
        const eligible: string[] = [];
        if (reminderEligible(g, s.simNow)) eligible.push("send_reminder");
        if (rateEligible(g)) eligible.push("rate_disposal");
        if (appealEligible(g, s.simNow)) eligible.push("create_appeal_draft");
        // Survey mode stays compact (v4 §26 budget): the long `reason` text only
        // rides along when a single case is requested or attention is needed.
        const row: Record<string, unknown> = {
          regId: g.regId,
          subject: g.subject.slice(0, single ? 70 : 45),
          phase: sla.phase,
          daysElapsed: sla.daysElapsed,
          target: sla.targetDays,
          hasInterimReply: sla.hasInterimReply,
          needsAttention: sla.needsAttention,
          eligibleActions: eligible,
        };
        if (single || sla.needsAttention) row.reason = sla.attentionReason?.slice(0, 130);
        return row;
      });
      const needy = cases.filter((c) => c.needsAttention);
      const speak = needy.length
        ? `${needy.length} case${needy.length > 1 ? "s" : ""} need${needy.length > 1 ? "" : "s"} attention: ${needy.map((c) => `${c.regId} (day ${c.daysElapsed} of ${c.target}${c.hasInterimReply ? ", interim reply on file" : ", no interim response"}${c.phase === "disposed" ? ", awaiting your feedback" : ""}${c.phase === "rated" ? ", appeal window open" : ""})`).join("; ")}.`
        : `All ${cases.length} cases are on track; nothing needs action today.`;
      return ok("get_sla_status", speak, { cases }, needy.length ? ["send_reminder", "rate_disposal", "create_appeal_draft"] : ["get_grievance_details"]);
    }),
};

const KB: { q: string[]; a: string }[] = [
  {
    q: ["excluded", "not accepted", "rti", "court", "religious", "service matter", "what can i file"],
    a: "This simulation follows CPGRAMS exclusions: RTI matters, sub-judice (court) matters, religious matters, and government-employee service matters are not taken up. Service-delivery grievances about Central ministries are accepted.",
  },
  {
    q: ["21", "how long", "timeline", "days", "target", "sla"],
    a: "The redressal target is 21 days from filing. If redressal is delayed, the ministry must record an interim reply explaining the delay.",
  },
  {
    q: ["reminder", "follow up", "pending"],
    a: "On grievances past the 21-day target you may send a Reminder, at most once every 7 days in this simulation.",
  },
  {
    q: ["appeal", "poor", "dissatisfied", "unhappy"],
    a: "After disposal you rate the grievance. A Poor rating opens the appeal option for 30 days from disposal; appeals go to the ministry's Nodal Appellate Authority and are targeted for disposal in about 30 days.",
  },
  {
    q: ["real", "government", "official", "cpgrams", "connected"],
    a: "This is a labelled simulation: fictional cases, ministries and officials; not affiliated with or connected to the Government of India or the real CPGRAMS.",
  },
  {
    q: ["interim", "delayed", "explain"],
    a: "When resolution is delayed, an interim reply explaining the reason is mandatory. A pending case past 21 days with no interim response is exactly when a reminder is most justified.",
  },
];

export const getKbAnswerTool: ModelContextTool = {
  name: "get_kb_answer",
  title: "Get process answer",
  description:
    "Plain-language answers about grievance process rules in this simulation: the 21-day target, interim replies, reminders, rating & appeals, exclusions, and the simulation's honesty policy. Input {question}. Returns JSON {ok, speakable, data:{answer, topic}, nextActions}. Read-only.",
  inputSchema: {
    type: "object",
    properties: { question: { type: "string", description: "The citizen's process question, 6–300 chars." } },
    required: ["question"],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: async (input) =>
    guarded("get_kb_answer", "Could not answer that question.", async () => {
      const rej =
        rejectUnknownKeys("get_kb_answer", input as Input, ["question"]) ??
        requireString("get_kb_answer", input as Input, "question", 6, 300);
      if (rej) return rej;
      const q = String((input as Input).question).toLowerCase();
      const hit = KB.find((entry) => entry.q.some((k) => q.includes(k)));
      return ok(
        "get_kb_answer",
        hit?.a ?? "I don't have a process answer for that; ask about timelines, reminders, appeals, or exclusions.",
        { answer: hit?.a ?? "No matching topic.", topic: hit ? hit.q[0] : "unknown" },
      );
    }),
};

export const checkDuplicateTool: ModelContextTool = {
  name: "check_duplicate_grievances",
  title: "Check duplicates",
  description:
    "Before filing, check whether the citizen already has a similar open grievance (input {keywords, optional categoryId}). Avoids duplicate filings. Returns JSON {ok, speakable, data:{matches:[{regId,subject,status}]}}. Read-only.",
  inputSchema: {
    type: "object",
    properties: {
      keywords: { type: "string", description: "Key terms of the new issue, e.g. 'EPF withdrawal stuck'." },
      categoryId: { type: "string", description: "Optional category id from list_grievance_categories." },
    },
    required: ["keywords"],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: async (input) =>
    guarded("check_duplicate_grievances", "Could not check duplicates.", async () => {
      const rej =
        rejectUnknownKeys("check_duplicate_grievances", input as Input, ["keywords", "categoryId"]) ??
        requireString("check_duplicate_grievances", input as Input, "keywords", 3, 200);
      if (rej) return rej;
      const words = String((input as Input).keywords).toLowerCase().split(/\W+/).filter((w) => w.length > 3);
      const s = useAppStore.getState();
      const matches = s.grievances
        .filter((g) => g.status !== "CLOSED")
        .map((g) => {
          const hay = `${g.subject} ${g.description}`.toLowerCase();
          const score = words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0);
          return { g, score };
        })
        .filter((m) => m.score >= Math.max(1, Math.ceil(words.length / 2)))
        .slice(0, 3)
        .map((m) => ({ regId: m.g.regId, subject: m.g.subject.slice(0, 80), status: m.g.status }));
      return ok(
        "check_duplicate_grievances",
        matches.length
          ? `${matches.length} similar open grievance${matches.length > 1 ? "s" : ""} found (${matches.map((m) => m.regId).join(", ")}).`
          : "No similar open grievance found; this looks new.",
        { matches },
        matches.length ? ["get_grievance_details"] : ["create_grievance_draft"],
      );
    }),
};

// ---------- optional (post-core) ----------

export const speakAloudTool: ModelContextTool = {
  name: "speak_aloud",
  title: "Speak aloud",
  description:
    "Speak a short message to the citizen through the page (text-to-speech; Hindi or English voice). Use when the user prefers listening. Keep text under 300 chars. Returns JSON {ok, speakable, data:{spoken,lang}}. Does not change any data.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "The message to speak, under 300 characters." },
      lang: { type: "string", enum: ["hi-IN", "en-IN"], description: "Voice language; default en-IN." },
    },
    required: ["text"],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: async (input) =>
    guarded("speak_aloud", "Could not speak aloud.", async () => {
      const i = input as Input;
      const text = typeof i.text === "string" ? i.text.slice(0, 300) : "";
      const lang = i.lang === "hi-IN" ? "hi-IN" : "en-IN";
      if (!("speechSynthesis" in window)) {
        return ok("speak_aloud", "Speech is not supported in this browser.", { spoken: false, lang });
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
      if (match) utter.voice = match;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      return ok("speak_aloud", `Speaking: "${text.slice(0, 60)}…"`, { spoken: true, lang });
    }),
};

// ---------- write tools 7–13 (v4 §21, §28–§29) ----------

function gateNeeded(tool: string, failSpeak: string, hash: string, rows: { k: string; v: string }[], title: string): string | null {
  const verdict = checkGate(hash);
  if (verdict === "approved") return null;
  if (verdict === "declined") {
    return err(tool, "The citizen declined this action.", {
      code: "PRECONDITION_FAILED",
      message: "The citizen explicitly declined this payload.",
      hint: "Do not retry the same payload immediately; ask the citizen what they would like to change.",
    });
  }
  useConfirmStore.getState().ask({ action: tool, payloadHash: hash, title, rows });
  return err(tool, failSpeak, {
    code: "CONFIRMATION_REQUIRED",
    message: `The page is showing the exact payload to the citizen for approval (${title}).`,
    hint: "Ask the citizen to confirm in the page, then call again with IDENTICAL arguments within 60 seconds.",
  });
}

function draftRows(d: { subject: string; description: string; reliefRequested: string; categoryId: string }): { k: string; v: string }[] {
  const cat = categoryOf(d.categoryId);
  return [
    { k: "Ministry", v: cat ? ministryOf(cat.ministryId)?.nameEn ?? cat.ministryId : "—" },
    { k: "Category", v: cat?.titleEn ?? d.categoryId },
    { k: "Subject", v: d.subject },
    { k: "Description", v: d.description },
    { k: "Relief sought", v: d.reliefRequested },
  ];
}

export const createGrievanceDraftTool: ModelContextTool = {
  name: "create_grievance_draft",
  title: "Create grievance draft",
  description:
    "Prepare a structured grievance draft for the citizen to review (no submission happens). Input {categoryId, subject (8-120), description (20-1200), reliefRequested (4-300)}. Get category ids from list_grievance_categories. The draft appears on the portal for the citizen to edit and confirm. Returns JSON {ok, speakable, data:{draft}, nextActions}. Reversible — no confirmation needed.",
  inputSchema: {
    type: "object",
    properties: {
      categoryId: { type: "string", description: "Category id from list_grievance_categories." },
      subject: { type: "string", description: "Short headline, 8–120 chars." },
      description: { type: "string", description: "Facts of the case, 20–1200 chars. No sensitive IDs or passwords." },
      reliefRequested: { type: "string", description: "The specific outcome wanted, 4–300 chars." },
    },
    required: ["categoryId", "subject", "description", "reliefRequested"],
    additionalProperties: false,
  },
  annotations: { untrustedContentHint: true },
  execute: async (input) =>
    guarded("create_grievance_draft", "Could not create the draft.", async () => {
      const i = input as Input;
      const rej =
        rejectUnknownKeys("create_grievance_draft", i, ["categoryId", "subject", "description", "reliefRequested"]) ??
        requireString("create_grievance_draft", i, "categoryId", 3, 60) ??
        requireString("create_grievance_draft", i, "subject", 8, 120) ??
        requireString("create_grievance_draft", i, "description", 20, 1200) ??
        requireString("create_grievance_draft", i, "reliefRequested", 4, 300);
      if (rej) return rej;
      const s = useAppStore.getState();
      if (s.draft) {
        return err("create_grievance_draft", "A draft is already in progress.", {
          code: "CONFLICT",
          message: "Only one grievance draft can be active at a time.",
          hint: "Use update_grievance_draft to change it, or submit_grievance once the citizen approves it.",
        });
      }
      const cat = categoryOf(String(i.categoryId));
      if (!cat) {
        return err("create_grievance_draft", "Unknown grievance category.", {
          code: "INVALID_ARGUMENT",
          message: `categoryId "${String(i.categoryId)}" does not exist.`,
          field: "categoryId",
          hint: "Call list_grievance_categories for valid ids.",
        });
      }
      const fields = {
        categoryId: cat.id,
        ministryId: cat.ministryId,
        subject: String(i.subject).trim(),
        description: String(i.description).trim(),
        reliefRequested: String(i.reliefRequested).trim(),
        evidence: [],
      };
      s.saveDraft(fields);
      return ok(
        "create_grievance_draft",
        "Draft prepared. It is shown on the portal for the citizen to review and edit before anything is submitted.",
        { draft: { ...fields, valid: draftIsValid({ ...fields, id: "t", updatedAt: "" }) } },
        ["update_grievance_draft", "submit_grievance"],
      );
    }),
};

export const updateGrievanceDraftTool: ModelContextTool = {
  name: "update_grievance_draft",
  title: "Update grievance draft",
  description:
    "Edit the active grievance draft. Input: any subset of {categoryId, subject, description, reliefRequested}; omitted fields stay unchanged. The citizen sees changes live on the portal. Returns JSON {ok, speakable, data:{draft}, nextActions}. Reversible — no confirmation needed.",
  inputSchema: {
    type: "object",
    properties: {
      categoryId: { type: "string" },
      subject: { type: "string" },
      description: { type: "string" },
      reliefRequested: { type: "string" },
    },
    additionalProperties: false,
  },
  annotations: { untrustedContentHint: true },
  execute: async (input) =>
    guarded("update_grievance_draft", "Could not update the draft.", async () => {
      const i = input as Input;
      const rej = rejectUnknownKeys("update_grievance_draft", i, ["categoryId", "subject", "description", "reliefRequested"]);
      if (rej) return rej;
      const s = useAppStore.getState();
      if (!s.draft) {
        return err("update_grievance_draft", "There is no draft to update.", {
          code: "PRECONDITION_FAILED",
          message: "No active grievance draft.",
          hint: "Call create_grievance_draft first.",
        });
      }
      const cat = i.categoryId !== undefined ? categoryOf(String(i.categoryId)) : undefined;
      if (i.categoryId !== undefined && !cat) {
        return err("update_grievance_draft", "Unknown grievance category.", {
          code: "INVALID_ARGUMENT",
          field: "categoryId",
          message: `categoryId "${String(i.categoryId)}" does not exist.`,
          hint: "Call list_grievance_categories for valid ids.",
        });
      }
      const next = {
        categoryId: cat?.id ?? s.draft.categoryId,
        ministryId: cat?.ministryId ?? s.draft.ministryId,
        subject: i.subject !== undefined ? String(i.subject).trim().slice(0, 120) : s.draft.subject,
        description: i.description !== undefined ? String(i.description).trim().slice(0, 1200) : s.draft.description,
        reliefRequested: i.reliefRequested !== undefined ? String(i.reliefRequested).trim().slice(0, 300) : s.draft.reliefRequested,
        evidence: s.draft.evidence,
      };
      s.saveDraft(next);
      return ok(
        "update_grievance_draft",
        "Draft updated on the portal.",
        { draft: { ...next, valid: draftIsValid({ ...next, id: "t", updatedAt: "" }) } },
        ["submit_grievance"],
      );
    }),
};

export const submitGrievanceTool: ModelContextTool = {
  name: "submit_grievance",
  title: "Submit grievance",
  description:
    "Submit the active draft as a simulated grievance. CONSEQUENTIAL: the citizen must approve the exact payload in the page first. First call (or after edits) returns CONFIRMATION_REQUIRED and opens the approval dialog; after the citizen confirms, retry with identical (empty) arguments to lodge the grievance and receive the registration ID (PG-26-XXXXX). Replay of a completed submission returns the same ID with alreadyProcessed=true — never files twice. Returns JSON {ok, speakable, data:{regId,...}}.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  execute: async () =>
    guarded("submit_grievance", "Submission could not be completed.", async () => {
      const s = useAppStore.getState();
      if (!s.draft) {
        // idempotent replay: the immediately-preceding successful submission answers an identical retry
        const last = useConfirmStore.getState().resultFor("submit_grievance", "last");
        if (last) {
          const parsed = JSON.parse(last) as { ok: boolean; data?: Record<string, unknown> };
          if (parsed.ok && parsed.data) {
            return JSON.stringify({ ...parsed, data: { ...parsed.data, alreadyProcessed: true } });
          }
        }
        return err("submit_grievance", "There is no grievance draft to submit.", {
          code: "PRECONDITION_FAILED",
          message: "No active draft.",
          hint: "Call create_grievance_draft (and have the citizen approve the content) first.",
        });
      }
      if (!draftIsValid(s.draft)) {
        return err("submit_grievance", "The draft is not complete enough to submit.", {
          code: "PRECONDITION_FAILED",
          message: "Draft validation failed.",
          hint: "Subject ≥ 8 chars, description ≥ 20 chars, relief ≥ 4 chars. Use update_grievance_draft.",
        });
      }
      const payload = {
        categoryId: s.draft.categoryId,
        subject: s.draft.subject,
        description: s.draft.description,
        reliefRequested: s.draft.reliefRequested,
      };
      const hash = hashPayload(payload);
      const gate = gateNeeded("submit_grievance", "The citizen must approve this grievance before it can be submitted.", hash, draftRows(payload), "Submit grievance");
      if (gate) return gate;
      consumeApproval(hash);
      try {
        const g = s.submitActiveDraft();
        const envelope = ok(
          "submit_grievance",
          `Grievance lodged. The registration ID is ${g.regId}. The 21-day redressal clock has started.`,
          { regId: g.regId, ministry: ministryOf(g.ministryId)?.nameEn, filedAt: g.filedAt },
          ["get_sla_status", "get_grievance_details"],
        );
        useConfirmStore.getState().recordResult("submit_grievance", "last", envelope);
        useConfirmStore.getState().recordResult("submit_grievance", hash, envelope);
        return envelope;
      } catch (e) {
        return err("submit_grievance", "Submission failed.", {
          code: "INTERNAL",
          message: e instanceof Error ? e.message : String(e),
          retry: true,
        });
      }
    }),
};

function caseRows(g: Grievance, extra: { k: string; v: string }[] = []): { k: string; v: string }[] {
  return [
    { k: "Registration ID", v: g.regId ?? "—" },
    { k: "Subject", v: g.subject },
    { k: "Status", v: g.status.replace("_", " ") },
    ...extra,
  ];
}

export const sendReminderTool: ModelContextTool = {
  name: "send_reminder",
  title: "Send reminder",
  description:
    "Send a Reminder on a pending grievance past its 21-day target (C5). CONSEQUENTIAL: the citizen confirms in the page first (first call returns CONFIRMATION_REQUIRED; retry identical arguments after approval). Input {grievanceId}. At most one reminder per 7 days per case. Returns JSON {ok, speakable, data:{regId,reminders}}.",
  inputSchema: {
    type: "object",
    properties: { grievanceId: { type: "string", description: "Registration ID (PG-26-XXXXX)." } },
    required: ["grievanceId"],
    additionalProperties: false,
  },
  execute: async (input) =>
    guarded("send_reminder", "Could not send the reminder.", async () => {
      const s = useAppStore.getState();
      const found = findGrievance("send_reminder", s, "grievanceId", input as Input);
      if (typeof found === "string") return found;
      const g = found;
      if (!reminderEligible(g, s.simNow)) {
        return err("send_reminder", "This grievance is not currently eligible for a reminder.", {
          code: "PRECONDITION_FAILED",
          message: "Reminders apply to pending grievances past the 21-day target, at most once every 7 days.",
          hint: "Call get_sla_status to see which case is reminder-eligible today.",
        });
      }
      const payload = { grievanceId: g.regId, kind: "reminder" };
      const hash = hashPayload(payload);
      const gate = gateNeeded("send_reminder", "The citizen must approve the reminder before it is sent.", hash, caseRows(g, [{ k: "Action", v: "Send Reminder (C5)" }]), "Send reminder");
      if (gate) return gate;
      consumeApproval(hash);
      const prior = useConfirmStore.getState().resultFor("send_reminder", hash);
      if (prior) return JSON.stringify({ ...JSON.parse(prior), data: { ...(JSON.parse(prior) as { data: Record<string, unknown> }).data, alreadyProcessed: true } });
      useAppStore.getState().remind(g.id, true);
      const envelope = ok(
        "send_reminder",
        `Reminder recorded on ${g.regId}. The case timeline now shows it.`,
        { regId: g.regId, reminders: g.reminders.length + 1 },
        ["get_sla_status"],
      );
      useConfirmStore.getState().recordResult("send_reminder", hash, envelope);
      return envelope;
    }),
};

export const rateDisposalTool: ModelContextTool = {
  name: "rate_disposal",
  title: "Rate disposal",
  description:
    "Record the citizen's feedback on a disposed grievance (C6). CONSEQUENTIAL: confirm with the citizen first (first call returns CONFIRMATION_REQUIRED; retry identical arguments after approval). Input {grievanceId, rating: Satisfactory|Average|Poor}. A Poor rating opens the 30-day appeal window — after which create_appeal_draft becomes available. Returns JSON {ok, speakable, data:{regId,rating}}.",
  inputSchema: {
    type: "object",
    properties: {
      grievanceId: { type: "string", description: "Registration ID (PG-26-XXXXX)." },
      rating: { type: "string", enum: ["Satisfactory", "Average", "Poor"], description: "The citizen's satisfaction with the disposal." },
    },
    required: ["grievanceId", "rating"],
    additionalProperties: false,
  },
  execute: async (input) =>
    guarded("rate_disposal", "Could not record the feedback.", async () => {
      const s = useAppStore.getState();
      const i = input as Input;
      const rej =
        rejectUnknownKeys("rate_disposal", i, ["grievanceId", "rating"]) ??
        requireString("rate_disposal", i, "grievanceId", 6, 40);
      if (rej) return rej;
      if (!["Satisfactory", "Average", "Poor"].includes(String(i.rating))) {
        return err("rate_disposal", "Invalid rating value.", {
          code: "INVALID_ARGUMENT",
          field: "rating",
          message: `"${String(i.rating)}" is not a valid rating.`,
          hint: "Use Satisfactory, Average, or Poor — ask the citizen, never decide for them.",
        });
      }
      const found = findGrievance("rate_disposal", s, "grievanceId", i, ["rating"]);
      if (typeof found === "string") return found;
      const g = found;
      if (!rateEligible(g)) {
        return err("rate_disposal", "This grievance has no disposal to rate yet.", {
          code: "PRECONDITION_FAILED",
          message: "Only disposed grievances can be rated (C6).",
          hint: "Call get_sla_status to see which case awaits feedback.",
        });
      }
      const rating = String(i.rating) as Satisfaction;
      const payload = { grievanceId: g.regId, rating };
      const hash = hashPayload(payload);
      const gate = gateNeeded("rate_disposal", "The citizen must confirm their feedback before it is recorded.", hash, caseRows(g, [{ k: "Feedback", v: rating }]), "Rate disposal");
      if (gate) return gate;
      consumeApproval(hash);
      useAppStore.getState().rate(g.id, rating);
      return ok(
        "rate_disposal",
        rating === "Poor"
          ? `Feedback recorded as Poor on ${g.regId}. The appeal option is now open for 30 days — I can prepare an appeal draft if the citizen wants.`
          : `Feedback recorded as ${rating} on ${g.regId}. The case will close.`,
        { regId: g.regId, rating },
        rating === "Poor" ? ["create_appeal_draft"] : ["get_sla_status"],
      );
    }),
};

export const createAppealDraftTool: ModelContextTool = {
  name: "create_appeal_draft",
  title: "Create appeal draft",
  description:
    "Prepare an appeal against a Poor-rated disposal, grounded in the case record (grounds: what was wrong with the disposal; argument ≥ 30 chars, ideally citing the original relief and evidence). Input {grievanceId, grounds, argument}. Available only inside the 30-day appeal window after a Poor rating. Reversible — no confirmation needed. Returns JSON {ok, speakable, data:{appealDraft}, nextActions}.",
  inputSchema: {
    type: "object",
    properties: {
      grievanceId: { type: "string", description: "Registration ID (PG-26-XXXXX) of the Poor-rated grievance." },
      grounds: { type: "string", description: "The objection to the disposal, 4–200 chars." },
      argument: { type: "string", description: "The appeal argument, 30–1500 chars." },
    },
    required: ["grievanceId", "grounds", "argument"],
    additionalProperties: false,
  },
  annotations: { untrustedContentHint: true },
  execute: async (input) =>
    guarded("create_appeal_draft", "Could not prepare the appeal.", async () => {
      const s = useAppStore.getState();
      const i = input as Input;
      const rej =
        rejectUnknownKeys("create_appeal_draft", i, ["grievanceId", "grounds", "argument"]) ??
        requireString("create_appeal_draft", i, "grievanceId", 6, 40) ??
        requireString("create_appeal_draft", i, "grounds", 4, 200) ??
        requireString("create_appeal_draft", i, "argument", 30, 1500);
      if (rej) return rej;
      const found = findGrievance("create_appeal_draft", s, "grievanceId", i, ["grounds", "argument"]);
      if (typeof found === "string") return found;
      const g = found;
      if (!appealEligible(g, s.simNow)) {
        return err("create_appeal_draft", "This grievance is not appeal-eligible.", {
          code: "PRECONDITION_FAILED",
          message: "Appeals require a disposed grievance rated Poor, inside the 30-day window (C6, C7).",
          hint: "Call get_sla_status; if feedback is pending, record it with rate_disposal first.",
        });
      }
      useAppStore.getState().startAppealDraft(g.id, String(i.grounds).trim(), String(i.argument).trim());
      return ok(
        "create_appeal_draft",
        "Appeal draft prepared and shown on the portal. Nothing is filed until the citizen confirms.",
        {
          appealDraft: {
            regId: g.regId,
            grounds: String(i.grounds).trim(),
            argumentPreview: `${String(i.argument).trim().slice(0, 120)}…`,
            addressedTo: ministryOf(g.ministryId)?.appellateAuthority,
          },
        },
        ["send_appeal"],
      );
    }),
};

export const sendAppealTool: ModelContextTool = {
  name: "send_appeal",
  title: "Send appeal",
  description:
    "File the prepared appeal with the ministry's Nodal Appellate Authority. CONSEQUENTIAL: the citizen must approve the exact appeal in the page first (first call returns CONFIRMATION_REQUIRED; retry with identical empty arguments after approval). Replay after success returns the original result with alreadyProcessed=true. Returns JSON {ok, speakable, data:{regId,appealFiledAt}}.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  execute: async () =>
    guarded("send_appeal", "The appeal could not be filed.", async () => {
      const s = useAppStore.getState();
      if (!s.appealDraft) {
        const last = useConfirmStore.getState().resultFor("send_appeal", "last");
        if (last) {
          const parsed = JSON.parse(last) as { ok: boolean; data: Record<string, unknown> };
          if (parsed.ok) return JSON.stringify({ ...parsed, data: { ...parsed.data, alreadyProcessed: true } });
        }
        return err("send_appeal", "There is no appeal draft to send.", {
          code: "PRECONDITION_FAILED",
          message: "No active appeal draft.",
          hint: "Call create_appeal_draft on a Poor-rated case first.",
        });
      }
      const g = s.grievances.find((x) => x.id === s.appealDraft!.grievanceId);
      if (!g || !appealEligible(g, s.simNow)) {
        return err("send_appeal", "This case is no longer appeal-eligible.", {
          code: "PRECONDITION_FAILED",
          message: "The appeal window may have closed.",
          hint: "Call get_sla_status to check the case state.",
        });
      }
      const payload = { grievanceId: g.regId, grounds: s.appealDraft.grounds, argument: s.appealDraft.argument };
      const hash = hashPayload(payload);
      const rows = [
        { k: "Registration ID", v: g.regId ?? "—" },
        { k: "Original relief", v: g.reliefRequested },
        { k: "Disposal being appealed", v: g.disposal?.summary ?? "—" },
        { k: "Grounds", v: payload.grounds },
        { k: "Appeal argument", v: payload.argument },
        { k: "Addressed to", v: ministryOf(g.ministryId)?.appellateAuthority ?? "Nodal Appellate Authority" },
      ];
      const gate = gateNeeded("send_appeal", "The citizen must approve the appeal before it is filed.", hash, rows, "Send appeal");
      if (gate) return gate;
      consumeApproval(hash);
      try {
        const updated = s.sendAppeal();
        const envelope = ok(
          "send_appeal",
          `Appeal filed on ${updated.regId} with the Nodal Appellate Authority. Disposal target: about 30 days.`,
          { regId: updated.regId, appealFiledAt: updated.appeal?.filedAt },
          ["get_grievance_details"],
        );
        useConfirmStore.getState().recordResult("send_appeal", "last", envelope);
        useConfirmStore.getState().recordResult("send_appeal", hash, envelope);
        return envelope;
      } catch (e) {
        return err("send_appeal", "The appeal could not be filed.", {
          code: "INTERNAL",
          message: e instanceof Error ? e.message : String(e),
          retry: true,
        });
      }
    }),
};

// ---------- dynamic surface (v4 §22) ----------

export const READ_TOOLS: ModelContextTool[] = [
  getAppStateTool,
  listGrievanceCategoriesTool,
  getGrievanceDetailsTool,
  getSlaStatusTool,
  getKbAnswerTool,
  checkDuplicateTool,
];

/** Desired tool set from current state — base reads + state-conditional writes.
 *  Consequential tools stay registered for a short replay window after success
 *  (v4 §22 surface × §29 idempotency). */
export function desiredTools(state: ReturnType<typeof useAppStore.getState>): ModelContextTool[] {
  const surf = (() => {
    try {
      return state.surface();
    } catch {
      return null;
    }
  })();
  const confirm = useConfirmStore.getState();
  const tools = [...READ_TOOLS];
  if (!surf) return tools;
  if (surf.noDraft) tools.push(createGrievanceDraftTool);
  else tools.push(updateGrievanceDraftTool);
  if (surf.draftValid || confirm.recentResult("submit_grievance")) tools.push(submitGrievanceTool);
  if (surf.reminderEligibleIds.length > 0 || confirm.recentResult("send_reminder")) tools.push(sendReminderTool);
  if (surf.rateEligibleIds.length > 0) tools.push(rateDisposalTool);
  if (surf.appealEligibleIds.length > 0) tools.push(createAppealDraftTool);
  if (surf.appealDraftValid || confirm.recentResult("send_appeal")) tools.push(sendAppealTool);
  return tools;
}
