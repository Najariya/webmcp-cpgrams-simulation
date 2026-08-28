import { useEffect } from "react";
import {
  Alert, AppBar, Box, IconButton, Stack, Toolbar, Tooltip as MuiTooltip, Typography, Button,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import GavelIcon from "@mui/icons-material/Gavel";
import DescriptionIcon from "@mui/icons-material/Description";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import TuneIcon from "@mui/icons-material/Tune";
import MapWorkspace from "./components/MapWorkspace";
import WebMcpPanel from "./components/WebMcpPanel";
import { useAppStore, type View } from "./store";
import { registrar } from "./webmcp/registrar";
import { BASE_TOOLS } from "./webmcp/tools";

const NAV: { view: View; icon: React.ReactNode; label: string }[] = [
  { view: "map", icon: <MapIcon />, label: "Map · नक्शा" },
  { view: "my_grievances", icon: <GavelIcon />, label: "My grievances · मेरी शिकायतें" },
  { view: "drafts", icon: <DescriptionIcon />, label: "Drafts · ड्राफ्ट" },
  { view: "agent_guide", icon: <MenuBookIcon />, label: "Agent guide" },
];

export default function App() {
  const { view, setView, largeType, toggleLargeType, panelOpen, togglePanel } = useAppStore();

  useEffect(() => {
    // Day-0: base read-only tools, synced once. Day-1+ diff on every state change.
    registrar.sync(BASE_TOOLS);
    return () => {
      registrar.unregisterAll();
    };
  }, []);

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontSize: largeType ? 18 : undefined,
        background: (t) =>
          `radial-gradient(1200px 800px at 85% -10%, ${t.palette.primary.main}0A 0%, transparent 55%), ${t.palette.background.default}`,
      }}
    >
      <AppBar position="static" sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Toolbar variant="dense" sx={{ gap: 1.5 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700, fontSize: 15 }}>
            ॐ
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>Gram Panchayat Grievance Portal · ग्राम पंचायत शिकायत पोर्टल</Typography>
            <Typography variant="caption" color="text.secondary">CPGRAMS-modelled · Silpi Gram, Mirzapur (UP) · simulation</Typography>
          </Box>
          <MuiTooltip title="Large type · बड़ा टेक्स्ट">
            <IconButton onClick={toggleLargeType} color={largeType ? "primary" : "default"}>
              <TextIncreaseIcon fontSize="small" />
            </IconButton>
          </MuiTooltip>
          <MuiTooltip title="WebMCP panel">
            <IconButton onClick={togglePanel} color={panelOpen ? "primary" : "default"}>
              <TuneIcon fontSize="small" />
            </IconButton>
          </MuiTooltip>
        </Toolbar>
      </AppBar>

      {!registrar.available && (
        <Alert severity="info" sx={{ borderRadius: 0, py: 0.5, px: 2, "& .MuiAlert-message": { fontSize: 12.5 } }}>
          WebMCP is not active in this browser — the portal still works, but the agent tools are simulated.
          Open in <strong>ChatGPT's in-app browser</strong> or enable{" "}
          <strong>chrome://flags/#enable-webmcp-testing</strong> in Chrome 149+ and relaunch.
        </Alert>
      )}

      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* navigation rail */}
        <Stack sx={{ p: 1, gap: 0.5, borderRight: "1px solid", borderColor: "divider" }}>
          {NAV.map((n) => (
            <MuiTooltip key={n.view} title={n.label} placement="right">
              <IconButton
                onClick={() => setView(n.view)}
                color={view === n.view ? "primary" : "default"}
                sx={{ bgcolor: view === n.view ? "action.selected" : "transparent" }}
              >
                {n.icon}
              </IconButton>
            </MuiTooltip>
          ))}
        </Stack>

        {/* workspace */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {view === "map" && <MapWorkspace />}
          {view !== "map" && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                {view === "my_grievances" && "मेरी शिकायतें · My Grievances"}
                {view === "drafts" && "ड्राफ्ट · Drafts"}
                {view === "agent_guide" && "Agent guide · एजेंट गाइड"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {view === "my_grievances" && "Your case file arrives in Day 1–3 of the build: CPGRAMS-style timelines, SLA badges, feedback, appeals."}
                {view === "drafts" && "Draft review cards arrive in Day 2: the agent prepares, you approve."}
                {view === "agent_guide" && "A plain-language capability map for visiting agents — coming Day 4."}
              </Typography>
              <Button variant="text" onClick={() => setView("map")} sx={{ mt: 2 }}>← नक्शे पर लौटें · Back to map</Button>
            </Box>
          )}
          <Typography variant="caption" sx={{ px: 2, py: 0.75, color: "text.secondary", borderTop: "1px solid", borderColor: "divider" }}>
            Simulation for demonstration — fictional officials and data; no affiliation with the actual Gram Panchayat of Shilpi/Silpi village. · यह एक प्रदर्शन सिमुलेशन है।
          </Typography>
        </Box>

        {panelOpen && <WebMcpPanel />}
      </Box>
    </Box>
  );
}
