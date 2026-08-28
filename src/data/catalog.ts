/**
 * Central-ministry catalogue + the golden simulation dataset (v4 §13).
 * All data fictional; ministries are credible Central bodies per C1.
 * Relative dates: cases are seeded against `now` so "day 23" is stable any day the demo opens.
 */
import { ev } from "../domain/engine";
import { DAY_MS } from "../domain/sla";
import type { Category, Grievance, Ministry } from "../domain/types";

export const MINISTRIES: Ministry[] = [
  { id: "rail", nameEn: "Ministry of Railways", nameHi: "रेल मंत्रालय", appellateAuthority: "Nodal Appellate Authority (JS rank)" },
  { id: "epfo", nameEn: "EPFO · Ministry of Labour & Employment", nameHi: "ईपीएफओ · श्रम एवं रोजगार मंत्रालय", appellateAuthority: "Nodal Appellate Authority (AS rank)" },
  { id: "health", nameEn: "Ministry of Health & Family Welfare", nameHi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय", appellateAuthority: "Nodal Appellate Authority (AS rank)" },
  { id: "edu", nameEn: "Ministry of Education", nameHi: "शिक्षा मंत्रालय", appellateAuthority: "Nodal Appellate Authority (AS rank)" },
  { id: "power", nameEn: "Ministry of Power", nameHi: "विद्युत मंत्रालय", appellateAuthority: "Nodal Appellate Authority (JS rank)" },
  { id: "ca", nameEn: "Ministry of Consumer Affairs", nameHi: "उपभोक्ता मामलों का मंत्रालय", appellateAuthority: "Nodal Appellate Authority (AS rank)" },
];

export const CATEGORIES: Category[] = [
  { id: "rail-ticket-refund", titleEn: "Rail travel · ticket refund failure", titleHi: "रेल यात्रा · टिकट रिफंड विफलता", ministryId: "rail", description: "Refunds not credited, incorrect deduction, or TDR rejected for rail tickets.", requiresEvidence: true },
  { id: "rail-amenity", titleEn: "Rail travel · onboard amenities & cleanliness", titleHi: "रेल यात्रा · सुविधाएँ व स्वच्छता", ministryId: "rail", description: "Coach condition, catering, cleanliness on trains or at stations.", requiresEvidence: false },
  { id: "epfo-withdrawal", titleEn: "EPF · withdrawal/transfer stuck", titleHi: "ईपीएफ · निकासी/स्थानांतरण रुका हुआ", ministryId: "epfo", description: "PF withdrawal or transfer claims pending beyond the stated timeline.", requiresEvidence: true },
  { id: "epfo-passbook", titleEn: "EPF · passbook / account mismatch", titleHi: "ईपीएफ · पासबुक / खाता विसंगति", ministryId: "epfo", description: "Employer contributions missing or passbook entries incorrect.", requiresEvidence: true },
  { id: "cghs-card", titleEn: "Health · CGHS card & empanelled hospital issues", titleHi: "स्वास्थ्य · सीजीएचएस कार्ड व अस्पताल सेवाएँ", ministryId: "health", description: "CGHS card delays, blocklisted hospitals refusing cashless treatment.", requiresEvidence: true },
  { id: "scholarship", titleEn: "Education · scholarship disbursement delay", titleHi: "शिक्षा · छात्रवृत्ति वितरण में देरी", ministryId: "edu", description: "National scholarship credited late, partially, or rejected without reason.", requiresEvidence: true },
  { id: "power-supply", titleEn: "Power · prolonged outage or voltage fluctuation", titleHi: "विद्युत · लंबे बिजली कटौती या वोल्टेज", ministryId: "power", description: "Sustained outages or dangerous supply quality reported to the utility without action.", requiresEvidence: false },
  { id: "consumer-ecom", titleEn: "Consumer · e-commerce/grievance portal inaction", titleHi: "उपभोक्ता · ई-कॉमर्स शिकायत पर कार्रवाई नहीं", ministryId: "ca", description: "Consumer complaints unresolved by the platform's own escalation.", requiresEvidence: true },
];

export function ministryOf(id: string): Ministry | undefined {
  return MINISTRIES.find((m) => m.id === id);
}
export function categoryOf(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

const iso = (now: number, daysAgo: number, hourOffset = 0) =>
  new Date(now - daysAgo * DAY_MS + hourOffset * 3_600_000).toISOString();

/**
 * G2–G6: five seeded cases + the G1 slot is the draft journey itself.
 * Designed states per docs/01 golden-dataset table.
 */
export function seedGoldenCases(now = Date.now()): Grievance[] {
  const g3 = iso(now, 23);
  const g4 = iso(now, 26);
  const g6Disposed = iso(now, 6);

  const G2: Grievance = {
    id: "g-PG-26-04112",
    regId: "PG-26-04112",
    categoryId: "scholarship",
    ministryId: "edu",
    subject: "National scholarship instalment not credited for the spring term",
    description:
      "The first instalment of the national scholarship for the spring term was approved in the portal four weeks ago but has not been credited to the bank account. The institute says all verification is complete.",
    reliefRequested: "Credit the approved instalment to the registered bank account and confirm the transaction reference.",
    evidence: [{ name: "scholarship-approval-screenshot.png", kind: "photo", note: "Portal shows 'approved'." }],
    status: "UNDER_PROCESS",
    filedAt: iso(now, 9),
    reminders: [],
    timeline: [
      ev(iso(now, 9), "filed", "citizen", "Grievance filed · PG-26-04112"),
      ev(iso(now, 9), "received", "system", "Received by the portal", "Routed to Ministry of Education."),
      ev(iso(now, 9), "under_process", "ministry", "Under process", "21-day clock running."),
    ],
  };

  const G3: Grievance = {
    id: "g-PG-26-03877",
    regId: "PG-26-03877",
    categoryId: "epfo-withdrawal",
    ministryId: "epfo",
    subject: "EPF withdrawal claim approved 6 weeks ago, money never received",
    description:
      "EPF withdrawal claim WF-2210 was marked approved more than six weeks ago. The amount has still not reached the bank account. Bank confirms no pending credit. No explanation has been received from the office.",
    reliefRequested: "Credit the approved claim amount with the transaction reference, or state the exact reason for the delay in writing.",
    evidence: [
      { name: "claim-approval-letter.pdf", kind: "document" },
      { name: "bank-statement-excerpt.pdf", kind: "document", note: "Shows no credit in the period." },
    ],
    status: "UNDER_PROCESS",
    filedAt: g3,
    reminders: [],
    timeline: [
      ev(g3, "filed", "citizen", "Grievance filed · PG-26-03877"),
      ev(g3, "received", "system", "Received by the portal", "Routed to EPFO (Labour & Employment)."),
      ev(g3, "under_process", "ministry", "Under process", "21-day clock running."),
    ],
  };

  const G4: Grievance = {
    id: "g-PG-26-03520",
    regId: "PG-26-03520",
    categoryId: "cghs-card",
    ministryId: "health",
    subject: "CGHS card renewal stuck; empanelled hospital refusing cashless treatment",
    description:
      "CGHS card renewal application submitted two months ago is still 'under process'. Meanwhile the empanelled hospital is refusing cashless treatment citing an invalid card, forcing out-of-pocket payment for ongoing medication.",
    reliefRequested: "Complete the card renewal immediately and issue a provisional validity letter for the empanelled hospital.",
    evidence: [{ name: "renewal-application-receipt.pdf", kind: "receipt" }],
    status: "UNDER_PROCESS",
    filedAt: g4,
    interimReply: {
      at: iso(now, 18),
      text:
        "The renewal is delayed because the beneficiary medical record is being re-verified with the parent hospital. A decision is expected shortly; interim validity has been noted for the wellness centre.",
    },
    reminders: [],
    timeline: [
      ev(g4, "filed", "citizen", "Grievance filed · PG-26-03520"),
      ev(g4, "received", "system", "Received by the portal", "Routed to Health & Family Welfare."),
      ev(g4, "under_process", "ministry", "Under process", "21-day clock running."),
      ev(iso(now, 18), "interim_reply", "ministry", "Interim reply recorded", "Delay explained as per the mandatory interim-reply rule."),
    ],
  };

  const G5: Grievance = {
    id: "g-PG-26-02961",
    regId: "PG-26-02961",
    categoryId: "rail-ticket-refund",
    ministryId: "rail",
    subject: "Duplicate fare charged for a cancelled Rajdhani ticket",
    description:
      "A cancelled Rajdhani ticket was charged twice in the same billing cycle. The extra debit was never reversed despite following the refund process twice.",
    reliefRequested: "Reverse the duplicate charge to the source account.",
    evidence: [{ name: "bank-statement-lines.png", kind: "photo" }],
    status: "CLOSED",
    filedAt: iso(now, 34),
    disposedAt: iso(now, 12),
    disposal: { at: iso(now, 12), summary: "Duplicate charge identified and reversed to the source account with reference RF-88213." },
    rating: "Satisfactory",
    ratingAt: iso(now, 11),
    reminders: [],
    timeline: [
      ev(iso(now, 34), "filed", "citizen", "Grievance filed · PG-26-02961"),
      ev(iso(now, 34), "under_process", "ministry", "Under process"),
      ev(iso(now, 12), "disposal", "ministry", "Disposed", "Duplicate charge reversed with reference RF-88213."),
      ev(iso(now, 11), "rating", "citizen", "Feedback recorded: Satisfactory"),
      ev(iso(now, 11), "note", "system", "Case closed"),
    ],
  };

  const G6: Grievance = {
    id: "g-PG-26-02640",
    regId: "PG-26-02640",
    categoryId: "consumer-ecom",
    ministryId: "ca",
    subject: "Refund for a returned appliance promised but never processed",
    description:
      "An appliance was returned within the return window; pickup was completed and acknowledged. The refund was repeatedly promised 'within 5 working days' across six weeks of support tickets, then the ticket was closed without the refund.",
    reliefRequested: "Process the full refund with interest for the delay, and provide a written explanation for closing the ticket.",
    evidence: [
      { name: "return-pickup-ack.png", kind: "photo" },
      { name: "support-tickets.pdf", kind: "document", note: "Six weeks of assurances." },
    ],
    status: "DISPOSED",
    filedAt: iso(now, 40),
    disposedAt: g6Disposed,
    disposal: {
      at: g6Disposed,
      summary:
        "The platform reports the refund was initiated to the original payment instrument on their side and considers the matter closed.",
    },
    reminders: [],
    timeline: [
      ev(iso(now, 40), "filed", "citizen", "Grievance filed · PG-26-02640"),
      ev(iso(now, 40), "under_process", "ministry", "Under process"),
      ev(g6Disposed, "disposal", "ministry", "Disposed", "Platform claims refund initiated; no transaction reference shared with the citizen."),
    ],
  };

  return [G3, G6, G2, G4, G5]; // attention-worthy first (G3 hero, G6 appeal), then healthy/contrast
}
