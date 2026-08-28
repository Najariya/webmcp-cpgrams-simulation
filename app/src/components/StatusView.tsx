import { useState } from "react";
import { Box, Button, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import Search from "@mui/icons-material/Search";
import RestartAlt from "@mui/icons-material/RestartAlt";
import Download from "@mui/icons-material/Download";
import { useAppStore } from "../store";
import { ministryOf } from "../data/catalog";
import { rankAttention, slaStatus } from "../domain/sla";
import StatusChip from "./StatusChip";
import { goi } from "../theme";

/**
 * View Status (CPGRAMS-style): search by registration ID, or the citizen's
 * full case register as a government table with SLA and next-action columns.
 * Cases needing attention are pinned to the top, most urgent first (the same
 * ranking the agent sees through get_sla_status).
 */
export default function StatusView() {
  const { grievances, simNow, select, setView, resetDemo } = useAppStore();
  const [q, setQ] = useState("");
  const rank = new Map(rankAttention(grievances, simNow).map((r, i) => [r.g.id, i]));
  const rows = grievances
    .filter((g) => !q.trim() || (g.regId ?? "").toLowerCase().includes(q.trim().toLowerCase()) || g.subject.toLowerCase().includes(q.trim().toLowerCase()))
    .slice()
    .sort((a, b) => (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER));

  const exportData = () => {
    const s = useAppStore.getState();
    const payload = {
      exportedAt: new Date().toISOString(),
      note: "Browser-local simulation data. Nothing here was ever sent to a server; this file is your copy.",
      citizen: s.citizen,
      grievances: s.grievances,
      draft: s.draft,
      appealDraft: s.appealDraft,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "cpgrams-simulation-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5 }}>
      <Paper elevation={1} sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ bgcolor: goi.navy, color: "#fff", px: { xs: 2, md: 3 }, py: 2.25, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", borderBottom: "3px solid", borderColor: goi.saffron }}>
          <Box sx={{ flex: 1, minWidth: 220, py: 0.5 }}>
            <Typography sx={{ fontSize: 16.5, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1.35 }}>View Grievance Status · शिकायत की स्थिति</Typography>
            <Typography className="longform" sx={{ fontSize: 12, opacity: 0.9, lineHeight: 1.55, mt: 0.25 }}>
              Your case register — SLA clocks, interim replies, reminders, feedback and appeals.
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search by registration ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ bgcolor: "#fff", borderRadius: 1, width: 260, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
            slotProps={{
              input: {
                startAdornment: (<InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>),
              },
            }}
          />
        </Box>

        <TableContainer>
          <Table size="small" sx={{ minWidth: 760, "& .MuiTableCell-body": { py: 1.25, "&:first-of-type": { pt: 1 } }, "& .MuiTableCell-head": { pb: 1.25 } }} aria-label="Grievance register">
            <TableHead>
              <TableRow>
                <TableCell>Registration ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Ministry / Department</TableCell>
                <TableCell>Filed</TableCell>
                <TableCell>SLA</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((g) => {
                const sla = slaStatus(g, simNow);
                return (
                  <TableRow key={g.id} hover sx={{ cursor: "pointer" }} onClick={() => { select(g.id); setView("case"); }}>
                    <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{g.regId}</TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" noWrap>{g.subject}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, color: "text.secondary", whiteSpace: "nowrap" }}>{ministryOf(g.ministryId)?.nameEn}</TableCell>
                    <TableCell sx={{ fontSize: 12.5, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{g.filedAt ? new Date(g.filedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: sla.phase === "overdue" ? "#B42318" : sla.phase === "within_target" ? "text.secondary" : goi.green }}>
                        {sla.daysElapsed !== null ? `Day ${sla.daysElapsed} / ${sla.targetDays}` : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusChip g={g} sla={sla} /></TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Button size="small" variant="outlined" color="inherit" sx={{ fontSize: 11.5 }} onClick={(e) => { e.stopPropagation(); select(g.id); setView("case"); }}>
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    No grievances match “{q}”.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mt: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Typography className="longform" variant="caption" color="text.secondary">
          {rows.length} record{rows.length === 1 ? "" : "s"} · cases needing attention are listed first, most urgent at top · simulation data stored only in this browser
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Download />} onClick={exportData} color="inherit" sx={{ color: "text.secondary" }}>
            Export my data
          </Button>
          <Button size="small" startIcon={<RestartAlt />} onClick={resetDemo} color="inherit" sx={{ color: "text.secondary" }}>
            Reset demo data
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
