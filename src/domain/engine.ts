/**
 * Lifecycle engine — guarded state transitions. Pure: take state, return new state.
 * Every mutation goes through a guard so the WebMCP tools and manual UI share
 * exactly the same eligibility rules (docs/03 §5 preconditions).
 */
import {
  appealEligible,
  daysBetween,
  reminderEligible,
  rateEligible,
} from "./sla";
import type {
  Actor,
  Grievance,
  GrievanceDraft,
  Satisfaction,
  TimelineEvent,
  TimelineKind,
} from "./types";

let seq = 0;
export function nextEventId(): string {
  seq += 1;
  return `ev-${Date.now().toString(36)}-${seq}`;
}

export function ev(at: string, kind: TimelineKind, actor: Actor, title: string, text?: string): TimelineEvent {
  return { id: nextEventId(), at, kind, actor, title, text };
}

export class PreconditionError extends Error {
  code: "PRECONDITION_FAILED" | "NOT_FOUND" | "CONFLICT";
  hint?: string;
  constructor(code: "PRECONDITION_FAILED" | "NOT_FOUND" | "CONFLICT", message: string, hint?: string) {
    super(message);
    this.code = code;
    this.hint = hint;
  }
}

/** Submit a validated draft → registered grievance with memorable ID (C2). */
export function submitDraft(d: GrievanceDraft, nowIso: string, regId: string): Grievance {
  const g: Grievance = {
    id: `g-${regId}`,
    regId,
    categoryId: d.categoryId,
    ministryId: d.ministryId,
    subject: d.subject,
    description: d.description,
    reliefRequested: d.reliefRequested,
    evidence: d.evidence,
    status: "UNDER_PROCESS",
    filedAt: nowIso,
    reminders: [],
    timeline: [
      ev(nowIso, "filed", "citizen", `Grievance filed · ${regId}`, "Submitted through the citizen's browser agent with explicit confirmation."),
      ev(nowIso, "received", "system", "Received by the portal", "Routed to the concerned Ministry/Department (simulation of CPGRAMS centralised routing)."),
      ev(nowIso, "under_process", "ministry", "Under process", "The nodal grievance officer has taken up the case. The 21-day redressal clock is running."),
    ],
  };
  return g;
}

export function sendReminder(g: Grievance, nowIso: string, byAgent: boolean): Grievance {
  if (!reminderEligible(g, nowIso)) {
    throw new PreconditionError(
      "PRECONDITION_FAILED",
      "This grievance is not currently eligible for a reminder.",
      "Reminders are possible on pending grievances past the 21-day target, at most once every 7 days. Check get_sla_status first.",
    );
  }
  return {
    ...g,
    reminders: [...g.reminders, { at: nowIso, byAgent }],
    timeline: [
      ...g.timeline,
      ev(nowIso, "reminder", byAgent ? "agent" : "citizen", "Reminder sent", "Recorded against the pending grievance."),
    ],
  };
}

export function rateDisposal(g: Grievance, rating: Satisfaction, nowIso: string): Grievance {
  if (!rateEligible(g)) {
    throw new PreconditionError(
      "PRECONDITION_FAILED",
      "This grievance has no disposal to rate yet.",
      "Only disposed grievances can be rated.",
    );
  }
  return {
    ...g,
    status: "RATED",
    rating,
    ratingAt: nowIso,
    timeline: [
      ...g.timeline,
      ev(nowIso, "rating", "citizen", `Feedback recorded: ${rating}`, rating === "Poor" ? "A Poor rating opens the appeal option for 30 days." : undefined),
    ],
  };
}

export interface AppealDraftInput {
  grounds: string;
  argument: string;
}

export function fileAppeal(g: Grievance, appeal: AppealDraftInput, nowIso: string): Grievance {
  if (!appealEligible(g, nowIso)) {
    if (g.status === "RATED" && g.rating === "Poor" && g.disposedAt && daysBetween(g.disposedAt, nowIso) > 30) {
      throw new PreconditionError(
        "PRECONDITION_FAILED",
        "The 30-day appeal window has closed for this grievance.",
        "Appeals are generally filed within 30 days of disposal.",
      );
    }
    throw new PreconditionError(
      "PRECONDITION_FAILED",
      "This grievance is not appeal-eligible.",
      "Appeal requires a disposed grievance rated Poor, inside the 30-day window.",
    );
  }
  if (appeal.argument.trim().length < 30 || appeal.grounds.trim().length < 4) {
    throw new PreconditionError(
      "PRECONDITION_FAILED",
      "The appeal is too thin to submit.",
      "grounds must state the objection (≥ 4 chars) and argument must be substantive (≥ 30 chars).",
    );
  }
  return {
    ...g,
    status: "APPEALED",
    appeal: {
      filedAt: nowIso,
      grounds: appeal.grounds,
      argument: appeal.argument,
      status: "PENDING",
    },
    timeline: [
      ...g.timeline,
      ev(nowIso, "appeal_filed", "citizen", "Appeal filed with the Nodal Appellate Authority", "Submitted with the citizen's explicit confirmation. Disposal target: about 30 days."),
    ],
  };
}

/** Appeal-window expiry closes a Poor-rated case that never appealed (C7). */
export function closeIfWindowExpired(g: Grievance, nowIso: string): Grievance {
  if (g.status === "RATED" && g.rating === "Poor" && g.disposedAt && daysBetween(g.disposedAt, nowIso) > 30) {
    return {
      ...g,
      status: "CLOSED",
      timeline: [
        ...g.timeline,
        ev(nowIso, "note", "system", "Appeal window closed", "The 30-day appeal window elapsed; the case is now closed."),
      ],
    };
  }
  if (g.status === "RATED" && g.rating && g.rating !== "Poor") {
    return {
      ...g,
      status: "CLOSED",
      timeline: [...g.timeline, ev(nowIso, "note", "system", "Case closed", `Closed after feedback (${g.rating}).`)],
    };
  }
  return g;
}
