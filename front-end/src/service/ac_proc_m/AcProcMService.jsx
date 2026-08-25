import axios from "axios";
const API = "/ac_proc_m";
export const fetchAllAcProcM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchAllAcProcMMarkB = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {

  const response = await axios.get(
    `${API}/mark_b_all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchAPCMByID = async (factory_code, ac_no) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&ac_no=${ac_no}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const createAcno = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  mark = "A",
) => {
  const response = await axios.get(
    `${API}/ac_no?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&mark=${mark}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const addAPCM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
  mark = "A",
) => {
  const response = await axios.post(
    `${API}?factory_code=${factory_code}&department=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}&mark=${mark}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const editAPCM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
  mark = "A",
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${data.ac_no}&page_size=${pageSize}&mark=${mark}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const deleteABomM = async (token, data) => {
  const response = await axios.delete(
    `${API}?factory_code=${data.factory_code}&cont_no=${data.cont_no}`,
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
export const searchAcProcMByFilter = async (
  filtered,
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
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
      filtered,
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const searchAcProcMMarkBByFilter = async (
  filtered,
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
      `${API}/search_mark_b?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
      filtered,
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportExcelVwProcM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) => {
  try {
    const response = await axios.post(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}`,
      { search: filters },
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ac_proc_m.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
  }
};
export const exportExcelVwProcMMarkB = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) => {
  try {
    const response = await axios.post(
      `${API}/excel_mark_b?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}`,
      { search: filters },
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ac_proc_m.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
  }
};
export const exportMaterialExcel = async (data) => {
  try {
    const response = await axios.post(`${API}/material-excel`, data, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "material.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in exportExcelUser", error);
  }
};
export const exportCustomExcel = async (data) => {
  try {
    const response = await axios.post(`${API}/custom-excel`, data, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "custom.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in exportExcelUser", error);
  }
};
export const activate = async (
  factory_code,
  user_code,
  ac_no,
  curr_rate,
  language,
) => {
  try {
    const response = await axios.get(
      `${API}/activate?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}&curr_rate=${curr_rate}&language=${language}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
export const voidAll = async (factory_code, ac_no, user_code, language) => {
  try {
    const response = await axios.get(
      `${API}/void?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}&language=${language}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
export const cancelActivate = async (
  factory_code,
  user_code,
  ac_no,
  language,
) => {
  try {
    const response = await axios.get(
      `${API}/cancel_activate?factory_code=${factory_code}&user_code=${user_code}&ac_no=${ac_no}&language=${language}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
export const close = async (factory_code, ac_no, user_code) => {
  try {
    const response = await axios.get(
      `${API}/close?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    return error?.response?.data;
  }
};

export const activateMarkB = async (
  factory_code,
  user_code,
  ac_no,
  language,
) => {
  try {
    const response = await axios.get(
      `${API}/activate_mark_b?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}&language=${language}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
export const voidAllMarkB = async (
  factory_code,
  ac_no,
  user_code,
  language,
) => {
  try {
    const response = await axios.get(
      `${API}/void_mark_b?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}&language=${language}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
export const cancelActivateMarkB = async (
  factory_code,
  user_code,
  ac_no,
  language,
) => {
  try {
    const response = await axios.get(
      `${API}/cancel_activate_mark_b?factory_code=${factory_code}&user_code=${user_code}&ac_no=${ac_no}&language=${language}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
export const closeMarkB = async (factory_code, ac_no, user_code) => {
  try {
    const response = await axios.get(
      `${API}/close_mark_b?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    return error?.response?.data;
  }
};
export const confirmAll = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) => {
  try {
    const response = await axios.get(
      `${API}/confirm_all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${ac_no}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
export const checkDuplicateAGEO = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_chgeno,
  out_date,
  ac_no,
) => {
  try {
    const response = await axios.get(
      `${API}/check_ageo?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_chgeno=${ac_chgeno}&out_date=${out_date}&ac_no=${ac_no}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};