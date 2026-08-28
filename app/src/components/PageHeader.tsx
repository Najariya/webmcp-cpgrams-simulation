import { Box, Typography } from "@mui/material";
import { goi } from "../theme";

/** Government page header band (matches Lodge/Status/Case/Agent screens). */
export default function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: goi.navy,
        color: "#fff",
        px: { xs: 2, md: 3 },
        py: 2.25,
        display: "flex",
        flexWrap: "wrap",
        gap: 1.5,
        alignItems: "center",
        borderBottom: "3px solid",
        borderColor: goi.saffron,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography sx={{ fontSize: 16.5, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1.35 }}>{title}</Typography>
        {sub && (
          <Typography className="longform" sx={{ fontSize: 12, opacity: 0.9, lineHeight: 1.55, mt: 0.25 }}>
            {sub}
          </Typography>
        )}
      </Box>
      {right}
    </Box>
  );
}
