import axios from "axios";

const SITE_PORT = {
  LOCAL: 3002,
  TAIWAN:3003,
  VG350: 3004,
  VG380: 3005,
  AW350: 3006,
  AW380: 3007,
};

const HOST = import.meta.env.VITE_API_HOST;

export function setApiSite(siteKey) {
  const baseURL = `http://${HOST}:${SITE_PORT[siteKey]}/api`;
  axios.defaults.baseURL = baseURL;
  localStorage.setItem("siteKey", siteKey);
  return baseURL;
}

export function restoreApiSite() {
  const saved = localStorage.getItem("siteKey");
  if (saved && SITE_PORT[saved]) {
    setApiSite(saved);
  }
}

export function getCurrentSite() {
  return localStorage.getItem("siteKey");
}