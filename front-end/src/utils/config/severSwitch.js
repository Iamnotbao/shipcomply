import axios from "axios";
import {
  getCurrentSite,
  getSiteApiBaseUrl,
  setCurrentSite,
} from "../../config/sites";

export function setApiSite(siteKey) {
  const normalizedSite = setCurrentSite(siteKey);
  const baseURL = getSiteApiBaseUrl(normalizedSite);
  axios.defaults.baseURL = baseURL;
  return baseURL;
}

export function restoreApiSite() {
  return setApiSite(getCurrentSite());
}

export { getCurrentSite };
