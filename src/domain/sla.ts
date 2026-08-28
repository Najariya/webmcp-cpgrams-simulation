/**
 * SLA logic — pure functions, the heart of journey J2.
 * All facts: docs/00-facts.md C3 (21-day target), C4 (interim reply), C5 (reminder),
 * C6 (rating/Poor→appeal), C7 (30-day appeal window), C9 (30-day appeal disposal).
 */
import {
  APPEAL_WINDOW_DAYS,
  REMINDER_COOLDOWN_DAYS,
  SLA_TARGET_DAYS,
  type Grievance,
  type Satisfaction,
} from "./types";

export const DAY_MS = 86_400_000;

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.floor((new Date(toIso).getTime() - new Date(fromIso).getTime()) / DAY_MS);
}

export function daysElapsed(g: Grievance, nowIso: string): number | null {
  return g.filedAt ? daysBetween(g.filedAt, nowIso) : null;
}

export type SlaPhase =
  | "not_filed"
  | "within_target"
  | "overdue"
  | "disposed"
  | "rated"
  | "appealed"
  | "closed";

export interface SlaStatus {
  phase: SlaPhase;
  daysElapsed: number | null;
  targetDays: number;
  daysOver?: number;
  daysLeft?: number;
  hasInterimReply: boolean;
  /** Human/agent-oriented verdict used by get_sla_status and the UI. */
  needsAttention: boolean;
  attentionReason?: string;
}

export function slaStatus(g: Grievance, nowIso: string): SlaStatus {
  const elapsed = daysElapsed(g, nowIso);
  const interim = Boolean(g.interimReply);
  const base = { daysElapsed: elapsed, targetDays: SLA_TARGET_DAYS, hasInterimReply: interim };

  switch (g.status) {
    case "DRAFT":
      return { ...base, phase: "not_filed", needsAttention: false };
    case "UNDER_PROCESS": {
      if (elapsed === null) return { ...base, phase: "within_target", needsAttention: false };
      if (elapsed <= SLA_TARGET_DAYS) {
        return {
          ...base,
          phase: "within_target",
          daysLeft: SLA_TARGET_DAYS - elapsed,
          needsAttention: false,
        };
      }
      // Overdue — C4 makes the interim reply the deciding nuance for the citizen.
      const reason = interim
        ? `Day ${elapsed} of ${SLA_TARGET_DAYS}; the ministry has recorded an interim reply explaining the delay, but redressal is still pending.`
        : `Day ${elapsed} of ${SLA_TARGET_DAYS}; the ${SLA_TARGET_DAYS}-day redressal target has passed and no interim response has been recorded.`;
      return {
        ...base,
        phase: "overdue",
        daysOver: elapsed - SLA_TARGET_DAYS,
        needsAttention: !interim,
        attentionReason: reason,
      };
    }
    case "DISPOSED":
      return {
        ...base,
        phase: "disposed",
        needsAttention: true,
        attentionReason: "The ministry has disposed this grievance; your feedback (rating) is pending.",
      };
    case "RATED":
      return {
        ...base,
        phase: "rated",
        needsAttention: g.rating === "Poor",
        attentionReason:
          g.rating === "Poor"
            ? `You rated the disposal Poor; you may appeal within ${APPEAL_WINDOW_DAYS} days of disposal.`
            : undefined,
      };
    case "APPEALED":
      return { ...base, phase: "appealed", needsAttention: false };
    case "CLOSED":
    default:
      return { ...base, phase: "closed", needsAttention: false };
  }
}

/** C5: reminders exist — our demo policy allows one per cooldown on overdue pending cases. */
export function reminderEligible(g: Grievance, nowIso: string): boolean {
  if (g.status !== "UNDER_PROCESS" || !g.filedAt) return false;
  const s = slaStatus(g, nowIso);
  if (s.phase !== "overdue") return false;
  const last = g.reminders[g.reminders.length - 1];
  if (last && daysBetween(last.at, nowIso) < REMINDER_COOLDOWN_DAYS) return false;
  return true;
}

/** C6: feedback after disposal; unrated disposed cases are rate-eligible. */
export function rateEligible(g: Grievance): boolean {
  return g.status === "DISPOSED";
}

/** C6+C7: Poor rating unlocks appeal within the window. */
export function appealEligible(g: Grievance, nowIso: string): boolean {
  if (g.status !== "RATED" || g.rating !== ("Poor" as Satisfaction) || !g.disposedAt) return false;
  return daysBetween(g.disposedAt, nowIso) <= APPEAL_WINDOW_DAYS;
}

export function appealWindowDaysLeft(g: Grievance, nowIso: string): number | null {
  if (!g.disposedAt) return null;
  return APPEAL_WINDOW_DAYS - daysBetween(g.disposedAt, nowIso);
}

/** The single entry point the hero journey asks for. */
export function needsAttentionToday(g: Grievance, nowIso: string): boolean {
  return slaStatus(g, nowIso).needsAttention || reminderEligible(g, nowIso) || rateEligible(g) || appealEligible(g, nowIso);
}
