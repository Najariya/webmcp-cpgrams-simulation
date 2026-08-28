import { describe, expect, it } from "vitest";
import {
  PreconditionError,
  closeIfWindowExpired,
  fileAppeal,
  rateDisposal,
  sendReminder,
  submitDraft,
} from "../src/domain/engine";
import type { GrievanceDraft } from "../src/domain/types";

const now = "2026-08-28T12:00:00.000Z";
const DAY = 86_400_000;
const iso = (offsetDays: number) => new Date(new Date(now).getTime() + offsetDays * DAY).toISOString();

const draft: GrievanceDraft = {
  id: "d1",
  categoryId: "rail-ticket-refund",
  ministryId: "rail",
  subject: "Duplicate fare charged",
  description: "The fare was charged twice for the same cancelled ticket.",
  reliefRequested: "Reverse the duplicate charge.",
  evidence: [],
  updatedAt: now,
};

function pending(daysAgo = 23) {
  const g = submitDraft(draft, iso(-daysAgo), "PG-26-12345");
  return g;
}

describe("lifecycle engine", () => {
  it("submitting a draft creates a registered grievance with a timeline", () => {
    const g = submitDraft(draft, now, "PG-26-04821");
    expect(g.regId).toBe("PG-26-04821");
    expect(g.status).toBe("UNDER_PROCESS");
    expect(g.timeline.map((e) => e.kind)).toEqual(["filed", "received", "under_process"]);
  });

  it("refuses reminders on ineligible cases with a corrective hint", () => {
    expect(() => sendReminder(pending(9), now, true)).toThrowError(PreconditionError);
    try {
      sendReminder(pending(9), now, true);
    } catch (e) {
      const pe = e as PreconditionError;
      expect(pe.code).toBe("PRECONDITION_FAILED");
      expect(pe.hint).toContain("get_sla_status");
    }
  });

  it("reminder on the overdue case appends a timeline event", () => {
    const g = sendReminder(pending(23), now, true);
    expect(g.reminders).toHaveLength(1);
    expect(g.reminders[0].byAgent).toBe(true);
    expect(g.timeline.at(-1)?.kind).toBe("reminder");
    expect(g.timeline.at(-1)?.actor).toBe("agent");
  });

  it("rating flow: Poor keeps the case alive for appeal; satisfactory closes it", () => {
    const disposed = { ...pending(40), status: "DISPOSED" as const, disposedAt: iso(-6), disposal: { at: iso(-6), summary: "Done." } };
    const poor = rateDisposal(disposed, "Poor", now);
    expect(poor.status).toBe("RATED");
    expect(appealWindowOpen(poor)).toBe(true);
    const good = closeIfWindowExpired(rateDisposal(disposed, "Satisfactory", now), now);
    expect(good.status).toBe("CLOSED");
  });

  it("appeal: guards and success", () => {
    const disposed = { ...pending(40), status: "DISPOSED" as const, disposedAt: iso(-6), disposal: { at: iso(-6), summary: "Claim initiated." } };
    expect(() => fileAppeal(disposed, { grounds: "x", argument: "y" }, now)).toThrowError(PreconditionError);
    const poor = rateDisposal(disposed, "Poor", now);
    expect(() => fileAppeal(poor, { grounds: "objection", argument: "too thin" }, now)).toThrowError(PreconditionError);
    const appealed = fileAppeal(poor, { grounds: "Refund not processed", argument: "Six weeks of tickets show no credit; the disposal provided no transaction reference." }, now);
    expect(appealed.status).toBe("APPEALED");
    expect(appealed.appeal?.status).toBe("PENDING");
  });

  it("appeal window expiry closes an un-appealed Poor case (C7)", () => {
    const disposed = { ...pending(70), status: "RATED" as const, rating: "Poor" as const, ratingAt: iso(-32), disposedAt: iso(-32), disposal: { at: iso(-32), summary: "Done." } };
    const closed = closeIfWindowExpired(disposed, now);
    expect(closed.status).toBe("CLOSED");
    expect(closed.timeline.at(-1)?.title).toContain("Appeal window closed");
  });
});

function appealWindowOpen(g: GrievanceLike): boolean {
  return g.status === "RATED" && g.rating === "Poor";
}
type GrievanceLike = { status: string; rating?: string };
