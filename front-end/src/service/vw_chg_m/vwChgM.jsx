import axios from "axios";
const API = "/vw_chg_m";
export const fetchViewAcCM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/list_of_chg_m?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : [];
};
export const fetchViewContImpSetting = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/list_of_setting_cont_imp?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const copyContract = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  old_cont_no,
  new_cont_no,
) => {
  try {
    const response = await axios.get(
      `${API}/copy?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&old_cont_no=${old_cont_no}&new_cont_no=${new_cont_no}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    // Handle error từ backend (status 400, 500, etc.)
    if (error.response) {
      // Server trả về response với status code lỗi
      console.error("Error response:", error.response.data);
      console.error("Status:", error.response.status);

      // Trả về error data để component xử lý
      throw {
        message: error.response.data.message,
        tableName: error.response.data.tableName,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error("Network error:", error.request);
      throw new Error("Network error - no response received");
    } else {
      // Lỗi khác khi setup request
      console.error("Error:", error.message);
      throw error;
    }
  }
};
export const extendContract = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
  language,
) => {
  const response = await axios.post(
    `${API}/extend?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}
    language=${language}`,
    { filters: filters },
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const extendConfirmContract = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
) => {
  const response = await axios.get(
    `${API}/confirm-extend?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&cont_no=${cont_no}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
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
export const searchVwChgMByFilter = async (
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
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}&language=${language}`,
      filtered,
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportExcelVwContImp = async (
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
      { filters: filters },
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vw_cont_imp.xlsx");
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
