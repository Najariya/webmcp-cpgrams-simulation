import { createTheme } from "@mui/material/styles";

/**
 * "Civic Trust" — Material 3 theme per docs/02-DESIGN.md.
 * Calm teal primary, amber = urgency, violet reserved for agent-authored UI.
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0F6B5C", contrastText: "#FFFFFF" },
    secondary: { main: "#8A5A00" },
    error: { main: "#BA1A1A" },
    success: { main: "#2E9E5B" },
    warning: { main: "#D97706" },
    info: { main: "#3B82C4" },
    background: { default: "#FBFDFB", paper: "#FFFFFF" },
    divider: "#E2E8E4",
    text: { primary: "#191C1B", secondary: "#5B6799" },
    violet: "#6750A4",
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      '"Inter", "Noto Sans Devanagari", "SF Pro Text", system-ui, -apple-system, sans-serif',
    allVariants: { letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 12, paddingInline: 18 } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(16,24,40,0.06)",
        },
        elevation1: {
          boxShadow:
            "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
    },
  },
});

/** CPGRAMS lifecycle status → color + pictogram (docs/02-DESIGN.md §2). */
export const statusTokens: Record<string, { color: string; icon: string; label: string }> = {
  registered: { color: "#7D8C99", icon: "📋", label: "Registered · दर्ज" },
  routed: { color: "#3B82C4", icon: "📤", label: "Routed · अग्रेषित" },
  under_process: { color: "#3B82C4", icon: "⚙️", label: "Under process · प्रक्रिया में" },
  interim_reply_due: { color: "#D97706", icon: "🕐", label: "Interim reply due · मध्यवर्ती उत्तर बाकी" },
  disposed_resolved: { color: "#2E9E5B", icon: "✅", label: "Resolved · निपटान" },
  disposed_rejected: { color: "#C4453B", icon: "🚫", label: "Rejected · अस्वीकृत" },
  appealed_t1: { color: "#6750A4", icon: "⚖️", label: "Appealed (BDO)" },
  appealed_t2: { color: "#6750A4", icon: "⚖️", label: "Appealed (DM)" },
  reopened: { color: "#0F8A6D", icon: "🔁", label: "Reopened · पुनः खुला" },
};

declare module "@mui/material/styles" {
  interface Palette {
    violet: string;
  }
  interface PaletteOptions {
    violet?: string;
  }
}
