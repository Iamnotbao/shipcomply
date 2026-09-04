import { toast } from "react-toastify";

const TOAST_DURATION = {
  success: 4500,
  info: 5500,
  warning: 7000,
  error: 8000,
  database: 9500,
};

const resolveMessage = (getControlLabel, translationKey, fallbackMessage) => {
  if (typeof getControlLabel !== "function") return fallbackMessage;
  return getControlLabel(translationKey, fallbackMessage);
};

export const showToast = (
  getControlLabel,
  type = "info",
  translationKey,
  fallbackMessage,
  replacements = {},
  options = {},
) => {
  const template = resolveMessage(
    getControlLabel,
    translationKey,
    fallbackMessage,
  );

  let message = template || fallbackMessage || "";
  message = message.replace(/\\n/g, "\n");

  Object.keys(replacements).forEach((key) => {
    const placeholder = `{${key}}`;
    message = message.replace(
      new RegExp(placeholder, "g"),
      replacements[key] ?? "",
    );
  });

  const toastOptions = {
    autoClose: TOAST_DURATION[type] || TOAST_DURATION.info,
    toastId: `${type}:${translationKey}:${message}`,
    ...options,
  };

  const toastMethod = toast[type] || toast.info;
  return toastMethod(message, toastOptions);
};

export const showSuccessToast = (
  getControlLabel,
  key,
  fallback,
  replacements,
  options,
) => showToast(getControlLabel, "success", key, fallback, replacements, options);

export const showErrorToast = (
  getControlLabel,
  key,
  fallback,
  replacements,
  options,
) => showToast(getControlLabel, "error", key, fallback, replacements, options);

export const showWarningToast = (
  getControlLabel,
  key,
  fallback,
  replacements,
  options,
) => showToast(getControlLabel, "warning", key, fallback, replacements, options);

export const showInfoToast = (
  getControlLabel,
  key,
  fallback,
  replacements,
  options,
) => showToast(getControlLabel, "info", key, fallback, replacements, options);

export const showDatabaseUnavailableToast = (message, siteKey) =>
  toast.error(message, {
    autoClose: TOAST_DURATION.database,
    toastId: `site-unavailable:${siteKey}`,
  });
