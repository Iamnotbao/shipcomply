import { Alert, Box, CircularProgress, TextField, Typography } from "@mui/material";
import BackGround from "../../../assets/images/bg3.png";
import Logo from "../../../assets/images/logo.png";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { fetchFactory } from "../../../service/factory/factoryService";
import { fetchUserByFactory } from "../../../service/user/userService";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fnQuery } from "../../../utils/fnQuery";
import { loginAsUser } from "../../../service/auth/Auth";
import useAuth from "../../../hooks/useAuth";
import {
  fetchDepartmentByFac,
  fetchDepartments,
} from "../../../service/factory_departments/FacDepartmentService";
import { useTranslation } from "react-i18next";

import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import {
  fetchPermissionByFactoryAndUser,
  fetchPermissionByUser,
} from "../../../service/users_permission/UsersPermission";
import NotificationPermission from "../../../component/dialog/NotificationPermission";
import { fetchUPDByUser } from "../../../service/users_permisison_department/usersPermissionDepartmentService";
import {
  showDatabaseUnavailableToast,
  showErrorToast,
  showSuccessToast,
} from "../../../utils/notification/Notification";
import { AUTH_ERROR_MAP } from "../../../constants/errors/authErrors";
import { DEFAULT_SITE_KEY } from "../../../config/sites";
import { useSite } from "../../../context/siteContextStore";

// ─── Design tokens — Green + Orange (match Sidebar) ──────────────────────────
const GREEN = "#1a6b1a";
const GREEN_MID = "#2d8c30";
const ORANGE = "#c95f00";
const ORANGE_MID = "#e07010";
const BORDER = "#c8dcc8"; // green-tinted border
const MUTED = "#64748b";
const LIGHT_BG = "#edf7ed"; // green-tinted light bg

// ─── Shared style objects ────────────────────────────────────────────────────

const sectionLabelSx = {
  position: "absolute",
  top: "-8px",
  left: "10px",
  background: "#fff",
  px: 0.75,
  fontSize: "0.56rem",
  fontWeight: 800,
  color: GREEN,
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
    color: "#1a1a1a",
    backgroundColor: "#f6faf6",
    "& fieldset": {
      borderColor: BORDER,
      borderWidth: "1.5px",
      transition: "border-color 0.12s",
    },
    "&:hover fieldset": { borderColor: GREEN_MID },
    "&.Mui-focused fieldset": { borderColor: GREEN, borderWidth: "2px" },
    "&.Mui-focused": { backgroundColor: "#fff" },
  },
  "& .MuiInputBase-input": { padding: "9px 12px" },
};

// ─── Static data ─────────────────────────────────────────────────────────────

const LANG_OPTIONS = [
  { value: "en", labelKey: "txt_english", labelFallback: "English" },
  { value: "zh", labelKey: "txt_chinese", labelFallback: "中文" },
  { value: "vi", labelKey: "txt_vietnamese", labelFallback: "Tiếng Việt" },
];

const FACTORY_ENV_MAP = {
  2210: [
    {
      value: "VG350",
      labelFallback: "VG350",
      labelKey: "txt_production",
      dotColor: "#e65100",
      badge: "PROD",
      badgeBg: "rgba(230,81,0,0.12)",
      badgeColor: "#c95f00",
    },
    {
      value: "VG380",
      labelFallback: "VG380",
      labelKey: "txt_test",
      dotColor: "#2d8c30",
      badge: "UAT",
      badgeBg: "rgba(45,140,48,0.12)",
      badgeColor: "#1a6b1a",
    },
  ],
  2110: [
    {
      value: "AW350",
      labelFallback: "AW350",
      labelKey: "txt_production",
      dotColor: "#e65100",
      badge: "PROD",
      badgeBg: "rgba(230,81,0,0.12)",
      badgeColor: "#c95f00",
    },
    {
      value: "AW380",
      labelFallback: "AW380",
      labelKey: "txt_test",
      dotColor: "#2d8c30",
      badge: "UAT",
      badgeBg: "rgba(45,140,48,0.12)",
      badgeColor: "#1a6b1a",
    },
  ],
  2010: [
    {
      value: "LOCAL",
      labelFallback: "LOCAL",
      dotColor: "#e65100",
      badge: "PROD",
      badgeBg: "rgba(230,81,0,0.12)",
      badgeColor: "#c95f00",
    },
  ],
};
// Thêm vào sau FACTORY_ENV_MAP
const DB_FACTORY_OPTIONS = Object.entries(FACTORY_ENV_MAP).map(
  ([code, envs]) => ({
    value: code,
    label: code,
    subLabel: envs.map((e) => e.value).join(" · "),
  }),
);

