import { Box, Button, Card, CardActionArea, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import ArrowForward from "@mui/icons-material/ArrowForward";
import RestartAlt from "@mui/icons-material/RestartAlt";
import { useAppStore } from "../store";
import { ministryOf, categoryOf } from "../data/catalog";
import { slaStatus } from "../domain/sla";
import StatusChip from "./StatusChip";

const HERO_PROMPT = "Which of my grievances needs attention today?";

const PROMPTS = [
  "Help me file a grievance about this issue.",
  HERO_PROMPT,
  "Why is this grievance delayed and what can I do?",
  "Was this grievance actually resolved?",
  "I don't agree with this disposal. What options do I have?",
  "What actions can you currently perform on this website?",
];

export default function HomeScreen() {
  const { grievances, simNow, select, setView, resetDemo } = useAppStore();
  const attention = grievances.filter((g) => slaStatus(g, simNow).needsAttention).length;

  const copy = (t: string) => navigator.clipboard?.writeText(t);

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", width: 1, p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Positioning hero */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, background: "linear-gradient(135deg, #0F6B5C 0%, #0B5548 100%)", color: "#fff", borderRadius: 4 }}>
        <Chip size="small" label="Simulation · fictional cases" sx={{ mb: 1.5, bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 600 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, maxWidth: 560, lineHeight: 1.25 }}>
          The citizen's advocate throughout the grievance lifecycle.
        </Typography>
        <Typography sx={{ mt: 1, maxWidth: 640, opacity: 0.92, fontSize: 14.5, lineHeight: 1.6 }}>
          Government portals already help you <strong>file</strong>. This sandbox lets <strong>your own browser agent</strong> —
          through WebMCP — keep watch afterwards: track SLAs, send reminders, record feedback, and prepare appeals, with every
          consequential action gated by your explicit confirmation.
        </Typography>
        <Paper
          onClick={() => copy(HERO_PROMPT)}
          elevation={0}
          sx={{ mt: 2.5, display: "inline-flex", alignItems: "center", gap: 1.25, px: 2, py: 1.25, cursor: "pointer", bgcolor: "rgba(255,255,255,0.14)", border: "1px dashed rgba(255,255,255,0.45)", borderRadius: 2, maxWidth: 560 }}
        >
          <AutoAwesome sx={{ fontSize: 18, opacity: 0.9 }} />
          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>“{HERO_PROMPT}”</Typography>
          <ContentCopy sx={{ fontSize: 15, opacity: 0.75, ml: "auto" }} />
        </Paper>
        <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.7 }}>
          Paste this into your agent in ChatGPT's browser or Chrome (WebMCP enabled).
        </Typography>
      </Paper>

      {/* Case board header */}
      <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6">
          My cases{" "}
          <Typography component="span" color="text.secondary" variant="body2">
            · मेरे मामले · {grievances.length} total
          </Typography>
        </Typography>
        <Typography variant="body2" color={attention ? "warning.main" : "text.secondary"} sx={{ fontWeight: 600 }}>
          {attention ? `${attention} need${attention > 1 ? "" : "s"} attention today` : "All on track"}
        </Typography>
      </Stack>

      {/* Case cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        {grievances.map((g) => {
          const sla = slaStatus(g, simNow);
          const m = ministryOf(g.ministryId);
          return (
            <Card key={g.id} elevation={1} sx={{ borderRadius: 3, "&:hover": { boxShadow: 6 }, transition: "box-shadow .2s" }}>
              <CardActionArea
                onClick={() => {
                  select(g.id);
                  setView("case");
                }}
                sx={{ p: 2.25, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 1.25, minHeight: 168 }}
              >
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: "text.secondary" }}>
                    {g.regId}
                  </Typography>
                  <StatusChip g={g} sla={sla} />
                </Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {g.subject}
                </Typography>
                <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap", rowGap: 0.75 }}>
                  <Chip size="small" variant="outlined" label={m?.nameEn ?? g.ministryId} sx={{ height: 24, fontSize: 11 }} />
                  <Chip size="small" variant="outlined" label={categoryOf(g.categoryId)?.titleEn ?? g.categoryId} sx={{ height: 24, fontSize: 11 }} />
                </Stack>
                {sla.attentionReason && (
                  <Typography variant="caption" sx={{ color: sla.needsAttention ? "warning.dark" : "text.secondary", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    → {sla.attentionReason}
                  </Typography>
                )}
                <Stack direction="row" sx={{ alignItems: "center", mt: "auto", color: "primary.main" }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Open case</Typography>
                  <ArrowForward sx={{ fontSize: 14, ml: 0.5 }} />
                </Stack>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      <Divider />
      {/* Suggested prompts */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.25 }}>Try these with your agent</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {PROMPTS.map((p) => (
            <Chip
              key={p}
              label={p}
              onClick={() => copy(p)}
              deleteIcon={<ContentCopy sx={{ fontSize: 13 }} />}
              onDelete={() => copy(p)}
              variant="outlined"
              sx={{ borderRadius: 2, height: "auto", "& .MuiChip-label": { whiteSpace: "normal", fontSize: 11.5, py: 0.5, lineHeight: 1.4 } }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Button size="small" startIcon={<RestartAlt />} onClick={resetDemo} color="inherit" sx={{ color: "text.secondary" }}>
          Reset demo data
        </Button>
        <Button size="small" onClick={() => setView("transparency")} sx={{ fontWeight: 600 }}>
          How your agent works →
        </Button>
      </Box>
    </Box>
  );
}
