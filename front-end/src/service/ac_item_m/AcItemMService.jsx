import axios from "axios";
const API = "/ac_item_m";
export const fetchAllAcItemM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAcItemMByID = async (
  factory_code,
  item_acno,
  options = {},
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&item_acno=${item_acno}`,
    {
      signal: options.signal,
    },
  );
  return response.data ? response.data : {};
};
export const fetchAcItemMByFac = async (factory_code) => {
  const response = await axios.get(
    `${API}/factory?factory_code=${factory_code}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchGroupFieldDropdown = async (
  factory_code,
  ac_itemno,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search = "",
  isStatus = true
) => {
  const response = await axios.get(
    `${API}/dropdown_group_field?factory_code=${factory_code}&ac_itemno=${ac_itemno}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchFieldWithFunction = async (
  factory_code,
  ac_itemno,
  department_code,
  user_code,
  query_level,
  field,
  type='1'
) => {
  const response = await axios.get(
    `${API}/field_with_function?factory_code=${factory_code}&ac_itemno=${ac_itemno}&type=${type}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchFieldDropdown = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  field,
  page,
  limit,
  search
) => {
  const response = await axios.get(
    `${API}/field_dropdown?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&language=${language}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const addAcItemM = async (
  factory_code,
  user_code,
  department_code,
  query_level,
  data,
  pageSize,
) => {
  const response = await axios.post(`${API}?factory_code=${factory_code}&user_code=${user_code}&department_code=${department_code}&query_level=${query_level}&page_size=${pageSize}`, {
    data: data,
  });
  return response.data ? response.data : {};
};
export const editAcItemM = async (
  factory_code,
  user_code,
  department_code,
  query_level,
  data,
  pageSize,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&user_code=${user_code}&department_code=${department_code}&query_level=${query_level}&item_acno=${data.item_acno}&page_size=${pageSize}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const deleteAcItemM = async (token, data) => {
  const response = await axios.delete(
    `${API}?factory_code=${data.factory_code}&department_code=${data.department_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response ? response.data : "";
};
export const deleteAllDepartment = async (users, token) => {
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
export const searchAcItemMByFilter = async (
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
export const exportPDFAcItemM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  try {
    const response = await axios.get(
      `${API}/pdf?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ac_item_m.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
export const exportExcelAcItemM = async (data) => {
  try {
    const response = await axios.post(
      `${API}/excel`,
      { data: data },
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "blob",
      },
    );
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AC_ITEM_M_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  } catch (error) {
    console.error(" Error when export Excel:", error);
    throw error;
  }
};

export const importExcel = async (
  token,
  factory_code,
  user_code,
  session_id,
  formData,
) => {
  const response = await axios.post(
    `${API}/import?factory_code=${factory_code}&user_code=${user_code}`,
    formData,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response ? response.data : "";
};
