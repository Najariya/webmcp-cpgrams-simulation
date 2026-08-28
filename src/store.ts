import { create } from "zustand";
import { CATEGORIES } from "./data/categories";

/**
 * App store (zustand). Day-0: view state + category reference data.
 * Day-1 adds persisted grievances, drafts, and the simulation engine.
 */
export type View = "map" | "my_grievances" | "drafts" | "agent_guide";

interface AppState {
  view: View;
  selectedGrievanceId: string | null;
  draftId: string | null;
  largeType: boolean;
  panelOpen: boolean;
  categories: typeof CATEGORIES;
  setView: (view: View) => void;
  select: (id: string | null) => void;
  toggleLargeType: () => void;
  togglePanel: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "map",
  selectedGrievanceId: null,
  draftId: null,
  largeType: false,
  panelOpen: true,
  categories: CATEGORIES,
  setView: (view) => set({ view }),
  select: (selectedGrievanceId) => set({ selectedGrievanceId }),
  toggleLargeType: () => set((s) => ({ largeType: !s.largeType })),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
}));
