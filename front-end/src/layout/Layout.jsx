import Box from "@mui/material/Box";
import Sidebar from "../component/sidebar/Sidebar";
import { ToastContainer } from "react-toastify";

export default function Layout() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar />
      <ToastContainer
        autoClose={1800}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Box>
  );
}
