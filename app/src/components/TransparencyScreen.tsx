import { useEffect, useState } from "react";
import { Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import PlayArrow from "@mui/icons-material/PlayArrow";
import VolumeUp from "@mui/icons-material/VolumeUp";
import PageHeader from "./PageHeader";
import { registrar } from "../webmcp/registrar";
import { getModelContext, type RegisteredToolInfo } from "../webmcp/types";
import { getSlaStatusTool, speakAloudTool } from "../webmcp/tools";

/**
 * Screen 5 — "How your agent works". The app demonstrates WebMCP with WebMCP:
 * live registry via getTools() + toolchange when available; a clearly-labelled
 * simulation of the intended registry otherwise. This page is a judging proof point.
 */
export default function TransparencyScreen() {
  const [, force] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const available = registrar.available;
  const [live, setLive] = useState<RegisteredToolInfo[] | null>(null);

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
  const tools = live ?? intended.map((t) => ({
    name: t.name, title: t.title, description: t.description, inputSchema: t.inputSchema, annotations: t.annotations,
  }));

  const runSelfTest = async () => {
    setResult(await getSlaStatusTool.execute({}, { signal: new AbortController().signal }));
  };

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Paper elevation={1} sx={{ p: 0, overflow: "hidden", borderRadius: 2 }}>
        <PageHeader
          title="Agent Tools · आपके एजेंट के टूल्स"
          sub="Exactly which capabilities this site exposes to your browser agent right now — the same registry your agent sees through WebMCP"
        />
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          <Chip
            color={available ? "success" : "warning"}
            variant={available ? "filled" : "outlined"}
            label={available ? "✓ WebMCP active in this browser — this is the live registry" : "WebMCP not active — simulation view of the intended registry"}
            sx={{ fontWeight: 600 }}
          />
          {!available && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Open in ChatGPT's in-app browser, or enable <strong>chrome://flags/#enable-webmcp-testing</strong> in Chrome 149+ and relaunch.
            </Typography>
          )}
        </Box>
      </Paper>

      <Stack spacing={1.25}>
        {tools.map((t) => (
          <Paper key={t.name} elevation={1} sx={{ p: 2, borderRadius: 2.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13.5 }}>{t.name}</Typography>
              {t.annotations?.readOnlyHint
                ? <Chip size="small" variant="outlined" label="read · no confirmation" sx={{ height: 22, fontSize: 10.5 }} />
                : <Chip size="small" color="warning" variant="outlined" label="write · confirmation required" sx={{ height: 22, fontSize: 10.5 }} />}
              {t.annotations?.untrustedContentHint && <Chip size="small" variant="outlined" label="untrusted content" sx={{ height: 22, fontSize: 10.5 }} />}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, lineHeight: 1.5 }}>
              {t.description}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Divider />
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button variant="outlined" size="small" startIcon={<PlayArrow />} onClick={runSelfTest}>
          Self-test: get_sla_status (all my cases)
        </Button>
        <Button
          variant="outlined" size="small" startIcon={<VolumeUp />}
          onClick={() => speakAloudTool.execute({ text: "Your agent sees the same case list you do. Every consequential action asks you first.", lang: "en-IN" }, { signal: new AbortController().signal })}
        >
          Test voice
        </Button>
      </Box>
      {result && (
        <Paper variant="outlined" sx={{ p: 1.75, bgcolor: "#F6F9F7", borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.5 }}>
            {result.slice(0, 1500)}{result.length > 1500 ? "…" : ""}
          </Typography>
        </Paper>
      )}

      <Divider />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
          <Typography variant="subtitle2" gutterBottom>Human control</Typography>
          <Typography variant="caption" sx={{ lineHeight: 1.6, color: "text.secondary" }}>
            Reads are free. Drafting is reversible. Consequential actions — submitting a grievance or sending an appeal —
            require your explicit confirmation in the page, bound to the exact payload. The agent can never silently commit them.
          </Typography>
        </Paper>
        <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
          <Typography variant="subtitle2" gutterBottom>Privacy</Typography>
          <Typography variant="caption" sx={{ lineHeight: 1.6, color: "text.secondary" }}>
            The prototype has no application backend and performs no server-side persistence. Demo grievance state is stored
            locally in your browser. Information required for an agent action is shared with your browser agent through
            explicit WebMCP tool contracts. All cases are fictional; no government connectivity.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
