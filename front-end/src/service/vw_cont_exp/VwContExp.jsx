import axios from "axios";
const API = "/vw_cont_exp";

export const fetchViewContExpSetting = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/list_of_setting_cont_exp?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchFieldDropdown = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  cont_no,
  page,
  limit,
  search,
  isStatus = true
) => {
  const response = await axios.get(
    `${API}/dropdown_field?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&cont_no=${cont_no}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchMinContDropdown = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  cont_no,
  page,
  limit,
  search,
  isStatus = true
) => {
  const response = await axios.get(
    `${API}/min_cont?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&cont_no=${cont_no}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchInContDropdown = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  page,
  limit,
  search,
  mark = "A",
  vend_no,
  d_type,
) => {
  const response = await axios.get(
    `${API}/in_cont?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&page=${page}&limit=${limit}&search=${search}&mark=${mark}&vend_no=${vend_no}&d_type=${d_type}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const getContno = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search
) => {
  const response = await axios.get(
    `${API}/cont_no?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page=${page}&limit=${limit}&search=${search}`,
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
  limit,
) => {

  try {
    const response = await axios.get(
      `${API}/copy?limit=${limit}&factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&old_cont_no=${old_cont_no}&new_cont_no=${new_cont_no}`,
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
export const searchVwAcContExpByFilter = async (
  filtered,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}`,
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
export const updateLastExpDate = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  cont_no,
  data,
) => {
  const response = await axios.post(
    `${API}/update_last_exp_date?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&cont_no=${cont_no}`,
    { data },
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
