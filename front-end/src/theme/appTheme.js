import { createTheme } from "@mui/material/styles";

const palette = {
  primary: "#0f766e",
  primaryDark: "#115e59",
  primarySoft: "#ccfbf1",
  primaryTint: "#f0fdfa",
  secondary: "#4f46e5",
  success: "#15803d",
  warning: "#b45309",
  error: "#b91c1c",
  info: "#0369a1",
  navy: "#0f172a",
  slate: "#475569",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#ffffff",
  canvas: "#f8fafc",
  selected: "#ecfdf5",
  selectedHover: "#d1fae5",
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
            boxShadow: `inset 3px 0 0 ${palette.primary}`,
          },
          "&& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell, && .Mui-selected-row .MuiDataGrid-cell": {
            color: `${palette.navy} !important`,
          },
          "&& .MuiDataGrid-row.Mui-selected:hover, && .Mui-selected-row:hover": {
            backgroundColor: `${palette.selectedHover} !important`,
            boxShadow: `inset 3px 0 0 ${palette.primaryDark}`,
          },
          "&& .MuiDataGrid-row:has(.MuiDataGrid-cell:focus-within)": {
            boxShadow: `inset 3px 0 0 ${palette.primary}, inset 0 0 0 1px rgba(15, 118, 110, 0.16)`,
          },
          "&& .MuiDataGrid-row.Mui-selected:has(.MuiDataGrid-cell:focus-within), && .Mui-selected-row:has(.MuiDataGrid-cell:focus-within)": {
            backgroundColor: `${palette.selected} !important`,
            boxShadow: `inset 3px 0 0 ${palette.primaryDark}, inset 0 0 0 1px rgba(15, 118, 110, 0.22)`,
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
