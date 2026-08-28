import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Typography } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { goi } from "../theme";
import { FAQS } from "../i18n";
import { useAppStore } from "../store";

/** FAQs — the same knowledge `get_kb_answer` serves your agent (docs/00-facts.md). */
export default function FaqScreen() {
  const [open, setOpen] = useState<number | false>(0);
  const lang = useAppStore((s) => s.lang);
  const faqs = FAQS[lang];
  return (
    <Box sx={{ maxWidth: 860, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5 }}>
      <Paper elevation={1} sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ bgcolor: goi.navy, color: "#fff", px: 3, py: 2, borderBottom: "3px solid", borderColor: goi.saffron }}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: "1.0312rem" }}>
            {lang === "hi" ? "सामान्य प्रश्न · FAQs" : "Frequently Asked Questions · सामान्य प्रश्न"}
          </Typography>
          <Typography className="longform" variant="caption" sx={{ opacity: 0.9 }}>
            {lang === "hi"
              ? "वही नियम जिनके जवाब आपका ब्राउज़र एजेंट get_kb_answer टूल से देता है।"
              : "The same rules your browser agent answers through the get_kb_answer tool."}
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
          {faqs.map((f, i) => (
            <Accordion key={f.q} expanded={open === i} onChange={(_, v) => setOpen(v ? i : false)} disableGutters>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                {f.q}
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography className="longform" variant="body2" sx={{ lineHeight: 1.7, color: "text.secondary" }}>{f.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
