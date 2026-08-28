import { Box, Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import Gavel from "@mui/icons-material/Gavel";
import PageHeader from "./PageHeader";
import { useAppStore } from "../store";
import { ministryOf } from "../data/catalog";

/**
 * Appeal review (Screen 4, v4 §14) — original grievance, disposal, citizen
 * objection and the agent-drafted appeal argument, with final confirmation.
 */
export default function AppealReview() {
  const { appealDraft, grievances, startAppealDraft, sendAppeal, setView } = useAppStore();

  if (!appealDraft) {
    const eligible = grievances.filter((g) => g.status === "DISPOSED");
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">No appeal draft in progress.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560, lineHeight: 1.6 }}>
          Appeals unlock after you rate a disposal <strong>Poor</strong>.{" "}
          {eligible.length > 0
            ? "You have a disposed case awaiting feedback — open it from the case register to rate it."
            : "Ask your agent: “I don't agree with this disposal. What options do I have?”"}
        </Typography>
      </Box>
    );
  }

  const g = grievances.find((x) => x.id === appealDraft.grievanceId);
  if (!g) {
    return <Box sx={{ p: 4 }}><Typography variant="h6">The underlying grievance could not be found.</Typography></Box>;
  }

  const valid = appealDraft.grounds.trim().length >= 4 && appealDraft.argument.trim().length >= 30;

  const confirm = () => {
    if (window.confirm("File this appeal with the Nodal Appellate Authority (simulation)?")) {
      sendAppeal();
      setView("case");
    }
  };

  return (
    <Box sx={{ maxWidth: 820, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5 }}>
      <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: "12px" }}>
        <PageHeader
          title={`Appeal review · ${g.regId}`}
          sub={`To be filed with the ${ministryOf(g.ministryId)?.appellateAuthority ?? "Nodal Appellate Authority"} — nothing is filed until you confirm`}
        />
        <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" }, gap: { xs: 0.5, sm: 2 } }}>
            <Typography variant="overline" sx={{ color: "text.secondary", fontSize: 11, pt: 0.5 }}>Original relief</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{g.reliefRequested}</Typography>
            <Typography variant="overline" sx={{ color: "text.secondary", fontSize: 11, pt: 0.5 }}>Disposal being appealed</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: "text.secondary" }}>{g.disposal?.summary ?? "—"}</Typography>
          </Box>

          <Divider />

          <TextField
            label="Grounds of appeal · अपील का आधार"
            value={appealDraft.grounds}
            onChange={(e) => startAppealDraft(g.id, e.target.value, appealDraft.argument)}
            fullWidth slotProps={{ htmlInput: { maxLength: 200 } }}
          />
          <TextField
            label="Appeal argument"
            value={appealDraft.argument}
            onChange={(e) => startAppealDraft(g.id, appealDraft.grounds, e.target.value)}
            multiline minRows={5} fullWidth slotProps={{ htmlInput: { maxLength: 1500 } }}
            helperText="Grounded in the case record: what the disposal failed to address and the relief sought."
          />

          <Divider />
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
            <Button color="inherit" onClick={() => setView("case")}>Go back</Button>
            <Button variant="contained" color="secondary" disabled={!valid} startIcon={<Gavel />} onClick={confirm}>
              Confirm &amp; File Appeal
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
