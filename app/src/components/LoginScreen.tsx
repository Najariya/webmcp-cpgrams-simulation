import { useState } from "react";
import { Alert, Box, Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAlt1 from "@mui/icons-material/PersonAddAlt1";
import { DEMO_CITIZEN, useAppStore } from "../store";
import { goi } from "../theme";
import { dict } from "../i18n";

/**
 * CPGRAMS-style citizen sign-in (mapped, simulated): OTP over mobile is the
 * real portal's primary path; here any credentials work and the demo citizen
 * profile is one click. No real authentication exists by design.
 */
export default function LoginScreen() {
  const { signIn, lang } = useAppStore();
  const d = dict(lang);
  const [name, setName] = useState(DEMO_CITIZEN.name);
  const [mobile, setMobile] = useState(DEMO_CITIZEN.mobile);
  const [otp, setOtp] = useState("4-2-6-9 demo");
  const [mode, setMode] = useState<"signin" | "register">("signin");

  const submit = () => {
    signIn({
      name: name.trim() || DEMO_CITIZEN.name,
      mobile: mobile.trim() || DEMO_CITIZEN.mobile,
      email: DEMO_CITIZEN.email,
      state: DEMO_CITIZEN.state,
    });
  };

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", width: 1, p: { xs: 2, md: 3 } }}>
      <Paper elevation={1} sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ bgcolor: goi.navy, color: "#fff", px: 3, py: 2, borderBottom: "3px solid", borderColor: goi.saffron }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.0625rem" }}>
            {mode === "signin" ? "Citizen Sign In · नागरिक साइन इन" : "Citizen Registration · नागरिक पंजीकरण"}
          </Typography>
          <Typography className="longform" variant="caption" sx={{ opacity: 0.9 }}>
            {mode === "signin"
              ? `${d.login.sub} · शिकायत दर्ज करने व स्थिति देखने के लिए साइन इन करें।`
              : `${d.login.sub} · शिकायत दर्ज करने व स्थिति देखने के लिए पंजीकरण करें।`}
          </Typography>
        </Box>

        <Stack spacing={2.25} sx={{ p: 3 }}>
          {mode === "register" && (
            <TextField label="Full name · पूरा नाम" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
          )}
          <TextField
            label="Mobile number · मोबाइल नंबर"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            fullWidth
            required
            helperText={d.login.otpHelper}
          />
          <TextField label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} fullWidth required helperText={d.login.demoOtp} />
          <Button variant="contained" size="large" startIcon={<LoginIcon />} onClick={submit} fullWidth>
            {mode === "signin" ? d.login.verify : d.login.register}
          </Button>
          <Divider>{d.common.or}</Divider>
          <Button
            variant="outlined"
            startIcon={<PersonAddAlt1 />}
            onClick={() => {
              setMode((m) => (m === "signin" ? "register" : "signin"));
            }}
            fullWidth
          >
            {mode === "signin" ? d.login.newUser : d.login.already}
          </Button>
          <Alert severity="info" className="longform" sx={{ "& .MuiAlert-message": { fontSize: "0.7812rem" } }}>
            {d.login.alert}
          </Alert>
        </Stack>
      </Paper>
    </Box>
  );
}
