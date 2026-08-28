import { Box, Card, CardActionArea, Chip, Paper, Stack, Typography } from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import EditNote from "@mui/icons-material/EditNote";
import FactCheck from "@mui/icons-material/FactCheck";
import LoginIcon from "@mui/icons-material/Login";
import SmartToy from "@mui/icons-material/SmartToy";
import { useAppStore } from "../store";
import { goi } from "../theme";
import { slaStatus } from "../domain/sla";

const HERO_PROMPT = "Which of my grievances needs attention today?";

const PROMPTS = [
  "Help me file a grievance about this issue.",
  HERO_PROMPT,
  "Why is this grievance delayed and what can I do?",
  "I don't agree with this disposal. What options do I have?",
  "What actions can you currently perform on this website?",
];

export default function GovHome() {
  const { grievances, simNow, citizen, setView } = useAppStore();
  const attention = grievances.filter((g) => slaStatus(g, simNow).needsAttention).length;
  const copy = (t: string) => navigator.clipboard?.writeText(t);

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Statutory-style alert strip, like the portal's email notice */}
      <Paper elevation={0} sx={{ bgcolor: "#FFF7E8", border: `1px solid #F0D9B5`, px: 2, py: 1.25, display: "flex", gap: 1.25, alignItems: "flex-start" }}>
        <Typography sx={{ color: goi.alertAmber, fontWeight: 800, fontSize: 15, lineHeight: 1 }}>!</Typography>
        <Typography sx={{ fontSize: 13, lineHeight: 1.55, color: "#5A4310" }}>
          This is a <strong>labelled simulation</strong> for the WebMCP Challenge — no grievance is actually submitted to any
          government system. Inspired by the CPGRAMS lifecycle; not affiliated with the Government of India. · यह एक
          प्रदर्शन सिमुलेशन है।
        </Typography>
      </Paper>

      {/* Action cards — the portal's Register/Login · Lodge · View Status trio */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
        {citizen ? (
          <ActionCard
            icon={<FactCheck />}
            title="View Status · स्थिति देखें"
            desc="Track your grievances, SLA clocks, reminders, feedback and appeals."
            badge={attention ? `${attention} need attention` : `${grievances.length} cases`}
            onClick={() => setView("status")}
          />
        ) : (
          <ActionCard
            icon={<LoginIcon />}
            title="Register / Login · पंजीकरण / लॉगिन"
            desc="Sign in (simulated) to lodge and track grievances, rate disposals and appeal."
            onClick={() => setView("login")}
          />
        )}
        <ActionCard
          icon={<EditNote />}
          title="Lodge Public Grievance · शिकायत दर्ज करें"
          desc="File a service-delivery grievance to a Central Ministry. 21-day redressal target."
          onClick={() => setView(citizen ? "lodge" : "login")}
        />
        <ActionCard
          icon={<SmartToy />}
          title="Your Browser Agent · आपका एजेंट"
          desc="This portal also speaks WebMCP: your own agent can track, explain, remind and help appeal — with your confirmation."
          onClick={() => setView("transparency")}
          accent
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.55fr 1fr" }, gap: 2, alignItems: "start" }}>
        {/* About — mirrors the portal's About CPGRAMS block */}
        <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
          <SectionTitle>About CPGRAMS · सीपीग्राम्स के बारे में</SectionTitle>
          <Typography variant="body2" sx={{ lineHeight: 1.75, color: "text.primary", mt: 1 }}>
            CPGRAMS is the Government of India's centralized portal for public grievances related to service delivery,
            linked to all Central Ministries/Departments and States/UTs. Every grievance receives a unique registration
            ID; the redressal target is <strong>21 days</strong>, with a mandatory <strong>interim reply</strong> when
            redressal is delayed. After disposal, citizens rate the outcome — a <strong>Poor</strong> rating opens the
            <strong> appeal</strong> option for 30 days before the ministry's Nodal Appellate Authority.
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, mt: 1.25 }}>
            {[
              "Not taken up: RTI matters, sub-judice matters, religious matters, service matters of government employees.",
              "Grievances sent by email are not entertained — use the portal or your agent.",
              "No fee is charged for lodging a grievance.",
            ].map((t) => (
              <Typography component="li" key={t} variant="body2" sx={{ lineHeight: 1.7, color: "text.secondary", mb: 0.25 }}>
                {t}
              </Typography>
            ))}
          </Box>
        </Paper>

        {/* What's new + agent prompt rail */}
        <Stack spacing={2}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <SectionTitle>What's New · नई जानकारी</SectionTitle>
            {[
              ["28 Aug 2026", "Agent-assisted grievance tracking added (WebMCP prototype)"],
              ["30 May 2026", "Real CPGRAMS launched 'Samadhan Didi' AI voice chatbot for multilingual intake"],
              ["2022", "CPGRAMS reforms tightened redressal to a 21-day expectation"],
            ].map(([d, t]) => (
              <Stack key={d} direction="row" sx={{ gap: 1.25, py: 0.75, borderBottom: "1px dashed", borderColor: "divider", "&:last-of-type": { borderBottom: 0 } }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: goi.link, minWidth: 78 }}>{d}</Typography>
                <Typography variant="caption" sx={{ lineHeight: 1.5, color: "text.primary" }}>{t}</Typography>
              </Stack>
            ))}
          </Paper>

          <Paper elevation={1} sx={{ p: 2, bgcolor: "#F5F8FD", borderColor: "#C7D8EF" }}>
            <SectionTitle>Ask your agent · अपने एजेंट से पूछें</SectionTitle>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
              In ChatGPT's browser or Chrome (WebMCP enabled), paste:
            </Typography>
            <Box
              onClick={() => copy(HERO_PROMPT)}
              sx={{ border: `1px dashed ${goi.link}`, bgcolor: "#fff", borderRadius: 1, px: 1.5, py: 1, cursor: "pointer", mb: 1.25 }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: goi.link }}>
                “{HERO_PROMPT}” <ContentCopy sx={{ fontSize: 13, verticalAlign: "middle", opacity: 0.6 }} />
              </Typography>
            </Box>
            <Stack spacing={0.5}>
              {PROMPTS.slice(0, 2).concat(PROMPTS.slice(3)).map((p) => (
                <Typography
                  key={p}
                  onClick={() => copy(p)}
                  sx={{ fontSize: 11.5, color: "text.secondary", cursor: "pointer", "&:hover": { color: goi.link } }}
                >
                  › {p}
                </Typography>
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
    <Typography sx={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: goi.navy, pb: 0.75, borderBottom: `2px solid ${goi.saffron}`, display: "inline-block" }}>
      {children}
    </Typography>
  );
}

function ActionCard({
  icon, title, desc, badge, onClick, accent,
}: { icon: React.ReactNode; title: string; desc: string; badge?: string; onClick: () => void; accent?: boolean }) {
  return (
    <Card elevation={1} sx={{ borderRadius: 2, ...(accent ? { border: `1px solid #C7D8EF`, bgcolor: "#F5F8FD" } : {}) }}>
      <CardActionArea onClick={onClick} sx={{ p: 2.25, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.75, minHeight: 150, height: "100%" }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1, width: 1 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: 1, display: "grid", placeItems: "center", bgcolor: accent ? goi.navy : "rgba(11,47,99,0.08)", color: accent ? "#fff" : goi.navy }}>
            {icon}
          </Box>
          {badge && <Chip size="small" label={badge} sx={{ ml: "auto", bgcolor: accent ? "#E3ECF9" : "rgba(26,122,60,0.1)", color: accent ? goi.navy : goi.green, fontSize: 10.5, height: 20 }} />}
        </Stack>
        <Typography sx={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.3 }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.55 }}>{desc}</Typography>
      </CardActionArea>
    </Card>
  );
}
