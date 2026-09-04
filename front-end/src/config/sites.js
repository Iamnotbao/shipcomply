export const DEFAULT_SITE_KEY = "VG350";

export const SITE_CONFIG = Object.freeze({
  LOCAL: { key: "LOCAL", port: 3002, label: "LOCAL" },
  TAIWAN: { key: "TAIWAN", port: 3003, label: "TAIWAN" },
  VG350: { key: "VG350", port: 3004, label: "VG350" },
  VG380: { key: "VG380", port: 3005, label: "VG380" },
  AW350: { key: "AW350", port: 3006, label: "AW350" },
  AW380: { key: "AW380", port: 3007, label: "AW380" },
});

const SITE_URL_OVERRIDES = {
  LOCAL: import.meta.env.VITE_API_URL_LOCAL,
  TAIWAN: import.meta.env.VITE_API_URL_TAIWAN,
  VG350: import.meta.env.VITE_API_URL_VG350,
  VG380: import.meta.env.VITE_API_URL_VG380,
  AW350: import.meta.env.VITE_API_URL_AW350,
  AW380: import.meta.env.VITE_API_URL_AW380,
};

const normalizeBaseUrl = (url) => url?.replace(/\/+$/, "").replace(/\/api$/, "");

export const normalizeSiteKey = (siteKey) =>
  SITE_CONFIG[siteKey] ? siteKey : DEFAULT_SITE_KEY;

export const getCurrentSite = () =>
  normalizeSiteKey(localStorage.getItem("siteKey"));

export const getSiteOrigin = (siteKey = getCurrentSite()) => {
  const normalizedSite = normalizeSiteKey(siteKey);
  const override = normalizeBaseUrl(SITE_URL_OVERRIDES[normalizedSite]);
  if (override) return override;

  const protocol = import.meta.env.VITE_API_PROTOCOL || "http";
  const host = import.meta.env.VITE_API_HOST || window.location.hostname;
  return `${protocol}://${host}:${SITE_CONFIG[normalizedSite].port}`;
};

export const getSiteApiBaseUrl = (siteKey = getCurrentSite()) =>
  `${getSiteOrigin(siteKey)}/api`;

export const getSiteHealthUrl = (siteKey = getCurrentSite()) =>
  `${getSiteApiBaseUrl(siteKey)}/health`;

export const getSiteEventsUrl = (siteKey = getCurrentSite()) =>
  `${getSiteApiBaseUrl(siteKey)}/sse/events`;

export const setCurrentSite = (siteKey) => {
  const normalizedSite = normalizeSiteKey(siteKey);
  const previousSite = getCurrentSite();
  localStorage.setItem("siteKey", normalizedSite);

  if (previousSite !== normalizedSite) {
    window.dispatchEvent(
      new CustomEvent("shipcomply:site-changed", {
        detail: { siteKey: normalizedSite },
      }),
    );
  }

  return normalizedSite;
};

export const subscribeToSiteChanges = (listener) => {
  const handleSiteChange = (event) => listener(event.detail.siteKey);
  window.addEventListener("shipcomply:site-changed", handleSiteChange);
  return () =>
    window.removeEventListener("shipcomply:site-changed", handleSiteChange);
};
