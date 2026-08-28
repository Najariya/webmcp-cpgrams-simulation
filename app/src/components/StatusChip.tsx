import { Chip, Icon } from "@mui/material";
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

/**
 * Status treatment — icon + words + color (never color-only), one consistent
 * chip grammar across register table, case cards and detail header.
 */
export default function StatusChip({ g, sla, size = "small" }: { g: Grievance; sla: SlaStatus; size?: "small" | "medium" }) {
  const { label, color, variant, icon } = describe(g, sla);
  return <Chip size={size} label={label} color={color} variant={variant} icon={icon} sx={{ fontWeight: 600, height: 28, "& .MuiChip-icon": { fontSize: 17, ml: 0.75 } }} />;
}

function describe(g: Grievance, sla: SlaStatus): {
  label: string;
  color: "default" | "info" | "warning" | "success" | "secondary";
  variant: "filled" | "outlined";
  icon: React.ReactElement<typeof Icon>;
} {
  switch (sla.phase) {
    case "within_target":
      return { label: `Day ${sla.daysElapsed ?? "?"} of ${sla.targetDays} · on track`, color: "info", variant: "outlined", icon: <Schedule /> };
    case "overdue":
      return sla.hasInterimReply
        ? { label: `Day ${sla.daysElapsed} · delayed, interim reply on file`, color: "warning", variant: "outlined", icon: <HourglassBottom /> }
        : { label: `Day ${sla.daysElapsed} of ${sla.targetDays} · overdue, no interim response`, color: "warning", variant: "filled", icon: <WarningAmber /> };
    case "disposed":
      return { label: "Disposed · feedback pending", color: "secondary", variant: "filled", icon: <RateReview /> };
    case "rated":
      if (g.rating === "Poor") {
        const left = appealWindowDaysLeft(g, new Date().toISOString());
        return { label: `Rated Poor · appeal open ${left !== null ? `${Math.max(0, left)}d` : ""}`.trim(), color: "secondary", variant: "filled", icon: <Gavel /> };
      }
      return { label: "Feedback recorded", color: "success", variant: "outlined", icon: <TaskAlt /> };
    case "appealed":
      return { label: "Appeal pending · 30-day target", color: "secondary", variant: "filled", icon: <Gavel /> };
    case "closed":
      return { label: "Closed", color: "default", variant: "outlined", icon: <TaskAlt /> };
    default:
      return { label: g.status.replace("_", " "), color: "default", variant: "outlined", icon: <CheckCircle /> };
  }
}
