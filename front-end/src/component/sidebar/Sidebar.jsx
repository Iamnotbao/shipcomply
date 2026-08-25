import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import OutboxOutlinedIcon from "@mui/icons-material/OutboxOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CircleIcon from "@mui/icons-material/Circle";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fnQuery } from "../../utils/fnQuery";
import { APP_SHELL } from "../../constants/layout";
import { NAVIGATION_ITEMS, getNavigationPath } from "../../constants/navigation";

const ICONS = {
  factory: FactoryOutlinedIcon,
  department: BusinessOutlinedIcon,
  users: PeopleAltOutlinedIcon,
  permission: AdminPanelSettingsOutlinedIcon,
  program: AppsOutlinedIcon,
  language: LanguageOutlinedIcon,
  bom: AccountTreeOutlinedIcon,
  import: MoveToInboxOutlinedIcon,
  export: OutboxOutlinedIcon,
  other: MoreHorizOutlinedIcon,
};

const safeReadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const isRouteActive = (pathname, item) => {
  const path = getNavigationPath(item);
  return pathname === path || pathname.startsWith(`${path}/`);
};

export default function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, getDefaultRoute } = useAuth();
  const { fetchTableControlTranslations, language } = useColumnTranslation();

  const [desktopOpen, setDesktopOpen] = React.useState(
    () => localStorage.getItem("sidebarOpen") !== "false",
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expandedMenus, setExpandedMenus] = React.useState(() =>
    safeReadJson("expandedMenus", {}),
  );
  const [controlTranslations, setControlTranslations] = React.useState([]);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  const programCodeList = React.useMemo(
    () => safeReadJson("programCodeList", []),
    [user?.user_code],
  );

  const envLabel = React.useMemo(() => {
    const activeUrl = localStorage.getItem("activeUrl");
    return activeUrl === import.meta.env.VITE_API_URL_PROD ? "PROD" : "UAT";
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const loadTranslations = async () => {
      try {
        const [controls] = await fnQuery([
          () => fetchTableControlTranslations("NAVIGATION"),
        ]);
        if (mounted) setControlTranslations(controls?.data || []);
      } catch (error) {
        console.error("Error fetching navigation translations:", error);
      }
    };
    loadTranslations();
    return () => {
      mounted = false;
    };
  }, [fetchTableControlTranslations, language]);

  const getControlLabel = React.useCallback(
    (fieldCode, fallback) =>
      controlTranslations.find((item) => item.field === fieldCode)?.title || fallback,
    [controlTranslations],
  );

  const navigation = React.useMemo(
    () =>
      NAVIGATION_ITEMS.map((item) => ({
        ...item,
        label: getControlLabel(item.labelKey, item.fallbackLabel),
        children: item.children?.map((child) => ({
          ...child,
          label: getControlLabel(child.labelKey, child.fallbackLabel),
        })),
      })),
    [getControlLabel],
  );

  const canAccess = React.useCallback(
    (programCode) => {
      if (user?.user_code === "admin") return true;
      return programCodeList.some((permission) => {
        if (typeof permission === "string") return permission === programCode;
        return (
          permission?.program_code === programCode && permission?.allow_query === "Y"
        );
      });
    },
    [programCodeList, user?.user_code],
  );

  const filteredMenu = React.useMemo(
    () =>
      navigation
        .map((item) => {
          if (!item.children?.length) return canAccess(item.programCode) ? item : null;
          const children = item.children.filter((child) => canAccess(child.programCode));
          return children.length ? { ...item, children } : null;
        })
        .filter(Boolean),
    [navigation, canAccess],
  );

  React.useEffect(() => {
    setExpandedMenus((previous) => {
      const next = { ...previous };
      let changed = false;
      filteredMenu.forEach((item) => {
        if (
          item.children?.some((child) => isRouteActive(location.pathname, child)) &&
          next[item.id] !== true
        ) {
          next[item.id] = true;
          changed = true;
        }
      });
      if (changed) localStorage.setItem("expandedMenus", JSON.stringify(next));
      return changed ? next : previous;
    });
  }, [filteredMenu, location.pathname]);

  const activeEntry = React.useMemo(() => {
    for (const item of filteredMenu) {
      const child = item.children?.find((entry) => isRouteActive(location.pathname, entry));
      if (child) return { group: item, page: child };
      if (isRouteActive(location.pathname, item)) return { page: item };
    }
    return {};
  }, [filteredMenu, location.pathname]);

  const homePath = React.useMemo(
    () => (typeof getDefaultRoute === "function" ? getDefaultRoute() : "/factory"),
    [getDefaultRoute],
  );

  const drawerOpen = isMobile ? mobileOpen : desktopOpen;
  const drawerWidth = desktopOpen
    ? APP_SHELL.drawerWidth
    : APP_SHELL.collapsedDrawerWidth;

  const setDesktopDrawer = (value) => {
    setDesktopOpen(value);
    localStorage.setItem("sidebarOpen", String(value));
  };

  const goTo = (item) => {
    navigate(getNavigationPath(item));
    if (isMobile) setMobileOpen(false);
  };

  const toggleGroup = (item) => {
    const next = { ...expandedMenus, [item.id]: !expandedMenus[item.id] };
    setExpandedMenus(next);
    localStorage.setItem("expandedMenus", JSON.stringify(next));
  };

  const renderIcon = (item, size = 20) => {
    const Icon = ICONS[item.icon] || AppsOutlinedIcon;
    return <Icon sx={{ fontSize: size }} />;
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          minHeight: APP_SHELL.appBarHeight,
          px: desktopOpen || isMobile ? 2 : 1,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.main",
            color: "common.white",
            flexShrink: 0,
          }}
        >
          <Inventory2OutlinedIcon fontSize="small" />
        </Box>
        {(desktopOpen || isMobile) && (
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, color: "common.white", lineHeight: 1.1 }}>
              ShipComply
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", mt: 0.35 }}>
              Customs Operations
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.16)" }} />

      <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 1.25 }}>
        <List disablePadding>
          {filteredMenu.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const groupActive = hasChildren
              ? item.children.some((child) => isRouteActive(location.pathname, child))
              : isRouteActive(location.pathname, item);
            const expanded = Boolean(expandedMenus[item.id]);

            return (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ mb: 0.4 }}>
                  <Tooltip
                    title={!desktopOpen && !isMobile ? item.label : ""}
                    placement="right"
                  >
                    <ListItemButton
                      selected={groupActive}
                      onClick={() => (hasChildren ? toggleGroup(item) : goTo(item))}
                      sx={{
                        minHeight: 42,
                        px: desktopOpen || isMobile ? 1.5 : 1,
                        borderRadius: 1.5,
                        justifyContent: desktopOpen || isMobile ? "initial" : "center",
                        color: groupActive ? "#ccfbf1" : "#cbd5e1",
                        "& .MuiListItemIcon-root": { color: "inherit" },
                        "&.Mui-selected": { bgcolor: "rgba(13, 148, 136, 0.20)" },
                        "&.Mui-selected:hover": { bgcolor: "rgba(13, 148, 136, 0.28)" },
                        "&:hover": { bgcolor: "rgba(148, 163, 184, 0.10)" },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: desktopOpen || isMobile ? 1.5 : 0,
                          justifyContent: "center",
                        }}
                      >
                        {renderIcon(item)}
                      </ListItemIcon>
                      {(desktopOpen || isMobile) && (
                        <>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: "0.82rem",
                              fontWeight: groupActive ? 700 : 500,
                              noWrap: true,
                            }}
                          />
                          {hasChildren &&
                            (expanded ? (
                              <ExpandLessRoundedIcon fontSize="small" />
                            ) : (
                              <ExpandMoreRoundedIcon fontSize="small" />
                            ))}
                        </>
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>

                {hasChildren && (desktopOpen || isMobile) && (
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <List disablePadding sx={{ mb: 0.8 }}>
                      {item.children.map((child) => {
                        const active = isRouteActive(location.pathname, child);
                        return (
                          <ListItem key={child.id} disablePadding>
                            <ListItemButton
                              selected={active}
                              onClick={() => goTo(child)}
                              sx={{
                                minHeight: 36,
                                pl: 4.7,
                                pr: 1.25,
                                py: 0.5,
                                borderRadius: 1.5,
                                color: active ? "#ccfbf1" : "#94a3b8",
                                "&.Mui-selected": { bgcolor: "rgba(13, 148, 136, 0.14)" },
                                "&.Mui-selected:hover": { bgcolor: "rgba(13, 148, 136, 0.22)" },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 18, color: "inherit" }}>
                                <CircleIcon sx={{ fontSize: 5 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{
                                  fontSize: "0.76rem",
                                  fontWeight: active ? 700 : 500,
                                  noWrap: true,
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.16)" }} />
      <Box sx={{ p: 1 }}>
        {(desktopOpen || isMobile) && (
          <Box sx={{ px: 1, py: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.75rem" }}
            >
              {(user?.user_code || "U").slice(0, 2).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: "#e2e8f0", fontSize: "0.78rem", fontWeight: 700 }} noWrap>
                {user?.user_code || "User"}
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.68rem" }} noWrap>
                {user?.department || user?.factory || "ShipComply"}
              </Typography>
            </Box>
          </Box>
        )}
        <Tooltip title={!desktopOpen && !isMobile ? getControlLabel("lbl_logout", "Log out") : ""} placement="right">
          <ListItemButton
            onClick={logout}
            sx={{
              minHeight: 40,
              borderRadius: 1.5,
              color: "#94a3b8",
              justifyContent: desktopOpen || isMobile ? "initial" : "center",
              px: desktopOpen || isMobile ? 1.5 : 1,
              "&:hover": { color: "#fecaca", bgcolor: "rgba(239,68,68,0.10)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: desktopOpen || isMobile ? 1.5 : 0, color: "inherit" }}>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            {(desktopOpen || isMobile) && (
              <ListItemText
                primary={getControlLabel("lbl_logout", "Log out")}
                primaryTypographyProps={{ fontSize: "0.8rem", fontWeight: 600 }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? APP_SHELL.drawerWidth : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isMobile ? APP_SHELL.drawerWidth : drawerWidth,
            bgcolor: "#0f172a",
            borderRight: 0,
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
              duration: theme.transitions.duration.shorter,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{
            zIndex: theme.zIndex.appBar,
            bgcolor: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ minHeight: `${APP_SHELL.appBarHeight}px !important`, gap: 1.5 }}>
            <IconButton
              size="small"
              onClick={() =>
                isMobile ? setMobileOpen(true) : setDesktopDrawer(!desktopOpen)
              }
              aria-label="Toggle navigation"
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
            >
              <MenuRoundedIcon fontSize="small" />
            </IconButton>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 600 }} noWrap>
                {user?.factory_name || getControlLabel("lbl_company", "ShipComply")}
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "text.primary" }} noWrap>
                {activeEntry.page?.label || getControlLabel("lbl_home", "Workspace")}
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 0.75 }}>
              {user?.factory && <Chip size="small" variant="outlined" label={`${getControlLabel("txt_factory_code", "Factory")}: ${user.factory}`} />}
              {user?.department && <Chip size="small" variant="outlined" label={`${getControlLabel("txt_department_code", "Department")}: ${user.department}`} />}
              <Chip
                size="small"
                label={envLabel}
                sx={{
                  bgcolor: envLabel === "PROD" ? "#fef2f2" : "#eff6ff",
                  color: envLabel === "PROD" ? "#b91c1c" : "#1d4ed8",
                  border: "1px solid",
                  borderColor: envLabel === "PROD" ? "#fecaca" : "#bfdbfe",
                }}
              />
            </Box>

            <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right", minWidth: 112 }}>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700 }}>
                {currentTime.toLocaleDateString("vi-VN")}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                {currentTime.toLocaleTimeString("vi-VN")}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            width: "100%",
            maxWidth: APP_SHELL.contentMaxWidth,
            mx: "auto",
            p: APP_SHELL.contentPadding,
          }}
        >
          <Breadcrumbs
            separator={<NavigateNextRoundedIcon sx={{ fontSize: 15, color: "text.disabled" }} />}
            sx={{ mb: 1.5, px: 0.25, "& .MuiBreadcrumbs-separator": { mx: 0.45 } }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => navigate(homePath)}
              sx={{
                border: 0,
                p: 0,
                bgcolor: "transparent",
                color: "text.secondary",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.4,
                cursor: "pointer",
                font: "inherit",
                fontSize: "0.76rem",
                "&:hover": { color: "primary.main" },
              }}
            >
              <HomeRoundedIcon sx={{ fontSize: 16 }} />
              {getControlLabel("lbl_home", "Home")}
            </Box>
            {activeEntry.group && (
              <Typography sx={{ fontSize: "0.76rem", color: "text.secondary" }}>
                {activeEntry.group.label}
              </Typography>
            )}
            {activeEntry.page && (
              <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, color: "text.primary" }}>
                {activeEntry.page.label}
              </Typography>
            )}
          </Breadcrumbs>

          <Box
            sx={{
              minWidth: 0,
              width: "100%",
              borderRadius: 2.5,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              p: { xs: 1, sm: 1.5 },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
