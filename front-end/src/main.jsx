import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n";
import "./styles/legacyUiRestore.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ColumnTranslationProvider } from "./context/ColumnTranslationContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ColumnTranslationProvider>
        <App />
      </ColumnTranslationProvider>
    </AuthProvider>
  </BrowserRouter>,
);
