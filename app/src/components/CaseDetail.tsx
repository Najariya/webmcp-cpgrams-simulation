import { useState } from "react";
import { Box, Button, Chip, Divider, Icon, Paper, Stack, Typography } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Gavel from "@mui/icons-material/Gavel";
import NotificationsActive from "@mui/icons-material/NotificationsActive";
import AttachFile from "@mui/icons-material/AttachFile";
import Schedule from "@mui/icons-material/Schedule";
import AccountBalance from "@mui/icons-material/AccountBalance";
import Description from "@mui/icons-material/Description";
import Inbox from "@mui/icons-material/Inbox";
import PendingActions from "@mui/icons-material/PendingActions";
import StarRate from "@mui/icons-material/StarRate";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Close from "@mui/icons-material/Close";
import WarningAmber from "@mui/icons-material/WarningAmber";
import TaskAlt from "@mui/icons-material/TaskAlt";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Check from "@mui/icons-material/Check";
import PageHeader from "./PageHeader";
import StatusChip from "./StatusChip";
import { useAppStore } from "../store";
import { categoryOf, ministryOf } from "../data/catalog";
import { appealEligible, rateEligible, reminderEligible, slaStatus } from "../domain/sla";
import { goi } from "../theme";
import { dict } from "../i18n";
import type { Actor, TimelineEvent, TimelineKind } from "../domain/types";

const ACTOR_COLOR: Record<Actor, string> = {
  citizen: goi.navy,
  agent: "#5B4AA0",
  ministry: "#3A6EA5",
  system: "#6B7684",
};

const KIND_ICON: Partial<Record<TimelineKind, React.ReactElement<typeof Icon>>> = {
  filed: <Description sx={{ fontSize: "0.875rem" }} />,
  received: <Inbox sx={{ fontSize: "0.875rem" }} />,
  under_process: <PendingActions sx={{ fontSize: "0.875rem" }} />,
  interim_reply: <Schedule sx={{ fontSize: "0.875rem" }} />,
  reminder: <NotificationsActive sx={{ fontSize: "0.875rem" }} />,
  disposal: <AccountBalance sx={{ fontSize: "0.875rem" }} />,
  rating: <StarRate sx={{ fontSize: "0.875rem" }} />,
  appeal_filed: <Gavel sx={{ fontSize: "0.875rem" }} />,
  appeal_disposed: <Gavel sx={{ fontSize: "0.875rem" }} />,
  note: <InfoOutlined sx={{ fontSize: "0.875rem" }} />,
};

