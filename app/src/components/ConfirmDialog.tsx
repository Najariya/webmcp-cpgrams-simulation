import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from "@mui/material";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import { useConfirmStore } from "../webmcp/confirm";
import { announce } from "../webmcp/voice";
import { useAppStore } from "../store";
import { dict } from "../i18n";

/**
 * The human gate (v4 §28). When a consequential tool call asks for approval,
 * this dialog shows the exact payload and records the decision. It is the
 * single point where "your agent asks you first" becomes visible.
 */
export default function ConfirmDialog() {
  const { request, approve, decline, clearRequest } = useConfirmStore();
  const lang = useAppStore((s) => s.lang);
  const d = dict(lang);
  const [left, setLeft] = useState(60);

  useEffect(() => {
    if (!request) return;
    setLeft(60);
    announce(
      `An action needs your approval in the page: ${request.title}. Nothing is committed until you confirm.`,
      useAppStore.getState().lang,
    );
    const t = setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          clearRequest();
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [request, clearRequest]);

  if (!request) return null;

  return (
    <Dialog open onClose={decline} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25, fontSize: "1rem", fontWeight: 700, pb: 1 }}>
        <ShieldOutlined sx={{ fontSize: "1.25rem", color: "secondary.main" }} />
        Confirm action · पुष्टि करें
        <Typography component="span" variant="caption" sx={{ ml: "auto", color: "text.secondary", fontWeight: 600 }}>
          {left}s
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1.5 }}>
        <Typography className="longform" variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
          {d.dialog.body.replace("{action}", request.action)}
        </Typography>
        <Paper variant="outlined" sx={{ p: 1.75, bgcolor: "#F8FAFD", borderRadius: 1.5 }}>
          <Stack spacing={0.75}>
            {request.rows.map((r) => (
              <Stack key={r.k} direction="row" sx={{ gap: 1.5, alignItems: "baseline" }}>
                <Typography variant="caption" sx={{ width: 110, flexShrink: 0, fontWeight: 700, color: "text.secondary" }}>{r.k}</Typography>
                <Typography className="longform" variant="body2" sx={{ lineHeight: 1.55, minWidth: 0, wordBreak: "break-word" }}>
                  {r.v.length > 220 ? `${r.v.slice(0, 220)}…` : r.v}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={decline} color="inherit">{d.common.decline}</Button>
        <Button variant="contained" color="secondary" onClick={approve}>{d.common.confirm}</Button>
      </DialogActions>
    </Dialog>
  );
}
