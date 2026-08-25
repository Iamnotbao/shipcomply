import {
  Box,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import BackGround from "../../../assets/images/bg4.png";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { register } from "../../../service/auth/Auth";
import { useEffect, useState } from "react";
import { fetchFactory } from "../../../service/factory/factoryService";
import { fnQuery } from "../../../utils/fnQuery";
import Dropdown from "../../../component/dropdown/Dropdown";

// ─── Design tokens (same as Login) ───────────────────────────────────────────
const NAVY     = "#0a1f44";
const NAVY_MID = "#1e3a6c";
const BORDER   = "#d1dce8";
const MUTED    = "#64748b";
const LIGHT_BG = "#eef2f8";

// ─── Shared style objects (same as Login) ────────────────────────────────────

const sectionLabelSx = {
  position: "absolute",
  top: "-8px",
  left: "10px",
  background: "#fff",
  px: 0.75,
  fontSize: "0.56rem",
  fontWeight: 800,
  color: NAVY,
  textTransform: "uppercase",
  letterSpacing: "0.13em",
  lineHeight: 1,
  userSelect: "none",
};

const fieldLabelSx = {
  fontSize: "0.61rem",
  fontWeight: 700,
  color: MUTED,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  mb: 0.45,
  lineHeight: 1,
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "7px",
    fontSize: "0.84rem",
    color: NAVY,
    backgroundColor: "#f8fafc",
    "& fieldset": {
      borderColor: BORDER,
      borderWidth: "1.5px",
      transition: "border-color 0.12s",
    },
    "&:hover fieldset": { borderColor: NAVY_MID },
    "&.Mui-focused fieldset": { borderColor: NAVY, borderWidth: "2px" },
    "&.Mui-focused": { backgroundColor: "#fff" },
  },
  "& .MuiInputBase-input": { padding: "9px 12px" },
};

// ─── Static data ─────────────────────────────────────────────────────────────

const LANG_OPTIONS = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "vi", label: "Tiếng Việt" },
];

