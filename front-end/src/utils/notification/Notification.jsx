
import { toast } from "react-toastify";

export const showToast = (
  getControlLabel,
  type = "info",
  translationKey,
  fallbackMessage,
  replacements = {},
  options = {}
) => {

  const template = getControlLabel(translationKey, fallbackMessage);
  

  let message = template || fallbackMessage;
  

  message = message?.replace(/\\n/g, "\n");
  
  
  Object.keys(replacements).forEach((key) => {
    const placeholder = `{${key}}`;
    message = message?.replace(new RegExp(placeholder, "g"), replacements[key] || "");
  });
  
  const toastOptions = {
    autoClose: 1000,
    ...options,
  };
  
  switch (type) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "warning":
      toast.warning(message, toastOptions);
      break;
    case "info":
    default:
      toast.info(message, toastOptions);
      break;
  }
};

export const showSuccessToast = (getControlLabel, key, fallback, replacements, options) => {
  showToast(getControlLabel, "success", key, fallback, replacements, options);
};

export const showErrorToast = (getControlLabel, key, fallback, replacements, options) => {
  showToast(getControlLabel, "error", key, fallback, replacements, options);
};

export const showWarningToast = (getControlLabel, key, fallback, replacements, options) => {
  showToast(getControlLabel, "warning", key, fallback, replacements, options);
};

export const showInfoToast = (getControlLabel, key, fallback, replacements, options) => {
  showToast(getControlLabel, "info", key, fallback, replacements, options);
};