import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Input,
  InputLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import BackGround from "../../../assets/images/bg4.png";
import LoginIcon from "@mui/icons-material/Login";
import Button from "@mui/material/Button";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import { loginAsAdmin } from "../../../service/auth/Auth";
import useAuth from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
const LoginAdmin = () => {
  const navigation = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { updateLanguage, fetchTableControlTranslations, language } =
    useColumnTranslation();
  const [controlTranslations, setControlTranslations] = useState([]);

  const handleRegister = () => {
    navigation("/register");
  };
  const handleLanguage = async (e) => {
    e.preventDefault();
    const newLanguage = e.target.value;

    //  Update language TRƯỚC để tránh delay
    await updateLanguage(newLanguage);

    //  Sau đó mới update i18n
    i18n.changeLanguage(newLanguage);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    try {
      const response = await loginAsAdmin(data);
      console.log("Login response:", response.data);
      if (response.success) {
        await login(response);
        toast.success(t("Login successful"));
        navigation("/");
      }
    } catch (error) {
      toast.error(t(`Login failed because ${error?.response?.data?.message}`));
    }
  };

  const fetchAllTranslations = async () => {
    try {
      const [controls] = await fnQuery([
        () => fetchTableControlTranslations("ADMIN_LOGIN"),
      ]);
      // combinedData[0] = column translations
      // combinedData[1] = control translations
      if (controls) {
        setControlTranslations(controls?.data);
      }
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };
  useEffect(() => {
    console.log("🌍 Language changed to:", language);
    fetchAllTranslations();
  }, [language]);
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode
    );
    return translation?.title || fallback;
  };
  return (
    <>
      <ToastContainer />
      <Box
        sx={{
          backgroundImage: `url(${BackGround})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <Box
          component="form"
          sx={{
            width: "418px",
            margin: "0 auto",
            backgroundColor: "white",
            boxShadow:
              "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
          }}
          onSubmit={handleLogin}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "48px",
              backgroundColor: "#009688",
              color: "white",
              padding: "4px 16px",
            }}
          >
            <AirportShuttleIcon sx={{ width: "24px", marginRight: "4px" }} />
            <Typography variant="h6" sx={{ fontSize: "1.25rem" }}>
              {getControlLabel("ttl_login", "Login System CH-VISITOR")}
            </Typography>
          </Box>
          <FormGroup sx={{ padding: "16px", gap: "7px" }}>
            <fieldset
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              <legend style={{ fontWeight: "bold" }}>
                {getControlLabel("ftxt_language", "(4)Language Section")}
              </legend>
              <FormGroup>
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    defaultValue={language}
                    onChange={handleLanguage}
                  >
                    <FormControlLabel
                      value="en"
                      control={<Radio size="small" color="#009688" />}
                      label="English"
                    />
                    <FormControlLabel
                      value="zh"
                      control={<Radio size="small" color="#009688" />}
                      label="中文"
                    />
                    <FormControlLabel
                      value="vi"
                      control={<Radio size="small" color="#009688" />}
                      label="Tiếng Việt"
                    />
                  </RadioGroup>
                </FormControl>
              </FormGroup>
            </fieldset>
            <FormControl>
              <InputLabel htmlFor="user_code">
                {getControlLabel("txt_user_code", "User Code")}
              </InputLabel>
              <Input
                id="user_code"
                name="user_code"
                aria-describeby="my helper-text"
                required
              />
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="password">
                {getControlLabel("txt_user_password", "Password")}
              </InputLabel>
              <Input
                id="password"
                type="password"
                name="user_password"
                aria-describeby="my helper-text"
              />
            </FormControl>
            <Divider
              sx={{
                height: "1px",
                color: "#000000",
                marginTop: "8px",
                marginBottom: "16px",
              }}
            />
            <fieldset
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              <legend style={{ fontWeight: "bold" }}>
                {getControlLabel("ftxt_environment", "(3)Environment Section")}
              </legend>
              <FormControl>
                <RadioGroup
                  row
                  aria-labelledby="env-radio-buttons-group-label"
                  name="env-radio-buttons-group"
                  defaultValue="UAT TEST"
                >
                  <FormControlLabel
                    value="UAT TEST"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "#009688",
                          "&.Mui-checked": { color: "#009688" },
                        }}
                      />
                    }
                    label="UAT TEST"
                  />
                  <FormControlLabel
                    value="888 PROD"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "#009688",
                          "&.Mui-checked": { color: "#009688" },
                        }}
                      />
                    }
                    label="888 PROD"
                  />
                </RadioGroup>
              </FormControl>
            </fieldset>
            <Divider
              sx={{
                height: "1px",
                color: "#000000",
                marginTop: "8px",
                marginBottom: "16px",
              }}
            />
          </FormGroup>
          <FormControl
            sx={{
              width: "100%",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                cursor: "pointer",
                display: "flex",
                justifyContent: "flex-end",
                width: "95%",
                height: "36px",
                marginLeft: "auto",
                marginRight: "auto",
                marginBottom: "8px",
                gap: "5px",
              }}
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={
                  <LoginIcon
                    sx={{ color: "white", fontSize: 14, fontWeight: "500" }}
                  />
                }
                sx={{
                  color: "white",
                  textTransform: "uppercase",
                  backgroundColor: "blue",
                   width: "140px",
                  height: "36px",
                  fontSize: "14px",
                  padding: "0px 16px",
                  fontWeight: "500",
                  "& .MuiButton-startIcon": {
                    marginRight: "4px",
                  },
                }}
                onClick={handleRegister}
              >
                  {getControlLabel("btn_register","REGISTER")}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={
                  <LoginIcon
                    sx={{ color: "white", fontSize: 14, fontWeight: "500" }}
                  />
                }
                sx={{
                  color: "white",
                  textTransform: "uppercase",
                  backgroundColor: "#009688",
                   width: "140px",
                  height: "36px",
                  fontSize: "14px",
                  padding: "0px 16px",
                  fontWeight: "500",
                  "& .MuiButton-startIcon": {
                    marginRight: "4px",
                  },
                }}
                type="submit"
              >
                {getControlLabel("btn_login","Login")}
              </Button>
            </Box>
          </FormControl>
        </Box>
      </Box>
    </>
  );
};
export default LoginAdmin;
