import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./i18n";
import "./service/axiosConfig/axios";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ColumnTranslationProvider } from "./context/ColumnTranslationContext";
import { SiteProvider } from "./context/SiteContext";
import { RealtimeProvider } from "./context/RealtimeContext";
import GlobalNotifications from "./component/notification/GlobalNotifications";
import appTheme from "./theme/appTheme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <AuthProvider>
          <SiteProvider>
            <ColumnTranslationProvider>
              <RealtimeProvider>
                <App />
              </RealtimeProvider>
            </ColumnTranslationProvider>
          </SiteProvider>
        </AuthProvider>
        <GlobalNotifications />
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>,
);