// ─── Component ───────────────────────────────────────────────────────────────
const Login = () => {
  const [facDept, setFactDept] = useState([]);
  const [factory, setFactory] = useState([]);
  const [department, setDepartment] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [selectFactory, setSelectFactory] = useState("");
  const [selectDepartment, setSelectDepartment] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userList, setUserList] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [openNotification, setOpenNotification] = useState(false);
  const [envOptions, setEnvOptions] = useState(FACTORY_ENV_MAP[2210]);
  const [selectedEnv, setSelectedEnv] = useState(DEFAULT_SITE_KEY);
  const [dbFactories, setDbFactories] = useState([]);
  const [selectDbFactory, setselectDbFactory] = useState(null);
  const formRef = useRef(null);
  const isFirstDbFactory = useRef(true);

  const navigation = useNavigate();
  const { login, programCodeList, updateProgramCodeList, getDefaultRoute } =
    useAuth();
  const {
    siteKey,
    selectSite,
    isHealthy,
    isChecking,
    isUnavailable,
    retryHealth,
  } = useSite();
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { updateLanguage, fetchTableControlTranslations, language } =
    useColumnTranslation();
  const [controlTranslations, setControlTranslations] = useState([]);

  const handleRegister = () => navigation("/register");
  const handleConfirm = () => navigation(getDefaultRoute());

  const handleLanguage = async (e) => {
    e.preventDefault();
    const newLanguage = e.target.value;
    await updateLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const changeLang = async (val) => {
    await updateLanguage(val);
    i18n.changeLanguage(val);
  };

  const handleSiteChange = (siteKey) => {
    selectSite(siteKey);
    setSelectedEnv(siteKey);
    setUserCode("");
    setSelectUser(null);
    formRef.current?.reset();
    setFactory([]);
    setDepartment([]);
    setFactDept([]);
    setSelectFactory({});
    setSelectDepartment({});
    setUserPermissions([]);
  };
  // Thêm vào sau handleSelectFactory
  function handleSelectDbFactory(f) {
    setselectDbFactory(f);
    // reset form khi đổi DB
    setUserCode("");
    setSelectUser(null);
    formRef.current?.reset();
    setFactory([]);
    setDepartment([]);
    setFactDept([]);
    setSelectFactory({});
    setSelectDepartment({});
    setUserPermissions([]);
  }
  const handleOpenNotification = () => setOpenNotification(true);
  const handleCloseNotification = () => setOpenNotification(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isHealthy) {
      showDatabaseUnavailableToast(
        t("site_unavailable", {
          site: siteKey,
          defaultValue:
            "{{site}} database is unavailable. Select another environment or retry.",
        }),
        siteKey,
      );
      return;
    }
    if (!userCode) {
      showErrorToast(
        getControlLabel,
        "noti_select_user_code",
        "Please select a user code",
      );
      return;
    }
    if (selectFactory !== null && selectDepartment !== null) {
      const form = new FormData(e.target);
      form.append("factory_code", selectFactory.factory_code);
      form.append("department_code", selectDepartment.department_code);
      form.append("user_code", userCode);
      form.append("language", language);
      const data = Object.fromEntries(form.entries());
      try {
        const response = await loginAsUser(data);
        const programCodeList = JSON.parse(
          localStorage.getItem("programCodeList"),
        );
        const hasAllowQuery = programCodeList?.some(
          (p) => p.allow_query === "Y",
        );
        if (
          (programCodeList && programCodeList.length === 0) ||
          !hasAllowQuery
        ) {
          handleOpenNotification();
          return;
        }
        if (response.success) {
          await login(response);
          showSuccessToast(
            getControlLabel,
            "noti_login_success",
            "Login successful",
          );
          navigation("/");
        }
      } catch (error) {
        const errCode = error?.response?.data?.message;
        const translationKey = AUTH_ERROR_MAP[errCode] ?? "noti_fail_login";
        showErrorToast(getControlLabel, translationKey, "Login failed");
      }
    }
  };

  function handleSelectFactory(f) {
    setSelectFactory(f);
    setSelectDepartment({});
    // env sẽ tự update qua useEffect bên dưới
  }

  function handleSelectDepartment(d) {
    setSelectDepartment(d);
  }

  function handleSelectUser(u) {
    setSelectUser(u);
    setUserCode(u?.user_code || "");
  }

  const fetchDep = async () => {
    const combinedData = await fnQuery([() => fetchDepartments()]);
    setDepartment(combinedData);
  };

  const fetchAllTranslations = async () => {
    try {
      const [controls, sysMessages] = await Promise.all([
        fetchTableControlTranslations("LOGIN"),
        fetchTableControlTranslations("SYS_MESG"),
      ]);
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };

  const fetchUPByUser = async () => {
    const response = await fetchUPDByUser(userCode);
    if (!response?.data || response.data.length === 0) {
      setUserPermissions([]);
      setFactory([]);
      setFactDept([]);
      setSelectFactory({});
      setSelectDepartment({});
      return;
    }
    setUserPermissions(response.data);
    const freshDepartments = await fnQuery([() => fetchDepartments()]);
    const factoryDepartments = Object.entries(
      response.data.reduce((acc, p) => {
        const deptList = freshDepartments[0]?.data.filter(
          (d) =>
            `${d.factory_code}-${d.department_code}` ===
            `${p.factory_code}-${p.department_code}`,
        );
        if (!acc[p.factory_code]) acc[p.factory_code] = [];
        if (deptList?.length) acc[p.factory_code].push(...deptList);
        return acc;
      }, {}),
    ).map(([factoryUP, departmentUP]) => ({
      factoryUP,
      departmentUP: [
        ...new Map(departmentUP.map((d) => [d.department_code, d])).values(),
      ],
    }));
    setFactDept(factoryDepartments);
    const allFactory = await fnQuery([fetchFactory]);
    const facCode = factoryDepartments.map((f) => f.factoryUP);
    const filteredFactory = allFactory[0]?.data.filter((f) =>
      facCode.includes(f.factory_code),
    );
    setFactory(filteredFactory);
    setSelectFactory(filteredFactory[0] || {});
    setSelectDepartment(factoryDepartments[0]?.departmentUP[0] || {});
  };

  const fetchAllUPByUPD = async () => {
    const response = await fetchPermissionByFactoryAndUser(
      selectFactory.factory_code,
      selectDepartment.department_code,
      userCode,
    );
    updateProgramCodeList(response?.data);
  };
  const fetchDbFactories = async () => {
    try {
      const result = await fnQuery([fetchFactory]);
      const data = result[0]?.data ?? [];
      setDbFactories(data);
      if (data.length > 0) {
        setselectDbFactory(
          data.find((factoryItem) => factoryItem.factory_code === "2210") ||
            data[0],
        );
      }
    } catch (err) {
      console.error("fetchDbFactories error", err);
    }
  };
  const createDropdownCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchUserByFactory(
          selectDbFactory?.factory_code,
          pageSize,
          page,
          searchText,
          true,
        );
        const finalData = [...result?.data,{ user_code: ""}];
        return {
          data: finalData,
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error("Error fetching user dropdown:", error);
        return { data: [], total: 0, pageSize: pageSize };
      }
    };
  };
  useEffect(() => {
    selectSite(DEFAULT_SITE_KEY);
    setSelectedEnv(DEFAULT_SITE_KEY);
  }, [selectSite]);
  useEffect(() => {
    if (isHealthy && userCode) fetchUPByUser();
  }, [userCode, isHealthy]);
  useEffect(() => {
    if (isHealthy) fetchAllTranslations();
  }, [language, siteKey, isHealthy]);
  useEffect(() => {
    if (isHealthy) fetchDbFactories();
  }, [siteKey, isHealthy]);
  useEffect(() => {
    if (!selectDbFactory?.factory_code) return;

    const opts = FACTORY_ENV_MAP[selectDbFactory.factory_code] ?? [];
    setEnvOptions(opts);

    if (opts.length > 0) {
      setSelectedEnv(opts[0].value);
      selectSite(opts[0].value);
    }
    if (isFirstDbFactory.current) {
      isFirstDbFactory.current = false;
      return;
    }

    setUserCode("");
    setSelectUser(null);
    formRef.current?.reset();
    setFactory([]);
    setDepartment([]);
    setFactDept([]);
    setSelectFactory({});
    setSelectDepartment({});
    setUserPermissions([]);
  }, [selectDbFactory, selectSite]);
  useEffect(() => {
    if (isHealthy) fetchDep();
  }, [siteKey, isHealthy]);
  useEffect(() => {
    if (selectFactory?.factory_code) {
      const found = facDept.find(
        (d) => d.factoryUP === selectFactory.factory_code,
      );
      setDepartment(found?.departmentUP || []);
      setSelectDepartment(found?.departmentUP[0] || {});
    } else {
      setDepartment([]);
    }
  }, [selectFactory, facDept]);
  useEffect(() => {
    if (
      userCode &&
      selectFactory?.factory_code &&
      selectDepartment?.department_code
    ) {
      fetchAllUPByUPD();
    }
  }, [selectFactory, selectDepartment, userCode]);

  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0)
      return fallback;
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };

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
        }}
      >
        {/* Green gradient overlay — match sidebar AppBar green */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(45, 75, 20, 0.65) 0%, rgba(230, 234, 241, 0.45) 100%)",
            backdropFilter: "blur(3px)",
          }}
        />

        {/* ── Card ──────────────────────────────────────────────────── */}
        <Box
          component="form"
          ref={formRef}
          onSubmit={handleLogin}
          sx={{
            position: "relative",
            zIndex: 1,
            width: { xs: "calc(100% - 32px)", sm: "420px" },
            background: "#fff",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 24px 60px rgba(26,107,26,0.35), 0 6px 18px rgba(26,107,26,0.18)",
          }}
        >
          {/* ── Header — green gradient (match AppBar) ──────────────── */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_MID} 100%)`,
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
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "9px",
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={Logo}
                sx={{
                  maxWidth: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
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
                {getControlLabel("ttl_login", "CH-VISITOR Portal")}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.50)",
                  fontSize: "0.6rem",
                  mt: 0.25,
                }}
              >
                {getControlLabel(
                  "ttl_description",
                  "Internal Shipping Management",
                )}
              </Typography>
            </Box>
          </Box>

          {/* ── Form body ───────────────────────────────────────────── */}
          <Box
            sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.6 }}
          >
            {/* 1 ── Language ─────────────────────────────────────────── */}
            <Box
              sx={{
                position: "relative",
                border: `1.5px solid ${BORDER}`,
                borderRadius: "8px",
                p: 1.5,
                pt: 2,
              }}
            >
              <Typography sx={sectionLabelSx}>
                {getControlLabel("ftxt_language", "Language")}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.6 }}>
                {LANG_OPTIONS.map((opt) => (
                  <Box
                    key={opt.value}
                    onClick={() => changeLang(opt.value)}
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      py: 0.55,
                      px: 0.5,
                      borderRadius: "6px",
                      border: "1.5px solid",
                      cursor: "pointer",
                      fontSize: "0.71rem",
                      fontWeight: language === opt.value ? 700 : 400,
                      transition: "all 0.12s ease",
                      userSelect: "none",
                      borderColor: language === opt.value ? GREEN : BORDER,
                      background: language === opt.value ? GREEN : "#f6faf6",
                      color: language === opt.value ? "#fff" : MUTED,
                      "&:hover": {
                        borderColor: GREEN,
                        color: language === opt.value ? "#fff" : GREEN,
                      },
                    }}
                  >
                    {getControlLabel(opt.labelKey, opt.labelFallback)}
                  </Box>
                ))}
              </Box>
            </Box>
            {/* 3.5 ── Factory for DB ────────────────────────────────────── */}
            <Box
              sx={{
                position: "relative",
                border: `1.5px solid ${BORDER}`,
                borderRadius: "8px",
                p: 1.5,
                pt: 2,
              }}
            >
              <Typography sx={sectionLabelSx}>
                {getControlLabel("ftxt_factory_db", "Factory for DB")}
              </Typography>

              <Dropdown
                key={selectDbFactory?.factory_code}
                select={selectDbFactory}
                data={dbFactories}
                onSelect={handleSelectDbFactory}
                getControlLabel={getControlLabel}
                language={language}
              />
            </Box>
            {/* 4 ── Environment — dynamic theo factory ─────────────────── */}
            <Box
              sx={{
                position: "relative",
                border: `1.5px solid ${BORDER}`,
                borderRadius: "8px",
                p: 1.5,
                pt: 2,
              }}
            >
              <Typography sx={sectionLabelSx}>
                {getControlLabel("ftxt_environment", "Environment")}
              </Typography>

              {envOptions.length === 0 ? (
                // Chưa chọn factory hoặc factory không có mapping
                <Typography sx={{ fontSize: "0.72rem", color: MUTED }}>
                  {getControlLabel(
                    "ftxt_select_factory_first",
                    "Please select a factory first",
                  )}
                </Typography>
              ) : (
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  {envOptions.map((opt) => (
                    <Box
                      key={opt.value}
                      onClick={() => handleSiteChange(opt.value)}
                      sx={{
                        flex: 1,
                        py: 0.7,
                        px: 1,
                        borderRadius: "7px",
                        border: "1.5px solid",
                        cursor: "pointer",
                        transition: "all 0.12s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.7,
                        borderColor:
                          selectedEnv === opt.value ? opt.dotColor : BORDER,
                        background:
                          selectedEnv === opt.value ? opt.badgeBg : "#f6faf6",
                        "&:hover": { borderColor: opt.dotColor },
                      }}
                    >
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background:
                            selectedEnv === opt.value
                              ? opt.dotColor
                              : "#cbd5e1",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: selectedEnv === opt.value ? 700 : 400,
                          color:
                            selectedEnv === opt.value ? opt.dotColor : MUTED,
                        }}
                      >
                        {getControlLabel(opt.labelKey, opt.labelFallback)}
                      </Typography>
                      {selectedEnv === opt.value && (
                        <Box
                          sx={{
                            ml: "auto",
                            fontSize: "0.56rem",
                            fontWeight: 700,
                            px: 0.65,
                            py: 0.12,
                            borderRadius: "3px",
                            background: opt.badgeBg,
                            color: opt.badgeColor,
                          }}
                        >
                          {opt.badge}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
              {isChecking && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                  <CircularProgress size={14} />
                  <Typography sx={{ fontSize: "0.72rem", color: MUTED }}>
                    {getControlLabel("msg_checking_site", "Checking database...")}
                  </Typography>
                </Box>
              )}
              {isUnavailable && !isChecking && (
                <Alert
                  severity="error"
                  variant="outlined"
                  sx={{ mt: 1, py: 0, fontSize: "0.72rem" }}
                  action={
                    <Button color="inherit" size="small" onClick={() => retryHealth()}>
                      {getControlLabel("btn_retry", "Retry")}
                    </Button>
                  }
                >
                  {getControlLabel(
                    "msg_site_unavailable",
                    `${selectedEnv} database is unavailable`,
                  )}
                </Alert>
              )}
            </Box>
            {/* divider */}
            <Box
              sx={{
                height: "1px",
                background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`,
              }}
            />
            {/* 2 ── Credentials ──────────────────────────────────────── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              <Box>
                <Typography sx={fieldLabelSx}>
                  {getControlLabel("txt_user_code", "User Code")}{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <Dropdown
                  key={selectUser?.user_code}
                  select={selectUser}
                  data={userList}
                  onSelect={handleSelectUser}
                  getControlLabel={getControlLabel}
                  language={language}
                  table="USER"
                  option=""
                  field={getControlLabel("txt_user_code", "User Code")}
                  isSearchMode={true}
                  onFetchData={createDropdownCallback()}
                  totalItems={0}
                  pageSize={10}
                />
              </Box>

              <Box>
                <Typography sx={fieldLabelSx}>
                  {getControlLabel("txt_user_password", "Password")}{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  name="user_password"
                  id="password"
                  required
                  sx={textFieldSx}
                />
              </Box>
            </Box>

            {/* 3 ── Workspace ────────────────────────────────────────── */}
            <Box
              sx={{
                position: "relative",
                border: `1.5px solid ${BORDER}`,
                borderRadius: "8px",
                p: 1.5,
                pt: 2,
              }}
            >
              <Typography sx={sectionLabelSx}>
                {getControlLabel("ftxt_workspace", "Workspace")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
                {/* Chỉ giữ Department thôi */}
                <Box>
                  <Typography sx={{ ...fieldLabelSx, mb: 0.4 }}>
                    {getControlLabel("ftxt_department", "Department")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <Dropdown
                    key={selectDepartment}
                    select={selectDepartment}
                    data={department}
                    onSelect={handleSelectDepartment}
                    getControlLabel={getControlLabel}
                    language={language}
                    table="DEPARTMENTS"
                    option="department"
                  />
                </Box>
              </Box>
            </Box>

            {/* divider */}
            <Box
              sx={{
                height: "1px",
                background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`,
              }}
            />

            {/* 5 ── Buttons ──────────────────────────────────────────── */}
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* Login — green fill */}
              <Button
                type="submit"
                disabled={!isHealthy || isChecking}
                sx={{
                  flex: 1,
                  height: 42,
                  background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_MID} 100%)`,
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  borderRadius: "8px",
                  textTransform: "none",
                  letterSpacing: "0.02em",
                  boxShadow: "none",
                  "&:hover": {
                    background: `linear-gradient(135deg, #155015 0%, #267329 100%)`,
                    boxShadow: "0 4px 12px rgba(26,107,26,0.30)",
                  },
                }}
              >
                {isChecking ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  getControlLabel("btn_login", "Login")
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <NotificationPermission
        open={openNotification}
        onClose={handleCloseNotification}
        onConfirm={handleConfirm}
        getControlLabel={getControlLabel}
        selectFactory={selectFactory}
        selectDepartment={selectDepartment}
      />
    </>
  );
};

export default Login;
