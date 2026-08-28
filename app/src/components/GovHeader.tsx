import { Box, Button, Chip, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import AccountBalance from "@mui/icons-material/AccountBalance";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import TextIncrease from "@mui/icons-material/TextIncrease";
import RecordVoiceOver from "@mui/icons-material/RecordVoiceOver";
import { goi } from "../theme";
import { useAppStore, type View } from "../store";
import { useVoiceStore } from "../webmcp/voice";
import { TYPE_STEP_LABELS } from "../ui/typeScale";

/**
 * CPGRAMS-style portal header (simulation). Identity band → tricolour rule →
 * section nav. No official emblem is reproduced; the seal is a neutral mark.
 */
const NAV: { view: View | null; href?: string; label: string; short: string; hi: string }[] = [
  { view: "home", label: "Home", short: "Home", hi: "मुख्य पृष्ठ" },
  { view: "lodge", label: "Lodge Grievance", short: "Lodge", hi: "शिकायत दर्ज करें" },
  { view: "status", label: "View Status / My Cases", short: "Status", hi: "स्थिति देखें" },
  { view: "transparency", label: "Agent Tools", short: "Agent", hi: "एजेंट टूल्स" },
  { view: "faq", label: "FAQs", short: "FAQs", hi: "सामान्य प्रश्न" },
];

export default function GovHeader() {
  const { view, setView, citizen, signOut, typeStep, cycleTypeStep, lang, setLang, goOrSignIn } = useAppStore();
  const { voiceMode, toggleVoiceMode } = useVoiceStore();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 10 }}>
      {/* Identity band */}
      <Box sx={{ bgcolor: goi.navy, color: "#fff" }}>
        <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 1.5, md: 2 }, py: 1.25, display: "flex", flexWrap: { xs: "wrap", md: "nowrap" }, alignItems: "center", gap: { xs: 1.25, md: 2 } }}>
          {/* neutral seal — the State Emblem is not reproduced */}
          <Box
            sx={{
              width: { xs: 36, md: 46 }, height: { xs: 36, md: 46 }, borderRadius: "50%", flexShrink: 0,
              border: "1.5px solid rgba(255,255,255,0.7)",
              display: "grid", placeItems: "center",
              bgcolor: "rgba(255,255,255,0.07)",
            }}
            aria-label="Simulation seal"
          >
            <AccountBalance sx={{ fontSize: { xs: "1.125rem", md: "1.375rem" }, color: "rgba(255,255,255,0.92)" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: "0.7188rem", lineHeight: 1.35 }}>
              भारत सरकार · Government of India <span style={{ opacity: 0.55 }}>|</span> कार्मिक, लोक शिकायत और पेंशन मंत्रालय · Department of Administrative Reforms &amp; Public Grievances
            </Typography>
            <Typography sx={{ fontSize: { xs: "1.0625rem", md: "1.3125rem" }, fontWeight: 800, lineHeight: 1.2, letterSpacing: "0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              CPGRAMS {!compact && <span style={{ fontWeight: 500, fontSize: "0.8438rem", opacity: 0.9 }}>— Centralized Public Grievance Redress and Monitoring System</span>}
            </Typography>
          </Box>
          <Stack sx={{ alignItems: { xs: "flex-end", md: "flex-end" }, gap: 0.75, flexShrink: 0 }}>
            <Chip size="small" label="SIMULATION · सिमुलेशन" sx={{ bgcolor: "rgba(255,153,51,0.22)", color: "#FFD9B8", border: "1px solid rgba(255,153,51,0.55)", fontWeight: 700, fontSize: "0.6562rem", height: 20 }} />
            <Stack direction="row" spacing={{ xs: 0.75, md: 1 }} sx={{ alignItems: "center" }}>
              <Box sx={{ border: "1px solid rgba(255,255,255,0.4)", borderRadius: 1, overflow: "hidden", display: "flex" }}>
                {(["en", "hi"] as const).map((l) => (
                  <Button
                    key={l}
                    size="small"
                    disableRipple
                    onClick={() => setLang(l)}
                    sx={{
                      minWidth: 40, px: 1, py: 0.15, fontSize: "0.7188rem", borderRadius: 0,
                      color: lang === l ? goi.navy : "#fff",
                      bgcolor: lang === l ? "#fff" : "transparent",
                      fontWeight: 700,
                    }}
                  >
                    {l === "en" ? "EN" : "हिं"}
                  </Button>
                ))}
              </Box>
              <IconButton
                size="small"
                onClick={toggleVoiceMode}
                sx={{ color: voiceMode ? "#FFB37E" : "#fff", border: "1px solid rgba(255,255,255,0.4)", width: 28, height: 28, borderRadius: 1 }}
                aria-label={voiceMode ? "Voice mode on — click to turn narration off" : "Voice mode off — click to speak key updates"}
                aria-pressed={voiceMode}
              >
                <RecordVoiceOver sx={{ fontSize: "0.9375rem" }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={cycleTypeStep}
                sx={{ color: typeStep > 0 ? "#FFB37E" : "#fff", border: "1px solid rgba(255,255,255,0.4)", bgcolor: typeStep > 0 ? "rgba(255,179,126,0.15)" : "transparent", width: 28, height: 28, borderRadius: 1 }}
                aria-label={`Text size ${TYPE_STEP_LABELS[typeStep]} — click to change`}
                aria-pressed={typeStep > 0}
              >
                <TextIncrease sx={{ fontSize: "0.9375rem" }} />
              </IconButton>
              {citizen ? (
                <Button
                  size="small"
                  startIcon={<LogoutIcon />}
                  onClick={signOut}
                  sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)", border: 1, borderRadius: 1, fontSize: "0.7188rem", py: 0.15 }}
                >
                  {citizen.name}
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<LoginIcon />}
                  onClick={() => setView("login")}
                  sx={{ fontSize: "0.7188rem", py: 0.15, bgcolor: goi.saffron, "&:hover": { bgcolor: goi.saffronDark } }}
                >
                  Sign In
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Tricolour rule */}
      <Box sx={{ display: "flex", height: 3 }}>
        <Box sx={{ flex: 1, bgcolor: goi.tricolor[0] }} />
        <Box sx={{ flex: 1, bgcolor: goi.tricolor[1], borderBottom: `1px solid ${goi.cardBorder}` }} />
        <Box sx={{ flex: 1, bgcolor: goi.tricolor[2] }} />
      </Box>

      {/* Section nav */}
      <Box sx={{ bgcolor: goi.navyDark, borderBottom: "1px solid rgba(255,255,255,0.12)" }} role="navigation" aria-label="Sections">
        <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 1, md: 2 }, display: "flex", alignItems: "stretch", gap: 0.25, overflowX: "auto", scrollbarWidth: "thin" }}>
          {NAV.map((n) => {
            const active = view === n.view || (n.view === "status" && (view === "case" || view === "appeal_review"));
            return (
              <Button
                key={n.label}
                onClick={() => n.view && (n.view === "lodge" || n.view === "status" ? goOrSignIn(n.view) : setView(n.view))}
                sx={{
                  color: active ? "#fff" : "rgba(255,255,255,0.78)",
                  bgcolor: active ? "rgba(255,255,255,0.14)" : "transparent",
                  borderRadius: 0,
                  px: { xs: 1.25, md: 1.75 },
                  py: 1,
                  fontSize: { xs: "0.7812rem", md: "0.8125rem" },
                  lineHeight: 1.4,
                  height: 44,
                  boxSizing: "border-box",
                  flexShrink: 0,
                  fontWeight: active ? 700 : 500,
                  boxShadow: active ? `inset 0 -3px 0 ${goi.saffron}` : "none",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
                  whiteSpace: "nowrap",
                }}
              >
                {lang === "hi" ? n.hi : compact ? n.short : n.label}
              </Button>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
