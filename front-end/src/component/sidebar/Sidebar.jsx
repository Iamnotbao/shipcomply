import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FactoryIcon from "@mui/icons-material/Factory";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import LanguageIcon from "@mui/icons-material/Language";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import OutboxIcon from "@mui/icons-material/Outbox";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import useAuth from "../../hooks/useAuth";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Avatar,
  Chip,
  Container,
  Tooltip,
  Collapse,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import ArchiveIcon from "@mui/icons-material/Archive";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fnQuery } from "../../utils/fnQuery";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// ─── Chip sx (compact — fix fontSize 18px) ───────────────────────────────────
const chipBaseSx = {
  fontWeight: 600,
  fontSize: "0.72rem",
  height: 24,
  backgroundColor: "rgba(255, 255, 255, 0.18)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.28)",
  "& .MuiChip-label": { paddingLeft: "8px", paddingRight: "8px" },
  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.28)" },
};

const envChipSx = (isProd) => ({
  ...chipBaseSx,
  backgroundColor: isProd ? "rgba(255, 0, 0, 0.25)" : "rgba(0, 150, 255, 0.25)",
  border: isProd
    ? "1px solid rgba(255,80,80,0.45)"
    : "1px solid rgba(80,160,255,0.45)",
  color: isProd ? "#ffaaaa" : "#aaddff",
});

const drawerWidth = 240;
const miniDrawerWidth = 60;

// ─── Main — professional light-gray background ───────────────────────────────
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    minHeight: "100vh",
    overflowX: "hidden",
    backgroundColor: "#f0f2f5",
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: `calc(100% - ${miniDrawerWidth}px)`,
  marginLeft: `${miniDrawerWidth}px`,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

