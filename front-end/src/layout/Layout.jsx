import { Alert, Box, Button, LinearProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/sidebar/Sidebar";
import { useSite } from "../context/siteContext";
import useAuth from "../hooks/useAuth";

export default function Layout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    siteKey,
    isInitialChecking,
    isUnavailable,
    retryHealth,
  } = useSite();

  if (isInitialChecking) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pt: 0.5 }}>
        <LinearProgress aria-label="Checking site availability" />
      </Box>
    );
  }

  if (isUnavailable) {
    const chooseEnvironment = () => {
      logout();
      navigate("/login", { replace: true });
    };

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
          p: 2,
        }}
      >
        <Alert
          severity="error"
          variant="outlined"
          sx={{ maxWidth: 560, width: "100%", bgcolor: "background.paper" }}
          action={
            <Button color="inherit" size="small" onClick={() => retryHealth()}>
              Retry
            </Button>
          }
        >
          <Typography variant="subtitle2">{siteKey} is unavailable</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            The API is running without a database connection, or the site cannot
            be reached. No other environment was selected automatically.
          </Typography>
          <Button size="small" sx={{ mt: 1 }} onClick={chooseEnvironment}>
            Choose environment
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar />
    </Box>
  );
}
