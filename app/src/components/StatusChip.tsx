import { Chip, Icon, Typography } from "@mui/material";
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
 * Status treatment — icon + words + color (never color-only), one consistent
 * chip grammar across register table, case cards and detail header.
 */
export default function StatusChip({ g, sla, size = "small" }: { g: Grievance; sla: SlaStatus; size?: "small" | "medium" }) {
  const lang = useAppStore((s) => s.lang);
  const { label, color, variant, icon } = describe(g, sla, lang);
  return <Chip size={size} label={<Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{label}</Typography>} color={color} variant={variant} icon={icon} sx={{ height: 28, maxWidth: "100%", "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis", display: "block", whiteSpace: "normal", lineHeight: 1.3, py: 0.25 }, "& .MuiChip-icon": { fontSize: "1.0625rem", ml: 0.75 } }} />;
}

function describe(g: Grievance, sla: SlaStatus, lang: "en" | "hi"): {
  label: string;
  color: "default" | "info" | "warning" | "success" | "secondary";
  variant: "filled" | "outlined";
  icon: React.ReactElement<typeof Icon>;
} {
  const hi = lang === "hi";
  switch (sla.phase) {
    case "within_target":
      return {
        label: hi ? `दिन ${sla.daysElapsed ?? "?"} / ${sla.targetDays} · सही रफ़्तार` : `Day ${sla.daysElapsed ?? "?"} of ${sla.targetDays} · on track`,
        color: "info", variant: "outlined", icon: <Schedule />,
      };
    case "overdue":
      return sla.hasInterimReply
        ? {
            label: hi ? `दिन ${sla.daysElapsed} · देरी, अंतरिम उत्तर दर्ज` : `Day ${sla.daysElapsed} · delayed, interim reply on file`,
            color: "warning", variant: "outlined", icon: <HourglassBottom />,
          }
        : {
            label: hi ? `दिन ${sla.daysElapsed} / ${sla.targetDays} · समय-सीमा पार, अंतरिम उत्तर नहीं` : `Day ${sla.daysElapsed} of ${sla.targetDays} · overdue, no interim response`,
            color: "warning", variant: "filled", icon: <WarningAmber />,
          };
    case "disposed":
      return {
        label: hi ? "निस्तारित · राय शेष" : "Disposed · feedback pending",
        color: "secondary", variant: "filled", icon: <RateReview />,
      };
    case "rated":
      if (g.rating === "Poor") {
        const left = appealWindowDaysLeft(g, new Date().toISOString());
        return {
          label: hi ? `खराब राय · अपील खुली ${left !== null ? `${Math.max(0, left)} दि.` : ""}`.trim() : `Rated Poor · appeal open ${left !== null ? `${Math.max(0, left)}d` : ""}`.trim(),
          color: "secondary", variant: "filled", icon: <Gavel />,
        };
      }
      return {
        label: hi ? "राय दर्ज" : "Feedback recorded",
        color: "success", variant: "outlined", icon: <TaskAlt />,
      };
    case "appealed":
      return {
        label: hi ? "अपील लंबित · 30 दिन का लक्ष्य" : "Appeal pending · 30-day target",
        color: "secondary", variant: "filled", icon: <Gavel />,
      };
    case "closed":
      return { label: hi ? "बंद" : "Closed", color: "default", variant: "outlined", icon: <TaskAlt /> };
    default:
      return { label: g.status.replace("_", " "), color: "default", variant: "outlined", icon: <CheckCircle /> };
  }
}
