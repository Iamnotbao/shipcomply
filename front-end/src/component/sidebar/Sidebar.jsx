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
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
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
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fnQuery } from "../../utils/fnQuery";
import { APP_SHELL } from "../../constants/layout";
import { NAVIGATION_ITEMS, getNavigationPath } from "../../constants/navigation";
import { useSite } from "../../context/siteContextStore";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, getDefaultRoute, programCodeList } = useAuth();
  const { siteKey, isChecking } = useSite();
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
  const menuScrollRef = React.useRef(null);
  const groupRefs = React.useRef(new Map());

  const setDesktopDrawer = (value) => {
    setDesktopOpen(value);
    localStorage.setItem("sidebarOpen", String(value));
  };

  const goToPath = React.useCallback(
    (path) => {
      if (!path || location.pathname === path) return;
      navigate(path);
    },
    [location.pathname, navigate],
  );

  const goTo = (item) => {
    if (isMobile) setMobileOpen(false);
    goToPath(getNavigationPath(item));
  };

  const setGroupExpanded = React.useCallback((itemId, expanded) => {
    setExpandedMenus((previous) => {
      if (previous[itemId] === expanded) return previous;
      const next = { ...previous, [itemId]: expanded };
      localStorage.setItem("expandedMenus", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleGroup = (item) => {
    setGroupExpanded(item.id, !expandedMenus[item.id]);
  };

  const scrollGroupToTop = React.useCallback((itemId) => {
    const container = menuScrollRef.current;
    const element = groupRefs.current.get(itemId);
    if (!container || !element) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const nextTop =
      container.scrollTop + elementRect.top - containerRect.top - 4;

    container.scrollTo({
      top: Math.max(0, nextTop),
      behavior: "smooth",
    });
  }, []);

  const openGroupFirstPage = (item) => {
    if (!item.children?.length) {
      goTo(item);
      return;
    }

    const firstAccessibleChild = item.children[0];
    setGroupExpanded(item.id, true);

    if (desktopOpen || isMobile) {
      requestAnimationFrame(() => scrollGroupToTop(item.id));
    }

    goTo(firstAccessibleChild);
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
        <Tooltip
          title={
            isMobile
              ? getControlLabel("lbl_close_navigation", "Close navigation")
              : desktopOpen
                ? getControlLabel("lbl_collapse_navigation", "Collapse navigation")
                : getControlLabel("lbl_expand_navigation", "Expand navigation")
          }
          placement="right"
        >
          <IconButton
            size="small"
            onClick={() =>
              isMobile ? setMobileOpen(false) : setDesktopDrawer(!desktopOpen)
            }
            aria-label={
              desktopOpen ? "Collapse navigation" : "Expand navigation"
            }
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "#55708a",
              color: "#ffffff",
              flexShrink: 0,
              "&:hover": { bgcolor: "#48627a" },
            }}
          >
            {desktopOpen || isMobile ? (
              <MenuOpenRoundedIcon fontSize="small" />
            ) : (
              <MenuRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        {(desktopOpen || isMobile) && (
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, color: "#26384a", lineHeight: 1.1 }}>
              ShipComply
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "#607487", mt: 0.35 }}>
              Customs Operations
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(85, 112, 138, 0.16)" }} />

      <Box
        ref={menuScrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1,
          py: 1.25,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(85,112,138,0.46) transparent",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(85,112,138,0.46)",
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(72,98,122,0.72)",
          },
        }}
      >
        <List disablePadding>
          {filteredMenu.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const groupActive = hasChildren
              ? item.children.some((child) => isRouteActive(location.pathname, child))
              : isRouteActive(location.pathname, item);
            const expanded = Boolean(expandedMenus[item.id]);

            return (
              <React.Fragment key={item.id}>
                <ListItem
                  ref={(node) => {
                    if (node) groupRefs.current.set(item.id, node);
                    else groupRefs.current.delete(item.id);
                  }}
                  disablePadding
                  sx={{
                    mb: 0.4,
                    ...(hasChildren && {
                      position: "sticky",
                      top: 0,
                      zIndex: 3,
                      bgcolor: "#e3eaf0",
                      borderRadius: 0.75,
                      borderBottom: "1px solid rgba(85,112,138,0.28)",
                      boxShadow: "0 2px 5px rgba(38,56,74,0.10)",
                    }),
                  }}
                >
                  <Tooltip
                    title={
                      !desktopOpen && !isMobile
                        ? item.label
                        : item.label?.length > 24
                          ? item.label
                          : ""
                    }
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      selected={groupActive}
                      onClick={() => (hasChildren ? openGroupFirstPage(item) : goTo(item))}
                      sx={{
                        minHeight: 42,
                        px: desktopOpen || isMobile ? 1.5 : 1,
                        borderRadius: 0.75,
                        justifyContent: desktopOpen || isMobile ? "initial" : "center",
                        color: groupActive ? "#ffffff" : "#31475c",
                        boxShadow: groupActive
                          ? "inset 3px 0 0 #40566c"
                          : "inset 3px 0 0 transparent",
                        "& .MuiListItemIcon-root": { color: "inherit" },
                        "&&.Mui-selected": {
                          bgcolor: "#55708a !important",
                          color: "#ffffff !important",
                        },
                        "&&.Mui-selected .MuiTypography-root, &&.Mui-selected .MuiListItemIcon-root": {
                          color: "#ffffff !important",
                        },
                        "&&.Mui-selected:hover": {
                          bgcolor: "#48627a !important",
                        },
                        "&:hover": { bgcolor: "rgba(85,112,138,0.12)" },
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
                              sx: {
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: groupActive ? 3 : 2,
                                overflow: "hidden",
                                lineHeight: 1.22,
                              },
                            }}
                          />
                          {hasChildren && (
                            <Tooltip
                              title={
                                expanded
                                  ? getControlLabel("lbl_collapse_section", "Collapse section")
                                  : getControlLabel("lbl_expand_section", "Expand section")
                              }
                              placement="right"
                              arrow
                            >
                              <IconButton
                                component="span"
                                size="small"
                                aria-label={
                                  expanded ? "Collapse section" : "Expand section"
                                }
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  toggleGroup(item);
                                }}
                                sx={{
                                  ml: 0.5,
                                  p: 0.25,
                                  color: "inherit",
                                  flexShrink: 0,
                                  "&:hover": {
                                    bgcolor: groupActive
                                      ? "rgba(255,255,255,0.14)"
                                      : "rgba(85,112,138,0.12)",
                                  },
                                }}
                              >
                                {expanded ? (
                                  <ExpandLessRoundedIcon fontSize="small" />
                                ) : (
                                  <ExpandMoreRoundedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
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
                                minHeight: 34,
                                pl: 4.5,
                                pr: 1.25,
                                py: 0.45,
                                borderRadius: 0.5,
                                color: active ? "#263f56" : "#40566c",
                                boxShadow: active
                                  ? "inset 2px 0 0 #55708a"
                                  : "inset 2px 0 0 transparent",
                                "&&.Mui-selected": {
                                  bgcolor: "rgba(85,112,138,0.18) !important",
                                  color: "#263f56 !important",
                                },
                                "&&.Mui-selected .MuiTypography-root": {
                                  color: "#263f56 !important",
                                },
                                "&&.Mui-selected:hover": {
                                  bgcolor: "rgba(85,112,138,0.26) !important",
                                },
                                "&:hover": {
                                  bgcolor: "rgba(85,112,138,0.10)",
                                },
                              }}
                            >
                              <Tooltip
                                title={child.label || ""}
                                placement="right"
                                arrow
                                enterDelay={500}
                              >
                                <ListItemText
                                  primary={child.label}
                                  primaryTypographyProps={{
                                    fontSize: "0.76rem",
                                    fontWeight: active ? 700 : 500,
                                    sx: {
                                      whiteSpace: "normal",
                                      overflowWrap: "anywhere",
                                      display: "-webkit-box",
                                      WebkitBoxOrient: "vertical",
                                      WebkitLineClamp: active ? 3 : 2,
                                      overflow: "hidden",
                                      lineHeight: 1.28,
                                    },
                                  }}
                                />
                              </Tooltip>
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

      <Divider sx={{ borderColor: "rgba(85, 112, 138, 0.16)" }} />
      <Box sx={{ p: 1 }}>
        {(desktopOpen || isMobile) && (
          <Box sx={{ px: 1, py: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.75rem" }}
            >
              {(user?.user_code || "U").slice(0, 2).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: "#26384a", fontSize: "0.78rem", fontWeight: 700 }} noWrap>
                {user?.user_code || "User"}
              </Typography>
              <Typography sx={{ color: "#607487", fontSize: "0.68rem" }} noWrap>
                {user?.department || user?.factory || "ShipComply"}
              </Typography>
            </Box>
          </Box>
        )}
        <Tooltip
          title={!desktopOpen && !isMobile ? getControlLabel("lbl_logout", "Log out") : ""}
          placement="right"
        >
          <ListItemButton
            onClick={logout}
            sx={{
              minHeight: 40,
              borderRadius: 1.5,
              color: "#607487",
              justifyContent: desktopOpen || isMobile ? "initial" : "center",
              px: desktopOpen || isMobile ? 1.5 : 1,
              "&:hover": { color: "#b23a3a", bgcolor: "rgba(85,112,138,0.10)" },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: desktopOpen || isMobile ? 1.5 : 0,
                color: "inherit",
              }}
            >
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
            bgcolor: "#e9eef3",
            borderRight: "1px solid rgba(85,112,138,0.18)",
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
          <Toolbar
            sx={{
              minHeight: `${APP_SHELL.appBarHeight}px !important`,
              gap: 1.5,
              position: "relative",
            }}
          >
            <IconButton
              size="small"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              sx={{
                display: { xs: "inline-flex", md: "none" },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <MenuRoundedIcon fontSize="small" />
            </IconButton>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 600 }}
                noWrap
              >
                {user?.factory_name || getControlLabel("lbl_company", "ShipComply")}
              </Typography>
              <Typography
                sx={{
                  display: { xs: "block", md: "none" },
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: "text.primary",
                }}
                noWrap
              >
                {activeEntry.page?.label || getControlLabel("lbl_home", "Workspace")}
              </Typography>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                maxWidth: "42%",
                px: 2,
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "text.primary",
                  letterSpacing: "0.005em",
                }}
                noWrap
              >
                {activeEntry.page?.label || getControlLabel("lbl_home", "Workspace")}
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 0.75 }}>
              {user?.factory && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${getControlLabel("txt_factory_code", "Factory")}: ${user.factory}`}
                />
              )}
              {user?.department && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${getControlLabel("txt_department_code", "Department")}: ${user.department}`}
                />
              )}
              <Chip
                size="small"
                label={isChecking ? `${siteKey} · checking` : siteKey}
                sx={{
                  bgcolor: "rgba(15, 118, 110, 0.08)",
                  color: "primary.dark",
                  border: "1px solid",
                  borderColor: "rgba(15, 118, 110, 0.25)",
                }}
              />
            </Box>

            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                textAlign: "right",
                minWidth: 112,
              }}
            >
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
            overflowX: "clip",
            "--shipcomply-toolbar-sticky-top": `${APP_SHELL.appBarHeight + 43}px`,
          }}
        >
          <Breadcrumbs
            separator={<NavigateNextRoundedIcon sx={{ fontSize: 15, color: "text.disabled" }} />}
            sx={{
              position: "sticky",
              top: APP_SHELL.appBarHeight,
              zIndex: theme.zIndex.appBar - 1,
              mb: 1,
              mx: { xs: -0.5, sm: -0.75 },
              px: { xs: 0.75, sm: 1 },
              py: 0.9,
              bgcolor: "rgba(244, 246, 248, 0.97)",
              backdropFilter: "blur(8px)",
              borderBottom: "1px solid",
              borderColor: "divider",
              "& .MuiBreadcrumbs-separator": { mx: 0.45 },
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={() => goToPath(homePath)}
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
