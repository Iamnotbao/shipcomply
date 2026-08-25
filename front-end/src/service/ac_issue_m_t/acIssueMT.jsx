import axios from "axios";
const API = "/ac_issue_m_t";
export const fetchAllAcIssueMT = async (
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
  return response ? response.data : "";
};
export const fetchAcIssueMTByID = async (
  token,
  factory_code,
  conf_seq,
  matd_seq,
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&conf_seq=${conf_seq}&matd_seq=${matd_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const fetchInvoiceDropdown = async (
  factory_code,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/invoice?factory_code=${factory_code}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const active = async (factory_code, user_code, conf_seq, language) => {
  try {
    const response = await axios.get(
      `${API}/active?factory_code=${factory_code}&user_code=${user_code}&conf_seq=${conf_seq}&language=${language}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error?.response?.data;
  }
};
export const calculate = async (
  factory_code,
  user_code,
  conf_seq,
  language,
) => {
  try {
    const response = await axios.get(
      `${API}/calculate?factory_code=${factory_code}&user_code=${user_code}&conf_seq=${conf_seq}&language=${language}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error;
  }
};
export const voidAll = async (
  factory_code,
  user_code,
  conf_seq,
  lock_seq,
  language,
) => {
  const response = await axios.get(
    `${API}/void_all?factory_code=${factory_code}&user_code=${user_code}&conf_seq=${conf_seq}&lock_seq=${lock_seq}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const fetchAllConfirmedChildren = async (
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
export const addAcIssueMT = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  try {
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
  } catch (error) {

    throw error?.reponse;
  }
};
export const autoAddAcIssueMT = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.post(
    `${API}/auto_add?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const editAcIssueMT = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&conf_seq=${data.conf_seq}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const searchAcIssueMTByFilter = async (
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
export const exportExcelList = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/excel_list?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
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
    throw error?.response?.data;
  }
};
export const exportExcelDetail = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/excel_detail?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}`,
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
    link.setAttribute("download", "export_excel_detail.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
export const exportExcelSummary = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/excel_summary?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}`,
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
    link.setAttribute("download", "export_excel_writing.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
