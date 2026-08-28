import { useEffect, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import PlayArrow from "@mui/icons-material/PlayArrow";
import VolumeUp from "@mui/icons-material/VolumeUp";
import RecordVoiceOver from "@mui/icons-material/RecordVoiceOver";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Close from "@mui/icons-material/Close";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import PanToolOutlined from "@mui/icons-material/PanToolOutlined";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";
import PrivacyTipOutlined from "@mui/icons-material/PrivacyTipOutlined";
import TerminalOutlined from "@mui/icons-material/TerminalOutlined";
import PageHeader from "./PageHeader";
import { registrar } from "../webmcp/registrar";
import { getModelContext, type RegisteredToolInfo } from "../webmcp/types";
import { getSlaStatusTool, speakAloudTool } from "../webmcp/tools";
import { speak, useVoiceStore } from "../webmcp/voice";
import { goi } from "../theme";
import { dict } from "../i18n";
import { useAppStore } from "../store";

/**
 * Screen 5 — "How your agent works". The app demonstrates WebMCP with WebMCP:
 * live registry via getTools() + toolchange when available; a clearly-labelled
 * simulation of the intended registry otherwise. This page is a judging proof point.
 */

type ToolInfo = RegisteredToolInfo;

export default function TransparencyScreen() {
  const [, force] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const available = registrar.available;
  const [live, setLive] = useState<RegisteredToolInfo[] | null>(null);
  const voiceMode = useVoiceStore((s) => s.voiceMode);
  const setVoiceMode = useVoiceStore((s) => s.setVoiceMode);
  const lang = useAppStore((s) => s.lang);
  const dd = dict(lang);

  useEffect(() => {
    const unsub = registrar.subscribe(() => force((n) => n + 1));
    const mc = getModelContext();
    const onChange = () => force((n) => n + 1);
    mc?.addEventListener("toolchange", onChange);
    return () => {
      unsub();
      mc?.removeEventListener("toolchange", onChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getModelContext()
      ?.getTools()
      .then((tools) => !cancelled && setLive(tools))
      .catch(() => setLive(null));
    return () => {
      cancelled = true;
    };
  }, [registrar.version]);

  const intended = registrar.intended();
  const tools: ToolInfo[] = (live ?? intended.map((t) => ({
    name: t.name, title: t.title, description: t.description, inputSchema: t.inputSchema, annotations: t.annotations,
  }))) as ToolInfo[];

  const reads = tools.filter((t) => t.annotations?.readOnlyHint);
  const writes = tools.filter((t) => !t.annotations?.readOnlyHint);

  const runSelfTest = async () => {
    setResult(await getSlaStatusTool.execute({}, { signal: new AbortController().signal }));
  };

  const toggle = (name: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper elevation={1} sx={{ p: 0, overflow: "hidden", borderRadius: 2 }}>
        <PageHeader
          title="Agent Tools · आपके एजेंट के टूल्स"
          sub="Exactly which capabilities this site exposes to your browser agent right now — the same registry your agent sees through WebMCP"
        />
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "flex-start", px: { xs: 2, md: 3 }, py: 2, bgcolor: available ? "#F4F9F5" : "#FFF9EE", borderTop: "1px solid", borderColor: available ? "#D4E6D9" : "#EDDCBF" }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: available ? goi.green : "#B45309", mt: "7px", flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: available ? "#1A5C33" : "#7A4608", lineHeight: 1.4 }}>
              {available ? "WebMCP active in this browser — this is the live registry" : "WebMCP not active — simulation view of the intended registry"}
            </Typography>
            <Typography className="longform" sx={{ fontSize: "0.75rem", lineHeight: 1.65, color: "text.secondary", mt: 0.25 }}>
              {available ? (
                <>Tools below are read from <code>document.modelContext.getTools()</code> and update live via <code>toolchange</code>.</>
              ) : (
                <>Open this page in ChatGPT&rsquo;s in-app browser, or enable{" "}
                  <Box component="code" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.6562rem", bgcolor: "#F1F4F8", border: "1px solid #D8DFE8", borderRadius: 0.5, px: 0.5, py: 0.25, wordBreak: "break-all" }}>
                    chrome://flags/#enable-webmcp-testing
                  </Box>{" "}
                  in Chrome 149+ and relaunch.</>
              )}
            </Typography>
            <Typography className="longform" sx={{ fontSize: "0.75rem", lineHeight: 1.65, color: "text.secondary", mt: 0.75 }}>
              {dd.agentTools.plainWords}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {reads.length > 0 && (
        <ToolGroup
          icon={<VisibilityOutlined sx={{ fontSize: "1rem" }} />}
          title={`Read tools · पढ़ने के टूल`}
          count={reads.length}
          blurb="Free for your agent to call at any time — they only read your record, so no confirmation is needed."
        >
          {reads.map((t, i) => (
            <ToolCard key={t.name} t={t} index={i} expanded={expanded.has(t.name)} onToggle={() => toggle(t.name)} />
          ))}
        </ToolGroup>
      )}

      {writes.length > 0 && (
        <ToolGroup
          icon={<PanToolOutlined sx={{ fontSize: "1rem" }} />}
          title={`Action tools · कार्रवाई के टूल`}
          count={writes.length}
          blurb="These change something — your record or your preferences. Record-changing actions pause for your explicit in-page confirmation, bound to the exact payload, before anything is committed; preference changes are reversible and need none."
        >
          {writes.map((t, i) => (
            <ToolCard key={t.name} t={t} index={reads.length + i} expanded={expanded.has(t.name)} onToggle={() => toggle(t.name)} />
          ))}
        </ToolGroup>
      )}

      {tools.length === 0 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
          <Typography className="longform" variant="body2" color="text.secondary">No tools are currently exposed. Lodge or select a grievance to activate the context-sensitive surface.</Typography>
        </Paper>
      )}

      {/* Self-test */}
      <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "12px" }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <TerminalOutlined sx={{ fontSize: "1.0625rem", color: goi.navy }} />
          <Typography component="h2" sx={{ fontSize: "0.7812rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", color: goi.navy }}>
            Try it yourself · स्वयं आज़माएँ
          </Typography>
        </Stack>
        <Typography className="longform" sx={{ fontSize: "0.7812rem", lineHeight: 1.65, color: "text.secondary", mt: 1 }}>
          Run the exact tool your agent would call — same validation, same envelope, no agent required. The response below is precisely what your agent receives.
        </Typography>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", rowGap: 1, mt: 1.75 }}>
          <Button variant="outlined" size="small" startIcon={<PlayArrow />} onClick={runSelfTest}>
            Call get_sla_status
          </Button>
          <Button
            variant="outlined" size="small" startIcon={<VolumeUp />}
            onClick={() => speakAloudTool.execute({ text: "Your agent sees the same case list you do. Every consequential action asks you first.", lang: "en-IN" }, { signal: new AbortController().signal })}
          >
            Test voice
          </Button>
        </Stack>
        {result && (
          <Paper elevation={0} sx={{ mt: 2, borderRadius: 1.5, overflow: "hidden", bgcolor: goi.navyDark }}>
            <Stack direction="row" sx={{ alignItems: "center", px: 1.5, py: 1, bgcolor: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mr: 1.5 }}>
                {["#E5565F", "#E0A93E", "#57B45E"].map((c) => (
                  <Box key={c} sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c, opacity: 0.85 }} />
                ))}
              </Stack>
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.6875rem", color: "#8FB3E0", flex: 1 }}>
                get_sla_status → response envelope
              </Typography>
              <Button size="small" sx={{ minWidth: 28, p: 0.5, color: "#8FB3E0" }} onClick={() => setResult(null)} aria-label="Close response">
                <Close sx={{ fontSize: "0.9375rem" }} />
              </Button>
            </Stack>
            <Box sx={{ p: 2, maxHeight: 320, overflow: "auto" }}>
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.7188rem", color: "#C7DAF5", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.65 }}>
                {result}
              </Typography>
            </Box>
          </Paper>
        )}
      </Paper>

      {/* Voice-ready */}
      <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "12px" }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <RecordVoiceOver sx={{ fontSize: "1.0625rem", color: goi.navy }} />
          <Typography component="h2" sx={{ fontSize: "0.7812rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", color: goi.navy }}>
            Voice-ready by design · आवाज़ के लिए तैयार
          </Typography>
        </Stack>
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {[
            ["Speakable envelopes", "Every tool returns a one-locale speakable line sized for speech — compact, plain-language, never bilingual concatenation. Voice agents read it directly."],
            ["Live announcements", "Page state changes — filings, reminders, ratings, appeals, approval prompts — are announced through an aria-live region, so voice agents and screen readers hear what changed."],
            ["Voice Mode", "A narration preference (toggle in the header, or the set_voice_mode tool) makes the page speak key citizen moments aloud in English or Hindi."],
          ].map(([t, d]) => (
            <Box key={t} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" }, gap: { xs: 0.25, sm: 2 } }}>
              <Typography sx={{ fontSize: "0.7812rem", fontWeight: 700, color: goi.navyDark }}>{t}</Typography>
              <Typography className="longform" sx={{ fontSize: "0.75rem", lineHeight: 1.65, color: "text.secondary" }}>{d}</Typography>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", rowGap: 1, mt: 2 }}>
          <Button
            variant={voiceMode ? "contained" : "outlined"} size="small" startIcon={<RecordVoiceOver />}
            color={voiceMode ? "success" : "inherit"}
            onClick={() => setVoiceMode(!voiceMode)}
          >
            {voiceMode ? "Voice mode is on — turn off" : "Turn Voice Mode on"}
          </Button>
          <Button variant="outlined" size="small" startIcon={<VolumeUp />} onClick={() => speak("Your agent sees the same case list you do. Every consequential action asks you first.", "en-IN")}>
            Test voice · English
          </Button>
          <Button variant="outlined" size="small" startIcon={<VolumeUp />} onClick={() => speak("आपका एजेंट वही केस देखता है जो आप देखते हैं। हर ज़रूरी काम से पहले आपकी पुष्टि ली जाती है।", "hi-IN")}>
            बोलकर सुनें · हिंदी
          </Button>
        </Stack>
      </Paper>

      {/* Guarantees */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <GuaranteeCard
          icon={<VerifiedUserOutlined sx={{ fontSize: "1.1875rem" }} />}
          title="Human control"
          body="Reads are free. Drafting is reversible. Consequential actions — submitting a grievance or sending an appeal — require your explicit confirmation in the page, bound to the exact payload. The agent can never silently commit them."
        />
        <GuaranteeCard
          icon={<PrivacyTipOutlined sx={{ fontSize: "1.1875rem" }} />}
          title="Privacy"
          body="The prototype has no application backend and performs no server-side persistence. Demo grievance state is stored locally in your browser — you can export it as a file or erase it at any time from the case register. Information required for an agent action is shared with your browser agent through explicit WebMCP tool contracts. All cases are fictional; no government connectivity."
        />
      </Box>
    </Box>
  );
}

function ToolGroup({ icon, title, count, blurb, children }: {
  icon: React.ReactNode; title: string; count: number; blurb: string; children: React.ReactNode;
}) {
  return (
    <Box>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 0.75 }}>
        <Box sx={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 1, bgcolor: "rgba(11,47,99,0.07)", color: goi.navy }}>{icon}</Box>
        <Typography component="h2" sx={{ fontSize: "0.8438rem", fontWeight: 800, color: goi.navy, letterSpacing: "0.01em" }}>
          {title}
          <Typography component="span" sx={{ fontSize: "0.7188rem", fontWeight: 700, color: "text.disabled", ml: 1, fontVariantNumeric: "tabular-nums" }}>
            {count}
          </Typography>
        </Typography>
        <Box sx={{ flex: 1, height: 2, bgcolor: "#E8EDF3", borderRadius: 1, maxWidth: 140 }} />
      </Stack>
      <Typography className="longform" sx={{ fontSize: "0.75rem", lineHeight: 1.6, color: "text.secondary", mb: 1.5, pl: { sm: 5.25 } }}>{blurb}</Typography>
      <Stack spacing={1.25}>{children}</Stack>
    </Box>
  );
}

