import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControlLabel, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography,
} from "@mui/material";
import TaskAlt from "@mui/icons-material/TaskAlt";
import { CATEGORIES, MINISTRIES, categoryOf } from "../data/catalog";
import { draftIsValid, type GrievanceDraft } from "../domain/types";
import { useAppStore } from "../store";
import { goi } from "../theme";

/**
 * CPGRAMS-style Lodge Public Grievance form (mapped, simulated).
 * Personal info → ministry/category cascade → grievance & relief → declaration →
 * explicit confirmation (Tier A human gate) → registration ID.
 */
export default function LodgeForm() {
  const { citizen, saveDraft, submitActiveDraft, clearDraft, draft, setView, select } = useAppStore();
  const [ministryId, setMinistryId] = useState(draft?.ministryId ?? "");
  const [categoryId, setCategoryId] = useState(draft?.categoryId ?? "");
  const [subject, setSubject] = useState(draft?.subject ?? "");
  const [description, setDescription] = useState(draft?.description ?? "");
  const [relief, setRelief] = useState(draft?.reliefRequested ?? "");
  const [declared, setDeclared] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cats = useMemo(() => CATEGORIES.filter((c) => !ministryId || c.ministryId === ministryId), [ministryId]);

  const partial: Omit<GrievanceDraft, "id" | "updatedAt"> = {
    categoryId,
    ministryId: categoryOf(categoryId)?.ministryId ?? ministryId,
    subject,
    description,
    reliefRequested: relief,
    evidence: [],
  };
  const valid = draftIsValid({ ...partial, id: "tmp", updatedAt: "" });

  const startSubmit = () => {
    if (!valid || !declared) {
      setError(!declared ? "Please tick the declaration before submitting." : "Please complete all required fields.");
      return;
    }
    setError(null);
    saveDraft(partial);
    setConfirmOpen(true);
  };

  const confirmedSubmit = () => {
    try {
      const g = submitActiveDraft();
      setConfirmOpen(false);
      select(g.id);
      setView("case");
      setSubmitted(g.regId ?? "");
    } catch (e) {
      setConfirmOpen(false);
      setError(e instanceof Error ? e.message : "Submission failed.");
    }
  };

  const [submitted, setSubmitted] = useState<string | null>(null);

  if (submitted) {
    return (
      <Box sx={{ maxWidth: 640, mx: "auto", width: 1, p: { xs: 2, md: 3 } }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
          <TaskAlt sx={{ fontSize: 54, color: goi.green }} />
          <Typography variant="h6" sx={{ mt: 1.5 }}>Grievance lodged successfully</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Your registration ID — quote this for status, reminders and appeals:
          </Typography>
          <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 26, fontWeight: 700, color: goi.navy, my: 2, letterSpacing: "0.06em" }}>
            {submitted}
          </Typography>
          <Typography className="longform" variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5, lineHeight: 1.6 }}>
            The 21-day redressal clock has started. Your browser agent can now watch this case for you. (Simulation —
            nothing was sent to any government system.)
          </Typography>
          <Button variant="contained" onClick={() => setView("case")}>View my grievance</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5 }}>
      <Paper elevation={1} sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ bgcolor: goi.navy, color: "#fff", px: 3, py: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>Lodge Public Grievance · लोक शिकायत दर्ज करें</Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Fields marked * are mandatory. Redressal target: 21 days from filing.
          </Typography>
        </Box>

        <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 } }}>
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

          <Box>
            <FieldLegend>1 · Applicant details · आवेदक विवरण</FieldLegend>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" }, gap: 2, mt: 1.5 }}>
              <TextField label="Name · नाम *" value={citizen?.name ?? ""} disabled fullWidth />
              <TextField label="Mobile · मोबाइल *" value={citizen?.mobile ?? ""} disabled fullWidth />
              <TextField label="State · राज्य" value={citizen?.state ?? ""} disabled fullWidth />
            </Box>
          </Box>

          <Divider />
          <Box>
            <FieldLegend>2 · Grievance details · शिकायत विवरण</FieldLegend>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 1.5 }}>
              <Box>
                <InputLabel sx={{ fontSize: 12.5, mb: 0.5 }}>Ministry / Department · मंत्रालय *</InputLabel>
                <Select fullWidth value={ministryId} onChange={(e) => { setMinistryId(e.target.value); setCategoryId(""); }} displayEmpty>
                  <MenuItem value="" disabled>Select ministry</MenuItem>
                  {MINISTRIES.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.nameEn}</MenuItem>
                  ))}
                </Select>
              </Box>
              <Box>
                <InputLabel sx={{ fontSize: 12.5, mb: 0.5 }}>Category · श्रेणी *</InputLabel>
                <Select fullWidth value={categoryId} onChange={(e) => setCategoryId(e.target.value)} displayEmpty disabled={!ministryId}>
                  <MenuItem value="" disabled>{ministryId ? "Select category" : "Select ministry first"}</MenuItem>
                  {cats.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.titleEn}</MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField label="Subject · विषय *" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth
                slotProps={{ htmlInput: { maxLength: 120 } }} helperText={`${subject.length}/120 — a short headline for your case`} />
              <TextField label="Grievance description · शिकायत विवरण *" value={description} onChange={(e) => setDescription(e.target.value)}
                multiline minRows={4} maxRows={8} fullWidth slotProps={{ htmlInput: { maxLength: 1200 } }}
                helperText="Facts only: what happened, when, what you have already tried. Do not include passwords or sensitive IDs." />
              <TextField label="Relief sought · मांगी गई राहत *" value={relief} onChange={(e) => setRelief(e.target.value)}
                multiline minRows={2} fullWidth helperText="What specific outcome do you want?" />
            </Stack>
          </Box>

          <Divider />
          <Box>
            <FieldLegend>3 · Declaration · घोषणा</FieldLegend>
            <FormControlLabel
              sx={{ mt: 1, alignItems: "flex-start" }}
              control={<Checkbox checked={declared} onChange={(e) => setDeclared(e.target.checked)} sx={{ mt: -0.5 }} />}
              label={
                <Typography className="longform" variant="body2" sx={{ lineHeight: 1.6 }}>
                  I declare that the information is true to the best of my knowledge, and that this is not an RTI,
                  sub-judice, religious or service matter. I understand this is a <strong>simulation</strong> and no
                  government system will receive this grievance.
                </Typography>
              }
            />
          </Box>

          <Alert severity="warning" className="longform" sx={{ "& .MuiAlert-message": { fontSize: 12.5 } }}>
            On submission you will see the exact grievance for a final confirmation — nothing is filed without it. Your
            browser agent follows the same rule.
          </Alert>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
            <Button color="inherit" onClick={() => { clearDraft(); setView("home"); }}>Cancel</Button>
            <Button variant="contained" disabled={!valid} onClick={startSubmit}>Review &amp; Submit</Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Tier A confirmation gate — payload shown verbatim */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>
          Confirm submission · जमा करने की पुष्टि करें
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            This is the final human confirmation. Verify the grievance exactly as it will be filed:
          </Typography>
          <Paper variant="outlined" sx={{ p: 1.75, mt: 1.25, bgcolor: "#F8FAFD" }}>
            <Stack spacing={0.75}>
              <KV k="Ministry" v={MINISTRIES.find((m) => m.id === (categoryOf(categoryId)?.ministryId ?? ministryId))?.nameEn ?? "—"} />
              <KV k="Category" v={categoryOf(categoryId)?.titleEn ?? "—"} />
              <KV k="Subject" v={subject} />
              <KV k="Description" v={description.length > 260 ? `${description.slice(0, 260)}…` : description} />
              <KV k="Relief sought" v={relief} />
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Go back and edit</Button>
          <Button variant="contained" onClick={confirmedSubmit}>Confirm &amp; Lodge Grievance</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function FieldLegend({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 12.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: goi.saffronDark }}>
      {children}
    </Typography>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <Stack direction="row" sx={{ gap: 1.5, alignItems: "baseline" }}>
      <Typography variant="caption" sx={{ width: 96, flexShrink: 0, fontWeight: 700, color: "text.secondary" }}>{k}</Typography>
      <Typography className="longform" variant="body2" sx={{ lineHeight: 1.55 }}>{v}</Typography>
    </Stack>
  );
}
