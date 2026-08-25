import axios from "axios";
const API = "/ac_send_base";
export const fetchAllASB = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  limit = 10,
  offset = 0,
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
export const fetchASBByID = async (factory_code, ac_send) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&ac_send=${ac_send}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchFieldDropdownByASB = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  d_type,
  page,
  limit,
  search,
  isStatus = true,
) => {
  const response = await axios.get(
    `${API}/dropdown_field?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&d_type=${d_type}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllAcSendByCate = async (
  factory_code,
  category_code,
  user_code,
  department_code,
  query_level,
  language,
  page,
  limit,
  search = "",
  isStatus = true,
) => {
  const response = await axios.get(
    `${API}/ac_send?factory_code=${factory_code}&category_code=${category_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllTypeByCate = async (
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  language,
  page,
  pageSize,
  searchText,
  isStatus = true,
) => {
  const response = await axios.get(
    `${API}/type?factory_code=${factory_code}&language=${language}&category_code=${category_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page=${page}&limit=${pageSize}&search=${searchText}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const addASB = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  pageSize,
) => {
  try {
    const response = await axios.post(
      `${API}?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}`,
      {
        data: data,
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    console.log("error when add the asb", data);
    return error.response.data;
  }
};
export const editASB = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  pageSize,
) => {

  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_send=${data.ac_send}&page_size=${pageSize}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const deleteIMT = async (token, data) => {
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

export const searchASBByFilter = async (
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
export const exportExcelIMT = async (
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  try {
    const response = await axios.get(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      {
        // headers: {
        //   authorization: `Bearer ${token}`,
        // },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ac_imp_material_tracking.xlsx");
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
