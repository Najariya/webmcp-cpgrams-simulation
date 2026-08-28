import { Box, Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import SmartToy from "@mui/icons-material/SmartToy";
import PageHeader from "./PageHeader";
import { useAppStore } from "../store";
import { categoryOf, ministryOf } from "../data/catalog";
import { draftIsValid } from "../domain/types";
import { goi } from "../theme";
import { dict } from "../i18n";

/**
 * Grievance review (Screen 3, v4 §14) — where an agent-prepared draft lands.
 * The citizen edits anything, then explicitly confirms submission; the same
 * human gate the WebMCP tool enforces.
 */
export default function DraftReview() {
  const { draft, lang, saveDraft, clearDraft, submitActiveDraft, setView } = useAppStore();
  const d = dict(lang);
  if (!draft) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">No grievance draft in progress.</Typography>
        <Typography className="longform" variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {d.review.draftEmpty}
        </Typography>
      </Box>
    );
  }
  const cat = categoryOf(draft.categoryId);

  const confirm = () => {
    if (window.confirm(d.review.lodgeConfirm)) {
      submitActiveDraft();
    }
  };

  return (
    <Box sx={{ maxWidth: 820, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5 }}>
      <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: "12px" }}>
        <PageHeader
          title="Grievance review · शिकायत समीक्षा"
          sub={d.review.draftSub}
        />
        <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 } }}>
          <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 1.5, bgcolor: "#F5F3FB", borderColor: "#DCD8EE", display: "flex", gap: 1.5, alignItems: "center" }}>
            <SmartToy sx={{ fontSize: "1.1875rem", color: "#5B4AA0" }} />
            <Typography variant="body2" sx={{ color: "#4A3E86" }}>
              {d.review.draftByAgent}
            </Typography>
          </Paper>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Ministry / Department"
              value={ministryOf(draft.ministryId)?.nameEn ?? ""}
              disabled fullWidth size="small"
            />
            <TextField label="Category" value={cat?.titleEn ?? draft.categoryId} disabled fullWidth size="small" />
          </Stack>
          <TextField
            label="Subject"
            value={draft.subject}
            onChange={(e) => saveDraft({ ...draft, subject: e.target.value })}
            fullWidth slotProps={{ htmlInput: { maxLength: 120 } }}
          />
          <TextField
            label="Grievance description"
            value={draft.description}
            onChange={(e) => saveDraft({ ...draft, description: e.target.value })}
            multiline minRows={4} fullWidth slotProps={{ htmlInput: { maxLength: 1200 } }}
          />
          <TextField
            label="Relief sought"
            value={draft.reliefRequested}
            onChange={(e) => saveDraft({ ...draft, reliefRequested: e.target.value })}
            multiline minRows={2} fullWidth slotProps={{ htmlInput: { maxLength: 300 } }}
          />

          <Divider />
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end", flexWrap: "wrap", rowGap: 1 }}>
            <Button color="inherit" onClick={() => { clearDraft(); setView("home"); }}>{d.review.discard}</Button>
            <Button variant="contained" disabled={!draftIsValid(draft)} onClick={confirm} sx={{ bgcolor: goi.navy, "&:hover": { bgcolor: "#123A75" } }}>
              {d.review.confirmLodge}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