const ACTOR_LABEL: Record<Actor, Record<"en" | "hi", string>> = {
  citizen: { en: "You", hi: "आप" },
  agent: { en: "Your agent", hi: "आपका एजेंट" },
  ministry: { en: "Ministry", hi: "मंत्रालय" },
  system: { en: "System", hi: "प्रणाली" },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function CaseDetail() {
  const { grievances, selectedGrievanceId, simNow, lang, select, setView, remind, rate, lastFiled, clearFiledNotice } = useAppStore();
  const d = dict(lang);
  const g = grievances.find((x) => x.id === selectedGrievanceId || x.regId === selectedGrievanceId);
  if (!g) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">{d.case.notFound}</Typography>
        <Button startIcon={<ArrowBack />} sx={{ mt: 2 }} onClick={() => setView("home")}>{d.case.backHome}</Button>
      </Box>
    );
  }
  const sla = slaStatus(g, simNow);
  const canRemind = reminderEligible(g, simNow);
  const canRate = rateEligible(g);
  const canAppeal = appealEligible(g, simNow);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      <Button
        size="small" startIcon={<ArrowBack />} color="inherit"
        onClick={() => { select(null); setView("status"); }}
        sx={{ alignSelf: "flex-start", color: "text.secondary", px: 0, "&:hover": { bgcolor: "transparent", color: goi.navy } }}
      >
        {d.case.backToRegister}
      </Button>

      {lastFiled && lastFiled.grievanceId === g.id && (
        <FiledBanner
          regId={lastFiled.regId}
          title={d.case.filedBannerTitle(lastFiled.regId)}
          target={d.case.filedBannerTarget}
          copyLabel={d.case.copyId}
          copiedLabel={d.common.copied}
          onClose={clearFiledNotice}
        />
      )}

      {/* Record */}
      <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: 2 }}>
        <PageHeader
          title={`Grievance ${g.regId ?? ""}`}
          sub={`${ministryOf(g.ministryId)?.nameEn ?? ""} · filed ${g.filedAt ? fmtDate(g.filedAt) : "—"}`}
          right={<StatusChip g={g} sla={sla} size="medium" />}
        />
        <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 } }}>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.4 }}>{g.subject}</Typography>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap", rowGap: 0.75, mt: 1 }}>
              <Chip size="small" variant="outlined" label={lang === "hi" ? categoryOf(g.categoryId)?.titleHi ?? categoryOf(g.categoryId)?.titleEn : categoryOf(g.categoryId)?.titleEn} sx={{ height: 24, fontSize: "0.6875rem" }} />
              {g.evidence.length > 0 && (
                <Chip size="small" variant="outlined" icon={<AttachFile sx={{ fontSize: "0.8125rem" }} />} label={d.case.evidenceItems(g.evidence.length)} sx={{ height: 22, fontSize: "0.6562rem", "& .MuiChip-icon": { ml: 0.5 } }} />
              )}
              {g.reminders.length > 0 && (
                <Chip size="small" variant="outlined" icon={<NotificationsActive sx={{ fontSize: "0.8125rem" }} />} label={d.case.remindersSent(g.reminders.length)} sx={{ height: 22, fontSize: "0.6562rem", "& .MuiChip-icon": { ml: 0.5 } }} />
              )}
            </Stack>
          </Box>

          {sla.attentionReason && (
            <Paper
              variant="outlined"
              sx={{
                p: 1.75, borderRadius: 1.5, display: "flex", gap: 1.25, alignItems: "flex-start",
                bgcolor: sla.needsAttention ? "#FDF3E7" : "#F4F7FB",
                borderColor: sla.needsAttention ? "#EBD5BC" : "#D5DFEA",
              }}
            >
              {sla.needsAttention
                ? <WarningAmber sx={{ fontSize: "1.1875rem", color: "#B45309", mt: 0.25 }} />
                : <InfoOutlined sx={{ fontSize: "1.1875rem", color: "#3A6EA5", mt: 0.25 }} />}
              <Typography className="longform" variant="body2" sx={{ fontWeight: 600, lineHeight: 1.6, color: sla.needsAttention ? "#7A4608" : "#33506E" }}>
                {sla.attentionReason}
              </Typography>
            </Paper>
          )}

          <Divider />
          <KV label={d.case.kvGrievance} body={g.description} />
          <KV label={d.case.kvRelief} body={g.reliefRequested} />
          {g.evidence.length > 0 && (
            <Box>
              <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.08em", fontSize: "0.6875rem" }}>Evidence</Typography>
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap", rowGap: 0.75, mt: 0.75 }}>
                {g.evidence.map((e) => (
                  <Chip key={e.name} size="small" variant="outlined" icon={<AttachFile sx={{ fontSize: "0.8125rem" }} />} label={e.name} sx={{ height: 24, fontSize: "0.6875rem", "& .MuiChip-icon": { ml: 0.5 } }} />
                ))}
              </Stack>
            </Box>
          )}

          {g.interimReply && <NoticeCard icon={<Schedule />} tone="amber" title={d.case.interimReply(fmtDate(g.interimReply.at))} body={g.interimReply.text} />}
          {g.disposal && (
            <NoticeCard
              icon={<AccountBalance />} tone="green" title={d.case.disposal(fmtDate(g.disposal.at))} body={g.disposal.summary}
              footer={g.rating ? d.case.yourFeedback(g.rating) : undefined}
            />
          )}
          {g.appeal && (
            <NoticeCard
              icon={<Gavel />} tone="violet" title={`Appeal · ${g.appeal.status === "PENDING" ? "pending with Nodal Appellate Authority" : "disposed"}`}
              body={`${g.appeal.grounds} — ${g.appeal.argument.slice(0, 240)}${g.appeal.argument.length > 240 ? "…" : ""}`}
            />
          )}
        </Stack>
      </Paper>

      {/* Next actions — same eligibility the WebMCP tools enforce */}
      {(canRemind || canRate || canAppeal) && (
        <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: "12px", bgcolor: "#FBFCFE" }}>
          <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.08em", fontSize: "0.6875rem" }}>
            {d.case.nextActions}
          </Typography>
          <Stack direction="row" spacing={1.25} useFlexGap sx={{ flexWrap: "wrap", rowGap: 1, mt: 1.25 }}>
            {canRemind && (
              <Button size="small" variant="contained" color="warning" startIcon={<NotificationsActive />} onClick={() => remind(g.id, false)}>
                {d.case.sendReminder}
              </Button>
            )}
            {canRate && (
              <>
                <Button size="small" variant="outlined" color="success" onClick={() => rate(g.id, "Satisfactory")}>
                  {d.case.resolved}
                </Button>
                <Button size="small" variant="outlined" onClick={() => rate(g.id, "Average")}>
                  {d.case.acceptable}
                </Button>
                <Button size="small" variant="contained" color="error" startIcon={<Gavel />} onClick={() => rate(g.id, "Poor")}>
                  {d.case.poorAppeal}
                </Button>
              </>
            )}
            {canAppeal && (
              <Button size="small" variant="contained" color="secondary" startIcon={<Gavel />} onClick={() => setView("appeal_review")}>
                {d.case.prepareAppeal}
              </Button>
            )}
          </Stack>
          <Typography className="longform" variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            {d.case.nextCaption}
          </Typography>
        </Paper>
      )}

      {/* Timeline */}
      <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: 2 }}>
        <PageHeader title={d.case.timelineTitle} sub={d.case.timelineSub} />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={0}>
            {g.timeline.map((e, i) => (
              <TimelineRow key={e.id} e={e} last={i === g.timeline.length - 1} lang={lang} />
            ))}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

