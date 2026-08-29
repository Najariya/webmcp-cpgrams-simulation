import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControlLabel, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography,
} from "@mui/material";
import TaskAlt from "@mui/icons-material/TaskAlt";
import { CATEGORIES, MINISTRIES, categoryOf } from "../data/catalog";
import { draftIsValid, type GrievanceDraft } from "../domain/types";
import { useAppStore } from "../store";
import { dict } from "../i18n";
import { goi } from "../theme";

/**
 * CPGRAMS-style Lodge Public Grievance form (mapped, simulated).
 * Personal info → ministry/category cascade → grievance & relief → declaration →
 * explicit confirmation (Tier A human gate) → registration ID.
 */
export default function LodgeForm() {
  const { citizen, lang, saveDraft, submitActiveDraft, clearDraft, draft, setView, select } = useAppStore();
  const d = dict(lang);
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
      setError(!declared ? d.lodge.errDeclaration : d.lodge.errFields);
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
          <TaskAlt sx={{ fontSize: "3.375rem", color: goi.green }} />
          <Typography variant="h6" sx={{ mt: 1.5 }}>{d.lodge.successTitle}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {d.lodge.successSub}
          </Typography>
          <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "1.625rem", fontWeight: 700, color: goi.navy, my: 2, letterSpacing: "0.06em" }}>
            {submitted}
          </Typography>
          <Typography className="longform" variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5, lineHeight: 1.6 }}>
            {d.lodge.successCaption}
          </Typography>
          <Button variant="contained" onClick={() => setView("case")}>{d.lodge.viewGrievance}</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5 }}>
      <Paper elevation={1} sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ bgcolor: goi.navy, color: "#fff", px: 3, py: 2 }}>
          <Typography component="h2" sx={{ fontWeight: 700 }}>{lang === "hi" ? "लोक शिकायत दर्ज करें · Lodge Public Grievance" : "Lodge Public Grievance · लोक शिकायत दर्ज करें"}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {d.lodge.bandSub}
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
                <InputLabel sx={{ fontSize: "0.7812rem", mb: 0.5 }}>Ministry / Department · मंत्रालय *</InputLabel>
                <Select fullWidth value={ministryId} onChange={(e) => { setMinistryId(e.target.value); setCategoryId(""); }} displayEmpty>
                  <MenuItem value="" disabled>{d.lodge.selectMinistry}</MenuItem>
                  {MINISTRIES.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.nameEn}</MenuItem>
                  ))}
                </Select>
              </Box>
              <Box>
                <InputLabel sx={{ fontSize: "0.7812rem", mb: 0.5 }}>Category · श्रेणी *</InputLabel>
                <Select fullWidth value={categoryId} onChange={(e) => setCategoryId(e.target.value)} displayEmpty disabled={!ministryId}>
                  <MenuItem value="" disabled>{ministryId ? d.lodge.selectCategory : d.lodge.selectMinistryFirst}</MenuItem>
                  {cats.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.titleEn}</MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField label="Subject · विषय *" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth
                slotProps={{ htmlInput: { maxLength: 120 } }} helperText={d.lodge.subjectHelper(subject.length)} />
              <TextField label="Grievance description · शिकायत विवरण *" value={description} onChange={(e) => setDescription(e.target.value)}
                multiline minRows={4} maxRows={8} fullWidth slotProps={{ htmlInput: { maxLength: 1200 } }}
                helperText={d.lodge.descHelper} />
              <TextField label="Relief sought · मांगी गई राहत *" value={relief} onChange={(e) => setRelief(e.target.value)}
                multiline minRows={2} fullWidth helperText={d.lodge.reliefHelper} />
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
                  {d.lodge.declaration1}<strong>{d.lodge.declaration2}</strong>{d.lodge.declaration3}
                </Typography>
              }
            />
          </Box>

          <Alert severity="warning" className="longform" sx={{ "& .MuiAlert-message": { fontSize: "0.7812rem" } }}>
            {d.lodge.warn}
          </Alert>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
            <Button color="inherit" onClick={() => { clearDraft(); setView("home"); }}>{d.common.cancel}</Button>
            <Button variant="contained" disabled={!valid} onClick={startSubmit}>{d.lodge.reviewSubmit}</Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Tier A confirmation gate — payload shown verbatim */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>
          {d.lodge.dialogTitle}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {d.lodge.dialogCaption}
          </Typography>
          <Paper variant="outlined" sx={{ p: 1.75, mt: 1.25, bgcolor: "#F8FAFD" }}>
            <Stack spacing={0.75}>
              <KV k={d.lodge.kvMinistry} v={MINISTRIES.find((m) => m.id === (categoryOf(categoryId)?.ministryId ?? ministryId))?.nameEn ?? "—"} />
              <KV k={d.lodge.kvCategory} v={categoryOf(categoryId)?.titleEn ?? "—"} />
              <KV k={d.lodge.kvSubject} v={subject} />
              <KV k={d.lodge.kvDescription} v={description.length > 260 ? `${description.slice(0, 260)}…` : description} />
              <KV k={d.lodge.kvRelief} v={relief} />
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>{d.lodge.goBack}</Button>
          <Button variant="contained" onClick={confirmedSubmit}>{d.lodge.confirmLodge}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function FieldLegend({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: "0.7812rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: goi.saffronDark }}>
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
