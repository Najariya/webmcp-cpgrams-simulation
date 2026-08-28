import { Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Gavel from "@mui/icons-material/Gavel";
import NotificationsActive from "@mui/icons-material/NotificationsActive";
import RateReview from "@mui/icons-material/RateReview";
import { useAppStore } from "../store";
import { categoryOf, ministryOf } from "../data/catalog";
import { appealEligible, rateEligible, reminderEligible, slaStatus } from "../domain/sla";
import StatusChip from "./StatusChip";
import type { Actor, TimelineEvent } from "../domain/types";

const ACTOR_COLOR: Record<Actor, string> = {
  citizen: "#0F6B5C",
  agent: "#6750A4",
  ministry: "#3B82C4",
  system: "#7D8C99",
};

const KIND_ICON: Record<string, string> = {
  filed: "📝",
  received: "📥",
  under_process: "⚙️",
  interim_reply: "🕐",
  reminder: "🔔",
  disposal: "🏛️",
  rating: "⭐",
  appeal_filed: "⚖️",
  appeal_disposed: "⚖️",
  note: "📌",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function CaseDetail() {
  const { grievances, selectedGrievanceId, simNow, select, setView, remind, rate } = useAppStore();
  const g = grievances.find((x) => x.id === selectedGrievanceId || x.regId === selectedGrievanceId);
  if (!g) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Case not found.</Typography>
        <Button startIcon={<ArrowBack />} sx={{ mt: 2 }} onClick={() => setView("home")}>Back to my cases</Button>
      </Box>
    );
  }
  const sla = slaStatus(g, simNow);
  const canRemind = reminderEligible(g, simNow);
  const canRate = rateEligible(g);
  const canAppeal = appealEligible(g, simNow);

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", width: 1, p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
        <Button size="small" startIcon={<ArrowBack />} onClick={() => { select(null); setView("home"); }} color="inherit" sx={{ color: "text.secondary" }}>
          My cases
        </Button>
      </Stack>

      <Paper elevation={1} sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: "text.secondary" }}>
            {g.regId}
          </Typography>
          <StatusChip g={g} sla={sla} />
        </Stack>
        <Typography variant="h6" sx={{ lineHeight: 1.35 }}>{g.subject}</Typography>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap", rowGap: 0.75 }}>
          <Chip size="small" label={`🏛 ${ministryOf(g.ministryId)?.nameEn}`} variant="outlined" sx={{ height: 26, fontSize: 11.5 }} />
          <Chip size="small" label={categoryOf(g.categoryId)?.titleEn} variant="outlined" sx={{ height: 26, fontSize: 11.5 }} />
          {g.filedAt && <Chip size="small" label={`Filed ${fmtDate(g.filedAt)}`} variant="outlined" sx={{ height: 26, fontSize: 11.5 }} />}
        </Stack>

        {sla.attentionReason && (
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: sla.needsAttention ? "warning.main" : "transparent", borderColor: sla.needsAttention ? undefined : "divider" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: sla.needsAttention ? "#fff" : "text.primary", lineHeight: 1.5 }}>
              {sla.attentionReason}
            </Typography>
          </Paper>
        )}

        <Divider />
        <Box>
          <Typography variant="subtitle2" gutterBottom>Grievance</Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.65, color: "text.primary" }}>{g.description}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" gutterBottom>Relief requested</Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{g.reliefRequested}</Typography>
        </Box>
        {g.evidence.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Evidence</Typography>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap", rowGap: 0.75 }}>
              {g.evidence.map((e) => (
                <Chip key={e.name} size="small" variant="outlined" label={`📎 ${e.name}`} sx={{ height: 26, fontSize: 11 }} />
              ))}
            </Stack>
          </Box>
        )}
        {g.interimReply && (
          <Paper variant="outlined" sx={{ p: 1.75, bgcolor: "#FFFBF2", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "warning.dark" }}>🕐 Interim reply · {fmtDate(g.interimReply.at)}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>{g.interimReply.text}</Typography>
          </Paper>
        )}
        {g.disposal && (
          <Paper variant="outlined" sx={{ p: 1.75, bgcolor: "#F4FAF6", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "success.dark" }}>🏛 Disposal · {fmtDate(g.disposal.at)}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>{g.disposal.summary}</Typography>
            {g.rating && <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>Your feedback: {g.rating}</Typography>}
          </Paper>
        )}
        {g.appeal && (
          <Paper variant="outlined" sx={{ p: 1.75, bgcolor: "#F6F3FB", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "#6750A4" }}>⚖ Appeal · {g.appeal.status === "PENDING" ? "pending with Nodal Appellate Authority" : "disposed"}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>{g.appeal.grounds} — {g.appeal.argument.slice(0, 220)}{g.appeal.argument.length > 220 ? "…" : ""}</Typography>
          </Paper>
        )}
      </Paper>

      {/* Next actions — same eligibility the WebMCP tools enforce */}
      {(canRemind || canRate || canAppeal) && (
        <Paper elevation={0} variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Next actions available to you and your agent</Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", rowGap: 1 }}>
            {canRemind && (
              <Button size="small" variant="contained" color="warning" startIcon={<NotificationsActive />} onClick={() => remind(g.id, false)}>
                Send reminder
              </Button>
            )}
            {canRate && (
              <>
                {(["Satisfactory", "Average", "Poor"] as const).map((r) => (
                  <Button key={r} size="small" variant={r === "Poor" ? "contained" : "outlined"} color={r === "Poor" ? "error" : r === "Satisfactory" ? "success" : "inherit"} startIcon={r === "Poor" ? undefined : <RateReview />} onClick={() => rate(g.id, r)}>
                    {r === "Satisfactory" ? "👍 Resolved" : r === "Average" ? "👌 Acceptable" : "👎 Poor — I want to appeal"}
                  </Button>
                ))}
              </>
            )}
            {canAppeal && (
              <Button size="small" variant="contained" color="secondary" startIcon={<Gavel />} onClick={() => setView("appeal_review")}>
                Prepare appeal
              </Button>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Your agent sees these same actions as WebMCP tools — and consequential ones always ask you first.
          </Typography>
        </Paper>
      )}

      {/* Timeline */}
      <Paper elevation={1} sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Movement timeline</Typography>
        <Stack spacing={0}>
          {g.timeline.map((e, i) => (
            <TimelineRow key={e.id} e={e} last={i === g.timeline.length - 1} />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

function TimelineRow({ e, last }: { e: TimelineEvent; last: boolean }) {
  return (
    <Stack direction="row" sx={{ minHeight: 56 }}>
      <Stack sx={{ alignItems: "center", width: 34, flexShrink: 0 }}>
        <Box sx={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: `${ACTOR_COLOR[e.actor]}14`, border: `1.5px solid ${ACTOR_COLOR[e.actor]}`, fontSize: 12 }}>
          {KIND_ICON[e.kind] ?? "•"}
        </Box>
        {!last && <Box sx={{ width: 1.5, flex: 1, bgcolor: "divider", my: 0.25 }} />}
      </Stack>
      <Box sx={{ pb: last ? 0 : 2.25, pt: 0.25, pl: 0.75 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", flexWrap: "wrap" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{e.title}</Typography>
          <Typography variant="caption" sx={{ color: ACTOR_COLOR[e.actor], fontWeight: 600 }}>
            {e.actor === "citizen" ? "you" : e.actor === "agent" ? "your agent" : e.actor === "ministry" ? "ministry" : "system"} · {fmtDate(e.at)}
          </Typography>
        </Stack>
        {e.text && (
          <Typography variant="caption" sx={{ display: "block", mt: 0.25, lineHeight: 1.5, color: "text.secondary", maxWidth: 560 }}>
            {e.text}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
