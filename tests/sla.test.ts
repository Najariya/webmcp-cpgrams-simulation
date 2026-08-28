import { describe, expect, it } from "vitest";
import {
  appealEligible,
  daysBetween,
  needsAttentionToday,
  rateEligible,
  reminderEligible,
  slaStatus,
} from "../src/domain/sla";
import type { Grievance } from "../src/domain/types";

const DAY = 86_400_000;
const now = new Date("2026-08-28T12:00:00Z").getTime();
const iso = (ms: number) => new Date(ms).toISOString();

function pendingCase(daysAgo: number, interim = false): Grievance {
  return {
    id: "g1",
    regId: "PG-26-00001",
    categoryId: "epfo-withdrawal",
    ministryId: "epfo",
    subject: "Test subject",
    description: "Test description long enough for the engine.",
    reliefRequested: "Test relief",
    evidence: [],
    status: "UNDER_PROCESS",
    filedAt: iso(now - daysAgo * DAY),
    reminders: [],
    timeline: [],
    ...(interim ? { interimReply: { at: iso(now - 2 * DAY), text: "Delay explained." } } : {}),
  };
}

describe("SLA engine (facts C3–C7)", () => {
  it("counts elapsed days", () => {
    expect(daysBetween(iso(now - 9 * DAY), iso(now))).toBe(9);
  });

  it("day 9 of 21 is within target and needs no attention", () => {
    const s = slaStatus(pendingCase(9), iso(now));
    expect(s.phase).toBe("within_target");
    expect(s.daysLeft).toBe(12);
    expect(s.needsAttention).toBe(false);
  });

  it("day 23 with no interim reply is overdue and needs attention (hero case)", () => {
    const s = slaStatus(pendingCase(23), iso(now));
    expect(s.phase).toBe("overdue");
    expect(s.daysOver).toBe(2);
    expect(s.needsAttention).toBe(true);
    expect(s.attentionReason).toContain("no interim response");
  });

  it("day 26 WITH interim reply stays honest but less urgent (C4 nuance)", () => {
    const s = slaStatus(pendingCase(26, true), iso(now));
    expect(s.phase).toBe("overdue");
    expect(s.hasInterimReply).toBe(true);
    expect(s.needsAttention).toBe(false);
  });

  it("reminder eligibility: overdue only, once per 7-day cooldown (C5)", () => {
    const g = pendingCase(23);
    expect(reminderEligible(g, iso(now))).toBe(true);
    const reminded = { ...g, reminders: [{ at: iso(now - 3 * DAY), byAgent: true }] };
    expect(reminderEligible(reminded, iso(now))).toBe(false);
    const reminded8d = { ...g, reminders: [{ at: iso(now - 8 * DAY), byAgent: true }] };
    expect(reminderEligible(reminded8d, iso(now))).toBe(true);
    expect(reminderEligible(pendingCase(9), iso(now))).toBe(false);
  });

  it("disposed unrated is rate-eligible; Poor opens 30-day appeal window (C6/C7)", () => {
    const disposed: Grievance = {
      ...pendingCase(40),
      status: "DISPOSED",
      disposedAt: iso(now - 6 * DAY),
      disposal: { at: iso(now - 6 * DAY), summary: "Claim initiated." },
    };
    expect(rateEligible(disposed)).toBe(true);
    const poor: Grievance = { ...disposed, status: "RATED", rating: "Poor", ratingAt: iso(now - 2 * DAY) };
    expect(appealEligible(poor, iso(now))).toBe(true);
    const poor31: Grievance = { ...disposed, status: "RATED", rating: "Poor", ratingAt: iso(now - 31 * DAY), disposedAt: iso(now - 31 * DAY) };
    expect(appealEligible(poor31, iso(now))).toBe(false);
    const ok: Grievance = { ...disposed, status: "RATED", rating: "Satisfactory", ratingAt: iso(now) };
    expect(appealEligible(ok, iso(now))).toBe(false);
  });

  it("attentionToday aggregates the honest signals", () => {
    expect(needsAttentionToday(pendingCase(23), iso(now))).toBe(true);
    expect(needsAttentionToday(pendingCase(26, true), iso(now))).toBe(false);
    expect(needsAttentionToday(pendingCase(9), iso(now))).toBe(false);
  });
});
