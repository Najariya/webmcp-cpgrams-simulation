import { useEffect } from "react";
import { Alert, AppBar, Box, IconButton, Stack, ToggleButton, ToggleButtonGroup, Toolbar, Tooltip as MuiTooltip, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import TransparencyIcon from "@mui/icons-material/Visibility";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import HomeScreen from "./components/HomeScreen";
import CaseDetail from "./components/CaseDetail";
import TransparencyScreen from "./components/TransparencyScreen";
import { useAppStore, type View } from "./store";
import { registrar } from "./webmcp/registrar";
import { desiredTools } from "./webmcp/tools";

/**
 * Shell — Home/My Cases first (case board), Case Detail, Transparency.
 * The tool registry syncs to app state; when write tools join (S2) this
 * becomes a subscribe-driven dynamic surface (v4 §22).
 */
export default function App() {
  const { view, setView, largeType, toggleLargeType, lang, setLang } = useAppStore();

  useEffect(() => {
    registrar.sync(desiredTools(useAppStore.getState()));
    return () => {
      registrar.unregisterAll();
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontSize: largeType ? 18 : undefined,
        background: (t) =>
          `radial-gradient(1100px 700px at 88% -8%, ${t.palette.primary.main}0A 0%, transparent 55%), ${t.palette.background.default}`,
      }}
    >
      <AppBar position="static" sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Toolbar variant="dense" sx={{ gap: 1.5 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700, fontSize: 15 }}>
            ⚖
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>The Citizen's Advocate · नागरिक सहायक</Typography>
            <Typography variant="caption" color="text.secondary">Grievance lifecycle sandbox · WebMCP simulation</Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={lang}
            onChange={(_, v) => v && setLang(v)}
            sx={{ mr: 0.5, "& .MuiToggleButton-root": { px: 1.25, py: 0.25, fontSize: 12, lineHeight: 1.4 } }}
          >
            <ToggleButton value="en">EN</ToggleButton>
            <ToggleButton value="hi">हिं</ToggleButton>
          </ToggleButtonGroup>
          <MuiTooltip title="Large type · बड़ा टेक्स्ट">
            <IconButton onClick={toggleLargeType} color={largeType ? "primary" : "default"} size="small">
              <TextIncreaseIcon fontSize="small" />
            </IconButton>
          </MuiTooltip>
        </Toolbar>
      </AppBar>

      {!registrar.available && (
        <Alert severity="info" sx={{ borderRadius: 0, py: 0.5, px: 2, "& .MuiAlert-message": { fontSize: 12.5 } }}>
          WebMCP is not active in this browser — the site works normally; your agent's tools are shown as a simulation.
          Open in <strong>ChatGPT's in-app browser</strong> or enable{" "}
          <strong>chrome://flags/#enable-webmcp-testing</strong> in Chrome 149+ and relaunch.
        </Alert>
      )}

      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Stack sx={{ p: 1.25, gap: 0.5, borderRight: "1px solid", borderColor: "divider", alignItems: "center" }}>
          {([
            { view: "home" as View, icon: <HomeIcon />, label: "My cases · मेरे मामले" },
            { view: "transparency" as View, icon: <TransparencyIcon />, label: "How your agent works" },
          ]).map((n) => (
            <MuiTooltip key={n.view} title={n.label} placement="right">
              <IconButton onClick={() => setView(n.view)} color={view === n.view ? "primary" : "default"} sx={{ bgcolor: view === n.view ? "action.selected" : "transparent" }}>
                {n.icon}
              </IconButton>
            </MuiTooltip>
          ))}
        </Stack>

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {view === "home" && <HomeScreen />}
            {view === "case" && <CaseDetail />}
            {view === "transparency" && <TransparencyScreen />}
            {(view === "draft_review" || view === "appeal_review") && (
              <Box sx={{ p: 4, maxWidth: 640 }}>
                <Typography variant="h6" gutterBottom>
                  {view === "draft_review" ? "Grievance review" : "Appeal review"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This review screen — the agent prepares, you confirm — arrives with the filing journey build.
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="caption" sx={{ px: 2, py: 0.75, color: "text.secondary", borderTop: "1px solid", borderColor: "divider" }}>
            Simulation for demonstration — fictional cases, ministries and officials; inspired by the CPGRAMS lifecycle;
            not affiliated with or connected to the Government of India. · यह एक प्रदर्शन सिमुलेशन है।
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
