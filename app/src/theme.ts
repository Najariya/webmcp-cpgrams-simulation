import { createTheme } from "@mui/material/styles";

/**
 * "GoI Portal" theme — visual language of Indian government web portals
 * (NIC/CPGRAMS style): deep navy header, tricolour accent strip, saffron
 * primary actions, dense squarer surfaces, formal bilingual tone.
 * This is a clearly-labelled simulation; no official emblem is reproduced.
 */
export const goi = {
  navy: "#0B2F63", // header band
  navyDark: "#081F42", // nav strip
  saffron: "#F26522", // primary action
  saffronDark: "#D4530F",
  green: "#1A7A3C", // success / tricolour
  tricolor: ["#FF9933", "#FFFFFF", "#138808"],
  link: "#0B5CAD",
  bg: "#F1F4F8", // page background
  cardBorder: "#D8DFE8",
  tableHeader: "#103A6B",
  alertAmber: "#8A5A00",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: goi.saffron, dark: goi.saffronDark, contrastText: "#FFFFFF" },
    secondary: { main: goi.navy, contrastText: "#FFFFFF" },
    error: { main: "#B3261E" },
    success: { main: goi.green },
    warning: { main: "#B45309" },
    info: { main: goi.link },
    background: { default: goi.bg, paper: "#FFFFFF" },
    divider: goi.cardBorder,
    text: { primary: "#1C2430", secondary: "#4A5A6E" },
    violet: "#5B4AA0",
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"IBM Plex Sans", "IBM Plex Sans Devanagari", "SF Pro Text", system-ui, -apple-system, sans-serif',
    allVariants: { letterSpacing: "0" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700, fontSize: "1.0625rem" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, paddingInline: 16, boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 3, fontWeight: 600 } } },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", border: `1px solid ${goi.cardBorder}` },
        elevation1: { boxShadow: "0 1px 2px rgba(12,32,60,0.06)" },
      },
    },
    MuiAppBar: { defaultProps: { elevation: 0, color: "inherit" } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, backgroundColor: goi.tableHeader, color: "#FFFFFF", whiteSpace: "nowrap" },
        root: { borderColor: goi.cardBorder },
      },
    },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: "0.75rem" } } },
  },
});

declare module "@mui/material/styles" {
  interface Palette {
    violet: string;
  }
  interface PaletteOptions {
    violet?: string;
  }
}
