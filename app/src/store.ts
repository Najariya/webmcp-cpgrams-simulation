import { create } from "zustand";
import {
  closeIfWindowExpired,
  fileAppeal,
  rateDisposal,
  sendReminder,
  submitDraft,
} from "./domain/engine";
import { appealEligible, needsAttentionToday, rateEligible, reminderEligible, slaStatus } from "./domain/sla";
import { draftIsValid, type Grievance, type GrievanceDraft, type Satisfaction } from "./domain/types";
import { seedGoldenCases } from "./data/catalog";
import { announce } from "./webmcp/voice";

/**
 * App store (zustand). Single source of truth for the simulation.
 * Persisted to localStorage under "advocate-demo-v1" — fictional demo data only.
 * The desired-tool surface (v4 §22) is derived here so UI and WebMCP agree.
 */
export type View = "home" | "lodge" | "status" | "case" | "draft_review" | "appeal_review" | "transparency" | "faq" | "login";

export interface Citizen {
  name: string;
  mobile: string;
  email: string;
  state: string;
}

export const DEMO_CITIZEN: Citizen = {
  name: "Sita Sharma",
  mobile: "98XXXXXX21",
  email: "sita.demo@example.org",
  state: "Delhi",
};

export interface Locale {
  lang: "en" | "hi";
}

interface PersistedShape {
  grievances: Grievance[];
  draft: GrievanceDraft | null;
  appealDraft: { grievanceId: string; grounds: string; argument: string } | null;
  citizen: Citizen | null;
}

const PERSIST_KEY = "advocate-demo-v1";

function loadPersisted(): PersistedShape {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedShape;
      if (Array.isArray(parsed.grievances)) {
        return {
          grievances: parsed.grievances,
          draft: parsed.draft ?? null,
          appealDraft: parsed.appealDraft ?? null,
          citizen: parsed.citizen ?? null,
        };
      }
    }
  } catch {
    /* corrupt storage → reseed */
  }
  return { grievances: seedGoldenCases(), draft: null, appealDraft: null, citizen: null };
}

function persist(s: Omit<PersistedShape, "citizen"> & { citizen?: Citizen | null }): void {
  // citizen defaults to the current session (engine actions don't touch auth)
  const citizen = s.citizen !== undefined ? s.citizen : (useAppStore.getState()?.citizen ?? null);
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify({ ...s, citizen }));
  } catch {
    /* storage full/unavailable — simulation continues in memory */
  }
}

export interface DesiredSurface {
  noDraft: boolean;
  draftActive: boolean;
  draftValid: boolean;
  reminderEligibleIds: string[];
  rateEligibleIds: string[];
  appealEligibleIds: string[];
  appealDraftValid: boolean;
}

export function computeSurface(s: { grievances: Grievance[]; draft: GrievanceDraft | null; appealDraft: PersistedShape["appealDraft"] }, nowIso: string): DesiredSurface {
  const d = s.draft;
  return {
    noDraft: d === null,
    draftActive: d !== null && !draftIsValid(d),
    draftValid: d !== null && draftIsValid(d),
    reminderEligibleIds: s.grievances.filter((g) => reminderEligible(g, nowIso)).map((g) => g.id),
    rateEligibleIds: s.grievances.filter((g) => rateEligible(g)).map((g) => g.id),
    appealEligibleIds: s.grievances.filter((g) => appealEligible(g, nowIso)).map((g) => g.id),
    appealDraftValid:
      s.appealDraft !== null && s.appealDraft.grounds.trim().length >= 4 && s.appealDraft.argument.trim().length >= 30,
  };
}

interface AppState extends PersistedShape {
  view: View;
  selectedGrievanceId: string | null;
  largeType: boolean;
  lang: "en" | "hi";
  /** Simulation clock — frozen at load so relative-day facts stay stable within a session. */
  simNow: string;
  setView: (view: View) => void;
  select: (id: string | null) => void;
  toggleLargeType: () => void;
  setLang: (lang: "en" | "hi") => void;
  signIn: (c: Citizen) => void;
  signOut: () => void;
  saveDraft: (d: Omit<GrievanceDraft, "id" | "updatedAt">) => void;
  clearDraft: () => void;
  // engine-backed actions (guards throw PreconditionError → mapped by tool layer)
  submitActiveDraft: () => Grievance;
  remind: (grievanceId: string, byAgent: boolean) => void;
  rate: (grievanceId: string, rating: Satisfaction) => void;
  startAppealDraft: (grievanceId: string, grounds: string, argument: string) => void;
  sendAppeal: () => Grievance;
  resetDemo: () => void;
  surface: (nowIso?: string) => DesiredSurface;
  attentionCases: () => Grievance[];
}

const initial = loadPersisted();

