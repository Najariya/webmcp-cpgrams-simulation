import { Box, Divider, Link, Stack, Typography } from "@mui/material";
import { goi } from "../theme";

export default function GovFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: goi.navyDark, color: "rgba(255,255,255,0.82)", mt: "auto" }}>
      <Box sx={{ display: "flex", height: 3 }}>
        <Box sx={{ flex: 1, bgcolor: goi.tricolor[0] }} />
        <Box sx={{ flex: 1, bgcolor: goi.tricolor[1] }} />
        <Box sx={{ flex: 1, bgcolor: goi.tricolor[2] }} />
      </Box>
      <Box sx={{ maxWidth: 1180, mx: "auto", px: 2, py: 2.5 }}>
        <Typography sx={{ fontSize: 12, lineHeight: 1.7 }}>
          <strong style={{ color: "#fff" }}>Simulation prototype.</strong> Inspired by the CPGRAMS grievance lifecycle
          (DARPG). Not affiliated with, endorsed by, or connected to the Government of India. All cases, ministries
          interactions and officials are fictional. · यह एक प्रदर्शन सिमुलेशन है — सभी मामले काल्पनिक हैं।
        </Typography>
        <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.15)" }} />
        <Stack direction="row" sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography sx={{ fontSize: 11.5, opacity: 0.75 }}>
            WebMCP Challenge prototype · no backend · state stays in your browser
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link href="#" sx={{ color: "#9FC0E8", fontSize: 11.5 }}>Disclaimer</Link>
            <Link href="#" sx={{ color: "#9FC0E8", fontSize: 11.5 }}>Website Policies</Link>
            <Link href="#" onClick={(e) => e.preventDefault()} sx={{ color: "#9FC0E8", fontSize: 11.5 }}>Best viewed 1440 × 900</Link>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
