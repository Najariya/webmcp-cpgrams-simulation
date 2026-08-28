import { Box, Typography } from "@mui/material";
import { goi } from "../theme";

/** Government page header band (matches Lodge/Status screens). */
export default function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: goi.navy, color: "#fff", px: 3, py: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        {sub && <Typography variant="caption" sx={{ opacity: 0.85 }}>{sub}</Typography>}
      </Box>
      {right}
    </Box>
  );
}