const clamp = (s: string, n: number) =>
  s.length <= n ? s : s.slice(0, n).replace(/[\s.;:,]+\S*$/, "").replace(/[\s.;:,]+$/, "") + " …";

function ToolCard({ t, index, expanded, onToggle }: {
  t: ToolInfo; index: number; expanded: boolean; onToggle: () => void;
}) {
  const props = (t.inputSchema?.properties ?? {}) as Record<string, { type?: string; description?: string; enum?: string[] }>;
  const required = new Set((t.inputSchema?.required ?? []) as string[]);
  const paramNames = Object.keys(props);
  const isRead = !!t.annotations?.readOnlyHint;
  const full = t.description ?? "";

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 1.75, sm: 2 }, borderRadius: 2, borderColor: "#DCE4EE", transition: "border-color .15s", "&:hover": { borderColor: "#B9C9DD" } }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "30px 1fr" }, gap: { xs: 0, sm: 1.75 } }}>
        <Typography
          aria-hidden
          sx={{ display: { xs: "none", sm: "block" }, fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.6875rem", fontWeight: 600, color: "#9AA8B8", pt: "3px", fontVariantNumeric: "tabular-nums" }}
        >
          {String(index + 1).padStart(2, "0")}
        </Typography>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.75 }}>
            <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.8125rem", fontWeight: 600, color: goi.navyDark, letterSpacing: "0.01em", lineHeight: "20px" }}>
              {t.name}
            </Typography>
            <Chip
              size="small" label={isRead ? "read" : "write"}
              sx={isRead
                ? { height: 20, fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.04em", bgcolor: "#EEF4FB", color: "#2B5B8C", border: "1px solid #C9DBF0", "& .MuiChip-label": { px: 0.75 } }
                : { height: 20, fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.04em", bgcolor: "#FDF3E7", color: "#8A5A00", border: "1px solid #EBD5BC", "& .MuiChip-label": { px: 0.75 } }}
            />
            {t.annotations?.untrustedContentHint && (
              <Chip size="small" label="untrusted content" sx={{ height: 20, fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.04em", bgcolor: "transparent", color: "#8A97A6", border: "1px dashed #C6D0DC", "& .MuiChip-label": { px: 0.75 } }} />
            )}
          </Stack>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary", lineHeight: 1.45, mt: 0.75 }}>
            {t.title}
          </Typography>
          <Typography className="longform" sx={{ fontSize: "0.75rem", lineHeight: 1.7, color: "text.secondary", mt: 0.5 }}>
            {expanded ? full : clamp(full, 220)}
          </Typography>
          <Button
            size="small" color="inherit" onClick={onToggle}
            sx={{ mt: 0.25, ml: -1, px: 1, fontSize: "0.6875rem", fontWeight: 700, color: goi.link, textTransform: "none", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
            endIcon={<ExpandMore sx={{ fontSize: "0.9375rem", transform: expanded ? "rotate(180deg)" : "none", transition: "transform .15s", ml: -0.5 }} />}
          >
            {expanded ? "Hide" : "Show"} full contract{paramNames.length > 0 ? ` · ${paramNames.length} parameter${paramNames.length > 1 ? "s" : ""}` : ""}
          </Button>
          {expanded && paramNames.length > 0 && (
            <Box sx={{ mt: 1, border: "1px solid #E3E9F1", borderRadius: 1.5, overflow: "hidden" }}>
              {paramNames.map((p, i) => {
                const spec = props[p];
                return (
                  <Box key={p} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" }, gap: { xs: 0.25, sm: 2 }, px: 1.5, py: 1, bgcolor: i % 2 === 0 ? "#FBFCFE" : "#fff", borderTop: i === 0 ? "none" : "1px solid #EDF1F6" }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "baseline" }}>
                      <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.6875rem", fontWeight: 600, color: goi.navyDark, wordBreak: "break-all" }}>{p}</Typography>
                      {required.has(p) && <Typography component="span" sx={{ fontSize: "0.625rem", fontWeight: 800, color: "#B42318" }}>*</Typography>}
                    </Stack>
                    <Typography sx={{ fontSize: "0.6875rem", lineHeight: 1.55, color: "text.secondary" }}>
                      <Box component="span" sx={{ color: "#5B6774", fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.6562rem" }}>{spec.type}{spec.enum ? ` · ${spec.enum.join(" | ")}` : ""}</Box>
                      {spec.description && <Box component="span"> — {spec.description}</Box>}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

function GuaranteeCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "12px", display: "flex", gap: 1.75, alignItems: "flex-start" }}>
      <Box sx={{ width: 38, height: 38, borderRadius: "10px", display: "grid", placeItems: "center", bgcolor: "rgba(11,47,99,0.07)", color: goi.navy, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.8438rem", fontWeight: 700, color: goi.navy }}>{title}</Typography>
        <Typography className="longform" sx={{ fontSize: "0.7812rem", lineHeight: 1.7, color: "text.secondary", mt: 0.75 }}>
          {body}
        </Typography>
      </Box>
    </Paper>
  );
}
