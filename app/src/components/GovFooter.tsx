import { Box, Divider, Stack, Typography } from "@mui/material";
import { goi } from "../theme";

export default function GovFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: "#0A1C38", color: "rgba(255,255,255,0.85)", mt: "auto" }}>
      <Box sx={{ display: "flex", height: 3 }}>
        <Box sx={{ flex: 1, bgcolor: goi.tricolor[0] }} />
        <Box sx={{ flex: 1, bgcolor: goi.tricolor[1] }} />
        <Box sx={{ flex: 1, bgcolor: goi.tricolor[2] }} />
      </Box>
      <Box sx={{ maxWidth: 1180, mx: "auto", px: 2, py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ maxWidth: 640 }}>
            <Typography className="longform" sx={{ fontSize: 12, lineHeight: 1.75 }}>
              <strong style={{ color: "#fff" }}>Simulation prototype.</strong> Inspired by the CPGRAMS grievance lifecycle
              (DARPG). Not affiliated with, endorsed by, or connected to the Government of India. All cases, ministry
              interactions and officials are fictional. <span style={{ opacity: 0.8 }}>· यह एक प्रदर्शन सिमुलेशन है — सभी मामले काल्पनिक हैं।</span>
            </Typography>
          </Box>
          <Stack spacing={0.5} sx={{ alignItems: { xs: "flex-start", md: "flex-end" }, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 11.5, opacity: 0.9 }}>WebMCP Challenge prototype · no backend · state stays in your browser</Typography>
            <Typography sx={{ fontSize: 11.5, opacity: 0.75 }}>Best experienced at 1440 × 900 · Chrome 149+ or ChatGPT's in-app browser</Typography>
          </Stack>
        </Stack>
        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />
        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 11 }}>
          v4 · advocate build · {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
}
