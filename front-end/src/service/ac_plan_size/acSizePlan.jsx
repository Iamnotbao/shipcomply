import axios from "axios";
const API = "/ac_plan_size";
export const fetchAllAcPlanSize = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
  ac_no,
  se_id,
  se_seq,
  se_ver,
  pack_gu,
  ship_seq,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}&ac_no=${ac_no}&se_id=${se_id}&se_seq=${se_seq}&se_ver=${se_ver}&pack_gu=${pack_gu}&ship_seq=${ship_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllAcPlanOrdLink = async (
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
    `${API}/all_link?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllPlanOrd = async (
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
    `${API}/plan_date?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const recreateTempTable = async (token, factory_code, user_code) => {
  const response = await axios.get(
    `${API}/recreate_temp_table?factory_code=${factory_code}&user_code=${user_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchFieldDropDownSePlanOrd = async (
  token,
  factory_code,
  field = null,
  language,
  page,
  limit,
  search,
  extraField,
) => {
  const response = await axios.get(
    `${API}/field_dropdown?factory_code=${factory_code}&field=${field}&language=${language}&page=${page}&limit=${limit}&search=${search}&extraField=${extraField}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchAcPlanOrdByID = async (
  token,
  factory_code,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&se_id=${se_id}&se_ver=${se_ver}&se_seq=${se_seq}&pack_gu=${pack_gu}&ship_seq=${ship_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const deleteSePlanOrd = async (
  token,
  factory_code,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
) => {
  const response = await axios.delete(
    `${API}?factory_code=${factory_code}&se_id=${se_id}&se_ver=${se_ver}&se_seq=${se_seq}&pack_gu=${pack_gu}&ship_seq=${ship_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const fetchAllConfirmedBasicData = async (
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  listBasicData = [],
) => {
  const response = await axios.post(
    `${API}/confirmed?factory_code=${factory_code}&category_code=${category_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      data: listBasicData,
    },
  );
  return response ? response.data : "";
};
export const addSePlanOrd = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
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
export const editAcPlanSize = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${data.ac_no}&size_no=${data.size_no}&se_id=${data.se_id}&se_ver=${data.se_ver}&se_seq=${data.se_seq}&ship_seq=${data.ship_seq}&pack_gu=${data.pack_gu}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const searchSePlanOrdFilter = async (
  token,
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
      { search: filtered },
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
export const searchLinkFilter = async (
  token,
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
      `${API}/search_link?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
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
export const searchPlanOrdFilter = async (
  token,
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
      `${API}/search_plan_date?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
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
export const exportPDF = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      { search },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "se_shiping_m.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
export const getShipSeq = async (
  token,
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  se_ver,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.get(
    `${API}/ship_seq?factory_code=${factory_code}&se_id=${se_id}&pack_gu=${pack_gu}&se_seq=${se_seq}&se_ver=${se_ver}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getCBM = async (
  token,
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  se_ver,
  ship_seq,
) => {
  const response = await axios.get(
    `${API}/cbm?factory_code=${factory_code}&se_id=${se_id}&pack_gu=${pack_gu}&se_seq=${se_seq}&se_ver=${se_ver}&ship_seq=${ship_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const checkBox = async (
  token,
  factory_code,
  department_code,
  user_code,
  is_check,
  gridData,
  filters,
  isAll,
) => {
  const response = await axios.post(
    `${API}/check_box?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&is_check=${is_check}`,
    { data: gridData, filters: filters, isAll: isAll },
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const confirmCheck = async (
  token,
  factory_code,
  department_code,
  user_code,
  gridData,
) => {
  const response = await axios.post(
    `${API}/confirm_all_check?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}`,
    { data: gridData },
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const confirm = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
) => {
  const response = await axios.get(
    `${API}/confirm_all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&se_id=${se_id}&pack_gu=${pack_gu}&se_ver=${se_ver}&se_seq=${se_seq}&ship_seq=${ship_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const updateProdAcno = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
  ac_no,
  prod_acno,
) => {
  const response = await axios.get(
    `${API}/update_prod_acno?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&se_id=${se_id}&pack_gu=${pack_gu}&se_ver=${se_ver}&se_seq=${se_seq}&ship_seq=${ship_seq}&ac_no=${ac_no}&prod_acno=${prod_acno}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getTempTable = async (token, limit = 10, offset = 0) => {
  const response = await axios.get(
    `${API}/temp_table?limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const clearTempTable = async (token) => {
  const response = await axios.get(`${API}/clear_temp_table`, {
    headers: {
      authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};

export const getTempTextTable = async (token, limit = 10, offset = 0) => {
  const response = await axios.get(
    `${API}/temp_text_table?limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const clearTempTextTable = async (token) => {
  const response = await axios.get(`${API}/clear_temp_text_table`, {
    headers: {
      authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
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
export const exportExcel = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/export_excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      { search },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "SE_PLAN_ORD.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
    throw error?.response.data;
  }
};
export const exportExcelMaterial = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/export_excel_material?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      { search },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "okla.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
    throw error?.response.data;
  }
};
export const exportExcelEndMaterial = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/export_excel_end_material?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      { search },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "material_end.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
    throw error?.response.data;
  }
};
export const exportExcelShipOrder = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/export_excel_ship_order?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      { search },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ship_order.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
    throw error?.response.data;
  }
};
export const exportExcelPP026 = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/export_excel_pp026?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      { search },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pp026.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
    throw error?.response.data;
  }
};
