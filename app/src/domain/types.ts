/**
 * Domain model — truth layer for the grievance lifecycle simulation.
 * Policy constants and behaviours trace to docs/00-facts.md (C1–C12).
 */

export const SLA_TARGET_DAYS = 21; // C3
export const APPEAL_WINDOW_DAYS = 30; // C7
export const APPEAL_DISPOSAL_DAYS = 30; // C9
export const REMINDER_COOLDOWN_DAYS = 7; // demo policy: one reminder per week per case

export interface Ministry {
  id: string;
  nameEn: string;
  nameHi: string;
  appellateAuthority: string; // fictional role label, AS/JS rank per C8
}

export interface Category {
  id: string;
  titleEn: string;
  titleHi: string;
  ministryId: string;
  description: string;
  requiresEvidence: boolean;
}

export type GrievanceStatus =
  | "DRAFT"
  | "UNDER_PROCESS" // submitted and with the ministry (C12 vocabulary)
  | "DISPOSED" // ministry closed it; rating pending
  | "RATED" // citizen feedback recorded; Poor keeps appeal window open
  | "APPEALED" // appeal filed, pending with appellate authority
  | "CLOSED"; // terminal: satisfactory path or appeal window expired / appeal disposed

export type Satisfaction = "Satisfactory" | "Average" | "Poor";

export type TimelineKind =
  | "filed"
  | "received"
  | "under_process"
  | "interim_reply"
  | "reminder"
  | "disposal"
  | "rating"
  | "appeal_filed"
  | "appeal_disposed"
  | "note";

export type Actor = "citizen" | "agent" | "ministry" | "system";

export interface TimelineEvent {
  id: string;
  at: string; // ISO
  kind: TimelineKind;
  actor: Actor;
  title: string;
  text?: string;
}

export interface EvidenceItem {
  name: string;
  kind: "photo" | "document" | "receipt" | "message";
  note?: string;
}

export interface InterimReply {
  at: string;
  text: string;
}

export interface Reminder {
  at: string;
  byAgent: boolean;
}

export interface DisposalRecord {
  at: string;
  summary: string;
}

export interface AppealRecord {
  filedAt: string;
  grounds: string;
  argument: string;
  status: "PENDING" | "DISPOSED";
  disposedAt?: string;
  outcome?: string;
}

export interface Grievance {
  id: string; // internal
  regId?: string; // PG-26-xxxxx once submitted (C2)
  categoryId: string;
  ministryId: string;
  subject: string;
  description: string;
  reliefRequested: string;
  evidence: EvidenceItem[];
  status: GrievanceStatus;
  filedAt?: string;
  disposedAt?: string;
  disposal?: DisposalRecord;
  rating?: Satisfaction;
  ratingAt?: string;
  interimReply?: InterimReply;
  reminders: Reminder[];
  appeal?: AppealRecord;
  timeline: TimelineEvent[];
}

export interface GrievanceDraft {
  id: string;
  categoryId: string;
  ministryId: string;
  subject: string;
  description: string;
  reliefRequested: string;
  evidence: EvidenceItem[];
  updatedAt: string;
}

/** A draft is submittable when the citizen-visible required fields are present. */
export function draftIsValid(d: GrievanceDraft): boolean {
  return Boolean(
    d.categoryId && d.subject.trim().length >= 8 && d.description.trim().length >= 20 && d.reliefRequested.trim().length >= 4,
  );
}

export const REG_ID_RE = /^PG-26-\d{5}$/;
