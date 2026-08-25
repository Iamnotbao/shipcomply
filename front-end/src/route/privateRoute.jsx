import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";

const PrivateRoute = ({ requiredProgram }) => {
  const { user, loading, programCodeList, getDefaultRoute } = useAuth();
  const location = useLocation();
  if (loading) {
    return <CircularProgress />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user.user_code === "admin") {
    return <Outlet />;
  }
  if (requiredProgram) {
    const hasPermission = programCodeList.some(
      (p) => p.program_code === requiredProgram && p.allow_query === "Y"
    );

    if (!hasPermission) {
      console.warn(
        ` User ${user.user_code} doesn't have access to ${requiredProgram}`
      );

      const defaultRoute = getDefaultRoute();

      if (location.pathname === defaultRoute) {
        console.error(" Infinite redirect detected, staying on current page");
        return (
          <Box p={3}>
            <h2>Access Denied</h2>
            <p>You don't have permission to access this page.</p>
          </Box>
        );
      }

      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
