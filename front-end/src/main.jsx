import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import "./i18n";
import "./styles/formFallback.css";
import { AuthProvider } from "./context/AuthContext";
import { ColumnTranslationProvider } from "./context/ColumnTranslationContext";
import appTheme from "./theme/appTheme";

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={appTheme}>
    <CssBaseline />
    <BrowserRouter>
      <AuthProvider>
        <ColumnTranslationProvider>
          <App />
        </ColumnTranslationProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>,
);
