import { useEffect, useState } from "react";
import {
  Box, Chip, Paper, Stack, Typography, Button, Tooltip as MuiTooltip, Divider,
} from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { registrar } from "../webmcp/registrar";
import { getModelContext, type RegisteredToolInfo } from "../webmcp/types";
import { listIssueCategoriesTool, speakAloudTool } from "../webmcp/tools";
import { useAppStore } from "../store";

/**
 * Transparency panel — the app demonstrates WebMCP with WebMCP:
 * live tool registry via getTools() + toolchange when available;
 * a clearly-marked simulation of the intended registry otherwise.
 */
export default function WebMcpPanel() {
  const [, force] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const togglePanel = useAppStore((s) => s.togglePanel);
  const available = registrar.available;

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

  const intended = registrar.intended();
  const [live, setLive] = useState<RegisteredToolInfo[] | null>(null);
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

  const runSelfTest = async () => {
    setResult(await listIssueCategoriesTool.execute({}, { signal: new AbortController().signal }));
  };

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  const tools = live ?? intended.map((t) => ({
    name: t.name,
    title: t.title,
    description: t.description,
    inputSchema: t.inputSchema,
    annotations: t.annotations,
  }));

  return (
    <Paper elevation={1} sx={{ m: 2, p: 2.5, width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2, overflow: "auto" }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="subtitle1">WebMCP · टूल पारदर्शिता</Typography>
        <MuiTooltip title="Hide panel"><Button size="small" onClick={togglePanel}>छिपाएँ · Hide</Button></MuiTooltip>
      </Stack>

      <Chip
        size="small"
        color={available ? "success" : "warning"}
        variant={available ? "filled" : "outlined"}
        label={available ? "✓ WebMCP active in this browser" : "WebMCP not active — simulation view"}
      />

      <Box>
        {tools.length === 0 && <Typography variant="body2" color="text.secondary">No tools registered yet.</Typography>}
        <Stack spacing={1}>
          {tools.map((t) => (
            <Paper key={t.name} variant="outlined" sx={{ p: 1.25 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="subtitle2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>{t.name}</Typography>
                {t.annotations?.readOnlyHint && <Chip size="small" label="read-only" sx={{ height: 20, fontSize: 10 }} />}
                {t.annotations?.untrustedContentHint && <Chip size="small" label="untrusted-out" sx={{ height: 20, fontSize: 10 }} />}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.4 }}>
                {t.description.slice(0, 140)}{(t.description.length ?? 0) > 140 ? "…" : ""}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Box>

      <Divider />
      <Button variant="outlined" size="small" startIcon={<PlayArrow />} onClick={runSelfTest}>
        Self-test: list_issue_categories
      </Button>
      <Button variant="outlined" size="small" onClick={() => speakAloudTool.execute({ text: "सिल्पी ग्राम शिकायत पोर्टल तैयार है। The grievance portal is ready.", lang: "hi-IN" }, { signal: new AbortController().signal })}>
        🔊 बोलकर देखें · Test voice (hi-IN)
      </Button>
      {result && (
        <Paper variant="outlined" sx={{ p: 1.25, bgcolor: "#F6F9F7" }}>
          <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {result.slice(0, 1500)}{result.length > 1500 ? "…" : ""}
          </Typography>
        </Paper>
      )}

      <Divider />
      <Typography variant="subtitle2">For your agent · आपके एजेंट के लिए</Typography>
      {[
        "What grievance categories does this panchayat accept, with their SLAs?",
        "Read the app state and tell me where I am.",
        "Speak aloud: welcome to the Silpi Gram grievance portal.",
      ].map((p) => (
        <Chip
          key={p}
          label={p}
          onClick={() => copy(p)}
          deleteIcon={<ContentCopy sx={{ fontSize: 14 }} />}
          onDelete={() => copy(p)}
          sx={{ justifyContent: "flex-start", textAlign: "left", height: "auto", "& .MuiChip-label": { whiteSpace: "normal", fontSize: 11.5, py: 0.75 } }}
        />
      ))}
    </Paper>
  );
}
