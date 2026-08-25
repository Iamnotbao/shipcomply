import axios from "axios";
const API = "/ac_cont_m";
export const fetchAllAcContD = async (
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data?.rows : "";
};
export const fetchAllAcContMByID = async (token, factory_code, cont_no) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&cont_no=${cont_no}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchFieldByPoVenderMDropDown = async (
  token,
  factory_code,
  categoryCode,
  vend_no,
  is_status,
  department_code,
  user_code,
  query_level,
  field,
  page,
  limit,
  search,
  language,
  isStatus = true,
) => {
  const response = await axios.get(
    `${API}/field_po_vender_m?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&category_code=${categoryCode}&vend_no=${vend_no}&page=${page}&limit=${limit}&search=${search}&language=${language}&is_status=${isStatus}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchBankDropDown = async (
  token,
  factory_code,
  field,
  page,
  limit,
  search,
  isStatus = true,
) => {
  const response = await axios.get(
    `${API}/bank?factory_code=${factory_code}&field=${field}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const confirmAll = async (
  token,
  factory_code,
  user_code,
  department_code,
  query_level,
  cont_no,
) => {
  const response = await axios.get(
    `${API}/confirm_all?factory_code=${factory_code}&user_code=${user_code}&department_code=${department_code}&query_level=${query_level}&cont_no=${cont_no}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchBigContNoByAcContMDropDown = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  gridData,
  page,
  limit,
  search,
  isStatus = true,
) => {
  const response = await axios.post(
    `${API}/big_contno?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    { data: gridData },
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchBigContNoExmpByAcContMDropDown = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  gridData,
  page,
  limit,
  search,
  isStatus = true,
) => {
  const response = await axios.post(
    `${API}/big_contno_exmp?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    { data: gridData },
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const addAcContM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
  cont_type = "1",
) => {
  const response = await axios.post(
    `${API}?&factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}&cont_type=${cont_type}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const editAcContM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
  cont_type = "1",
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&cont_no=${data.cont_no}&page_size=${pageSize}&cont_type=${cont_type}`,
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
export const searchVwAcContImpByFilter = async (
  filtered,
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      filtered,
    );
    return response ? response.data?.rows : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportExcelVwContImp = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
) => {
  try {
    const response = await axios.post(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
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
