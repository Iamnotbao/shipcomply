import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/notification.css";

const GlobalNotifications = () => (
  <ToastContainer
    autoClose={5500}
    position="top-right"
    hideProgressBar={false}
    newestOnTop
    closeOnClick={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    limit={4}
    theme="light"
  />
);

export default GlobalNotifications;
