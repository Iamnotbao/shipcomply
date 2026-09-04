import axios from "axios";
import { getCurrentSite, getSiteApiBaseUrl } from "../../config/sites";

const isAbsoluteUrl = (url = "") => /^https?:\/\//i.test(url);

axios.defaults.baseURL = getSiteApiBaseUrl();

axios.interceptors.request.use((config) => {
  if (!isAbsoluteUrl(config.url)) {
    config.baseURL = getSiteApiBaseUrl(getCurrentSite());
  }

  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

const clearExpiredSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.dispatchEvent(new Event("shipcomply:auth-expired"));
};

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("Missing refresh token");

  refreshPromise = axios
    .post(
      "/authentication/refresh",
      { token: refreshToken },
      { skipAuthRefresh: true },
    )
    .then(({ data }) => {
      if (!data?.access_token) throw new Error("Refresh did not return a token");
      localStorage.setItem("access_token", data.access_token);
      axios.defaults.headers.common.authorization = `Bearer ${data.access_token}`;
      window.dispatchEvent(
        new CustomEvent("shipcomply:token-refreshed", {
          detail: { accessToken: data.access_token },
        }),
      );
      return data.access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh;

    if (!shouldRefresh) return Promise.reject(error);

    originalRequest._retry = true;

    try {
      const token = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axios(originalRequest);
    } catch (refreshError) {
      clearExpiredSession();
      return Promise.reject(refreshError);
    }
  }
);

export const getActiveUrl = () => getSiteApiBaseUrl(getCurrentSite());
export default axios;