function KV({ label, body }: { label: string; body: string }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" }, gap: { xs: 0.5, sm: 2 } }}>
      <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.08em", fontSize: "0.6875rem", pt: 0.5 }}>{label}</Typography>
      <Typography className="longform" variant="body2" sx={{ lineHeight: 1.75, color: "text.primary" }}>{body}</Typography>
    </Box>
  );
}

const TONES = {
  amber: { bg: "#FFFCF5", border: "#EBD5BC", color: "#8A5A00" },
  green: { bg: "#F6FAF7", border: "#CBDFD2", color: "#1A6B38" },
  violet: { bg: "#F8F7FC", border: "#DCD8EE", color: "#4A3E86" },
};

function NoticeCard({ icon, tone, title, body, footer }: {
  icon: React.ReactNode; tone: keyof typeof TONES; title: string; body: string; footer?: string;
}) {
  const t = TONES[tone];
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: t.bg, borderColor: t.border, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <Box sx={{ width: 30, height: 30, borderRadius: 1, display: "grid", placeItems: "center", bgcolor: "#fff", border: `1px solid ${t.border}`, color: t.color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.7812rem", fontWeight: 700, color: t.color, letterSpacing: "0.02em" }}>{title}</Typography>
        <Typography className="longform" variant="body2" sx={{ mt: 0.5, lineHeight: 1.65 }}>{body}</Typography>
        {footer && <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>{footer}</Typography>}
      </Box>
    </Paper>
  );
}

function TimelineRow({ e, last, lang }: { e: TimelineEvent; last: boolean; lang: "en" | "hi" }) {
  const color = ACTOR_COLOR[e.actor];
  return (
    <Stack direction="row" sx={{ minHeight: 52 }}>
      <Stack sx={{ alignItems: "center", width: 30, flexShrink: 0 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "#fff", border: `1.5px solid ${color}`, color }}>
          {KIND_ICON[e.kind] ?? <InfoOutlined sx={{ fontSize: "0.875rem" }} />}
        </Box>
        {!last && <Box sx={{ width: 1.5, flex: 1, bgcolor: "divider", my: 0.25 }} />}
      </Stack>
      <Box sx={{ pb: last ? 0 : 2, pt: 0.25, pl: 1.5, minWidth: 0 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "baseline", flexWrap: "wrap", rowGap: 0.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{e.title}</Typography>
          <Typography variant="caption" sx={{ color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {ACTOR_LABEL[e.actor][lang]} · {fmtDate(e.at)}
          </Typography>
        </Stack>
        {e.text && (
          <Typography className="longform" variant="caption" sx={{ display: "block", mt: 0.25, lineHeight: 1.6, color: "text.secondary", maxWidth: 560 }}>
            {e.text}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function FiledBanner({ regId, title, target, copyLabel, copiedLabel, onClose }: {
  regId: string; title: string; target: string; copyLabel: string; copiedLabel: string; onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Paper
      elevation={0}
      sx={{ p: 2, borderRadius: "12px", bgcolor: "#F2FAF4", border: "1px solid #BFE2C8", display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}
    >
      <TaskAlt sx={{ fontSize: 22, color: goi.green }} />
      <Box sx={{ flex: 1, minWidth: 200 }}>
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#14532D" }}>{title}</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#3D6B4C", mt: 0.25 }}>{target}</Typography>
      </Box>
      <Button
        size="small" variant="outlined" color="success"
        startIcon={copied ? <Check /> : <ContentCopy />}
        onClick={() => { navigator.clipboard?.writeText(regId); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        sx={{ fontWeight: 700 }}
      >
        {copied ? copiedLabel : copyLabel}
      </Button>
      <Button size="small" color="inherit" onClick={onClose} aria-label="Dismiss" sx={{ minWidth: 32, p: 0.5, color: "#3D6B4C" }}>
        <Close sx={{ fontSize: "1.125rem" }} />
      </Button>
    </Paper>
  );
}
