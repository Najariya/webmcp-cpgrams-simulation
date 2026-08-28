import { Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import TextIncrease from "@mui/icons-material/TextIncrease";
import { goi } from "../theme";
import { useAppStore, type View } from "../store";

/**
 * CPGRAMS-style portal header (simulation). Identity band → tricolour rule →
 * section nav. No official emblem is reproduced; the seal is a neutral mark.
 */
const NAV: { view: View | null; href?: string; label: string; hi: string }[] = [
  { view: "home", label: "Home", hi: "मुख्य पृष्ठ" },
  { view: "lodge", label: "Lodge Grievance", hi: "शिकायत दर्ज करें" },
  { view: "status", label: "View Status / My Cases", hi: "स्थिति देखें" },
  { view: "transparency", label: "Agent Tools", hi: "एजेंट टूल्स" },
  { view: "faq", label: "FAQs", hi: "सामान्य प्रश्न" },
];

export default function GovHeader() {
  const { view, setView, citizen, signOut, largeType, toggleLargeType, lang, setLang } = useAppStore();

  return (
    <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 10 }}>
      {/* Identity band */}
      <Box sx={{ bgcolor: goi.navy, color: "#fff" }}>
        <Box sx={{ maxWidth: 1180, mx: "auto", px: 2, py: 1.25, display: "flex", alignItems: "center", gap: 2 }}>
          {/* neutral seal — the State Emblem is not reproduced */}
          <Box
            sx={{
              width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.85)",
              display: "grid", placeItems: "center",
              bgcolor: "rgba(255,255,255,0.08)",
              fontSize: 19,
            }}
            aria-label="Simulation seal"
          >
            ⚖
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 11.5, lineHeight: 1.35, opacity: 0.95 }}>
              भारत सरकार · Government of India <span style={{ opacity: 0.55 }}>|</span> कार्मिक, लोक शिकायत और पेंशन मंत्रालय · Department of Administrative Reforms &amp; Public Grievances
            </Typography>
            <Typography sx={{ fontSize: 21, fontWeight: 800, lineHeight: 1.2, letterSpacing: "0.01em" }}>
              CPGRAMS <span style={{ fontWeight: 500, fontSize: 13.5, opacity: 0.9 }}>— Centralized Public Grievance Redress and Monitoring System</span>
            </Typography>
          </Box>
          <Stack sx={{ alignItems: "flex-end", gap: 0.75, flexShrink: 0 }}>
            <Chip size="small" label="SIMULATION · सिमुलेशन" sx={{ bgcolor: "rgba(255,153,51,0.22)", color: "#FFD9B8", border: "1px solid rgba(255,153,51,0.55)", fontWeight: 700, fontSize: 10.5 }} />
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Box sx={{ border: "1px solid rgba(255,255,255,0.4)", borderRadius: 1, overflow: "hidden", display: "flex" }}>
                {(["en", "hi"] as const).map((l) => (
                  <Button
                    key={l}
                    size="small"
                    disableRipple
                    onClick={() => setLang(l)}
                    sx={{
                      minWidth: 40, px: 1, py: 0.15, fontSize: 11.5, borderRadius: 0,
                      color: lang === l ? goi.navy : "#fff",
                      bgcolor: lang === l ? "#fff" : "transparent",
                      fontWeight: 700,
                    }}
                  >
                    {l === "en" ? "EN" : "हिं"}
                  </Button>
                ))}
              </Box>
              <IconButton size="small" onClick={toggleLargeType} sx={{ color: largeType ? "#FFB37E" : "#fff", border: "1px solid rgba(255,255,255,0.4)" }} aria-label="Large type">
                <TextIncrease sx={{ fontSize: 16 }} />
              </IconButton>
              {citizen ? (
                <Button
                  size="small"
                  startIcon={<LogoutIcon />}
                  onClick={signOut}
                  sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)", border: 1, borderRadius: 1, fontSize: 11.5, py: 0.15 }}
                >
                  {citizen.name}
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<LoginIcon />}
                  onClick={() => setView("login")}
                  sx={{ fontSize: 11.5, py: 0.15, bgcolor: goi.saffron, "&:hover": { bgcolor: goi.saffronDark } }}
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
        <Box sx={{ maxWidth: 1180, mx: "auto", px: 2, display: "flex", alignItems: "stretch", gap: 0.25, overflowX: "auto" }}>
          {NAV.map((n) => {
            const active = view === n.view || (n.view === "status" && (view === "case" || view === "appeal_review"));
            return (
              <Button
                key={n.label}
                onClick={() => n.view && setView(n.view)}
                sx={{
                  color: active ? "#fff" : "rgba(255,255,255,0.78)",
                  bgcolor: active ? "rgba(255,255,255,0.14)" : "transparent",
                  borderRadius: 0,
                  px: 1.75,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  borderBottom: active ? `3px solid ${goi.saffron}` : "3px solid transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
                  whiteSpace: "nowrap",
                }}
              >
                {lang === "hi" ? n.hi : n.label}
              </Button>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
