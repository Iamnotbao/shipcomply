import axios from "axios";
const API = "/authentication";
export const loginAsUser = async (user) => {
  const result = await axios.post(`${API}/login`, user, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return result.data.success ? result.data : {};
};
export const loginAsAdmin = async (user) => {
  const result = await axios.post(`${API}/admin-login`, user);
  return result.data.success ? result.data : {};
};
export const register = async (user) => {
  const result = await axios.post(`${API}/register`, user);
  if (result.data) {
    return result.data;
  }
};
export const refresh = async (token) => {
  const result = await axios.post(`${API}/refresh`, { token });
  return result.data;
};
