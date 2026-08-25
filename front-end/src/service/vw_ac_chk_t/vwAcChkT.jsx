import axios from "axios";
const API = "/vw_ac_chk_t";
export const fetchVwAcChkT = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  ac_itemno,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/list_of_achk_t?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${ac_no}&ac_itemno=${ac_itemno}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
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
export const fetchInAcnoDropdown = async (
  factory_code,
  src,
  out_dtype,
  matd_no,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/in_acno?factory_code=${factory_code}&src=${src}&out_dtype=${out_dtype}&matd_no=${matd_no}&page=${page}&limit=${limit}&search=${search}`,
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
) => {
  const response = await axios.get(
    `${API}/cont_no?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const verifyRemain = async (
  factory_code,
  ac_no,
  ac_itemno,
  language,
) => {
  const response = await axios.get(
    `${API}/verify_remain?factory_code=${factory_code}&ac_no=${ac_no}&ac_itemno=${ac_itemno}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const updateQty = async (
  factory_code,
  ac_no,
  ac_itemno,
  n_mqty,
  n_src,
) => {
  const response = await axios.get(
    `${API}/verify_remain?factory_code=${factory_code}&ac_no=${ac_no}&ac_itemno=${ac_itemno}&n_mqty=${n_mqty}&n_src=${n_src}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const restoreS = async (factory_code, ac_no, src) => {
  const response = await axios.get(
    `${API}/restore_status?factory_code=${factory_code}&ac_no=${ac_no}&src=${src}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const searchVwAcChgSumByFilter = async (
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
export const exportExcel = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  ac_no,
  ac_itemno,
) => {
  try {
    const response = await axios.get(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&ac_no=${ac_no}&ac_itemno=${ac_itemno}`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vw_ac_chk_t.xlsx");
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