export default function Sidebar() {
  const theme = useTheme();
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== "false";
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { fetchTableControlTranslations, language } = useColumnTranslation();
  const [controlTranslations, setControlTranslations] = React.useState([]);
  const [expandedMenus, setExpandedMenus] = React.useState(() => {
    const saved = localStorage.getItem("expandedMenus");
    return saved ? JSON.parse(saved) : {};
  });
  const [envLabel, setEnvLabel] = React.useState(() => {
    const saved = localStorage.getItem("activeUrl");
    return saved === import.meta.env.VITE_API_URL_PROD
      ? "888 PROD"
      : "UAT TEST";
  });

  const menuProgramCodeMap = {
    factory: "FACTORY",
    departments: "DEPARTMENTS",
    user: "USER",
    permission: "USER_PERMISSION",
    program: "PROGRAM",
    language: "PROGRAM_FIELD_TITLE",
    basic_data: "BASIC_DATA",
    actf_250: "ACTF_250",
    actf_020: "ACTF_020",
    actf_0201: "ACTF_0201",
    actf_0202: "ACTF_0202",
    actf_021: "ACTF_021",
    actf_410: "ACTF_410",
    actf_4101: "ACTF_4101",
    actf_4102: "ACTF_4102",
    actf_110: "ACTF_110",
    actf_130: "ACTF_130",
    actf_210: "ACTF_210",
    actf_220: "ACTF_220",
    actf_290: "ACTF_290",
    actf_120: "ACTF_120",
    actf_1201: "ACTF_1201",
    setf_570: "SETF_570",
    setf_560: "SETF_560",
    setf_120: "SETF_120",
    actf_230: "ACTF_230",
    setf_590: "SETF_590",
    setf_590_1: "SETF_590",
    setf_510: "SETF_510",
    actf_270: "ACTF_270",
    actf_022: "ACTF_022",
    actf_240: "ACTF_240",
  };

  const programCodeList =
    JSON.parse(localStorage.getItem("programCodeList")) || [];

  const getControlLabel = React.useCallback(
    (fieldCode, fallback) => {
      if (!controlTranslations || controlTranslations.length === 0)
        return fallback;
      const translation = controlTranslations.find(
        (item) => item.field === fieldCode,
      );
      return translation?.title || fallback;
    },
    [controlTranslations],
  );

  const sidebarMenu = React.useMemo(
    () => [
      {
        id: "factory",
        label: getControlLabel("lbl_factory", "FACTORY"),
        icon: <FactoryIcon />,
        programCode: menuProgramCodeMap.factory,
      },
      {
        id: "departments",
        label: getControlLabel("lbl_department", "DEPARTMENTS"),
        icon: <BusinessIcon />,
        programCode: menuProgramCodeMap.departments,
      },
      {
        id: "user",
        label: getControlLabel("lbl_user", "USERS"),
        icon: <PeopleAltIcon />,
        programCode: menuProgramCodeMap.user,
      },
      {
        id: "permission",
        label: getControlLabel("lbl_permission", "PERMISSIONS"),
        icon: <SupervisedUserCircleIcon />,
        programCode: menuProgramCodeMap.permission,
      },
      {
        id: "program",
        label: getControlLabel("lbl_program", "PROGRAM"),
        icon: <ShieldIcon />,
        programCode: menuProgramCodeMap.program,
      },
      {
        id: "language",
        label: getControlLabel("lbl_language", "LANGUAGE"),
        icon: <LanguageIcon />,
        programCode: menuProgramCodeMap.language,
      },
      {
        id: "bom",
        label: getControlLabel("lbl_ac_bom", "Customs BOM"),
        icon: <AccountTreeIcon />,
        programCode: "ACTF_020",
        hasSubmenu: true,
        submenu: [
          {
            id: "actf_020",
            label: getControlLabel("lbl_actf_020_1", "BOM Item Master"),
            programCode: "ACTF_020",
          },
          {
            id: "actf_020_1",
            label: getControlLabel("lbl_actf_020_2", "Material Tracking"),
            programCode: "ACTF_0201",
          },
          {
            id: "actf_020_2",
            label: getControlLabel("lbl_actf_020_3", "BOM Structure"),
            programCode: "ACTF_0202",
          },
          {
            id: "actf_021",
            label: getControlLabel("lbl_actf_021", "BOM Maintain"),
            programCode: "ACTF_021",
          },
        ],
      },
      {
        id: "ac_import",
        label: getControlLabel("lbl_ac_import", "Import"),
        icon: <MoveToInboxIcon />,
        programCode: "ACTF_410",
        hasSubmenu: true,
        submenu: [
          {
            id: "actf_250",
            label: getControlLabel("lbl_actf_250", "IMPORT MATERIAL TRACKING"),
            programCode: menuProgramCodeMap.actf_250,
          },
          {
            id: "actf_410",
            label: getControlLabel(
              "lbl_actf_410",
              "Customs Declaration Application",
            ),
            programCode: "ACTF_410",
          },
          {
            id: "actf_410_1",
            label: getControlLabel("lbl_actf_410_1", "Material Tracking"),
            programCode: "ACTF_4101",
          },
          {
            id: "actf_410_2",
            label: getControlLabel("lbl_actf_410_2", "Customs Tracking"),
            programCode: "ACTF_4102",
          },
          {
            id: "actf_110",
            label: getControlLabel("lbl_actf_110", "IMPORT_CONTRACT"),
            programCode: "ACTF_110",
          },
          {
            id: "actf_130",
            label: getControlLabel("lbl_actf_130", "INM_M"),
            programCode: menuProgramCodeMap.actf_130,
          },
          {
            id: "actf_210",
            label: getControlLabel(
              "lbl_actf_210",
              "Create Foreign Import Declaration",
            ),
            programCode: menuProgramCodeMap.actf_210,
          },
          {
            id: "actf_220",
            label: getControlLabel(
              "lbl_actf_220",
              "Create Transfer Import Declaration",
            ),
            programCode: menuProgramCodeMap.actf_220,
          },
        ],
      },
      {
        id: "ac_other",
        label: getControlLabel("lbl_ac_other", "Other"),
        icon: <MoreHorizIcon />,
        programCode: "ACTF_410",
        hasSubmenu: true,
        submenu: [
          {
            id: "basic_data",
            label: getControlLabel("lbl_basic_data", "BASIC DATA"),
            programCode: menuProgramCodeMap.basic_data,
          },
          {
            id: "actf_290",
            label: getControlLabel(
              "lbl_actf_290",
              "Customs Declaration Application",
            ),
            programCode: "ACTF_290",
          },
          {
            id: "actf_120",
            label: getControlLabel(
              "lbl_actf_120",
              "Customs Declaration Application 120",
            ),
            programCode: "ACTF_120",
          },
          {
            id: "actf_120_1",
            label: getControlLabel(
              "lbl_actf_1201",
              "Customs Declaration Application 1201",
            ),
            programCode: "ACTF_1201",
          },
          {
            id: "setf_120",
            label: getControlLabel(
              "lbl_setf_120",
              "Customs Declaration Application S120",
            ),
            programCode: "SETF_120",
          },
          {
            id: "actf_310",
            label: getControlLabel(
              "lbl_actf_310",
              "Customs Declaration Application 310",
            ),
            programCode: "ACTF_310",
          },
          {
            id: "actf_310_1",
            label: getControlLabel(
              "lbl_actf_3101",
              "Customs Declaration Application 3101",
            ),
            programCode: "ACTF_3101",
          },
          {
            id: "setf_510",
            label: getControlLabel(
              "lbl_setf_510",
              "Customs Declaration Application 510",
            ),
            programCode: "SETF_510",
          },
          {
            id: "actf_270",
            label: getControlLabel(
              "lbl_actf_270",
              "Customs Declaration Application 270",
            ),
            programCode: "ACTF_270",
          },
          {
            id: "actf_022",
            label: getControlLabel(
              "lbl_actf_022",
              "Customs Declaration Application 022",
            ),
            programCode: "ACTF_022",
          },
        ],
      },
      {
        id: "ac_export",
        label: getControlLabel("lbl_ac_export", "Export"),
        icon: <OutboxIcon />,
        programCode: "SETF_570",
        hasSubmenu: true,
        submenu: [
          {
            id: "setf_570",
            label: getControlLabel(
              "lbl_setf_570",
              "Customs Declaration Application",
            ),
            programCode: "SETF_570",
          },
          {
            id: "setf_560",
            label: getControlLabel(
              "lbl_setf_560",
              "Customs Declaration Application 560",
            ),
            programCode: "SETF_560",
          },
          {
            id: "actf_230",
            label: getControlLabel(
              "lbl_actf_230",
              "Customs Declaration Application 230",
            ),
            programCode: "ACTF_230",
          },
          {
            id: "setf_590",
            label: getControlLabel(
              "lbl_setf_590",
              "Customs Declaration Application 590",
            ),
            programCode: "SETF_590",
          },
          {
            id: "setf_590_1",
            label: getControlLabel(
              "lbl_setf_590_1",
              "Customs Declaration Application 5901",
            ),
            programCode: "SETF_5901",
          },
          {
            id: "actf_240",
            label: getControlLabel(
              "lbl_actf_240",
              "Customs Declaration Application 240",
            ),
            programCode: "ACTF_240",
          },
        ],
      },
    ],
    [controlTranslations],
  );

  const fetchAllTranslations = async () => {
    try {
      const [controls] = await fnQuery([
        () => fetchTableControlTranslations("NAVIGATION"),
      ]);
      if (controls) setControlTranslations(controls?.data);
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };

  const filteredMenu = React.useMemo(() => {
    if (user?.user_code === "admin") return sidebarMenu;
    return sidebarMenu
      .map((item) => {
        if (item.hasSubmenu && item.submenu) {
          const filteredSubmenu = item.submenu.filter((subItem) =>
            programCodeList.some(
              (p) =>
                (p.program_code === subItem.programCode ||
                  p === subItem.programCode) &&
                p.allow_query === "Y",
            ),
          );
          return filteredSubmenu.length > 0
            ? { ...item, submenu: filteredSubmenu }
            : null;
        }
        const hasPermission = programCodeList.some(
          (p) =>
            (p.program_code === item.programCode || p === item.programCode) &&
            p.allow_query === "Y",
        );
        return hasPermission ? item : null;
      })
      .filter(Boolean);
  }, [sidebarMenu, programCodeList, user?.user_code]);

  React.useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  React.useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "sidebarOpen") setOpen(e.newValue !== "false");
      if (e.key === "expandedMenus")
        setExpandedMenus(e.newValue ? JSON.parse(e.newValue) : {});
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const navItems = React.useMemo(
    () => [
      {
        id: "logout",
        label: getControlLabel("lbl_logout", "LOG OUT"),
        icon: <LogoutIcon />,
        isLogout: true,
      },
      {
        id: "profile",
        label: user?.user_code || "Profile",
        icon: <AccountCircleIcon />,
        isLogout: false,
        path: "/profile",
      },
    ],
    [user?.user_code, controlTranslations],
  );

  const handleDrawerOpen = () => {
    setOpen(true);
    localStorage.setItem("sidebarOpen", "true");
  };
  const handleDrawerToggle = () => setOpen(!open);
  const handleDrawerClose = () => {
    setOpen(false);
    localStorage.setItem("sidebarOpen", "false");
  };

  React.useEffect(() => {
    const newExpandedMenus = { ...expandedMenus };
    let hasChanges = false;
    filteredMenu.forEach((item) => {
      if (item.hasSubmenu) {
        const isActive = item.submenu?.some((sub) =>
          location.pathname.startsWith(`/${sub.id.toLowerCase()}`),
        );
        if (isActive && expandedMenus[item.id] === undefined) {
          newExpandedMenus[item.id] = true;
          hasChanges = true;
        }
      }
    });
    if (hasChanges) {
      setExpandedMenus(newExpandedMenus);
      localStorage.setItem("expandedMenus", JSON.stringify(newExpandedMenus));
    }
  }, [location.pathname, filteredMenu]);

  const isSubmenuActive = (item) => {
    if (!item.hasSubmenu) return false;
    return item.submenu?.some((sub) =>
      location.pathname.startsWith(`/${sub.id.toLowerCase()}`),
    );
  };

  const handleMenuToggle = (item) => {
    const isCurrentlyExpanded = !!expandedMenus[item.id];
    if (
      user?.user_code !== "admin" &&
      item.hasSubmenu &&
      item.submenu?.length > 0
    ) {
      const isInSubmenu = item.submenu.some((sub) =>
        location.pathname.startsWith(`/${sub.id.toLowerCase()}`),
      );
      if (isInSubmenu) {
        const nm = { ...expandedMenus, [item.id]: !isCurrentlyExpanded };
        setExpandedMenus(nm);
        localStorage.setItem("expandedMenus", JSON.stringify(nm));
        return;
      }
      const firstSubmenu = item.submenu[0];
      const nm = { ...expandedMenus, [item.id]: true };
      setExpandedMenus(nm);
      localStorage.setItem("expandedMenus", JSON.stringify(nm));
      window.location.href =`/${firstSubmenu.id.toLowerCase()}`;
      return;
    }
    const nm = { ...expandedMenus, [item.id]: !isCurrentlyExpanded };
    setExpandedMenus(nm);
    localStorage.setItem("expandedMenus", JSON.stringify(nm));
  };

  const handleMenuClick = (item) => window.location.href=`/${item.id.toLowerCase()}`;

  const currentMenuLabel = React.useMemo(() => {
    for (const item of filteredMenu) {
      if (item.hasSubmenu) {
        const activeSub = item.submenu?.find((sub) => {
          const subPath = `/${sub.id.toLowerCase()}`;
          return (
            location.pathname === subPath ||
            location.pathname.startsWith(subPath + "/")
          );
        });
        if (activeSub) return `${activeSub.label}`;
      } else {
        const itemPath = `/${item.id.toLowerCase()}`;
        if (
          location.pathname === itemPath ||
          location.pathname.startsWith(itemPath + "/")
        ) {
          return item.label;
        }
      }
    }
    return "";
  }, [filteredMenu, location.pathname]);

  // ─── Breadcrumb builder ──────────────────────────────────────────────────────
  const currentBreadcrumb = React.useMemo(() => {
    const homeLabel = getControlLabel("lbl_home", "Home");
    const crumbs = [{ label: homeLabel, path: "/factory", isHome: true }];

    for (const item of filteredMenu) {
      if (item.hasSubmenu) {
        const activeSub = item.submenu?.find((sub) => {
          const subPath = `/${sub.id.toLowerCase()}`;
          return (
            location.pathname === subPath ||
            location.pathname.startsWith(subPath + "/")
          );
        });
        if (activeSub) {
          crumbs.push({ label: item.label, isParent: true });
          crumbs.push({
            label: activeSub.label,
            path: `/${activeSub.id.toLowerCase()}`,
          });
          return crumbs;
        }
      } else {
        const itemPath = `/${item.id.toLowerCase()}`;
        if (
          location.pathname === itemPath ||
          location.pathname.startsWith(itemPath + "/")
        ) {
          crumbs.push({ label: item.label, path: itemPath });
          return crumbs;
        }
      }
    }
    return crumbs;
  }, [filteredMenu, location.pathname, controlTranslations]);

  // ── Reusable listItemText + icon sx ────────────────────────────────────────
  const listItemTextSx = {
    opacity: open ? 1 : 0,
    flex: open ? "1 1 auto" : "0 0 0px",
    transition: "opacity 0.2s, flex 0.2s",
    wordBreak: "break-word",
    whiteSpace: "normal",
    margin: 0,
    minWidth: 0,
    display: open ? "block" : "none",
  };

  const listItemIconSx = (mr) => ({
    minWidth: 0,
    mr: open ? mr : "auto",
    mt: open ? "2px" : 0,
    justifyContent: "center",
  });

  return (
    // ─── Root Box — same bg as Main so no flash on page edges ────────────────
    <Box
      sx={{ display: "flex", backgroundColor: "#f0f2f5", minHeight: "100vh" }}
    >
      <CssBaseline />

      {/* ── AppBar ─────────────────────────────────────────────────────────── */}
      <AppBar position="fixed" open={open} sx={{ bgcolor: "green" }}>
        <Container maxWidth="xxl">
          <Toolbar>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                edge="start"
                sx={[
                  { mr: 2 },
                  open && { display: { xs: "none", md: "flex" }, mr: 1 },
                ]}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            <Box
              sx={{ display: { xs: "none", md: "flex", marginRight: "50px" } }}
            >
              <Typography variant="h6" noWrap component="div">
                {user?.factory_name}
              </Typography>
            </Box>

            {/* Chips */}
            <Box
              sx={{
                flexGrow: 0.5,
                display: { xs: "none", md: "flex" },
                gap: 0.75,
                alignItems: "center",
              }}
            >
              <Chip
                label={`${getControlLabel("txt_factory_code", "Factory")}: ${user?.factory}`}
                variant="outlined"
                size="small"
                sx={chipBaseSx}
              />
              <Chip
                label={`${getControlLabel("txt_department_code", "Department")}: ${user?.department}`}
                variant="outlined"
                size="small"
                sx={chipBaseSx}
              />
              <Chip
                label={`${getControlLabel("txt_user_code", "User")}: ${user?.user_code}`}
                variant="outlined"
                size="small"
                sx={chipBaseSx}
              />
              <Chip
                label={envLabel}
                size="small"
                sx={envChipSx(envLabel === "888 PROD")}
              />
            </Box>

            <Box sx={{ flexGrow: 2, display: { xs: "none", md: "flex" } }}>
              <Box
                sx={{
                  flexGrow: 1,
                  display: { xs: "none", md: "flex" },
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" noWrap component="div">
                  {currentMenuLabel}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <Typography variant="h6" noWrap component="div">
                {getControlLabel("lbl_company", "Chi Hung Company")}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                color="inherit"
                onClick={handleDrawerOpen}
                edge="start"
                sx={[
                  { mr: 2 },
                  open && { display: { xs: "flex", md: "none" }, mr: 1 },
                ]}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Date Time */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                alignItems: "center",
                mr: 2,
                lineHeight: 1.2,
              }}
            >
              <Typography
                sx={{ color: "white", fontWeight: "bold", fontSize: "13px" }}
              >
                {currentTime.toLocaleDateString("vi-VN")}
              </Typography>
              <Typography
                sx={{ color: "white", fontWeight: "bold", fontSize: "13px" }}
              >
                {currentTime.toLocaleTimeString("vi-VN")}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
              <Tooltip title="Open settings">
                <IconButton sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <Tooltip title="Open settings">
                <IconButton sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Drawer ─────────────────────────────────────────────────────────── */}
      <Drawer
        sx={{
          width: open ? drawerWidth : miniDrawerWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : miniDrawerWidth,
            overflow: "hidden",
            transition: theme.transitions.create("width", {
              easing: open
                ? theme.transitions.easing.easeOut
                : theme.transitions.easing.sharp,
              duration: open
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
            boxSizing: "border-box",
            backgroundColor: "orange",
            display: "flex",
            flexDirection: "column",
          },
        }}
        variant="permanent"
        anchor="left"
        open={open}
      >
        <Box sx={{ flexShrink: 0 }}>
          <DrawerHeader>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxHeight: "80px",
                cursor: "pointer",
              }}
              onClick={() => (window.location.href = "/factory")}
            >
              {/* <img
                src="/icon.png"
                alt="Chi Hung Company Logo"
                style={{ height: "auto", width: "100%" }}
              /> */}
            </Box>
          </DrawerHeader>
          <Divider />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: open ? "auto" : "hidden",
            overflowX: "hidden",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.25)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(0,0,0,0.45)",
            },
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.25) transparent",
          }}
        >
          <List>
            {filteredMenu.map((item) => (
              <React.Fragment key={item.id}>
                {item.hasSubmenu ? (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleMenuToggle(item)}
                      selected={isSubmenuActive(item)}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        alignItems: "center",
                        "&.Mui-selected": {
                          backgroundColor: "#1b5e20",
                          color: "white",
                          "& .MuiListItemIcon-root": { color: "white" },
                        },
                        "&.Mui-selected:hover": { backgroundColor: "#154d15" },
                        "&.Mui-focusVisible": {
                          outline: "none",
                          backgroundColor: "inherit",
                        },
                        ":focus": { outline: "none" },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          mt: 0,
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} sx={listItemTextSx} />
                      {open &&
                        (expandedMenus[item.id] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        ))}
                    </ListItemButton>
                  </ListItem>
                ) : (
                  <ListItem disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to={`/${item.id.toLowerCase()}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMenuClick(item);
                      }}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        alignItems: "center",
                        "&.active": {
                          backgroundColor: "#1b5e20",
                          color: "white",
                          "& .MuiListItemIcon-root": { color: "white" },
                        },
                        "&.active:hover": { backgroundColor: "#154d15" },
                        "&.Mui-focusVisible": {
                          outline: "none",
                          backgroundColor: "inherit",
                        },
                        ":focus": { outline: "none" },
                      }}
                      selected={
                        location.pathname === `/${item.id.toLowerCase()}`
                      }
                    >
                      <ListItemIcon sx={listItemIconSx(2)}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} sx={listItemTextSx} />
                    </ListItemButton>
                  </ListItem>
                )}

                {item.hasSubmenu && (
                  <Collapse
                    in={open && !!expandedMenus[item.id]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.submenu?.map((subItem) => (
                        <ListItem key={subItem.id} disablePadding>
                          <ListItemButton
                            component={NavLink}
                            to={`/${subItem.id.toLowerCase()}`}
                            onClick={() =>
                              window.location.href=`/${subItem.id.toLowerCase()}`
                            }
                            sx={{
                              minHeight: 48,
                              justifyContent: open ? "initial" : "center",
                              px: 2.5,
                              alignItems: "center",
                              pl: 4,
                              "&.active": {
                                backgroundColor: "#154d15",
                                color: "white",
                              },
                              "&.active:hover": { backgroundColor: "#0d3a0d" },
                              "&.Mui-focusVisible": {
                                outline: "none",
                                backgroundColor: "inherit",
                              },
                              ":focus": { outline: "none" },
                            }}
                            selected={
                              location.pathname ===
                              `/${subItem.id.toLowerCase()}`
                            }
                          >
                            <ListItemIcon sx={listItemIconSx(2)}>
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={subItem.label}
                              sx={listItemTextSx}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                {item.isLogout ? (
                  <ListItemButton
                    onClick={() => {
                      logout();
                    }}
                  >
                    <ListItemIcon sx={listItemIconSx(2)}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} sx={listItemTextSx} />
                  </ListItemButton>
                ) : (
                  <ListItemButton component="a" href={item.path}>
                    <ListItemIcon sx={listItemIconSx(2)}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} sx={listItemTextSx} />
                  </ListItemButton>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <Main open={open}>
        <DrawerHeader />

        {/* ── Breadcrumb bar ──────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1.5,
            px: 0.5,
            py: 0.25,
          }}
        >
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={
              <NavigateNextIcon
                fontSize="small"
                sx={{ color: "#bdbdbd", fontSize: 16 }}
              />
            }
            sx={{
              "& .MuiBreadcrumbs-ol": {
                flexWrap: "nowrap",
                alignItems: "center",
              },
              "& .MuiBreadcrumbs-separator": { mx: 0.5 },
            }}
          >
            {currentBreadcrumb.map((crumb, idx) => {
              const isLast = idx === currentBreadcrumb.length - 1;

              if (crumb.isHome) {
                return (
                  <MuiLink
                    key="home"
                    component={NavLink}
                    to={crumb.path}
                    underline="hover"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.4,
                      color: "#2e7d32",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      "&:hover": { color: "#1b5e20" },
                    }}
                  >
                    <HomeRoundedIcon sx={{ fontSize: 17, mb: "1px" }} />
                    {crumb.label}
                  </MuiLink>
                );
              }

              if (isLast) {
                return (
                  <Typography
                    key={idx}
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "text.primary",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {crumb.label}
                  </Typography>
                );
              }

              // parent group (not clickable)
              return (
                <Typography
                  key={idx}
                  sx={{
                    fontSize: "0.82rem",
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {crumb.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        </Box>

        <Outlet/>
      </Main>
    </Box>
  );
}
