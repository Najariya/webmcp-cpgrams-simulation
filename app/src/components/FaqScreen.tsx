import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Typography } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { goi } from "../theme";

/** FAQs — the same knowledge `get_kb_answer` serves your agent (docs/00-facts.md). */
const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the redressal timeline?",
    a: "The redressal target is 21 days from filing. If redressal is delayed, the ministry must record an interim reply explaining the reason — a pending case past 21 days with no interim response is exactly when a reminder is most justified.",
  },
  {
    q: "How do I follow up on a pending grievance?",
    a: "On grievances past the 21-day target you may send a Reminder — at most once every 7 days in this simulation. Your browser agent can send it for you, with your confirmation.",
  },
  {
    q: "What happens after my grievance is disposed?",
    a: "You rate the disposal. A Satisfactory or Average rating closes the case. A Poor rating opens the appeal option for 30 days from disposal.",
  },
  {
    q: "How do appeals work?",
    a: "Appeals go to the ministry's Nodal Appellate Authority (an officer of Additional Secretary / Joint Secretary rank) and are targeted for disposal within about 30 days. The appeal keeps the case alive until the appeal itself is disposed.",
  },
  {
    q: "Which matters are not taken up?",
    a: "RTI matters, sub-judice (court) matters, religious matters, and service matters of government employees are outside the grievance system's scope.",
  },
  {
    q: "Is this the real CPGRAMS?",
    a: "No. This is a labelled simulation built for the WebMCP Challenge: fictional cases, ministries and officials; no government connectivity; state stored only in your browser. It is not affiliated with the Government of India.",
  },
  {
    q: "What can my browser agent do here?",
    a: "Through WebMCP, your agent can read your case status and SLA picture, answer process questions, check for duplicates before filing, prepare drafts, and — only with your explicit in-page confirmation — send reminders, record feedback and submit grievances or appeals.",
  },
];

export default function FaqScreen() {
  const [open, setOpen] = useState<number | false>(0);
  return (
    <Box sx={{ maxWidth: 860, mx: "auto", width: 1, px: { xs: 1.5, md: 2 }, py: 2.5 }}>
      <Paper elevation={1} sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ bgcolor: goi.navy, color: "#fff", px: 3, py: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>Frequently Asked Questions · सामान्य प्रश्न</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            The same rules your browser agent answers through the get_kb_answer tool.
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
          {FAQS.map((f, i) => (
            <Accordion key={f.q} expanded={open === i} onChange={(_, v) => setOpen(v ? i : false)} disableGutters>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ fontWeight: 600, fontSize: 14 }}>
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
