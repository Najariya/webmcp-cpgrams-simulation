import { Box, Card, CardActionArea, Chip, Paper, Stack, Typography } from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import EditNote from "@mui/icons-material/EditNote";
import FactCheck from "@mui/icons-material/FactCheck";
import LoginIcon from "@mui/icons-material/Login";
import SmartToy from "@mui/icons-material/SmartToy";
import Campaign from "@mui/icons-material/Campaign";
import { useAppStore } from "../store";
import { goi } from "../theme";
import { slaStatus } from "../domain/sla";

const HERO_PROMPT = "Which of my grievances needs attention today?";

export default function GovHome() {
  const { grievances, simNow, citizen, setView } = useAppStore();
  const attention = grievances.filter((g) => slaStatus(g, simNow).needsAttention).length;
  const copy = (t: string) => navigator.clipboard?.writeText(t);

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Statutory notice strip */}
      <Paper
        elevation={0}
        sx={{ px: 2, py: 1.25, display: "flex", gap: 1.5, alignItems: "center", bgcolor: "#FFF9EE", border: "1px solid #EDDCBF", borderRadius: 1.5 }}
      >
        <Campaign sx={{ fontSize: 19, color: goi.alertAmber, flexShrink: 0 }} />
        <Typography className="longform" sx={{ fontSize: 12.5, lineHeight: 1.55, color: "#6B4E0E" }}>
          <strong>Labelled simulation</strong> for the WebMCP Challenge — nothing is submitted to any government system. Inspired by
          the CPGRAMS lifecycle; not affiliated with the Government of India.{" "}
          <Box component="span" sx={{ opacity: 0.7 }}>· यह एक प्रदर्शन सिमुलेशन है।</Box>
        </Typography>
      </Paper>

      {/* Action cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
        {citizen ? (
          <ActionCard
            icon={<FactCheck />} title="View Status" hi="स्थिति देखें"
            desc="Track grievances, SLA clocks, reminders, feedback and appeals."
            badge={attention ? `${attention} need attention` : `${grievances.length} cases`}
            onClick={() => setView("status")}
          />
        ) : (
          <ActionCard
            icon={<LoginIcon />} title="Register / Login" hi="पंजीकरण / लॉगिन"
            desc="Sign in (simulated) to lodge and track grievances, rate disposals and appeal."
            onClick={() => setView("login")}
          />
        )}
        <ActionCard
          icon={<EditNote />} title="Lodge Grievance" hi="शिकायत दर्ज करें"
          desc="File a service-delivery grievance to a Central Ministry. 21-day redressal target."
          onClick={() => setView(citizen ? "lodge" : "login")}
        />
        <ActionCard
          icon={<SmartToy />} title="Your Browser Agent" hi="आपका एजेंट"
          desc="This portal also speaks WebMCP — your agent tracks, explains and acts, with your confirmation."
          onClick={() => setView("transparency")}
          accent
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, gap: 2, alignItems: "start" }}>
        {/* About */}
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: "12px" }}>
          <SectionTitle>About CPGRAMS · सीपीग्राम्स</SectionTitle>
          <Typography className="longform" variant="body2" sx={{ lineHeight: 1.8, color: "text.primary", mt: 2, maxWidth: "68ch" }}>
            CPGRAMS is the Government of India's centralized portal for public grievances related to service delivery,
            linked to all Central Ministries and Departments. Every grievance receives a unique registration ID; the
            redressal target is <strong>21 days</strong>, with a mandatory <strong>interim reply</strong> when redressal
            is delayed. After disposal, citizens rate the outcome — a <strong>Poor</strong> rating opens the{" "}
            <strong>appeal</strong> option for 30 days before the ministry's Nodal Appellate Authority.
          </Typography>
          <Box component="ul" sx={{ pl: 2.25, mt: 1.75, mb: 0 }}>
            {[
              "Not taken up: RTI matters, sub-judice matters, religious matters, service matters of government employees.",
              "Grievances sent by email are not entertained — use the portal or your agent.",
              "No fee is charged for lodging a grievance.",
            ].map((t) => (
              <Typography className="longform" component="li" key={t} variant="body2" sx={{ lineHeight: 1.75, color: "text.secondary", mb: 0.5, "&::marker": { color: goi.saffron } }}>
                {t}
              </Typography>
            ))}
          </Box>
        </Paper>

        <Stack spacing={2}>
          {/* Agent assist — compact: one prompt, one hint */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", bgcolor: goi.navy, color: "#fff" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
              <SmartToy sx={{ fontSize: 15, opacity: 0.9 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", opacity: 0.9 }}>
                Ask your agent
              </Typography>
            </Stack>
            <Paper
              elevation={0}
              onClick={() => copy(HERO_PROMPT)}
              sx={{ p: 1.25, bgcolor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 1.5, cursor: "pointer", transition: "background-color .15s", "&:hover": { bgcolor: "rgba(255,255,255,0.16)" } }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.45, flex: 1 }}>
                  “{HERO_PROMPT}”
                </Typography>
                <ContentCopy sx={{ fontSize: 14, opacity: 0.7 }} />
              </Stack>
            </Paper>
            <Typography variant="caption" sx={{ display: "block", opacity: 0.65, mt: 1.25, lineHeight: 1.5 }}>
              Paste in ChatGPT's browser or Chrome (WebMCP). More prompts on{" "}
              <Box component="span" sx={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => setView("transparency")}>Agent Tools</Box>.
            </Typography>
          </Paper>

          {/* What's new */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px" }}>
            <SectionTitle>What's New · नई जानकारी</SectionTitle>
            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {[
                ["28 Aug 2026", "Agent-assisted grievance tracking added (WebMCP prototype)"],
                ["30 May 2026", "CPGRAMS launched 'Samadhan Didi' AI voice chatbot for multilingual intake"],
                ["2022", "CPGRAMS reforms tightened redressal to a 21-day expectation"],
              ].map(([d, t]) => (
                <Stack key={d} direction="row" spacing={1.5} sx={{ alignItems: "baseline" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: goi.link, minWidth: 74, fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{d}</Typography>
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
    <Typography component="h2" sx={{ fontSize: 12.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", color: goi.navy, display: "flex", alignItems: "center", gap: 1.25 }}>
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
            <Chip size="small" label={badge} sx={{ ml: "auto", bgcolor: "#EBF2EE", color: goi.green, fontSize: 10.5, height: 21, fontWeight: 700 }} />
          )}
        </Stack>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25, display: "flex", alignItems: "baseline", gap: 1 }}>
            {title}
            <Typography component="span" variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>{hi}</Typography>
          </Typography>
        </Box>
        <Typography className="longform" variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6, fontSize: 12.5 }}>{desc}</Typography>
      </CardActionArea>
    </Card>
  );
}
