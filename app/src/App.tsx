import { useEffect } from "react";
import { Alert, Box } from "@mui/material";
import GovHeader from "./components/GovHeader";
import GovFooter from "./components/GovFooter";
import GovHome from "./components/GovHome";
import LoginScreen from "./components/LoginScreen";
import LodgeForm from "./components/LodgeForm";
import StatusView from "./components/StatusView";
import CaseDetail from "./components/CaseDetail";
import TransparencyScreen from "./components/TransparencyScreen";
import FaqScreen from "./components/FaqScreen";
import ConfirmDialog from "./components/ConfirmDialog";
import DraftReview from "./components/DraftReview";
import AppealReview from "./components/AppealReview";
import { useAppStore } from "./store";
import { registrar } from "./webmcp/registrar";
import { desiredTools } from "./webmcp/tools";
import { useAnnounceStore } from "./webmcp/voice";
import { applyTypeStep } from "./ui/typeScale";
import { dict } from "./i18n";
import type { View } from "./store";

/* ---------- hash routing (deep links, back/forward, reload restore) ---------- */

const GATED_VIEWS: View[] = ["lodge", "status", "case", "draft_review", "appeal_review"];

function viewFromHash(hash: string): { view: View; id: string | null } {
  const h = hash.replace(/^#\/?/, "");
  if (h.startsWith("lodge")) return { view: "lodge", id: null };
  if (h.startsWith("agent-tools")) return { view: "transparency", id: null };
  if (h.startsWith("faqs")) return { view: "faq", id: null };
  if (h.startsWith("signin")) return { view: "login", id: null };
  if (h.startsWith("draft-review")) return { view: "draft_review", id: null };
  if (h.startsWith("appeal-review")) return { view: "appeal_review", id: null };
  if (h.startsWith("cases/")) return { view: "case", id: decodeURIComponent(h.slice("cases/".length)) };
  if (h.startsWith("cases")) return { view: "status", id: null };
  return { view: "home", id: null };
}

function hashFromState(view: View, selectedGrievanceId: string | null): string {
  switch (view) {
    case "lodge": return "#/lodge";
    case "transparency": return "#/agent-tools";
    case "faq": return "#/faqs";
    case "login": return "#/signin";
    case "draft_review": return "#/draft-review";
    case "appeal_review": return "#/appeal-review";
    case "status": return "#/cases";
    case "case": return selectedGrievanceId ? `#/cases/${encodeURIComponent(selectedGrievanceId)}` : "#/cases";
    default: return "#/";
  }
}

/**
 * Portal shell — CPGRAMS-style chrome over the advocate simulation.
 * The tool registry re-syncs on every state change (dynamic surface, v4 §22);
 * consequential agent actions surface through the ConfirmDialog human gate.
 */
export default function App() {
  const { view, citizen, lang } = useAppStore();
  const d = dict(lang);

  useEffect(() => {
    applyTypeStep(useAppStore.getState().typeStep);
    document.documentElement.lang = useAppStore.getState().lang;

    // hash → state (boot, reload, back/forward)
    const applyHash = () => {
      const { view: v, id } = viewFromHash(location.hash);
      const s = useAppStore.getState();
      if (GATED_VIEWS.includes(v) && !s.citizen) {
        useAppStore.setState({ view: "login", postSignInView: v, selectedGrievanceId: id });
        return;
      }
      useAppStore.setState({ view: v, selectedGrievanceId: id, postSignInView: null });
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);

    // state → hash (shareable links prefer the registration ID)
    const unsubHash = useAppStore.subscribe((s) => {
      const g = s.grievances.find((x) => x.id === s.selectedGrievanceId || x.regId === s.selectedGrievanceId);
      const want = hashFromState(s.view, g?.regId ?? s.selectedGrievanceId);
      if (want !== location.hash) location.hash = want;
    });

    // dynamic registration: state → desired tools → diff-sync
    const syncNow = () => void registrar.sync(desiredTools(useAppStore.getState()));
    syncNow();
    const unsub = useAppStore.subscribe(syncNow);
    return () => {
      unsubHash();
      window.removeEventListener("hashchange", applyHash);
      unsub();
      void registrar.unregisterAll();
    };
  }, []);

  const authed = (node: React.ReactNode) => (citizen ? node : <LoginScreen />);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: (t) => t.palette.background.default,
      }}
    >
      <GovHeader />

      {!registrar.available && (
        <Alert severity="info" sx={{ borderRadius: 0, py: 0.4, px: 2, "& .MuiAlert-message": { fontSize: "0.75rem" } }}>
          {d.banner.off}
        </Alert>
      )}

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {view === "home" && <GovHome />}
        {view === "login" && (citizen ? <StatusView /> : <LoginScreen />)}
        {view === "lodge" && authed(<LodgeForm />)}
        {view === "status" && authed(<StatusView />)}
        {view === "case" && authed(<CaseDetail />)}
        {view === "faq" && <FaqScreen />}
        {view === "transparency" && <TransparencyScreen />}
        {view === "draft_review" && authed(<DraftReview />)}
        {view === "appeal_review" && authed(<AppealReview />)}
      </Box>

      <ConfirmDialog />
      <GovFooter />
      <LiveAnnouncer />
    </Box>
  );
}

/** aria-live region for voice agents and screen readers: page state changes
 *  (filings, reminders, ratings, appeals, approval prompts) are announced
 *  here; when Voice Mode is on they are also spoken aloud. */
function LiveAnnouncer() {
  const { message, seq } = useAnnounceStore();
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
    >
      {message && <span key={seq}>{message}</span>}
    </Box>
  );
}
