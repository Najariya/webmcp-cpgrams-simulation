import { Chip } from "@mui/material";
import type { SlaStatus } from "../domain/sla";
import type { Grievance } from "../domain/types";
import { appealWindowDaysLeft } from "../domain/sla";

/**
 * Status treatment — pictogram + words + color (never color-only, docs/02 + v4 §47).
 */
export default function StatusChip({ g, sla }: { g: Grievance; sla: SlaStatus }) {
  const { label, color, variant } = describe(g, sla);
  return <Chip size="small" label={label} color={color} variant={variant} sx={{ fontWeight: 600, height: 26 }} />;
}

function describe(g: Grievance, sla: SlaStatus): { label: string; color: "default" | "info" | "warning" | "success" | "secondary"; variant: "filled" | "outlined" } {
  switch (sla.phase) {
    case "within_target":
      return { label: `⚙ Day ${sla.daysElapsed ?? "?"} of ${sla.targetDays} · on track`, color: "info", variant: "outlined" };
    case "overdue":
      return sla.hasInterimReply
        ? { label: `🕐 Day ${sla.daysElapsed} · delayed, interim reply on file`, color: "warning", variant: "outlined" }
        : { label: `⚠ Day ${sla.daysElapsed} of ${sla.targetDays} · overdue, no interim response`, color: "warning", variant: "filled" };
    case "disposed":
      return { label: "✍ Disposed · your feedback pending", color: "secondary", variant: "filled" };
    case "rated":
      if (g.rating === "Poor") {
        const left = appealWindowDaysLeft(g, new Date().toISOString());
        return { label: `⚖ Rated Poor · appeal window open${left !== null ? ` (${Math.max(0, left)}d)` : ""}`, color: "secondary", variant: "filled" };
      }
      return { label: "✓ Feedback recorded · closing", color: "success", variant: "outlined" };
    case "appealed":
      return { label: "⚖ Appeal pending · ~30-day target", color: "secondary", variant: "filled" };
    case "closed":
      return { label: "✓ Closed", color: "default", variant: "outlined" };
    default:
      return { label: g.status.replace("_", " "), color: "default", variant: "outlined" };
  }
}
