import axios from "axios";
const API = "/ac_chg_m";
export const fetchAllAcContM = async (
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
export const fetchAcChgMByID = async (factory_code, ac_no) => {
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
export const fetchFieldDropdown = async (
  factory_code,
  field,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/field_dropdown?factory_code=${factory_code}&field=${field}&page=${page}&limit=${limit}&search=${search}`,
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
  ac_no,
  type = "1",
) => {
  const response = await axios.get(
    `${API}/ac_no?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${ac_no}&type=${type}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};

export const addAcChgM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
  type = "1",
) => {
  const response = await axios.post(
    `${API}?factory_code=${factory_code}&deparment_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}&type=${type}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const editAcChgM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
  type = "1",
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&deparment_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${data.ac_no}&page_size=${pageSize}&type=${type}`,
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
export const exportExcelVwChgM = async (
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
    link.setAttribute("download", "vw_chg_m.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
  }
};
export const exportExcelToTransfer = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) => {
  try {
    const response = await axios.post(
      `${API}/excel_transfer?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}`,
      { search: filters },
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vw_chg_exp.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
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
export const activateExp = async (factory_code, user_code, ac_no, language) => {
  try {
    const response = await axios.get(
      `${API}/activate_exp?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}&language=${language}`,
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
export const confirmAll = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  type = "1",
) => {
  try {
    const response = await axios.get(
      `${API}/confirm_all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${ac_no}&type=${type}`,
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
export const voidAllExp = async (factory_code, ac_no, user_code, language) => {
  try {
    const response = await axios.get(
      `${API}/void_exp?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}&language=${language}`,
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
export const cancelActivateExp = async (
  factory_code,
  user_code,
  ac_no,
  language,
) => {
  try {
    const response = await axios.get(
      `${API}/cancel_activate_exp?factory_code=${factory_code}&user_code=${user_code}&ac_no=${ac_no}&language=${language}`,
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
export const refreshGrossW = async (factory_code, ac_no) => {
  try {
    const response = await axios.get(
      `${API}/refresh_gross?factory_code=${factory_code}&ac_no=${ac_no}`,
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
export const confirmPassDate = async (factory_code, out_date, ac_no) => {
  try {
    const response = await axios.get(
      `${API}/confirm_pass_date?factory_code=${factory_code}&ac_no=${ac_no}&out_date=${out_date}`,
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

export const pdfToChgD = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) => {
  try {
    const response = await axios.get(
      `${API}/pdf_chg_d?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${ac_no}`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customs_declaration_d.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
export const pdfItemDetails = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) => {
  try {
    const response = await axios.get(
      `${API}/pdf_item_details?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${ac_no}`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customs_declaration_d.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
export const pdfToChgDWithName = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
) => {
  try {
    const response = await axios.get(
      `${API}/pdf_chg_d_name?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${ac_no}`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customs_declaration_d.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
export const checkDuplicateAGO = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_chgno,
  out_date,
  ac_no,
  type="1"
) => {
  try {
    const response = await axios.get(
      `${API}/check_ago?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_chgno=${ac_chgno}&out_date=${out_date}&ac_no=${ac_no}&type=${type}`,
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