// ─── Component ───────────────────────────────────────────────────────────────
const Register = () => {
  const navigation = useNavigate();
  const [factory, setFactory]             = useState([]);
  const [selectFactory, setSelectFactory] = useState("");
  const [selectedLang, setSelectedLang]   = useState("en");

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.factory_code = selectFactory.factory_code;
    const result = await register(data);
    if (result) {
      navigation("/login");
    } else {
      console.log("cannot register");
    }
  };

  const handleLogin = () => navigation("/login");

  function handleSelectFactory(f) {
    setSelectFactory(f);
  }

  useEffect(() => {
    const fetch = async () => {
      const combinedData = await fnQuery([fetchFactory]);
      setFactory(combinedData);
    };
    fetch();
  }, []);

  return (
    <>
      {/* ── Full-page background ─────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundImage: `url(${BackGround})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 3,
        }}
      >
        {/* Navy gradient overlay — lighter (same as Login) */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(10,31,68,0.58) 0%, rgba(26,58,108,0.42) 100%)",
            backdropFilter: "blur(3px)",
          }}
        />

        {/* ── Card ──────────────────────────────────────────────────── */}
        <Box
          component="form"
          onSubmit={handleRegister}
          sx={{
            position: "relative",
            zIndex: 1,
            width: { xs: "calc(100% - 32px)", sm: "420px" },
            background: "#fff",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 24px 60px rgba(10,31,68,0.42), 0 6px 18px rgba(10,31,68,0.22)",
          }}
        >
          {/* ── Header ──────────────────────────────────────────────── */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
              px: 2.5,
              py: 1.8,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* Icon badge */}
            <Box
              sx={{
                background: "rgba(255,255,255,0.13)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: "9px",
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AirportShuttleIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>

            {/* Title */}
            <Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  letterSpacing: "0.01em",
                  lineHeight: 1.2,
                }}
              >
                CH-VISITOR Portal
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.46)", fontSize: "0.6rem", mt: 0.25 }}
              >
                Create a new account
              </Typography>
            </Box>
          </Box>

          {/* ── Form body ───────────────────────────────────────────── */}
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.6,
            }}
          >

            {/* 1 ── Language section box ─────────────────────────── */}
            <Box
              sx={{
                position: "relative",
                border: `1.5px solid ${BORDER}`,
                borderRadius: "8px",
                p: 1.5,
                pt: 2,
              }}
            >
              <Typography sx={sectionLabelSx}>Language</Typography>
              <Box sx={{ display: "flex", gap: 0.6 }}>
                {LANG_OPTIONS.map((opt) => (
                  <Box
                    key={opt.value}
                    onClick={() => setSelectedLang(opt.value)}
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      py: 0.55,
                      px: 0.5,
                      borderRadius: "6px",
                      border: "1.5px solid",
                      cursor: "pointer",
                      fontSize: "0.71rem",
                      fontWeight: selectedLang === opt.value ? 700 : 400,
                      transition: "all 0.12s ease",
                      userSelect: "none",
                      borderColor: selectedLang === opt.value ? NAVY : BORDER,
                      background: selectedLang === opt.value ? NAVY : "#f8fafc",
                      color: selectedLang === opt.value ? "#fff" : MUTED,
                      "&:hover": {
                        borderColor: NAVY,
                        color: selectedLang === opt.value ? "#fff" : NAVY,
                      },
                    }}
                  >
                    {opt.label}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* 2 ── Personal Info section box ────────────────────── */}
            <Box
              sx={{
                position: "relative",
                border: `1.5px solid ${BORDER}`,
                borderRadius: "8px",
                p: 1.5,
                pt: 2,
              }}
            >
              <Typography sx={sectionLabelSx}>Personal Info</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
                {/* Full Name */}
                <Box>
                  <Typography sx={fieldLabelSx}>
                    Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="user_name_e"
                    id="user_name_e"
                    required
                    sx={textFieldSx}
                  />
                </Box>

                {/* Email */}
                <Box>
                  <Typography sx={fieldLabelSx}>
                    Email Address <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    name="email"
                    id="email"
                    required
                    sx={textFieldSx}
                  />
                </Box>

                {/* Phone */}
                <Box>
                  <Typography sx={fieldLabelSx}>Phone</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="phone"
                    id="phone"
                    inputMode="numeric"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              color: MUTED,
                              mr: 0.25,
                            }}
                          >
                            +84
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={textFieldSx}
                  />
                </Box>
              </Box>
            </Box>

            {/* thin gradient divider */}
            <Box
              sx={{
                height: "1px",
                background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`,
              }}
            />

            {/* 3 ── Security ─────────────────────────────────────── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
              {/* Password */}
              <Box>
                <Typography sx={fieldLabelSx}>
                  Password <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  name="user_password"
                  id="user_password"
                  required
                  sx={textFieldSx}
                />
              </Box>

              {/* Confirm Password */}
              <Box>
                <Typography sx={fieldLabelSx}>
                  Confirm Password <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  name="confirm_password"
                  id="confirm_password"
                  required
                  sx={textFieldSx}
                />
              </Box>
            </Box>

            {/* thin gradient divider */}
            <Box
              sx={{
                height: "1px",
                background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`,
              }}
            />

            {/* 4 ── Workspace section box ────────────────────────── */}
            <Box
              sx={{
                position: "relative",
                border: `1.5px solid ${BORDER}`,
                borderRadius: "8px",
                p: 1.5,
                pt: 2,
              }}
            >
              <Typography sx={sectionLabelSx}>Workspace</Typography>
              <Box>
                <Typography sx={{ ...fieldLabelSx, mb: 0.4 }}>
                  Factory <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                {factory.length > 0 &&
                  factory.map((f, index) => (
                    <Dropdown
                      key={index}
                      selectFactory={selectFactory}
                      data={f.data}
                      onSelectFactory={handleSelectFactory}
                    />
                  ))}
              </Box>
            </Box>

            {/* thin gradient divider */}
            <Box
              sx={{
                height: "1px",
                background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`,
              }}
            />

            {/* 5 ── Buttons ──────────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* Back to Login — navy outline */}
              <Button
                onClick={handleLogin}
                sx={{
                  flex: 1,
                  height: 42,
                  border: `2px solid ${NAVY}`,
                  color: NAVY,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  borderRadius: "8px",
                  textTransform: "none",
                  letterSpacing: "0.02em",
                  boxShadow: "none",
                  "&:hover": {
                    background: LIGHT_BG,
                    border: `2px solid ${NAVY}`,
                    boxShadow: "none",
                  },
                }}
              >
                Back to Login
              </Button>

              {/* Register — navy fill */}
              <Button
                type="submit"
                sx={{
                  flex: 1,
                  height: 42,
                  background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  borderRadius: "8px",
                  textTransform: "none",
                  letterSpacing: "0.02em",
                  boxShadow: "none",
                  "&:hover": {
                    background: `linear-gradient(135deg, #0d2852 0%, #1a3a6c 100%)`,
                    boxShadow: "0 4px 12px rgba(10,31,68,0.30)",
                  },
                }}
              >
                Register
              </Button>
            </Box>

          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Register;