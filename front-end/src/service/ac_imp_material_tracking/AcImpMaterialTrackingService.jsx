import axios from "axios";
const API = "/ac_imp_material_tracking";
export const fetchIMT = async (
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
export const fetchIMTByID = async (factory_code, invoice_no, sort) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&invoice_no=${invoice_no}&sort=${sort}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchFieldDropdownByIMT = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  com_invoice,
  sort,
  page,
  limit,
  search,
  isStatus,
) => {
  const response = await axios.get(
    `${API}/dropdown_field?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&com_invoice=${com_invoice}&sort=${sort}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getComInvoice = async (
  factory_code,
  field,
  value,
  department_code,
  invoice_no,
  sort,
  page=1,
  limit=10,
  search=''
) => {
  const response = await axios.get(
    `${API}/com_invoice?factory_code=${factory_code}&department_code=${department_code}&field=${field}&invoice_no=${invoice_no}&sort=${sort}&value=${value}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getCol4 = async (
  factory_code,
  field,
  value,
  invoice_no,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.get(
    `${API}/col4?factory_code=${factory_code}&department_code=${department_code}&field=${field}&invoice_no=${invoice_no}&value=${value}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getSort = async (
  factory_code,
  com_invoice,
  department_code,
  invoice_no,
  sort,
) => {
  const response = await axios.get(
    `${API}/sort?factory_code=${factory_code}&department_code=${department_code}&com_invoice=${com_invoice}&invoice_no=${invoice_no}&sort=${sort}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const addIMT = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  pageSize,
) => {
  const response = await axios.post(
    `${API}?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const editIMT = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  pageSize,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&invoice_no=${data.invoice_no}&sort=${data.sort}&page_size=${pageSize}`,
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
export const searchIMTByFilter = async (
  filtered,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit = 10,
  offset = 0,
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
