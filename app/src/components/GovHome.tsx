import { useState } from "react";
import { Box, Button, Card, CardActionArea, Chip, Paper, Stack, Typography } from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import EditNote from "@mui/icons-material/EditNote";
import FactCheck from "@mui/icons-material/FactCheck";
import LoginIcon from "@mui/icons-material/Login";
import SmartToy from "@mui/icons-material/SmartToy";
import Campaign from "@mui/icons-material/Campaign";
import HelpOutline from "@mui/icons-material/HelpOutlineOutlined";
import Close from "@mui/icons-material/Close";
import Check from "@mui/icons-material/Check";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { registrar } from "../webmcp/registrar";
import { useAppStore } from "../store";
import { goi } from "../theme";
import { slaStatus } from "../domain/sla";
import { dict } from "../i18n";

const AGENT_PROMPTS = [
  "Which of my grievances needs attention today?",
  "Help me file a grievance about my problem.",
  "Explain the status of my case in simple words.",
];

const NOTICE_KEY = "advocate-notice-v1";

export default function GovHome() {
  const { grievances, simNow, citizen, lang, setView, goOrSignIn } = useAppStore();
  const d = dict(lang);
  const [noticeOpen, setNoticeOpen] = useState(() => {
    try {
      return localStorage.getItem(NOTICE_KEY) !== "dismissed";
    } catch {
      return true;
    }
  });
  const dismissNotice = () => {
    try {
      localStorage.setItem(NOTICE_KEY, "dismissed");
    } catch {
      /* storage unavailable — stays open for this session */
    }
    setNoticeOpen(false);
  };
  const attention = grievances.filter((g) => slaStatus(g, simNow).needsAttention).length;
  const news = [
    ["28 Aug 2026", d.home.news1],
    ["30 May 2026", d.home.news2],
    ["2022", d.home.news3],
  ] as const;

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Single merged simulation notice (dismissble; header SIMULATION badge always remains) */}
      {noticeOpen && (
        <Paper
          elevation={0}
          sx={{ px: 2, py: 1.25, display: "flex", gap: 1.5, alignItems: "center", bgcolor: "#FFF9EE", border: "1px solid #EDDCBF", borderRadius: 1.5 }}
        >
          <Campaign sx={{ fontSize: "1.1875rem", color: goi.alertAmber, flexShrink: 0 }} />
          <Typography className="longform" sx={{ fontSize: "0.7812rem", lineHeight: 1.55, color: "#6B4E0E", flex: 1 }}>
            <strong>{d.home.noticeStrong}</strong> {d.home.noticeRest}{" "}
            {registrar.available ? d.banner.on : d.banner.off}
          </Typography>
          <Button size="small" onClick={dismissNotice} aria-label="Dismiss notice" sx={{ minWidth: 28, p: 0.5, color: "#8A5A00" }}>
            <Close sx={{ fontSize: "1.125rem" }} />
          </Button>
        </Paper>
      )}

      {/* Plain-language explainer */}
      <Accordion elevation={0} disableGutters sx={{ border: "1px solid #D8DFE8", borderRadius: "8px !important", "&:before": { display: "none" } }}>
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 44, "& .MuiAccordionSummary-content": { my: 0.5 } }}>
          <HelpOutline sx={{ fontSize: "1.0625rem", color: goi.navy, mr: 1.25 }} />
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: goi.navy }}>{d.home.explainerTitle} · ब्राउज़र एजेंट क्या है?</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Typography className="longform" variant="body2" sx={{ lineHeight: 1.7, color: "text.secondary" }}>
            {d.home.explainerBody1}
          </Typography>
          <Typography className="longform" variant="body2" sx={{ lineHeight: 1.7, color: "text.secondary", mt: 1 }}>
            {d.home.explainerBody2}
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Action cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
        {citizen ? (
          <ActionCard
            icon={<FactCheck />} title="View Status" hi="स्थिति देखें"
            desc={d.home.cardStatusDesc}
            badge={attention ? d.home.cardStatusBadge(attention) : d.home.cases(grievances.length)}
            onClick={() => goOrSignIn("status")}
          />
        ) : (
          <ActionCard
            icon={<LoginIcon />} title="Register / Login" hi="पंजीकरण / लॉगिन"
            desc={d.home.cardStatusDesc}
            onClick={() => setView("login")}
          />
        )}
        <ActionCard
          icon={<EditNote />} title="Lodge Grievance" hi="शिकायत दर्ज करें"
          desc={d.home.cardLodgeDesc}
          onClick={() => goOrSignIn("lodge")}
        />
        <ActionCard
          icon={<SmartToy />} title="Your Browser Agent" hi="आपका एजेंट"
          desc={d.home.cardAgentDesc}
          onClick={() => setView("transparency")}
          accent
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, gap: 2, alignItems: "start" }}>
        {/* About */}
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: "12px" }}>
          <SectionTitle>About CPGRAMS · सीपीग्राम्स</SectionTitle>
          <Typography className="longform" variant="body2" sx={{ lineHeight: 1.8, color: "text.primary", mt: 2, maxWidth: "68ch" }}>
            {d.home.aboutPara1}
            <strong>{d.home.aboutPara2}</strong>
            {d.home.aboutPara3}
            <strong>{d.home.aboutPara4}</strong>
            {d.home.aboutPara5}
            <strong>{d.home.aboutPara6}</strong>
            {d.home.aboutPara7}
            <strong>{d.home.aboutPara8}</strong>
            {d.home.aboutPara9}
          </Typography>
          <Box component="ul" sx={{ pl: 2.25, mt: 1.75, mb: 0 }}>
            {[d.home.bullet1, d.home.bullet2, d.home.bullet3].map((t) => (
              <Typography className="longform" component="li" key={t} variant="body2" sx={{ lineHeight: 1.75, color: "text.secondary", mb: 0.5, "&::marker": { color: goi.saffron } }}>
                {t}
              </Typography>
            ))}
          </Box>
        </Paper>

        <Stack spacing={2}>
          {/* Agent assist — compact: one prompt, one hint */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", bgcolor: goi.navy, color: "#fff" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
              <SmartToy sx={{ fontSize: 16, color: "#FFB37E" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                {d.home.askAgent}
              </Typography>
            </Stack>
            <Stack spacing={0.75}>
              {AGENT_PROMPTS.map((p) => (
                <PromptChip key={p} text={p} copiedLabel={d.common.copied} copyLabel={d.common.copy} />
              ))}
            </Stack>
            <Typography className="longform" variant="caption" sx={{ display: "block", opacity: 0.85, mt: 1.25, lineHeight: 1.55 }}>
              {d.home.askAgentCaption}{" "}
              <Box component="span" sx={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => setView("transparency")}>{d.home.askAgentLink}</Box>.
            </Typography>
          </Paper>

          {/* What's new */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px" }}>
            <SectionTitle>What's New · नई जानकारी</SectionTitle>
            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {news.map(([date, t]) => (
                <Stack key={date} direction="row" spacing={1.5} sx={{ alignItems: "baseline" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: goi.link, minWidth: 74, fontSize: "0.75rem", fontVariantNumeric: "tabular-nums" }}>{date}</Typography>
                  <Typography variant="caption" sx={{ lineHeight: 1.55, color: "text.primary" }}>{t}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography component="h2" sx={{ fontSize: "0.7812rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", color: goi.navy, display: "flex", alignItems: "center", gap: 1.25 }}>
      {children}
      <Box sx={{ flex: 1, height: 2, bgcolor: "#E8EDF3", borderRadius: 1, maxWidth: 120 }} />
    </Typography>
  );
}

function ActionCard({
  icon, title, hi, desc, badge, onClick, accent,
}: { icon: React.ReactNode; title: string; hi: string; desc: string; badge?: string; onClick: () => void; accent?: boolean }) {
  return (
    <Card elevation={0} sx={{ borderRadius: "12px", ...(accent ? { border: "1px solid #C9D8EC", bgcolor: "#F5F8FC" } : {}) }}>
      <CardActionArea onClick={onClick} sx={{ p: 2.5, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, minHeight: 148, height: "100%" }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1.25, width: 1 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: "10px", display: "grid", placeItems: "center", bgcolor: "rgba(11,47,99,0.07)", color: goi.navy }}>
            {icon}
          </Box>
          {badge && (
            <Chip size="small" label={badge} sx={{ ml: "auto", bgcolor: "#EBF2EE", color: goi.green, fontSize: "0.75rem", height: 22, fontWeight: 700 }} />
          )}
        </Stack>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.25, display: "flex", alignItems: "baseline", gap: 1 }}>
            {title}
            <Typography component="span" variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>{hi}</Typography>
          </Typography>
        </Box>
        <Typography className="longform" variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6, fontSize: "0.7812rem" }}>{desc}</Typography>
      </CardActionArea>
    </Card>
  );
}

function PromptChip({ text, copyLabel, copiedLabel }: { text: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Paper
      elevation={0}
      component="button"
      onClick={copy}
      aria-label={`${copyLabel}: ${text}`}
      sx={{ p: 1.25, display: "flex", gap: 1, alignItems: "center", width: 1, textAlign: "left", bgcolor: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.32)", borderRadius: 1.5, cursor: "pointer", transition: "background-color .15s", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, "&:focus-visible": { outline: "2px solid #FFB37E" } }}
    >
      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.45, flex: 1, color: "#fff" }}>
        “{text}”
      </Typography>
      {copied ? (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "#A8E6B0" }}>
          <Check sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#A8E6B0" }}>{copiedLabel}</Typography>
        </Stack>
      ) : (
        <ContentCopy sx={{ fontSize: 14, opacity: 0.85 }} />
      )}
    </Paper>
  );
}
