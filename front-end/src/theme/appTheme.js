import { createTheme } from "@mui/material/styles";

const palette = {
  primary: "#0f766e",
  primaryDark: "#115e59",
  primarySoft: "#ccfbf1",
  navy: "#0f172a",
  slate: "#475569",
  border: "#e2e8f0",
  surface: "#ffffff",
  canvas: "#f8fafc",
  selected: "#ecfdf5",
  hover: "#f1f5f9",
};

const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.primary, dark: palette.primaryDark },
    background: { default: palette.canvas, paper: palette.surface },
    text: { primary: palette.navy, secondary: palette.slate },
    divider: palette.border,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Arial, sans-serif',
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
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
        root: { borderRadius: 8, minHeight: 36 },
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
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f8fafc",
            borderBottom: `1px solid ${palette.border}`,
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#f8fafc !important",
            borderRight: `1px solid ${palette.border}`,
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            color: `${palette.navy} !important`,
            fontSize: "0.78rem !important",
            fontWeight: "700 !important",
            letterSpacing: "0.01em",
          },
          "& .MuiDataGrid-cell": {
            borderRight: `1px solid ${palette.border} !important`,
            borderBottom: `1px solid ${palette.border} !important`,
            color: palette.navy,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: `${palette.hover} !important`,
          },
          "& .MuiDataGrid-row.Mui-selected, & .Mui-selected-row": {
            backgroundColor: `${palette.selected} !important`,
          },
          "& .MuiDataGrid-row.Mui-selected:hover, & .Mui-selected-row:hover": {
            backgroundColor: `${palette.primarySoft} !important`,
          },
          "& .MuiDataGrid-footerContainer": {
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
