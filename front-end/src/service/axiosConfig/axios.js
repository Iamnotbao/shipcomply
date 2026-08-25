import axios from "axios";

let activeUrl = localStorage.getItem("activeUrl") || import.meta.env.VITE_API_URL;

export const setActiveUrl = (url) => {
  activeUrl = url;
  localStorage.setItem("activeUrl", url);
};
export const getActiveUrl = () => activeUrl;

// 1. Đổi URL theo site đang chọn
axios.interceptors.request.use((config) => {
  config.url = config.url.replace(import.meta.env.VITE_API_URL, activeUrl);
  const token = localStorage.getItem("access_token"); // đổi key khớp AuthContext
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 3. Xử lý 401 -> tự refresh token -> retry request cũ
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(
          `${activeUrl}/authentication/refresh`,
          { token: refreshToken }
        );
        localStorage.setItem("accessToken", data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;