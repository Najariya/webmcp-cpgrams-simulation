import { Chip, Icon, Stack, Typography } from "@mui/material";
import Schedule from "@mui/icons-material/Schedule";
import WarningAmber from "@mui/icons-material/WarningAmber";
import HourglassBottom from "@mui/icons-material/HourglassBottom";
import RateReview from "@mui/icons-material/RateReview";
import Gavel from "@mui/icons-material/Gavel";
import TaskAlt from "@mui/icons-material/TaskAlt";
import CheckCircle from "@mui/icons-material/CheckCircle";
import type { SlaStatus } from "../domain/sla";
import type { Grievance } from "../domain/types";
import { appealWindowDaysLeft } from "../domain/sla";
import { useAppStore } from "../store";

/**
 * Status treatment — a SHORT single-line state chip (never clipped) plus an
 * optional secondary detail line for the nuance (no interim response, appeal
 * window). Icon + words + color, never color-only; one grammar across the
 * register table, mobile cards and the case-detail header.
 */
export default function StatusChip({ g, sla, size = "small" }: { g: Grievance; sla: SlaStatus; size?: "small" | "medium" }) {
  const lang = useAppStore((s) => s.lang);
  const { state, detail, color, variant, icon } = describe(g, sla, lang);
  return (
    <Stack sx={{ alignItems: "flex-start", gap: 0.5, py: 0.25 }}>
      <Chip
        size={size}
        label={state}
        color={color}
        variant={variant}
        icon={icon}
        sx={{
          height: size === "medium" ? 30 : 26,
          maxWidth: "100%",
          "& .MuiChip-label": { fontSize: "0.75rem", fontWeight: 700, px: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", lineHeight: 1.2 },
          "& .MuiChip-icon": { fontSize: "1rem", ml: 0.75 },
        }}
      />
      {detail && (
        <Typography sx={{ fontSize: "0.75rem", lineHeight: 1.3, color: "text.secondary", fontWeight: 600 }}>
          {detail}
        </Typography>
      )}
    </Stack>
  );
}

function describe(g: Grievance, sla: SlaStatus, lang: "en" | "hi"): {
  state: string;
  detail: string | null;
  color: "default" | "info" | "warning" | "success" | "secondary";
  variant: "filled" | "outlined";
  icon: React.ReactElement<typeof Icon>;
} {
  const hi = lang === "hi";
  switch (sla.phase) {
    case "within_target":
      return {
        state: hi ? "सही रफ़्तार" : "On track",
        detail: null, // day count already lives in the SLA column
        color: "info", variant: "outlined", icon: <Schedule />,
      };
    case "overdue":
      return sla.hasInterimReply
        ? {
            state: hi ? "देरी है" : "Delayed",
            detail: hi ? "अंतरिम उत्तर दर्ज है" : "interim reply on file",
            color: "warning", variant: "outlined", icon: <HourglassBottom />,
          }
        : {
            state: hi ? "समय-सीमा पार" : "Overdue",
            detail: hi ? "अंतरिम उत्तर नहीं" : "no interim response",
            color: "warning", variant: "filled", icon: <WarningAmber />,
          };
    case "disposed":
      return {
        state: hi ? "राय शेष" : "Feedback pending",
        detail: null,
        color: "secondary", variant: "filled", icon: <RateReview />,
      };
    case "rated":
      if (g.rating === "Poor") {
        const left = appealWindowDaysLeft(g, new Date().toISOString());
        return {
          state: hi ? "अपील खुली है" : "Appeal open",
          detail: left !== null ? (hi ? `${Math.max(0, left)} दिन बाकी` : `${Math.max(0, left)} days left`) : null,
          color: "secondary", variant: "filled", icon: <Gavel />,
        };
      }
      return {
        state: hi ? "राय दर्ज" : "Feedback recorded",
        detail: null,
        color: "success", variant: "outlined", icon: <TaskAlt />,
      };
    case "appealed":
      return {
        state: hi ? "अपील लंबित" : "Appeal pending",
        detail: hi ? "30 दिन का लक्ष्य" : "30-day disposal target",
        color: "secondary", variant: "filled", icon: <Gavel />,
      };
    case "closed":
      return { state: hi ? "बंद" : "Closed", detail: null, color: "default", variant: "outlined", icon: <TaskAlt /> };
    default:
      return { state: g.status.replace("_", " "), detail: null, color: "default", variant: "outlined", icon: <CheckCircle /> };
  }
}
