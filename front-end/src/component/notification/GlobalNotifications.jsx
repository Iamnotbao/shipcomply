import { ToastContainer } from "react-toastify";

const GlobalNotifications = () => (
  <ToastContainer
    autoClose={5500}
    position="top-right"
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnFocusLoss
    draggable
    pauseOnHover
    limit={4}
    theme="light"
  />
);

export default GlobalNotifications;
