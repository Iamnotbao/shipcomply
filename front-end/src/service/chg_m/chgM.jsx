import axios from "axios";
const API = "/chg_m";
export const fetchChgM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/chg_m?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : [];
};

export const addABomM = async (data) => {
  const response = await axios.post(`${API}`, { data: data });
  return response.data ? response.data : {};
};
export const editABomM = async (data) => {

  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}&prod_acno=${data.prod_acno}&item_acno=${data.item_acno}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const checkBox = async (
  token,
  factory_code,
  ac_no,
  is_check,
  filters,
  isAll,
  language,
) => {
  try {
    const response = await axios.post(
      `${API}/checkbox?factory_code=${factory_code}&ac_no=${ac_no}&is_check=${is_check}&language=${language}`,
      { filters: filters, isAll: isAll },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const autoAdd = async (token, factory_code, language, user_code) => {
  try {
    const response = await axios.get(
      `${API}/auto_add?factory_code=${factory_code}&language=${language}&user_code=${user_code}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response ? response.data : [];
  } catch (error) {
    throw error?.response?.data;
  }
};
export const deleteABomM = async (token, data) => {
  const response = await axios.delete(
    `${API}?factory_code=${data.factory_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response ? response.data : "";
};
export const deleteAllFactory = async (users, token) => {
  try {
    const response = await axios.delete(`${API}/delete-all`, {
      data: users,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data ? response.data : [];
  } catch (error) {
    console.log("The error was in delete", error);
  }
};
export const searchChgMByFilter = async (
  filtered,
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}&language=${language}`,
      filtered,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const getTempTable = async (token) => {
  try {
    const response = await axios.get(`${API}/temp_table`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const clearTempTable = async (token) => {
  try {
    const response = await axios.get(`${API}/clear_temp_table`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
