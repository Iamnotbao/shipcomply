import { createTheme } from "@mui/material/styles";

const palette = {
  primary: "#2e7d32",
  primaryDark: "#1b5e20",
  primarySoft: "#c8e6c9",
  primaryTint: "#f1f8e9",
  secondary: "#1976d2",
  success: "#15803d",
  warning: "#b45309",
  error: "#b91c1c",
  info: "#0369a1",
  navy: "#0f172a",
  slate: "#475569",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#ffffff",
  canvas: "#f4f6f8",
  selected: "#fff59d",
  selectedHover: "#ffee58",
  hover: "#f8fafc",
};

const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.primary, dark: palette.primaryDark },
    secondary: { main: palette.secondary },
    success: { main: palette.success },
    warning: { main: palette.warning },
    error: { main: palette.error },
    info: { main: palette.info },
    background: { default: palette.canvas, paper: palette.surface },
    text: { primary: palette.navy, secondary: palette.slate },
    divider: palette.border,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Arial, sans-serif',
    h6: { fontWeight: 700 },
    button: {
      textTransform: "none",
      fontWeight: 650,
      letterSpacing: "0.01em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          backgroundColor: palette.canvas,
          color: palette.navy,
        },
        "*": { boxSizing: "border-box" },
        "*::-webkit-scrollbar": {
          width: 7,
          height: 7,
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(71, 85, 105, 0.48)",
          borderRadius: 999,
        },
        "*::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "rgba(51, 65, 85, 0.72)",
        },
        "input[type='checkbox']": {
          accentColor: palette.primary,
        },

        "body .MuiDataGrid-root .MuiDataGrid-columnHeader": {
          backgroundColor: "#1976d2 !important",
          color: "#ffffff !important",
          borderRight: "1px solid rgba(255,255,255,0.20) !important",
        },
        "body .MuiDataGrid-root .MuiDataGrid-columnHeaderTitle": {
          color: "#ffffff !important",
          fontWeight: "700 !important",
          fontSize: "0.78rem !important",
        },
        "body .MuiDataGrid-root .Mui-selected-row, body .MuiDataGrid-root .MuiDataGrid-row.Mui-selected": {
          backgroundColor: `${palette.selected} !important`,
          color: "black !important",
          boxShadow: "none !important",
        },
        "body .MuiDataGrid-root .Mui-selected-row .MuiDataGrid-cell, body .MuiDataGrid-root .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell": {
          color: "black !important",
        },
        "body .MuiDataGrid-root .Mui-selected-row:hover, body .MuiDataGrid-root .MuiDataGrid-row.Mui-selected:hover": {
          backgroundColor: `${palette.selectedHover} !important`,
          boxShadow: "none !important",
        },
        "body .MuiDataGrid-root .MuiDataGrid-footerContainer": {
          minHeight: "48px !important",
          padding: "6px 10px",
          backgroundColor: "#fbfdff !important",
          borderTop: `1px solid ${palette.border} !important`,
          gap: 8,
        },
        "body .MuiDataGrid-root .MuiDataGrid-footerContainer select": {
          minHeight: 32,
          padding: "4px 28px 4px 10px !important",
          border: `1px solid ${palette.border} !important`,
          borderRadius: "8px !important",
          backgroundColor: `${palette.surface} !important`,
          color: `${palette.navy} !important`,
          fontSize: "0.78rem !important",
          outline: "none",
          cursor: "pointer",
        },
        "body .MuiDataGrid-root .MuiDataGrid-footerContainer input[readonly]": {
          height: "30px !important",
          border: `1px solid ${palette.border} !important`,
          borderRadius: "7px !important",
          backgroundColor: `${palette.canvas} !important`,
          color: `${palette.navy} !important`,
          padding: "0 8px !important",
          fontSize: "0.76rem !important",
        },
        "body .MuiDataGrid-root .MuiDataGrid-footerContainer .MuiIconButton-root": {
          width: 30,
          height: 30,
          border: `1px solid ${palette.border}`,
          borderRadius: 8,
          backgroundColor: palette.surface,
          color: palette.slate,
        },
        "body .MuiDataGrid-root .MuiDataGrid-footerContainer .MuiIconButton-root:hover": {
          borderColor: palette.primary,
          color: palette.primary,
          backgroundColor: palette.primaryTint,
        },
        "body .MuiDataGrid-root .MuiDataGrid-footerContainer .MuiIconButton-root.Mui-disabled": {
          opacity: 0.45,
          backgroundColor: palette.canvas,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 34,
          paddingInline: 14,
          fontSize: "0.79rem",
          whiteSpace: "nowrap",
          transition:
            "background-color 140ms ease, border-color 140ms ease, color 140ms ease, box-shadow 140ms ease, transform 80ms ease",
          "&:active:not(.Mui-disabled)": {
            transform: "translateY(1px)",
          },
        },
        contained: {
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
          "&:hover": {
            boxShadow: "0 3px 8px rgba(15, 23, 42, 0.12)",
          },
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          gap: 6,
          boxShadow: "none",
          alignItems: "center",
        },
        grouped: {
          borderRadius: "8px !important",
          borderLeft: "1px solid currentColor !important",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: `${palette.primaryTint} !important`,
            color: `${palette.primaryDark} !important`,
            borderColor: "transparent !important",
            boxShadow: "none !important",
          },
          "&.Mui-selected .MuiTypography-root, &.Mui-selected .MuiListItemIcon-root": {
            color: `${palette.primaryDark} !important`,
          },
          "&.Mui-selected:hover": {
            backgroundColor: `${palette.primarySoft} !important`,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: palette.surface,
          fontSize: "0.8rem",
          transition:
            "box-shadow 120ms ease, border-color 120ms ease, background-color 120ms ease",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: palette.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#94a3b8",
          },
          "&.Mui-focused": {
            boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.10)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: palette.primary,
            borderWidth: 1,
          },
        },
        input: {
          paddingTop: 9,
          paddingBottom: 9,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.8rem",
          color: palette.muted,
          "&.Mui-focused": {
            color: palette.primary,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          minHeight: "unset",
          display: "flex",
          alignItems: "center",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 6,
          color: "#94a3b8",
          "&.Mui-checked, &.MuiCheckbox-indeterminate": {
            color: palette.primary,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: palette.primary,
          },
          "&.Mui-checked + .MuiSwitch-track": {
            backgroundColor: palette.primary,
          },
        },
        track: {
          backgroundColor: "#cbd5e1",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 7, fontWeight: 600 },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${palette.border}`,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: palette.surface,
          fontSize: "0.82rem",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          "&& .MuiDataGrid-columnHeaders": {
            backgroundColor: `${palette.canvas} !important`,
            borderBottom: `1px solid ${palette.border}`,
          },
          "&& .MuiDataGrid-columnHeader": {
            backgroundColor: `${palette.canvas} !important`,
            borderRight: `1px solid ${palette.border} !important`,
          },
          "&& .MuiDataGrid-columnHeaderTitle": {
            color: `${palette.navy} !important`,
            fontSize: "0.78rem !important",
            fontWeight: "700 !important",
            letterSpacing: "0.01em",
          },
          "&& .MuiDataGrid-cell": {
            borderRight: `1px solid ${palette.border} !important`,
            borderBottom: `1px solid ${palette.border} !important`,
            color: palette.navy,
            transition: "background-color 120ms ease, color 120ms ease",
          },
          "&& .MuiDataGrid-row": {
            position: "relative",
            transition:
              "background-color 120ms ease, box-shadow 120ms ease, color 120ms ease",
          },
          "&& .MuiDataGrid-row:hover": {
            backgroundColor: `${palette.hover} !important`,
          },
          "&& .MuiDataGrid-row.Mui-selected, && .Mui-selected-row": {
            backgroundColor: `${palette.selected} !important`,
            color: "black !important",
            boxShadow: "none !important",
          },
          "&& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell, && .Mui-selected-row .MuiDataGrid-cell": {
            color: "black !important",
          },
          "&& .MuiDataGrid-row.Mui-selected:hover, && .Mui-selected-row:hover": {
            backgroundColor: `${palette.selectedHover} !important`,
            boxShadow: "none !important",
          },
          "&& .MuiDataGrid-row:has(.MuiDataGrid-cell:focus-within)": {
            boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.18)",
          },
          "&& .MuiDataGrid-row.Mui-selected:has(.MuiDataGrid-cell:focus-within), && .Mui-selected-row:has(.MuiDataGrid-cell:focus-within)": {
            backgroundColor: `${palette.selected} !important`,
            boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.28)",
          },
          "&& .MuiDataGrid-columnHeaderCheckbox, && .MuiDataGrid-cellCheckbox": {
            backgroundColor: "transparent !important",
          },
          "&& .MuiDataGrid-footerContainer": {
            minHeight: 46,
            borderTop: `1px solid ${palette.border}`,
            backgroundColor: "#fbfdff",
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
            outline: "none",
          },
        },
      },
    },
  },
});

export { palette };
export default appTheme;
