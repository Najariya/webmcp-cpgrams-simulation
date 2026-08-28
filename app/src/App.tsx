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

/**
 * Portal shell — CPGRAMS-style chrome over the advocate simulation.
 * The tool registry re-syncs on every state change (dynamic surface, v4 §22);
 * consequential agent actions surface through the ConfirmDialog human gate.
 */
export default function App() {
  const { view, largeType, citizen } = useAppStore();

  useEffect(() => {
    // dynamic registration: state → desired tools → diff-sync
    const syncNow = () => void registrar.sync(desiredTools(useAppStore.getState()));
    syncNow();
    const unsub = useAppStore.subscribe(syncNow);
    return () => {
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
        fontSize: largeType ? 17.5 : undefined,
        background: (t) => t.palette.background.default,
      }}
    >
      <GovHeader />

      {!registrar.available && (
        <Alert severity="info" sx={{ borderRadius: 0, py: 0.4, px: 2, "& .MuiAlert-message": { fontSize: 12 } }}>
          WebMCP is not active in this browser — the portal works normally. Your agent&rsquo;s tools are shown as a
          labelled simulation on the <strong>Agent Tools</strong> page.
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
    </Box>
  );
}
