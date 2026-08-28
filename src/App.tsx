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
import { useAppStore } from "./store";
import { registrar } from "./webmcp/registrar";
import { desiredTools } from "./webmcp/tools";

/**
 * Portal shell — CPGRAMS-style chrome over the advocate simulation.
 * Citizen-only sections (lodge/status/case/appeal) redirect to the mapped,
 * simulated sign-in when no citizen session exists.
 */
export default function App() {
  const { view, largeType, citizen } = useAppStore();

  useEffect(() => {
    registrar.sync(desiredTools(useAppStore.getState()));
    return () => {
      registrar.unregisterAll();
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
          WebMCP is not active in this browser — the portal works normally; your agent's tools are shown as a simulation
          on the Agent Tools page. Open in <strong>ChatGPT's in-app browser</strong> or enable{" "}
          <strong>chrome://flags/#enable-webmcp-testing</strong> in Chrome 149+ and relaunch.
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
        {(view === "draft_review" || view === "appeal_review") && authed(
          <Box sx={{ p: 4, maxWidth: 640 }}>
            Review screen — arrives with the agent drafting journey.
          </Box>,
        )}
      </Box>

      <GovFooter />
    </Box>
  );
}