export const useAppStore = create<AppState>((set, get) => ({
  ...initial,
  view: "home",
  selectedGrievanceId: null,
  largeType: false,
  lang: "en",
  simNow: new Date().toISOString(),

  setView: (view) => set({ view }),
  select: (selectedGrievanceId) => set({ selectedGrievanceId }),
  toggleLargeType: () => set((s) => ({ largeType: !s.largeType })),
  setLang: (lang) => set({ lang }),

  signIn: (c) => {
    const s = get();
    set({ citizen: c, view: s.view === "login" ? "status" : s.view });
    persist({ grievances: s.grievances, draft: s.draft, appealDraft: s.appealDraft, citizen: c });
    announce(`Signed in as ${c.name}.`, s.lang);
  },
  signOut: () => {
    const s = get();
    set({ citizen: null, view: "home", selectedGrievanceId: null });
    persist({ grievances: s.grievances, draft: s.draft, appealDraft: s.appealDraft, citizen: null });
  },

  saveDraft: (d) => {
    const s = get();
    const draft: GrievanceDraft = { ...d, id: s.draft?.id ?? `d-${Date.now().toString(36)}`, updatedAt: s.simNow };
    set({ draft });
    persist({ grievances: s.grievances, draft, appealDraft: s.appealDraft, citizen: s.citizen });
    announce(s.draft ? "Draft updated. Review it on the portal before anything is submitted." : "Draft prepared. Review it on the portal before anything is submitted.", s.lang);
  },
  clearDraft: () => {
    const s = get();
    set({ draft: null });
    persist({ grievances: s.grievances, draft: null, appealDraft: s.appealDraft, citizen: s.citizen });
  },

  submitActiveDraft: () => {
    const s = get();
    if (!s.draft || !draftIsValid(s.draft)) {
      throw Object.assign(new Error("Draft is not submittable"), { code: "PRECONDITION_FAILED" });
    }
    const seq = s.grievances.length + 4_800;
    const regId = `PG-26-${String(10_000 + Math.floor(Math.random() * 89_999)).slice(0, 5)}`;
    void seq;
    const g = submitDraft(s.draft, s.simNow, regId);
    set({ grievances: [g, ...s.grievances], draft: null, view: "case", selectedGrievanceId: g.id });
    persist({ grievances: [g, ...s.grievances], draft: null, appealDraft: s.appealDraft });
    announce(`Grievance lodged. Your registration ID is ${g.regId}. Quote it for status, reminders and appeals.`, s.lang);
    return g;
  },

  remind: (grievanceId, byAgent) => {
    const s = get();
    const idx = s.grievances.findIndex((g) => g.id === grievanceId);
    if (idx < 0) throw Object.assign(new Error(`No grievance with id ${grievanceId}`), { code: "NOT_FOUND" });
    const updated = sendReminder(s.grievances[idx], s.simNow, byAgent);
    const grievances = s.grievances.map((g, i) => (i === idx ? updated : g));
    set({ grievances });
    persist({ grievances, draft: s.draft, appealDraft: s.appealDraft });
    announce(`Reminder recorded on ${updated.regId}. The case timeline shows it.`, s.lang);
  },

  rate: (grievanceId, rating) => {
    const s = get();
    const idx = s.grievances.findIndex((g) => g.id === grievanceId);
    if (idx < 0) throw Object.assign(new Error(`No grievance with id ${grievanceId}`), { code: "NOT_FOUND" });
    const updated = closeIfWindowExpired(rateDisposal(s.grievances[idx], rating, s.simNow), s.simNow);
    const grievances = s.grievances.map((g, i) => (i === idx ? updated : g));
    set({ grievances });
    persist({ grievances, draft: s.draft, appealDraft: s.appealDraft });
    announce(
      rating === "Poor"
        ? `Feedback recorded as Poor on ${updated.regId}. The appeal option is open for 30 days.`
        : `Feedback recorded as ${rating} on ${updated.regId}. The case will close.`,
      s.lang,
    );
  },

  startAppealDraft: (grievanceId, grounds, argument) => {
    const s = get();
    const g = s.grievances.find((x) => x.id === grievanceId);
    if (!g) throw Object.assign(new Error(`No grievance with id ${grievanceId}`), { code: "NOT_FOUND" });
    set({ appealDraft: { grievanceId, grounds, argument } });
    persist({ grievances: s.grievances, draft: s.draft, appealDraft: { grievanceId, grounds, argument } });
  },

  sendAppeal: () => {
    const s = get();
    if (!s.appealDraft) throw Object.assign(new Error("No appeal draft"), { code: "PRECONDITION_FAILED" });
    const idx = s.grievances.findIndex((g) => g.id === s.appealDraft!.grievanceId);
    if (idx < 0) throw Object.assign(new Error("Appeal grievance not found"), { code: "NOT_FOUND" });
    const updated = fileAppeal(s.grievances[idx], s.appealDraft, s.simNow);
    const grievances = s.grievances.map((g, i) => (i === idx ? updated : g));
    set({ grievances, appealDraft: null });
    persist({ grievances, draft: s.draft, appealDraft: null });
    announce(`Appeal filed on ${updated.regId} with the Nodal Appellate Authority.`, s.lang);
    return updated;
  },

  resetDemo: () => {
    const fresh = { grievances: seedGoldenCases(), draft: null, appealDraft: null };
    set({ ...fresh, view: "home", selectedGrievanceId: null });
    persist(fresh);
  },

  surface: (nowIso) => {
    const s = get();
    return computeSurface(s, nowIso ?? s.simNow);
  },

  attentionCases: () => {
    const s = get();
    return s.grievances.filter((g) => needsAttentionToday(g, s.simNow));
  },
}));

/** Convenience for tools/UI: SLA snapshot of every case (drives the case board). */
export function boardSnapshot(s: { grievances: Grievance[]; simNow: string }) {
  return s.grievances.map((g) => ({ g, sla: slaStatus(g, s.simNow) }));
}
