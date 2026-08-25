import axios from "axios";
const API = "/ac_chg_d";
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
export const calculateRefPrice = async ( factory_code, com_invoice, item_acno) => {
  const response = await axios.get(
    `${API}/calculate_ref_price?factory_code=${factory_code}&com_invoice=${com_invoice}&item_acno=${item_acno}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const refreshSeq = async (factory_code, ac_no, language) => {
  const response = await axios.get(
    `${API}/refresh_seq?factory_code=${factory_code}&ac_no=${ac_no}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const refreshPrice = async (factory_code, ac_no, language) => {
  const response = await axios.get(
    `${API}/refresh_price?factory_code=${factory_code}&ac_no=${ac_no}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const copyShoe = async (factory_code, ac_no, cont_no, shoe_id, language) => {
  const response = await axios.get(
    `${API}/copy_shoe_id?factory_code=${factory_code}&ac_no=${ac_no}&language=${language}&shoe_id=${shoe_id}&cont_no=${cont_no}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchAllAcChgDByAcno = async (
  factory_code,
  ac_no,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/ac_no?factory_code=${factory_code}&ac_no=${ac_no}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};


export const fetchAllAcChgDExpByAcno = async (
  factory_code,
  ac_no,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/ac_no_exp?factory_code=${factory_code}&ac_no=${ac_no}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getSum = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_no,
) => {
  const response = await axios.get(
    `${API}/sum?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&ac_no=${ac_no}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllAcContDWithView = async (
  token,
  cont_no,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/list_of_ac_cont_d?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&cont_no=${cont_no}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchAcChgDByID = async (factory_code, ac_no, seq) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&ac_no=${ac_no}&seq=${seq}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const autoAddAcChgD = async (
  token,
  factory_code,
  department_code,
  user_code,
  ac_no,
  language="en",
) => {
  try {
    const response = await axios.get(
      `${API}/auto_add?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&ac_no=${ac_no}&language=${language}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error?.response?.data;
  }
};
export const addAcChgD = async (
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
export const editAcChgD = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${data.ac_no}&seq=${data.seq}&page_size=${pageSize}`,
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
